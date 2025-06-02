const { Task } = require("../models");

// Get all tasks for the logged-in user
const getTasks = async (req, res) => {
  try {
    const userId = req.user.id; // set by authMiddleware
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: no user ID" });
    }

    const tasks = await Task.findAll({ where: { userId } });
    res.status(200).json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error.message);
    res.status(500).json({ message: "Server error fetching tasks" });
  }
};

// Create a new task for the logged-in user
const createTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, dueDate, category, status, priority } =
      req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: no user ID" });
    }

    const newTask = await Task.create({
      userId,
      title,
      description,
      dueDate,
      category,
      status,
      priority,
    });

    res.status(201).json({ task: newTask });
  } catch (error) {
    console.error("Error creating task:", error.message);
    res.status(500).json({ message: "Server error creating task" });
  }
};

// Update a task for the logged-in user
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    // Convert snake_case to camelCase for due date
    if (updateData.due_date) {
      updateData.dueDate = updateData.due_date;
      delete updateData.due_date;
    }

    const validPriorities = ["low", "medium", "high"];
    if (updateData.priority && !validPriorities.includes(updateData.priority)) {
      return res.status(400).json({ message: "Invalid priority value" });
    }

    const task = await Task.findOne({ where: { id, userId } });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await task.update(updateData);
    await task.reload();

    // Convert response to camelCase before sending
    const responseData = {
      id: task.id,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate ?? task.due_date, // fallback
      category: task.category,
      status: task.status,
      priority: task.priority,
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error updating task:", error.message);
    return res.status(500).json({
      message: "Failed to update task",
      error: error.message,
    });
  }
};

// Delete a task for the logged-in user
const deleteTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const task = await Task.findOne({ where: { id, userId } });

    if (!task) {
      return res
        .status(404)
        .json({ message: "Task not found or unauthorized" });
    }

    await task.destroy();
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error.message);
    res.status(500).json({ message: "Server error deleting task" });
  }
};

// Get task statistics for the logged-in user
const getTaskStats = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: no user ID" });
    }

  
    const tasks = await Task.findAll({ where: { userId } });

    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
      (task) => task.status === "completed"
    ).length;

    res.status(200).json({
      totalTasks,
      completedTasks,
    });
  } catch (error) {
    console.error("Error fetching task stats:", error.message);
    res.status(500).json({ message: "Server error fetching stats" });
  }
};

module.exports = {
  getTasks,
  createTask,
  getTaskStats,
  updateTask,
  deleteTask,
};
