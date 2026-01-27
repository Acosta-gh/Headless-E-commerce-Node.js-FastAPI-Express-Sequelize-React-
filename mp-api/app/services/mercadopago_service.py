import mercadopago
from app.config import (
    MP_ACCESS_TOKEN,
    MP_WEBHOOK_URL,
)

# ======================================================================
# 🔐 Mercado Pago SDK
# ======================================================================
sdk = mercadopago.SDK(MP_ACCESS_TOKEN)

# ======================================================================
# 🔎 Obtener payment por ID
# ======================================================================
def get_payment_by_id(payment_id: str):
    result = sdk.payment().get(payment_id)
    return result["response"]
