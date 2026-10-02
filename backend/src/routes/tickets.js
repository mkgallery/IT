const express = require("express");
const multer = require("multer");
const { Op } = require("sequelize");
const { Ticket, User } = require("../models");
const { authRequired, requireRole } = require("../middleware/auth");
const cloudinary = require("../config/cloudinary");
const { deleteCloudinaryFile } = require("../config/cloudinaryHelpers");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024, files: 5 }, // 20 MB per file, max 5 files
});

const publicUserAttrs = ["id", "name", "email", "office"];

// Helper: upload a single buffer to Cloudinary
function uploadBufferToCloudinary(buffer, mimetype) {
  const isVideo = mimetype.startsWith("video/");
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "it-support-tickets",
        resource_type: isVideo ? "video" : "image",
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

// Upload MULTIPLE attachments (up to 5) -> returns array of { url, type }
router.post("/upload", authRequired, upload.array("files", 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const results = [];
    for (const file of req.files) {
      const isVideo = file.mimetype.startsWith("video/");
      const isImage = file.mimetype.startsWith("image/");
      if (!isVideo && !isImage) {
        return res.status(400).json({ error: "Only images or videos are allowed" });
      }

      const result = await uploadBufferToCloudinary(file.buffer, file.mimetype);
      results.push({
        url: result.secure_url,
        type: isVideo ? "video" : "image",
      });
    }

    res.json({ attachments: results });
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
      attachments, // array of { url, type } (new)
      attachmentUrl, // single (legacy, still supported)
      attachmentType,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: "title and description are required" });
    }

    // Keep legacy fields too — set to the first attachment for compatibility
    let firstUrl = attachmentUrl || null;
    let firstType = attachmentType || null;
    if (Array.isArray(attachments) && attachments.length > 0) {
      firstUrl = attachments[0].url;
      firstType = attachments[0].type;
    }

    const ticket = await Ticket.create({
      title,
      description,
      category,
      priority: priority || "medium",
      office: office || req.user.office,
      reporterId: req.user.id,
      status: "open",
      attachmentUrl: firstUrl,
      attachmentType: firstType,
      attachments: Array.isArray(attachments) && attachments.length > 0 ? attachments : null,
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

// Admin: dashboard stats (MUST be before /:id)
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

// Admin: 7-day ticket volume trend (MUST be before /:id)
router.get("/stats/trend", authRequired, requireRole("admin"), async (req, res) => {
  try {
    const days = 7;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));

    const tickets = await Ticket.findAll({
      where: { createdAt: { [Op.gte]: start } },
      attributes: ["createdAt"],
    });

    const buckets = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      buckets[key] = 0;
    }

    tickets.forEach((ticket) => {
      const key = new Date(ticket.createdAt).toISOString().slice(0, 10);
      if (buckets[key] !== undefined) buckets[key] += 1;
    });

    const result = Object.entries(buckets).map(([date, count]) => {
      const d = new Date(date);
      return {
        date,
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        count,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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

// Admin: delete a ticket (also deletes all Cloudinary attachments)
router.delete("/:id", authRequired, requireRole("admin"), async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    // Delete all attachments from Cloudinary
    const urls = [];
    if (Array.isArray(ticket.attachments)) {
      ticket.attachments.forEach((a) => a.url && urls.push(a.url));
    }
    if (ticket.attachmentUrl) urls.push(ticket.attachmentUrl);

    for (const url of urls) {
      await deleteCloudinaryFile(url);
    }

    await ticket.destroy();
    res.json({ success: true, message: "Ticket deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;