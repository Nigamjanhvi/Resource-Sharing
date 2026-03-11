const { Notification } = require('../models/index');

/**
 * Create a notification and emit it via Socket.io if available
 */
const createNotification = async (io, recipientId, type, title, message, data = {}) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      data,
    });

    // Emit real-time notification if socket server is available
    if (io) {
      io.to(`user:${recipientId}`).emit('notification', {
        _id: notification._id,
        type,
        title,
        message,
        data,
        isRead: false,
        createdAt: notification.createdAt,
      });
    }

    return notification;
  } catch (err) {
    console.error('Failed to create notification:', err);
    return null;
  }
};

/**
 * Notify resource owner of a new request
 */
const notifyNewRequest = (io, ownerId, requesterName, resourceTitle) => {
  return createNotification(
    io,
    ownerId,
    'NEW_REQUEST',
    'New Request Received',
    `${requesterName} has requested your resource: "${resourceTitle}"`,
    { requesterName, resourceTitle }
  );
};

/**
 * Notify requester that their request was accepted
 */
const notifyRequestAccepted = (io, requesterId, ownerName, resourceTitle) => {
  return createNotification(
    io,
    requesterId,
    'REQUEST_ACCEPTED',
    'Request Accepted! 🎉',
    `${ownerName} accepted your request for "${resourceTitle}"`,
    { ownerName, resourceTitle }
  );
};

/**
 * Notify requester that their request was rejected
 */
const notifyRequestRejected = (io, requesterId, ownerName, resourceTitle) => {
  return createNotification(
    io,
    requesterId,
    'REQUEST_REJECTED',
    'Request Declined',
    `${ownerName} declined your request for "${resourceTitle}"`,
    { ownerName, resourceTitle }
  );
};

/**
 * Notify user of a new message
 */
const notifyNewMessage = (io, recipientId, senderName, conversationId) => {
  return createNotification(
    io,
    recipientId,
    'NEW_MESSAGE',
    'New Message',
    `You have a new message from ${senderName}`,
    { senderName, conversationId }
  );
};

/**
 * Notify user of a new review
 */
const notifyReviewReceived = (io, recipientId, reviewerName, rating) => {
  return createNotification(
    io,
    recipientId,
    'REVIEW_RECEIVED',
    'New Review Received ⭐',
    `${reviewerName} left you a ${rating}-star review`,
    { reviewerName, rating }
  );
};

module.exports = {
  createNotification,
  notifyNewRequest,
  notifyRequestAccepted,
  notifyRequestRejected,
  notifyNewMessage,
  notifyReviewReceived,
};
