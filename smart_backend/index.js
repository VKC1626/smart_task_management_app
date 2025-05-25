require("dotenv").config(); // must be first
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET;
console.log("JWT_SECRET:", SECRET_KEY); // should log the secret key

const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Use CORS with proper config (only once)
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Parse JSON requests
app.use(express.json());

// Import routes
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require("./routes/authRoutes");

// Use routes (order matters)
app.use("/api", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api", authRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start server after syncing DB
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
