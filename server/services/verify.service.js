/*
* ========================================================================================
* ⚠️ This file's code was generated partially or completely by a Large Language Model (LLM).
* ========================================================================================
*/

const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { User, Subscriber, Token } = require("@/models/index");
const { verifyEmail } = require("@/utils/templates/verifyEmail");
const { sendEmail } = require("@/utils/emailUtils");

const saltRounds = parseInt(process.env.SALT_ROUNDS, 10) || 10;

/**
 * Verifica el email de un usuario usando el token
 */
const verifyUserEmail = async (token) => {
  try {
    console.log("=== INICIO VERIFICACIÓN ===");
    console.log("Token recibido:", token);
    console.log("Longitud del token:", token.length);

    // Hash del token recibido
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    console.log("Token hash generado:", tokenHash);

    // Buscar el token en la base de datos
    const tokenRecord = await Token.findOne({
      where: {
        tokenHash,
        type: "email_verify",
      },
      include: [{ model: User, as: "user" }],
    });

    console.log("Token encontrado en BD:", tokenRecord ? "SÍ" : "NO");

    if (!tokenRecord) {
      // Debug adicional: buscar TODOS los tokens de este tipo para ver qué hay
      const allTokens = await Token.findAll({
        where: { type: "email_verify" },
        attributes: ["id", "tokenHash", "userId", "createdAt", "used"],
      });
      console.log("Total tokens email_verify en BD:", allTokens.length);
      console.log("Tokens disponibles:", JSON.stringify(allTokens, null, 2));

      throw new Error("Invalid or expired verification token");
    }

    console.log("Token record ID:", tokenRecord.id);
    console.log("Token usado:", tokenRecord.used);
    console.log("Token createdAt:", tokenRecord.createdAt);

    // Verificar si el token ya fue usado
    if (tokenRecord.used) {
      throw new Error("This verification token has already been used");
    }

    const user = tokenRecord.user;

    if (!user) {
      console.log("ERROR: Usuario no encontrado en el token");
      throw new Error("User not found");
    }

    console.log("Usuario encontrado:", user.email);
    console.log("Usuario verificado:", user.verified);

    if (user.verified) {
      // Marcar token como usado
      tokenRecord.used = true;
      tokenRecord.usedAt = new Date();
      await tokenRecord.save();
      console.log("Usuario ya estaba verificado");
      return { message: "Email already verified" };
    }

    // Verificar el usuario
    user.verified = true;
    await user.save();

    // Marcar el token como usado
    tokenRecord.used = true;
    tokenRecord.usedAt = new Date();
    await tokenRecord.save();

    console.log("✅ Verificación exitosa");
    return { message: "Email verified successfully" };
  } catch (error) {
    console.error("❌ Error en verifyUserEmail:", error);
    throw error;
  }
};

/**
 * Verifica el email de un subscriber
 */
const verifySubscriberEmail = async (token) => {
  try {
    console.log("=== INICIO VERIFICACIÓN SUBSCRIBER ===");

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const tokenRecord = await Token.findOne({
      where: {
        tokenHash,
        type: "email_verify",
      },
      include: [{ model: Subscriber, as: "subscriber" }],
    });

    if (!tokenRecord) {
      console.log("❌ Token no encontrado");
      throw new Error("Invalid or expired verification token");
    }

    // Verificar si el token ya fue usado
    if (tokenRecord.used) {
      console.log("❌ Token ya usado");
      throw new Error("This verification token has already been used");
    }

    const subscriber = tokenRecord.subscriber;

    if (!subscriber) {
      console.log("❌ Subscriber no encontrado");
      throw new Error("Subscriber not found");
    }

    console.log("Subscriber encontrado:", subscriber.email);

    if (subscriber.verified) {
      tokenRecord.used = true;
      tokenRecord.usedAt = new Date();
      await tokenRecord.save();
      console.log("⚠️ Subscriber ya verificado");
      return { message: "Email already verified" };
    }

    subscriber.verified = true;
    await subscriber.save();

    tokenRecord.used = true;
    tokenRecord.usedAt = new Date();
    await tokenRecord.save();

    console.log("✅ Verificación exitosa para subscriber:", subscriber.email);
    return { message: "Email verified successfully" };
  } catch (error) {
    console.error("❌ Error verifying subscriber email:", error.message);
    throw error;
  }
};

/**
 * Reenvía el email de verificación
 */
const resendVerificationEmail = async (email) => {
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("User not found");
    }

    if (user.verified) {
      return { message: "Email already verified" };
    }

    // Marcar tokens antiguos de verificación como usados (no eliminar para auditoría)
    await Token.update(
      { used: true, usedAt: new Date() },
      {
        where: {
          userId: user.id,
          type: "email_verify",
          used: false,
        },
      },
    );

    // Generar nuevo token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    await Token.create({
      subscriberId: subscriber.id,
      tokenHash,
      type: "email_verify",
      used: false,
    });
    console.log("Hash del nuevo token:", tokenHash);

    await Token.create({
      userId: user.id,
      tokenHash,
      type: "email_verify",
      used: false,
    });

    const verificationLink = `${process.env.FRONTEND_URL}/verify?token=${verificationToken}`;
    console.log("Link de verificación:", verificationLink);

    const html = verifyEmail(user.name, verificationLink);
    await sendEmail(user.email, "Verify your email", html);

    return { message: "Verification email resent successfully" };
  } catch (error) {
    console.error("Error resending verification email:", error);
    throw error;
  }
};

module.exports = {
  verifyUserEmail,
  verifySubscriberEmail,
  resendVerificationEmail,
};
