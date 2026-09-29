require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const { sequelize, User } = require("./models");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const ticketRoutes = require("./routes/tickets");
const commentRoutes = require("./routes/comments");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api", commentRoutes);

const PORT = process.env.PORT || 4000;

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

  const existing = await User.findOne({ where: { email } });

  if (existing) {
    if (existing.role !== "super_admin") {
      existing.role = "super_admin";
      await existing.save();
      console.log(`Upgraded ${email} to super_admin`);
    }
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  await User.create({
    name: "System Admin",
    email,
    password: hashed,
    role: "super_admin",
    office: "Head Office",
  });
  console.log(`Seeded super_admin account: ${email}`);
}

async function start() {
  let connected = false;
  for (let i = 0; i < 15 && !connected; i++) {
    try {
      await sequelize.authenticate();
      connected = true;
    } catch (err) {
      console.log("Waiting for database...");
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  if (!connected) throw new Error("Could not connect to database");

  await sequelize.sync();
  await seedAdmin();

  app.listen(PORT, () => console.log(`IT Support backend running on port ${PORT}`));
}

start();