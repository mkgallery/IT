const express = require("express");
const { Comment, Ticket, User } = require("../models");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

const publicUserAttrs = ["id", "name", "email", "office", "role"];

// Helper: check that the requesting user has access to a ticket
async function canAccessTicket(ticketId, user) {
  const ticket = await Ticket.findByPk(ticketId);
  if (!ticket) return { ok: false, reason: "Ticket not found", status: 404 };

  const isOwner = ticket.reporterId === user.id;
  const isAssignee = ticket.assigneeId === user.id;
  const isAdmin = user.role === "admin" || user.role === "super_admin";

  if (!isAdmin && !isOwner && !isAssignee) {
    return { ok: false, reason: "Not authorized", status: 403 };
  }
  return { ok: true, ticket };
}

// GET /api/tickets/:ticketId/comments — list all comments for a ticket
router.get("/tickets/:ticketId/comments", authRequired, async (req, res) => {
  try {
    const check = await canAccessTicket(req.params.ticketId, req.user);
    if (!check.ok)
      return res.status(check.status).json({ error: check.reason });

    const comments = await Comment.findAll({
      where: { ticketId: req.params.ticketId },
      include: [{ model: User, as: "author", attributes: publicUserAttrs }],
      order: [["createdAt", "ASC"]],
    });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tickets/:ticketId/comments — add a new comment
router.post("/tickets/:ticketId/comments", authRequired, async (req, res) => {
  try {
    const { body } = req.body;
    if (!body || !body.trim()) {
      return res.status(400).json({ error: "Comment body is required" });
    }

    const check = await canAccessTicket(req.params.ticketId, req.user);
    if (!check.ok)
      return res.status(check.status).json({ error: check.reason });

    const comment = await Comment.create({
      ticketId: req.params.ticketId,
      userId: req.user.id,
      body: body.trim(),
    });

    // Reload with author info
    const full = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: "author", attributes: publicUserAttrs }],
    });

    res.status(201).json(full);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tickets/:ticketId/comments/:id — delete a comment
// Only the author OR an admin can delete
router.delete(
  "/tickets/:ticketId/comments/:id",
  authRequired,
  async (req, res) => {
    try {
      const comment = await Comment.findByPk(req.params.id);
      if (!comment) return res.status(404).json({ error: "Comment not found" });

      const isAuthor = comment.userId === req.user.id;
      const isAdmin = req.user.role === "admin" || req.user.role === "super_admin";

      if (!isAuthor && !isAdmin) {
        return res.status(403).json({ error: "Not authorized to delete" });
      }

      await comment.destroy();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;