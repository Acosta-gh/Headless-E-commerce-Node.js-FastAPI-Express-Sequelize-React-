const jwt = require("jsonwebtoken");
const { jwtSecret } = require("@/config/auth");

/**
 * Middleware to verify JWT token
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
function verifyJWT(req, res, next) {
  console.log("Verifying JWT...");
  console.log("Headers:", req.headers);
  console.log("Authorization Header:", req.headers.authorization);
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "No token provided." });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Malformed token." });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = payload;
    console.log("JWT verified successfully:", payload);
    console.log("User ID from token:", payload.id);
    next();
  } catch (err) {
    console.error("JWT verification error:", err);
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

module.exports = { verifyJWT };
