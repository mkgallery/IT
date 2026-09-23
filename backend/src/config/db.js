const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME || "itsupport",
  process.env.DB_USER || "itsupport_user",
  process.env.DB_PASSWORD || "itsupport_pass",
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: false,
  }
);

module.exports = sequelize;
