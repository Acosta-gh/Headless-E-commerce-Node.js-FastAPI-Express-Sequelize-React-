const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

function verifyTempIdToken(req, res, next) {
  const tempIdToken = req.headers["x-tempid-token"];
  const tempId = req.body?.tempId || req.query?.tempId;

  console.log("Verifying:", tempIdToken);
  console.log("tempId", tempId);

  if (!tempIdToken || !tempId) {
    console.error("Missing tempId or token");
    console.log("Skipping tempId verification, proceeding without it.");
    next();
    return;
  }

  try {
    const payload = jwt.verify(tempIdToken, SECRET);
    console.log("Payload:", payload);
    if (payload.tempId !== tempId) {
      return res
        .status(401)
        .json({ error: "tempId does not match token.tempId." });
    }
    req.verifiedTempId = tempId;
    console.log("Verified:", tempId);
    next();
  } catch (err) {
    console.error("Error verifying token:", err);
    return res.status(401).json({ error: "Invalid or expired tempId token." });
  }
}

module.exports = { verifyTempIdToken };
