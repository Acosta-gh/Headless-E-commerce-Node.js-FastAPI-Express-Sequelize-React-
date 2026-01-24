import os
from dotenv import load_dotenv

# ======================================================================
#                      ⚙️ Environment Setup
# ======================================================================
load_dotenv()

# ======================================================================
#                      🔐 Credenciales Mercado Pago 
# ======================================================================
MP_ACCESS_TOKEN = os.getenv("MP_ACCESS_TOKEN")

# ======================================================================
#                      🔁 Back URLs
# ======================================================================
MP_BACK_URL_SUCCESS = os.getenv("MP_BACK_URL_SUCCESS")
MP_BACK_URL_FAILURE = os.getenv("MP_BACK_URL_FAILURE")
MP_BACK_URL_PENDING = os.getenv("MP_BACK_URL_PENDING")

# ======================================================================
#                      📡 Webhook
# ======================================================================
MP_WEBHOOK_URL = os.getenv("MP_WEBHOOK_URL") 