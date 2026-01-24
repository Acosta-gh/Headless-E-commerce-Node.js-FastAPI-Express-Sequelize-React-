import mercadopago
from app.config import (
    MP_ACCESS_TOKEN,
    MP_BACK_URL_SUCCESS,
    MP_BACK_URL_FAILURE,
    MP_BACK_URL_PENDING,
    MP_WEBHOOK_URL,
)

# ======================================================================
# 🔐 Mercado Pago SDK
# ======================================================================
sdk = mercadopago.SDK(MP_ACCESS_TOKEN)


# ======================================================================
# 💳 Crear payment preference
# ======================================================================
def create_preference(items: list, external_reference: str | None = None):
    preference_data = {
        "items": items,
        "back_urls": {
            "success": MP_BACK_URL_SUCCESS,
            "failure": MP_BACK_URL_FAILURE,
            "pending": MP_BACK_URL_PENDING,
        },
        "notification_url": MP_WEBHOOK_URL,
        "auto_return": "approved",
    }

    if external_reference:
        preference_data["external_reference"] = external_reference

    result = sdk.preference().create(preference_data)
    return result["response"]

# ======================================================================
# 🔎 Obtener payment por ID
# ======================================================================
def get_payment_by_id(payment_id: str):
    result = sdk.payment().get(payment_id)
    return result["response"]
