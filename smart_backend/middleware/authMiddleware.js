// authMiddleware.js
require("dotenv").config();
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET;
console.log("Middleware JWT_SECRET:", SECRET_KEY);

const authMiddleware = (req, res, next) => {
  const authHeader = req.get("Authorization");
  console.log("Authorization Header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log("Decoded Token:", decoded);

    if (!decoded.id) {
      return res.status(400).json({ message: "Invalid token payload" });
    }

    req.user = { id: decoded.id };
    next();
  } catch (err) {
    console.error("JWT verification error:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
