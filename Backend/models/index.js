const mongoose = require('mongoose');

// ─── Request Schema ───────────────────────────────────────────────────────────
const requestSchema = new mongoose.Schema(
  {
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resourceOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      maxlength: [500, 'Request message cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    requestType: {
      type: String,
      enum: ['Borrow', 'Exchange', 'Buy', 'Rent'],
      required: true,
    },
    exchangeOffer: {
      type: String,
      maxlength: [300],
    },
    meetupDetails: {
      location: String,
      time: Date,
    },
    reviewedByRequester: { type: Boolean, default: false },
    reviewedByOwner: { type: Boolean, default: false },
  },
  { timestamps: true }
);

requestSchema.index({ requester: 1, status: 1 });
requestSchema.index({ resourceOwner: 1, status: 1 });
requestSchema.index({ resource: 1 });

// ─── Conversation Schema ──────────────────────────────────────────────────────
const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    lastMessageAt: Date,
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

// ─── Message Schema ───────────────────────────────────────────────────────────
const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: [2000],
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text',
    },
    fileUrl: String,
    isRead: {
      type: Boolean,
      default: false,
    },
    readBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        readAt: { type: Date, default: Date.now },
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: -1 });

// ─── Review Schema ────────────────────────────────────────────────────────────
const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: [500],
    },
    tags: [
      {
        type: String,
        enum: ['Reliable', 'Responsive', 'Honest', 'Good Condition', 'As Described', 'Friendly'],
      },
    ],
  },
  { timestamps: true }
);

reviewSchema.index({ reviewer: 1, request: 1 }, { unique: true });
reviewSchema.index({ reviewee: 1 });

// Update user trust score after review is saved
reviewSchema.post('save', async function () {
  const User = require('./User');
  const result = await mongoose.model('Review').aggregate([
    { $match: { reviewee: this.reviewee } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  if (result.length > 0) {
    await User.findByIdAndUpdate(this.reviewee, {
      trustScore: Math.round(result[0].avgRating * 10) / 10,
      totalRatings: result[0].count,
      ratingSum: result[0].avgRating * result[0].count,
    });
  }
});

// ─── Notification Schema ──────────────────────────────────────────────────────
const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'NEW_REQUEST',
        'REQUEST_ACCEPTED',
        'REQUEST_REJECTED',
        'NEW_MESSAGE',
        'REVIEW_RECEIVED',
        'RESOURCE_EXPIRING',
        'SYSTEM',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: mongoose.Schema.Types.Mixed,
    isRead: { type: Boolean, default: false },
    readAt: Date,
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = {
  Request: mongoose.model('Request', requestSchema),
  Conversation: mongoose.model('Conversation', conversationSchema),
  Message: mongoose.model('Message', messageSchema),
  Review: mongoose.model('Review', reviewSchema),
  Notification: mongoose.model('Notification', notificationSchema),
};
