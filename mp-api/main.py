# ===========================================
# 📡  Contexto técnico — Webhooks Mercado Pago
# ===========================================
# Este microservicio existe debido a una limitación
# conocida del SDK oficial de Mercado Pago para Node.js.
#
# Actualmente, la validación del hash (firma) de los
# webhooks en Node.js presenta inconsistencias cuando
# se utilizan pagos reales en producción, provocando
# firmas inválidas incluso con datos correctos.
#
# En Python, la validación del hash funciona de manera
# confiable, por lo que se decidió implementar esta
# mini API externa dedicada exclusivamente a:
# - Recepción de webhooks de Mercado Pago
# - Validación segura de la firma
# - Procesamiento confiable de notificaciones
#
# Referencia del problema:
# https://github.com/mercadopago/sdk-nodejs/discussions/318
#
# Esta API actúa como un microservicio desacoplado
# del backend principal (headless e-commerce),
# asegurando estabilidad en el flujo de pagos.
# ===========================================

# ===========================================
# 🚀  Punto de entrada de la aplicación
# ===========================================
from fastapi import FastAPI
from app.routers.mercadopago_router import router as mercadopago_router

# ===========================================
# 🧠  Instancia principal de FastAPI
# ===========================================
app = FastAPI()

# ===========================================
# 🔌  Registro de routers
# ===========================================
app.include_router(mercadopago_router)
