import httpx
from fastapi import APIRouter, Request
from app.services.mercadopago_service import create_preference, get_payment_by_id
import os

# ======================================================================
# 🔌 Router
# ======================================================================
router = APIRouter(prefix="/mp", tags=["MercadoPago"])

# ======================================================================
# 🌐 Backend principal (Node.js)
# ======================================================================
NODE_API_URL = os.getenv("NODE_API_URL", "http://localhost:3001/api/v1")

# ======================================================================
# 💳 Crear payment preference
# ======================================================================
@router.post("/preference")
async def create_preference_endpoint(req: Request):
    body = await req.json()
    items = body.get("items", [
        {
            "title": "Mi producto",
            "quantity": 1,
            "unit_price": 1000,
        }
    ])
    external_reference = body.get("external_reference")
    pref = create_preference(items=items, external_reference=external_reference)
    return {
        "id": pref["id"],
        "init_point": pref["init_point"],
        "sandbox_init_point": pref.get("sandbox_init_point"),
    }


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
    body = await req.json()
    print("📩 WEBHOOK MP:", body)
    
    event_type = req.query_params.get("type") or body.get("type")
    payment_id = req.query_params.get("data.id") or (body.get("data") or {}).get("id")

    # MP necesita 200 rápido SIEMPRE
    if event_type != "payment" or not payment_id:
        return {"ok": True, "ignored": True}

    try:
        # Buscar el pago real en MP
        payment = get_payment_by_id(payment_id)
        
        status = payment.get("status")
        external_reference = payment.get("external_reference")  # Este es el orderId
        
        print("💰 PAYMENT STATUS:", status)
        print("🧾 EXTERNAL_REFERENCE (Order ID):", external_reference)

        # Mapear estados de MercadoPago a tu sistema
        status_map = {
            "approved": "paid",
            "in_process": "pending",
            "pending": "pending",
            "rejected": "failed",
            "cancelled": "failed",
            "refunded": "refunded",
            "charged_back": "urefunded",
        }

        payment_status = status_map.get(status, "pending")

        # ==================================================================
        # 🔁 Notificar backend Node.js
        # ==================================================================
        if external_reference:
            # Secret compartido para autenticar el webhook
            webhook_secret = os.getenv("WEBHOOK_SECRET", "")
            
            headers = {}
            if webhook_secret:
                headers["x-webhook-secret"] = webhook_secret
            
            async with httpx.AsyncClient() as client:
                response = await client.patch(
                    f"{NODE_API_URL}/order/{external_reference}/payment-status",
                    json={
                        "paymentStatus": payment_status,
                        "paymentId": str(payment_id),
                        "mercadopagoStatus": status,
                    },
                    headers=headers,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    print(f"✅ Orden {external_reference} actualizada a {payment_status}")
                else:
                    print(f"❌ Error actualizando orden: {response.status_code} - {response.text}")
        
        return {"ok": True}
    
    except Exception as e:
        print(f"❌ Error procesando webhook: {str(e)}")
        # Siempre devolver 200 a MP para que no reintente
        return {"ok": True, "error": str(e)}