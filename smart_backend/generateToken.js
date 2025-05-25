const jwt = require("jsonwebtoken");

const payload = {
  userId: 123,
  username: "testuser",
  email: "testuser@example.com",
  role: "user",
};

const token = jwt.sign(
  payload,
  "myjwtkeysecret", // Replace with your process.env.JWT_SECRET in production
  { expiresIn: "7d" }
);
