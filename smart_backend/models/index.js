const Sequelize = require("sequelize");
const sequelize = require("../config/db");

const User = require("./User");
const Task = require("./Task");

// Initialize associations
User.hasMany(Task, { foreignKey: "userId", onDelete: "CASCADE" });
Task.belongsTo(User, { foreignKey: "userId" });

const db = {
  sequelize,
  Sequelize,
  User,
  Task,
};

module.exports = db;
