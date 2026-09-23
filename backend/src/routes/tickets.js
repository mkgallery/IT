const express = require("express");
const { Ticket, User } = require("../models");
const { authRequired, requireRole } = require("../middleware/auth");

const router = express.Router();

const publicUserAttrs = ["id", "name", "email", "office"];

// Create a ticket (any authenticated user, typically an employee)
router.post("/", authRequired, async (req, res) => {
  try {
    const { title, description, category, priority, office } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: "title and description are required" });
    }
    const ticket = await Ticket.create({
      title,
      description,
      category,
      priority: priority || "medium",
      office: office || req.user.office,
      reporterId: req.user.id,
      status: "open",
    });
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List tickets - scoped by role:
//   employee  -> only their own tickets
//   it_staff  -> only tickets assigned to them
//   admin     -> all tickets (can filter by ?status= & ?office=)
router.get("/", authRequired, async (req, res) => {
  const where = {};
  if (req.query.status) where.status = req.query.status;
  if (req.query.office) where.office = req.query.office;

  if (req.user.role === "employee") {
    where.reporterId = req.user.id;
  } else if (req.user.role === "it_staff") {
    where.assigneeId = req.user.id;
  }
  // admin sees everything (subject to optional filters above)

  const tickets = await Ticket.findAll({
    where,
    include: [
      { model: User, as: "reporter", attributes: publicUserAttrs },
      { model: User, as: "assignee", attributes: publicUserAttrs },
    ],
    order: [["createdAt", "DESC"]],
  });
  res.json(tickets);
});

// Get a single ticket (must be reporter, assignee, or admin)
router.get("/:id", authRequired, async (req, res) => {
  const ticket = await Ticket.findByPk(req.params.id, {
    include: [
      { model: User, as: "reporter", attributes: publicUserAttrs },
      { model: User, as: "assignee", attributes: publicUserAttrs },
    ],
  });
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });

  const isOwner = ticket.reporterId === req.user.id;
  const isAssignee = ticket.assigneeId === req.user.id;
  if (req.user.role !== "admin" && !isOwner && !isAssignee) {
    return res.status(403).json({ error: "Not authorized to view this ticket" });
  }
  res.json(ticket);
});

// Admin: assign a ticket to an IT staff member
router.put("/:id/assign", authRequired, requireRole("admin"), async (req, res) => {
  try {
    const { assigneeId } = req.body;
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    const staff = await User.findOne({ where: { id: assigneeId, role: "it_staff" } });
    if (!staff) return res.status(400).json({ error: "assigneeId must be a valid IT staff user" });

    ticket.assigneeId = assigneeId;
    ticket.status = "assigned";
    await ticket.save();
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// IT staff (or admin): update ticket status / add resolution notes
router.put("/:id/status", authRequired, requireRole("it_staff", "admin"), async (req, res) => {
  try {
    const { status, resolutionNotes } = req.body;
    const validStatuses = ["open", "assigned", "in_progress", "resolved", "closed"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    if (req.user.role === "it_staff" && ticket.assigneeId !== req.user.id) {
      return res.status(403).json({ error: "You are not assigned to this ticket" });
    }

    if (status) ticket.status = status;
    if (resolutionNotes !== undefined) ticket.resolutionNotes = resolutionNotes;
    await ticket.save();
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: quick dashboard stats
router.get("/stats/overview", authRequired, requireRole("admin"), async (req, res) => {
  const [open, assigned, inProgress, resolved, closed, total] = await Promise.all([
    Ticket.count({ where: { status: "open" } }),
    Ticket.count({ where: { status: "assigned" } }),
    Ticket.count({ where: { status: "in_progress" } }),
    Ticket.count({ where: { status: "resolved" } }),
    Ticket.count({ where: { status: "closed" } }),
    Ticket.count(),
  ]);
  res.json({ open, assigned, inProgress, resolved, closed, total });
});

module.exports = router;
