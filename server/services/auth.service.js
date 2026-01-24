const { User, Token } = require("@/models/index");
const { toSafeUser } = require("@/utils/toSafeUser");
const saltRounds = parseInt(process.env.SALT_ROUNDS, 10) || 10;
const bcrypt = require("bcrypt");
const { jwtSecret, jwtExpiration } = require("@/config/auth");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { verifyEmail } = require("@/utils/templates/verifyEmail");
const { sendEmail } = require("@/utils/emailUtils");
const { resetPasswordEmail } = require("@/utils/templates/resetPasswordEmail");

const registerUser = async (data) => {
  try {
    const existingEmail = await User.findOne({ where: { email: data.email } });

    if (existingEmail) {
      throw new Error("Email already in use");
    }

    const existingUsername = await User.findOne({
      where: { username: data.username },
    });

    if (existingUsername) {
      throw new Error("Username already in use");
    }

    const hashedPassword = await bcrypt.hash(data.password, saltRounds);
    const user = await User.create({
      ...data,
      password: hashedPassword,
      admin: false,
      employee: false,
      verified: false,
      banned: false,
    });

    const safeUser = toSafeUser(user);
    const authToken = jwt.sign({ id: user.id, admin: user.admin }, jwtSecret, {
      expiresIn: jwtExpiration,
    });

    // Generar token de verificación usando el modelo Token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    await Token.create({
      userId: user.id,
      tokenHash,
      type: "email_verify",
      used: false,
    });

    const verificationLink = `${process.env.FRONTEND_URL}/#/verify?token=${verificationToken}`;
    console.log("Verification Link:", verificationLink);
    const html = verifyEmail(user.name, verificationLink);
    await sendEmail(user.email, "Verify your email", html);

    return { user: safeUser, token: authToken };
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Error creating user: " + error.message);
  }
};

const loginUser = async (data) => {
  try {
    const user = await User.findOne({ where: { email: data.email } });

    if (!user) {
      return { error: "User not found" };
    }

    if (user.banned) {
      return { error: "User is banned. Contact support for more information." };
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      return { error: "Incorrect password" };
    }

    if (!user.verified) {
      return {
        error: "Email not verified. Please check your inbox.",
        user: toSafeUser(user),
      };
    }

    const token = jwt.sign({ id: user.id, admin: user.admin }, jwtSecret, {
      expiresIn: jwtExpiration,
    });

    return { user: toSafeUser(user), token };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Internal server error" };
  }
};
/**
 * Envía email para resetear contraseña
 */
const sendPasswordResetEmail = async (email) => {
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // No revelar si el usuario existe o no por seguridad
      return { message: "If the email exists, a reset link has been sent" };
    }

    // Marcar tokens antiguos de reset como usados (no eliminar para auditoría)
    await Token.update(
      { used: true, usedAt: new Date() },
      {
        where: {
          userId: user.id,
          type: "password_reset",
          used: false,
        },
      },
    );

    // Generar nuevo token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await Token.create({
      userId: user.id,
      tokenHash,
      type: "password_reset",
      used: false,
    });

    const resetLink = `${process.env.FRONTEND_URL}/#/reset?token=${resetToken}`;
    const html = resetPasswordEmail(user.name, resetLink);
    await sendEmail(user.email, "Reset your password", html);

    return { message: "If the email exists, a reset link has been sent" };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

/**
 * Resetea la contraseña usando el token
 */
const resetPassword = async (token, newPassword) => {
  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const tokenRecord = await Token.findOne({
      where: {
        tokenHash,
        type: "password_reset",
      },
      include: [{ model: User, as: "user" }],
    });

    if (!tokenRecord) {
      throw new Error("Invalid or expired reset token");
    }

    // Verificar si el token ya fue usado
    if (tokenRecord.used) {
      throw new Error("This reset token has already been used");
    }

    const user = tokenRecord.user;

    if (!user) {
      throw new Error("User not found");
    }

    // Verificar que el token no tenga más de 15 minutos (por seguridad adicional)
    const tokenAge = Date.now() - new Date(tokenRecord.createdAt).getTime();
    const fifteenMinutes = 15 * 60 * 1000;

    if (tokenAge > fifteenMinutes) {
      tokenRecord.used = true;
      tokenRecord.usedAt = new Date();
      await tokenRecord.save();
      throw new Error("Reset token has expired");
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña
    user.password = hashedPassword;
    await user.save();

    // Marcar el token como usado
    tokenRecord.used = true;
    tokenRecord.usedAt = new Date();
    await tokenRecord.save();

    // Marcar todos los otros tokens de reset de este usuario como usados por seguridad
    await Token.update(
      { used: true, usedAt: new Date() },
      {
        where: {
          userId: user.id,
          type: "password_reset",
          used: false,
          tokenHash: { [require("sequelize").Op.ne]: tokenHash },
        },
      },
    );

    return { message: "Password reset successfully" };
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};

module.exports = {
  registerUser,
  loginUser,
  sendPasswordResetEmail,
  resetPassword,
};
