const express = require('express');
const { Notification } = require('../models/index');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// ─── GET /api/notifications ───────────────────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;

    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.json({
      success: true,
      data: { notifications, unreadCount },
    });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── PUT /api/notifications/mark-read ────────────────────────────────────────
router.put('/mark-read', authenticate, async (req, res) => {
  try {
    const { ids } = req.body;

    if (ids === 'all') {
      await Notification.updateMany(
        { recipient: req.user._id, isRead: false },
        { $set: { isRead: true, readAt: new Date() } }
      );
    } else if (Array.isArray(ids) && ids.length > 0) {
      await Notification.updateMany(
        { _id: { $in: ids }, recipient: req.user._id },
        { $set: { isRead: true, readAt: new Date() } }
      );
    }

    res.json({ success: true, message: 'Notifications marked as read' });
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── DELETE /api/notifications/:id ───────────────────────────────────────────
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id,
    });

    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    console.error('Delete notification error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;