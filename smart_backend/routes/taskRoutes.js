const express = require("express");
const router = express.Router();
const { createTask, getTasks } = require("../controllers/taskController");
const { getTaskStats } = require("../controllers/taskController");
const authMiddleware = require("../middleware/authMiddleware");

// Routes
router.post("/", authMiddleware, createTask);
router.get("/", authMiddleware, getTasks);
router.get("/stats", authMiddleware, getTaskStats); // ✅

module.exports = router;
