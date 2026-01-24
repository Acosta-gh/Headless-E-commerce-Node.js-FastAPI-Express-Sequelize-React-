/* 
const crypto = require("crypto");
const { getPaymentById } = require("../services/mercadopago.service");
const OrderService = require("../services/order.service");

const mercadopagoWebhookController = async (req, res) => {
  console.log("================ MP WEBHOOK HIT ================");
  console.log("📍 URL:", req.originalUrl);
  console.log("📍 HEADERS:", JSON.stringify(req.headers, null, 2));
  console.log("📍 QUERY:", JSON.stringify(req.query, null, 2));
  console.log("📍 BODY:", JSON.stringify(req.body, null, 2));

  try {
    const xSignature = req.headers["x-signature"];
    const xRequestId = req.headers["x-request-id"];
    const dataId =
      req.query["data.id"] ||
      req.query.id ||
      req.body?.data?.id ||
      req.body?.id;

    const type =
      req.query.type || req.query.topic || req.body?.type || req.body?.topic;

    console.log("🔎 Parsed values:", { xSignature, xRequestId, dataId, type });

    if (!process.env.MP_WEBHOOK_SECRET) {
      console.error("❌ MP_WEBHOOK_SECRET is NOT defined");
      return res.status(500).send("Server misconfigured");
    }

    if (!xSignature || !xRequestId || !dataId) {
      console.error("❌ Missing required signature data");
      return res.status(400).send("Missing headers or query params");
    }

    // =================== Verificar Firma (SOLUCIÓN CORRECTA) ===================
    // Basado en: https://github.com/mercadopago/sdk-nodejs/discussions/318#discussioncomment-12694027
    const [timestamp, hash] = xSignature.split(",");
    const [, valueOfTimestamp] = timestamp.split("=");
    const [, valueOfHash] = hash.split("=");

    console.log("🧩 Signature parsed:", { 
      timestamp: valueOfTimestamp, 
      hash: valueOfHash 
    });

    if (!valueOfTimestamp || !valueOfHash) {
      console.error("❌ Invalid x-signature format");
      return res.status(401).send("Invalid signature format");
    }

    // Construir manifest string (SIN modificar el timestamp)
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${valueOfTimestamp};`;
    console.log("🧾 Manifest string:", manifest);

    const generatedHash = crypto
      .createHmac("sha256", process.env.MP_WEBHOOK_SECRET)
      .update(manifest)
      .digest("hex");

    console.log("🔐 Hash comparison:", {
      receivedHash: valueOfHash,
      generatedHash,
      match: generatedHash === valueOfHash,
    });

    if (generatedHash !== valueOfHash) {
      console.error("❌ SIGNATURE MISMATCH");
      console.error("🔍 DEBUG INFO:");
      console.error("   Manifest:", manifest);
      console.error("   Secret length:", process.env.MP_WEBHOOK_SECRET?.length);
      return res.status(401).send("Invalid signature");
    }

    console.log("✅ Signature VALID");

    // =================== Procesar Evento de Pago ===================
    if (type === "payment") {
      try {
        const paymentResponse = await getPaymentById(dataId);
        console.log("💳 Payment FULL RESPONSE:");
        console.dir(paymentResponse, { depth: null });

        const paymentStatus = paymentResponse.status;
        const externalReference = paymentResponse.external_reference;
        const paymentId = paymentResponse.id;

        console.log("📌 Payment Info:", {
          status: paymentStatus,
          externalReference,
          paymentId,
        });

        // Buscar la orden asociada
        let order = null;

        // Intentar buscar por external_reference (orderId)
        if (externalReference) {
          try {
            order = await OrderService.getOrderById(
              parseInt(externalReference),
            );
            console.log("✅ Order found by external_reference:", order.id);
          } catch (error) {
            console.log("⚠️ Order not found by external_reference");
          }
        }

        // Si no se encontró, intentar buscar por paymentId
        if (!order) {
          try {
            order = await OrderService.getOrderByPaymentId(String(paymentId));
            console.log("✅ Order found by paymentId:", order.id);
          } catch (error) {
            console.log("⚠️ Order not found by paymentId");
          }
        }

        if (!order) {
          console.warn("⚠️ No order found for this payment, ignoring");
          return res.sendStatus(200);
        }

        // Actualizar estado de la orden según el estado del pago
        let newPaymentStatus = null;

        switch (paymentStatus) {
          case "approved":
            newPaymentStatus = "paid";
            console.log("💰 Payment APPROVED - Marking order as PAID");
            break;
          case "pending":
          case "in_process":
            newPaymentStatus = "pending";
            console.log("⏳ Payment PENDING");
            break;
          case "rejected":
          case "cancelled":
            newPaymentStatus = "failed";
            console.log("❌ Payment FAILED/CANCELLED");
            break;
          case "refunded":
            newPaymentStatus = "refunded";
            console.log("💸 Payment REFUNDED");
            break;
          default:
            console.log("ℹ️ Unknown payment status:", paymentStatus);
        }

        if (newPaymentStatus) {
          await OrderService.updateOrderPaymentStatus(
            order.id,
            newPaymentStatus,
            String(paymentId),
          );
          console.log(
            `✅ Order ${order.id} updated to status: ${newPaymentStatus}`,
          );
        }
      } catch (error) {
        if (error?.status === 404) {
          console.warn("⚠️ Payment not found, ignoring webhook test");
        } else {
          throw error;
        }
      }
    } else {
      console.log("ℹ️ Ignored event type:", type);
    }

    console.log("✅ Responding 200 OK");
    return res.sendStatus(200);
  } catch (error) {
    console.error("🔥 WEBHOOK ERROR");
    console.error(error);
    return res.sendStatus(500);
  } finally {
    console.log("=============== END WEBHOOK =================\n");
  }
};

module.exports = {
  mercadopagoWebhookController,
};
 */