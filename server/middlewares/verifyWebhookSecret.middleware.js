const crypto = require('crypto');

/**
 * Middleware para autenticar webhooks de MercadoPago
 * Verifica que el secret compartido coincida
 */
function verifyWebhookSecret(req, res, next) {
    console.log("🔐 [WEBHOOK AUTH] Iniciando validación");

    const secrets = {
        mercadopago: process.env.MP_WEBHOOK_SECRET
    };

    // 1. Obtener el secret del header
    const receivedSecret = req.headers["x-webhook-secret"];
    const webhookProvider = req.headers["x-webhook-provider"];

    // 2. Obtener el secret esperado del .env
    const expectedSecret = secrets[webhookProvider];

    // 3. Validar que existe el secret configurado
    if (!expectedSecret) {
        console.error("❌ [WEBHOOK AUTH] Un WEBHOOK_SECRET no está configurado en .env");
        return res.status(500).json({
            ok: false,
            message: "Server configuration error"
        });
    }

    // 4. Validar que el request trae el secret
    if (!receivedSecret) {
        console.error("❌ [WEBHOOK AUTH] Request no tiene x-webhook-secret header");
        return res.status(401).json({
            ok: false,
            message: "Unauthorized - Missing credentials"
        });
    }

    // 5. Comparar secrets de forma segura (constant-time)
    try {
        const receivedBuffer = Buffer.from(receivedSecret, 'utf8');
        const expectedBuffer = Buffer.from(expectedSecret, 'utf8');

        // Verificar longitudes
        if (receivedBuffer.length !== expectedBuffer.length) {
            console.error("❌ [WEBHOOK AUTH] Secret length mismatch");
            return res.status(401).json({
                ok: false,
                message: "Unauthorized - Invalid credentials"
            });
        }

        // Comparación segura
        const isValid = crypto.timingSafeEqual(receivedBuffer, expectedBuffer);

        if (!isValid) {
            console.error("❌ [WEBHOOK AUTH] Secret no coincide");
            return res.status(401).json({
                ok: false,
                message: "Unauthorized - Invalid credentials"
            });
        }

        // ✅ Todo OK - continuar
        console.log("✅ [WEBHOOK AUTH] Autenticación exitosa");
        next();

    } catch (error) {
        console.error("❌ [WEBHOOK AUTH] Error durante validación:", error.message);
        return res.status(401).json({
            ok: false,
            message: "Unauthorized - Validation error"
        });
    }
}

module.exports = { verifyWebhookSecret };