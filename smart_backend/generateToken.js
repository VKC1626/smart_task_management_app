const jwt = require("jsonwebtoken");

const payload = {
  userId: 123,
  username: "testuser",
  email: "testuser@example.com",
  role: "user",
};

const token = jwt.sign(
  payload,
  "myjwtkeysecret", 
  { expiresIn: "7d" }
);
