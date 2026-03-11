const { Message, Conversation } = require('../models/index');
const { notifyNewMessage } = require('../utils/notifications');

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    const user = socket.user;

    // Join personal room for notifications
    if (user) {
      socket.join(`user:${user._id}`);
    }

    // ─── Join a conversation room ─────────────────────────────────────
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    // ─── Leave a conversation room ────────────────────────────────────
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // ─── Typing indicator ─────────────────────────────────────────────
    socket.on('typing', ({ conversationId, isTyping }) => {
      if (!user) return;
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        userId: user._id,
        name: user.firstName,
        isTyping,
      });
    });

    // ─── Send message via socket ──────────────────────────────────────
    socket.on('send_message', async ({ conversationId, content }) => {
      if (!user || !conversationId || !content) return;

      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        // Check user is a participant
        const isParticipant = conversation.participants
          .map((p) => p.toString())
          .includes(user._id.toString());
        if (!isParticipant) return;

        // Create message
        const message = await Message.create({
          conversation: conversationId,
          sender: user._id,
          content,
        });

        const populated = await message.populate('sender', 'firstName lastName profilePicture');

        // Update conversation
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message._id,
          lastMessageAt: new Date(),
        });

        // Emit to all in conversation room
        io.to(`conversation:${conversationId}`).emit('new_message', populated);

        // Notify other participants
        const otherParticipants = conversation.participants.filter(
          (p) => p.toString() !== user._id.toString()
        );

        for (const recipientId of otherParticipants) {
          await notifyNewMessage(
            io,
            recipientId,
            `${user.firstName} ${user.lastName}`,
            conversationId
          );
        }
      } catch (err) {
        console.error('Socket send_message error:', err);
      }
    });

    // ─── Disconnect ───────────────────────────────────────────────────
    socket.on('disconnect', () => {
      if (user) {
        console.log(`User ${user.firstName} disconnected`);
      }
    });
  });
};

module.exports = socketHandler;