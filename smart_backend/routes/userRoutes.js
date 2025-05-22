// routes/userRoutes.js

const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/userController");

router.post("/register", registerUser);
router.post("/login", loginUser);
// protected route if needed

module.exports = router;
