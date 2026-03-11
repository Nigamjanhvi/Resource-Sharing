const express = require('express');
const { body, validationResult } = require('express-validator');
const { Review, Request } = require('../models/index');
const { authenticate } = require('../middleware/auth');
const { notifyReviewReceived } = require('../utils/notifications');

const router = express.Router();

// ─── POST /api/reviews ────────────────────────────────────────────────────────
// Submit a review after a completed exchange
router.post(
  '/',
  authenticate,
  [
    body('requestId').notEmpty().withMessage('Request ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().isLength({ max: 500 }),
    body('tags').optional().isArray(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { requestId, rating, comment, tags } = req.body;

      // Find the request
      const request = await Request.findById(requestId)
        .populate('resource')
        .populate('requester')
        .populate('resourceOwner');

      if (!request) {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }

      if (request.status !== 'Completed') {
        return res.status(400).json({ success: false, message: 'Can only review completed exchanges' });
      }

      // Determine who is reviewing whom
      const isRequester = request.requester._id.toString() === req.user._id.toString();
      const isOwner = request.resourceOwner._id.toString() === req.user._id.toString();

      if (!isRequester && !isOwner) {
        return res.status(403).json({ success: false, message: 'Not authorized to review this exchange' });
      }

      // Check if already reviewed
      if (isRequester && request.reviewedByRequester) {
        return res.status(400).json({ success: false, message: 'You have already reviewed this exchange' });
      }
      if (isOwner && request.reviewedByOwner) {
        return res.status(400).json({ success: false, message: 'You have already reviewed this exchange' });
      }

      const reviewee = isRequester ? request.resourceOwner._id : request.requester._id;

      const review = await Review.create({
        reviewer: req.user._id,
        reviewee,
        request: requestId,
        rating,
        comment,
        tags: tags || [],
      });

      // Mark as reviewed
      if (isRequester) request.reviewedByRequester = true;
      if (isOwner) request.reviewedByOwner = true;
      await request.save();

      // Send notification
      const io = req.app.get('io');
      await notifyReviewReceived(
        io,
        reviewee,
        `${req.user.firstName} ${req.user.lastName}`,
        rating
      );

      res.status(201).json({
        success: true,
        message: 'Review submitted successfully',
        data: { review },
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ success: false, message: 'You have already reviewed this exchange' });
      }
      console.error('Submit review error:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// ─── GET /api/reviews/user/:userId ────────────────────────────────────────────
// Get all reviews for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'firstName lastName profilePicture university')
      .populate('request', 'requestType')
      .sort({ createdAt: -1 })
      .limit(20);

    const stats = await Review.aggregate([
      { $match: { reviewee: require('mongoose').Types.ObjectId.createFromHexString(req.params.userId) } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalCount: { $sum: 1 },
          fiveStars:  { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          fourStars:  { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          threeStars: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          twoStars:   { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          oneStar:    { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        reviews,
        stats: stats[0] || { avgRating: 0, totalCount: 0 },
      },
    });
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
