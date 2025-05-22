const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");

// Use routes
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);

// Root route (optional)
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Sync database and start server
sequelize
  .sync()
  .then(() => {
    console.log("Database & tables synced");
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to sync database:", err);
  });
