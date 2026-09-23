const express = require("express");
const bcrypt = require("bcryptjs");
const { User } = require("../models");
const { authRequired, requireRole } = require("../middleware/auth");

const router = express.Router();

// Admin: list all users (optionally filter by role, e.g. ?role=it_staff)
router.get("/", authRequired, requireRole("admin"), async (req, res) => {
  const where = {};
  if (req.query.role) where.role = req.query.role;
  const users = await User.findAll({
    where,
    attributes: ["id", "name", "email", "role", "office"],
    order: [["name", "ASC"]],
  });
  res.json(users);
});

// Admin: create an IT staff or admin account
router.post("/", authRequired, requireRole("admin"), async (req, res) => {
  try {
    const { name, email, password, role, office } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "name, email, password, role are required" });
    }
    if (!["employee", "it_staff", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role, office });
    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role, office: user.office });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
