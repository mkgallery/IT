const sequelize = require("../config/db");
const User = require("./User");
const Ticket = require("./Ticket");

// A ticket is created by an employee (reporter)
Ticket.belongsTo(User, { as: "reporter", foreignKey: "reporterId" });
User.hasMany(Ticket, { as: "reportedTickets", foreignKey: "reporterId" });

// A ticket can be assigned to an IT staff member
Ticket.belongsTo(User, { as: "assignee", foreignKey: "assigneeId" });
User.hasMany(Ticket, { as: "assignedTickets", foreignKey: "assigneeId" });

module.exports = { sequelize, User, Ticket };
