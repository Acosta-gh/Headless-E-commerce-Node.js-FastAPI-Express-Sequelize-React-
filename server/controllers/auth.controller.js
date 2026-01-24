const authService = require("@/services/auth.service");

/**
 * Registrar nuevo usuario
 */
async function registerUser(req, res) {
  try {
    const result = await authService.registerUser(req.body);
    return res.status(201).json(result);
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Login de usuario
 */
async function loginUser(req, res) {
  try {
    const result = await authService.loginUser(req.body);

    // Si hay un error en el resultado, devolver el código apropiado
    if (result.error) {
      if (result.error === "User not found") {
        return res.status(404).json({ error: result.error });
      }
      if (result.error === "Incorrect password") {
        return res.status(401).json({ error: result.error });
      }
      if (result.error.includes("banned")) {
        return res.status(403).json({ error: result.error });
      }
      if (result.error.includes("not verified")) {
        return res.status(403).json({
          error: result.error,
          user: result.user,
        });
      }
      return res.status(500).json({ error: result.error });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Enviar email de reset de contraseña
 */
async function sendResetPasswordEmail(req, res) {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // CORRECCIÓN: Usar verifyService en lugar de authService
    const result = await authService.sendPasswordResetEmail(email);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error sending reset password email:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Resetear contraseña con token
 */
async function resetPassword(req, res) {
  // El token puede venir en query params o body
  const token = req.query.token || req.body.token;
  const newPassword = req.body.password || req.body.newPassword;

  console.log("Reset password controller:");
  console.log("- Token:", token ? "Presente" : "Ausente");
  console.log("- Password:", newPassword ? "Presente" : "Ausente");

  if (!token || !newPassword) {
    return res.status(400).json({ 
      error: "Token and new password are required",
      received: {
        token: !!token,
        password: !!newPassword
      }
    });
  }

  // Validar que la contraseña tenga al menos 8 caracteres
  if (newPassword.length < 8) {
    return res.status(400).json({ 
      error: "Password must be at least 8 characters long" 
    });
  }

  try {
    const result = await authService.resetPassword(token, newPassword);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error resetting password:", error);
    
    // Devolver errores específicos con códigos apropiados
    if (error.message.includes("Invalid or expired")) {
      return res.status(400).json({ error: error.message });
    }
    if (error.message.includes("already been used")) {
      return res.status(400).json({ error: error.message });
    }
    if (error.message.includes("expired")) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  registerUser,
  loginUser,
  sendResetPasswordEmail,
  resetPassword,
};