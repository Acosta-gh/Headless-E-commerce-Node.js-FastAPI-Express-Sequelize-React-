const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");
const SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

const createTempId = async (data) => {
  const tempId = randomUUID();
  const token = jwt.sign({ tempId }, SECRET, { expiresIn: "1h" }); // Expires in 1 hour
  return { tempId, token };
};

module.exports = {
  createTempId,
};
