const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// Public registration always creates an "employee".
// IT staff / admin accounts are created by an admin via /api/users (see users.js).
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, office } = req.body;
    if (!name || !email || !password || !office) {
      return res.status(400).json({
        error: "name, email, password, and office are required",
      });
    }
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, office, role: "employee" });

    const token = signToken(user);
    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, office: user.office },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken(user);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, office: user.office },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/me", authRequired, async (req, res) => {
  const user = await User.findByPk(req.user.id, { attributes: ["id", "name", "email", "role", "office"] });
  res.json(user);
});

module.exports = router;