const express = require("express");
const multer = require("multer");
const { Ticket, User } = require("../models");
const { authRequired, requireRole } = require("../middleware/auth");
const cloudinary = require("../config/cloudinary");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

const publicUserAttrs = ["id", "name", "email", "office"];

// Upload an attachment (image or video) -> returns a Cloudinary URL
router.post("/upload", authRequired, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const isVideo = req.file.mimetype.startsWith("video/");
    const isImage = req.file.mimetype.startsWith("image/");
    if (!isVideo && !isImage) {
      return res.status(400).json({ error: "Only images or videos are allowed" });
    }

    // Upload to Cloudinary from buffer
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "it-support-tickets",
          resource_type: isVideo ? "video" : "image",
        },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      stream.end(req.file.buffer);
    });

    res.json({
      url: result.secure_url,
      type: isVideo ? "video" : "image",
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Create a ticket (any authenticated user)
router.post("/", authRequired, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      office,
      attachmentUrl,
      attachmentType,
    } = req.body;
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
      attachmentUrl: attachmentUrl || null,
      attachmentType: attachmentType || null,
    });
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List tickets (scoped by role)
router.get("/", authRequired, async (req, res) => {
  const where = {};
  if (req.query.status) where.status = req.query.status;
  if (req.query.office) where.office = req.query.office;

  if (req.user.role === "employee") {
    where.reporterId = req.user.id;
  } else if (req.user.role === "it_staff") {
    where.assigneeId = req.user.id;
  }

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

// Get single ticket
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

// Admin: assign a ticket
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

// IT staff (or admin): update status / resolution notes
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

// Admin: dashboard stats
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
