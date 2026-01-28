import httpx
from fastapi import APIRouter, Request
from app.services.mercadopago_service import get_payment_by_id
import os
import traceback

# ======================================================================
# 🔌 Router
# ======================================================================
router = APIRouter(prefix="/mp", tags=["MercadoPago"])

# ======================================================================
# 🌐 Backend principal (Node.js)
# ======================================================================
NODE_API_URL = os.getenv("NODE_API_URL", "http://localhost:3001/api/v1")

# ======================================================================
# 📡 Mercado Pago Webhook
# ======================================================================
@router.post("/webhook")
async def mercadopago_webhook(req: Request):
    """
    MercadoPago manda eventos tipo:
    {
      "type": "payment",
      "data": { "id": "123" }
    }
    """
    print("\n" + "="*70)
    print("🔔 WEBHOOK RECIBIDO")
    print("="*70)
    
    # Debug: Headers
    print("📋 HEADERS:")
    for key, value in req.headers.items():
        print(f"   {key}: {value}")
    
    # Debug: Query params
    print("\n🔍 QUERY PARAMS:")
    for key, value in req.query_params.items():
        print(f"   {key}: {value}")
    
    # Debug: Body
    body = await req.json()
    print("\n📦 BODY:")
    print(f"   {body}")
    
    event_type = req.query_params.get("type") or body.get("type")
    payment_id = req.query_params.get("data.id") or (body.get("data") or {}).get("id")
    
    print(f"\n🎯 PARSED VALUES:")
    print(f"   event_type: {event_type}")
    print(f"   payment_id: {payment_id}")

    # MP necesita 200 rápido SIEMPRE
    if event_type != "payment" or not payment_id:
        print(f"⏭️  IGNORANDO: event_type={event_type}, payment_id={payment_id}")
        print("="*70 + "\n")
        return {"ok": True, "ignored": True}

    try:
        print(f"\n🔎 CONSULTANDO PAGO A MERCADOPAGO: {payment_id}")
        
        # Buscar el pago real en MP
        payment = get_payment_by_id(payment_id)
        
        print(f"\n💳 RESPUESTA DE MERCADOPAGO:")
        print(f"   Status: {payment.get('status')}")
        print(f"   External Reference: {payment.get('external_reference')}")
        print(f"   Full Payment Data: {payment}")
        
        status = payment.get("status")
        external_reference = payment.get("external_reference")

        print(f"\n💰 PAYMENT STATUS: {status}")
        print(f"🧾 EXTERNAL_REFERENCE (Order ID): {external_reference}")

        # Mapear estados de MercadoPago a tu sistema
        status_map = {
            "approved": "paid",
            "in_process": "pending",
            "pending": "pending",
            "rejected": "failed",
            "cancelled": "failed",
            "refunded": "refunded",
            "charged_back": "refunded",
        }
        payment_status = status_map.get(status, "pending")
        
        print(f"\n🔄 MAPPED STATUS: {payment_status}")

        # ==================================================================
        # 🔁 Notificar backend Node.js
        # ==================================================================
        if external_reference:
            print(f"\n📤 PREPARANDO REQUEST A NODE.JS")
            print(f"   URL: {NODE_API_URL}/order/{external_reference}/payment/webhook")
            
            # Secret compartido para autenticar el webhook
            webhook_secret = os.getenv("MP_WEBHOOK_SECRET", "")
            
            headers = {
                "x-webhook-provider": "mercadopago",
                "Content-Type": "application/json"
            }
            
            if webhook_secret:
                headers["x-webhook-secret"] = webhook_secret
                print(f"✅ Secret agregado: {webhook_secret[:10]}...")
            else:
                print(f"⚠️  NO HAY MP_WEBHOOK_SECRET configurado")
            
            payload = {
                "paymentStatus": payment_status,
                "paymentId": str(payment_id),
                "mercadopagoStatus": status,
            }
            
            print(f"\n📋 HEADERS QUE SE ENVIARÁN:")
            for key, value in headers.items():
                if key == "x-webhook-secret":
                    print(f"   {key}: {value[:10]}...")
                else:
                    print(f"   {key}: {value}")
            
            print(f"\n📦 PAYLOAD QUE SE ENVIARÁ:")
            print(f"   {payload}")

            async with httpx.AsyncClient() as client:
                print(f"\n🚀 ENVIANDO REQUEST...")
                
                try:
                    response = await client.patch(
                        f"{NODE_API_URL}/order/{external_reference}/payment/webhook",
                        json=payload,
                        headers=headers,
                        timeout=30.0
                    )
                    
                    print(f"\n📥 RESPUESTA DE NODE.JS:")
                    print(f"   Status Code: {response.status_code}")
                    print(f"   Headers: {dict(response.headers)}")
                    print(f"   Body: {response.text}")
                    
                    if response.status_code == 200:
                        print(f"\n✅ Orden {external_reference} actualizada a {payment_status}")
                    else:
                        print(f"\n❌ Error actualizando orden:")
                        print(f"   Status: {response.status_code}")
                        print(f"   Response: {response.text}")
                        
                except httpx.TimeoutException as te:
                    print(f"\n⏱️  TIMEOUT al llamar a Node.js:")
                    print(f"   {str(te)}")
                    
                except httpx.RequestError as re:
                    print(f"\n🔌 ERROR DE CONEXIÓN a Node.js:")
                    print(f"   {str(re)}")
                    print(f"   URL: {NODE_API_URL}/order/{external_reference}/payment/webhook")
                    
        else:
            print(f"\n⚠️  NO HAY EXTERNAL_REFERENCE - No se notifica a Node.js")

        print("="*70 + "\n")
        return {"ok": True}

    except Exception as e:
        print(f"\n❌ ERROR CRÍTICO procesando webhook:")
        print(f"   Error: {str(e)}")
        print(f"   Tipo: {type(e).__name__}")
        print(f"\n📚 TRACEBACK COMPLETO:")
        traceback.print_exc()
        print("="*70 + "\n")
        
        # Siempre devolver 200 a MP para que no reintente
        return {"ok": True, "error": str(e)}