const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Task = sequelize.define("Task", {
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  category: { type: DataTypes.STRING, allowNull: true },
  action: { type: DataTypes.STRING, allowNull: true },
  priority: {
    type: DataTypes.ENUM("low", "medium", "high"),
    defaultValue: "medium",
  },
  status: {
    type: DataTypes.ENUM("pending", "in progress", "completed"),
    defaultValue: "pending",
  },
  dueDate: { type: DataTypes.DATE, allowNull: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
});

module.exports = Task;
