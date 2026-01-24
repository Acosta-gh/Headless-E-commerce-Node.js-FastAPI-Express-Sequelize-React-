const verifyService = require("@/services/verify.service");

// ======================================================================
//                      📧 Email Verification
// ======================================================================

async function verifyUserEmail(req, res) {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    const result = await verifyService.verifyUserEmail(token);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Email verification error:", error);
    
    if (error.message.includes("Invalid or expired")) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function verifySubscriberEmail(req, res) {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    const result = await verifyService.verifySubscriberEmail(token);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Subscriber email verification error:", error);
    
    if (error.message.includes("Invalid or expired")) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function resendVerificationEmail(req, res) {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const result = await verifyService.resendVerificationEmail(email);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Resend verification error:", error);
    
    if (error.message.includes("User not found")) {
      return res.status(404).json({ error: error.message });
    }
    
    return res.status(500).json({ error: "Internal server error" });
  }
}

// ======================================================================
//                      🔑 Password Reset
// ======================================================================

async function sendPasswordResetEmail(req, res) {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const result = await verifyService.sendPasswordResetEmail(email);
    // Siempre devolver 200 para no revelar si el email existe
    return res.status(200).json(result);
  } catch (error) {
    console.error("Password reset email error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function resetPassword(req, res) {
  try {
    // El token puede venir en query params o en el body
    const token = req.query.token || req.body.token;
    const password = req.body.password || req.body.newPassword;
    
    console.log("Reset password - Token:", token ? "Presente" : "Ausente");
    console.log("Reset password - Password:", password ? "Presente" : "Ausente");
    console.log("Query params:", req.query);
    console.log("Body params:", req.body);
    
    if (!token || !password) {
      return res.status(400).json({ 
        error: "Token and password are required",
        received: {
          token: !!token,
          password: !!password
        }
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }

    const result = await verifyService.resetPassword(token, password);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Reset password error:", error);
    
    if (error.message.includes("Invalid or expired") || error.message.includes("has expired")) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(500).json({ error: "Internal server error" });
  }
}

// ======================================================================
//                      📤 Exports
// ======================================================================

module.exports = {
  // Email verification
  verifyUserEmail,
  verifySubscriberEmail,
  resendVerificationEmail,
  // Password reset
  sendPasswordResetEmail,
  resetPassword,
};