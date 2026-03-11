const express = require('express');
const { authenticate } = require('../middleware/auth');
const { Conversation, Message, Notification } = require('../models/index');

const router = express.Router();

// GET /api/messages/conversations - Get all conversations for user
router.get('/conversations', authenticate, async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'firstName lastName profilePicture isActive lastSeen')
      .populate('lastMessage', 'content createdAt sender messageType')
      .populate('resource', 'title images')
      .sort({ lastMessageAt: -1 })
      .limit(50);

    // Add other participant and unread count
    const enriched = conversations.map((conv) => {
      const other = conv.participants.find(
        (p) => p._id.toString() !== req.user._id.toString()
      );
      return {
        ...conv.toObject(),
        otherParticipant: other,
        unreadCount: conv.unreadCount?.get(req.user._id.toString()) || 0,
      };
    });

    res.json({ success: true, data: { conversations: enriched } });
  } catch (error) {
    next(error);
  }
});

// GET /api/messages/:conversationId - Get messages in a conversation
router.get('/:conversationId', authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 30 } = req.query;

    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      participants: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const total = await Message.countDocuments({
      conversation: req.params.conversationId,
      isDeleted: false,
    });

    const messages = await Message.find({
      conversation: req.params.conversationId,
      isDeleted: false,
    })
      .populate('sender', 'firstName lastName profilePicture')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: req.params.conversationId,
        sender: { $ne: req.user._id },
        isRead: false,
      },
      { isRead: true }
    );

    // Reset unread count for this user
    await Conversation.findByIdAndUpdate(req.params.conversationId, {
      $set: { [`unreadCount.${req.user._id}`]: 0 },
    });

    res.json({
      success: true,
      data: {
        messages: messages.reverse(),
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/messages - Send message (or start conversation)
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { recipientId, content, resourceId, conversationId } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: 'Message content required.' });
    }

    let conversation;

    if (conversationId) {
      conversation = await Conversation.findOne({
        _id: conversationId,
        participants: req.user._id,
      });
    } else {
      // Find or create conversation
      conversation = await Conversation.findOne({
        participants: { $all: [req.user._id, recipientId] },
        ...(resourceId ? { resource: resourceId } : {}),
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [req.user._id, recipientId],
          resource: resourceId || undefined,
          unreadCount: { [recipientId]: 0 },
        });
      }
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      content: content.trim(),
    });

    // Update conversation
    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: message._id,
      lastMessageAt: new Date(),
      $inc: { [`unreadCount.${conversation.participants.find((p) => p.toString() !== req.user._id.toString())}`]: 1 },
    });

    await message.populate('sender', 'firstName lastName profilePicture');

    // Emit via socket (handled in socketHandler, but also emit here as fallback)
    if (req.io) {
      req.io.to(`conversation:${conversation._id}`).emit('new_message', message);
    }

    res.status(201).json({ success: true, data: { message, conversationId: conversation._id } });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/messages/:messageId - Soft delete
router.delete('/:messageId', authenticate, async (req, res, next) => {
  try {
    const message = await Message.findOne({
      _id: req.params.messageId,
      sender: req.user._id,
    });

    if (!message) return res.status(404).json({ success: false, message: 'Message not found.' });

    await Message.findByIdAndUpdate(req.params.messageId, {
      isDeleted: true,
      content: 'This message was deleted.',
    });

    res.json({ success: true, message: 'Message deleted.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
