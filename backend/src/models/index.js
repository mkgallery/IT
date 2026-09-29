const sequelize = require("../config/db");
const User = require("./User");
const Ticket = require("./Ticket");
const Comment = require("./Comment");

// A ticket is created by an employee (reporter)
Ticket.belongsTo(User, { as: "reporter", foreignKey: "reporterId" });
User.hasMany(Ticket, { as: "reportedTickets", foreignKey: "reporterId" });

// A ticket can be assigned to an IT staff member
Ticket.belongsTo(User, { as: "assignee", foreignKey: "assigneeId" });
User.hasMany(Ticket, { as: "assignedTickets", foreignKey: "assigneeId" });

// Comments belong to a ticket and are authored by a user
Comment.belongsTo(Ticket, { foreignKey: "ticketId", onDelete: "CASCADE" });
Ticket.hasMany(Comment, { as: "comments", foreignKey: "ticketId", onDelete: "CASCADE" });

Comment.belongsTo(User, { as: "author", foreignKey: "userId" });
User.hasMany(Comment, { as: "comments", foreignKey: "userId" });

module.exports = { sequelize, User, Ticket, Comment };