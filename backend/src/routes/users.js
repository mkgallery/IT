const express = require("express");
const bcrypt = require("bcryptjs");
const { User, Ticket } = require("../models");
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
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      office: user.office,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: reset a user's password
router.put("/:id/password", authRequired, requireRole("admin"), async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    await user.save();

    res.json({ success: true, message: "Password updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: delete a user
// - Cannot delete yourself
// - Cannot delete other admins (safety)
// - Deleting an employee also deletes their REPORTED tickets
// - Deleting an IT staff UNASSIGNS their assigned tickets (status -> open)
router.delete("/:id", authRequired, requireRole("admin"), async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (id === req.user.id) {
      return res.status(400).json({ error: "You cannot delete your own account" });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.role === "admin") {
      return res.status(403).json({ error: "Admin accounts cannot be deleted" });
    }

    if (user.role === "employee") {
      // Delete all tickets reported by this user
      await Ticket.destroy({ where: { reporterId: id } });
    } else if (user.role === "it_staff") {
      // Unassign all tickets assigned to this user, set them back to open
      await Ticket.update(
        { assigneeId: null, status: "open" },
        { where: { assigneeId: id } }
      );
    }

    await user.destroy();
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
