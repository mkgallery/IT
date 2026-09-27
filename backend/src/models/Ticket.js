const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Ticket = sequelize.define("Ticket", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  office: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  priority: {
    type: DataTypes.ENUM("low", "medium", "high", "urgent"),
    defaultValue: "medium",
  },
  status: {
    type: DataTypes.ENUM("open", "assigned", "in_progress", "resolved", "closed"),
    defaultValue: "open",
  },
  resolutionNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  attachmentUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  attachmentType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Ticket;
