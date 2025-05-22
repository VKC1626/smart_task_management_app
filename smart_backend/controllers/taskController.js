const Task = require("../models/Task");
const { Op } = require("sequelize");

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, category, dueDate, status, priority } =
      req.body;

    const newTask = await Task.create({
      title,
      description,
      category,
      due_date: dueDate, // Map camelCase to snake_case
      status,
      priority,
      userId: req.user.userId, // Extracted from token via authMiddleware
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
};

// Get all tasks
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { userId: req.user.userId }, // Filter by logged-in user
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

// Get task stats (bar chart & pie chart)
const getTaskStats = async (req, res) => {
  try {
    const tasks = await Task.findAll({ where: { userId: req.user.userId } });

    // Bar chart: count by category
    const barChartData = {};
    tasks.forEach((task) => {
      barChartData[task.category] = (barChartData[task.category] || 0) + 1;
    });

    // Pie chart: count by status
    const pieChartData = { Completed: 0, Pending: 0 };
    tasks.forEach((task) => {
      if (task.status === "completed") {
        pieChartData.Completed += 1;
      } else {
        pieChartData.Pending += 1;
      }
    });

    res.status(200).json({ barChartData, pieChartData });
  } catch (error) {
    console.error("Error generating stats:", error);
    res.status(500).json({ message: "Server error while generating stats" });
  }
};

// ✅ Export getTaskStats
exports.getTaskStats = getTaskStats;
