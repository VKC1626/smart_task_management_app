const express = require("express");
const router = express.Router();
const { User, Task } = require("../models");

router.get("/dashboard", async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalTasks = await Task.count();
    const completedTasks = await Task.count({ where: { status: "completed" } });
    const pendingTasks = await Task.count({ where: { status: "pending" } });

    res.json({
      totalUsers,
      totalTasks,
      completedTasks,
      pendingTasks,
    });
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
});

module.exports = router;
