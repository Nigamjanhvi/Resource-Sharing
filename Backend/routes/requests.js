// ─── routes/requests.js ───────────────────────────────────────────────────────
const express = require('express');
const { authenticate } = require('../middleware/auth');
const { Request } = require('../models/index');
const Resource = require('../models/Resource');
const { createNotification } = require('../utils/notifications');

const requestRouter = express.Router();

// POST /api/requests
requestRouter.post('/', authenticate, async (req, res, next) => {
  try {
    const { resourceId, message, requestType, exchangeOffer } = req.body;

    const resource = await Resource.findById(resourceId).populate('postedBy', '_id');
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found.' });

    if (resource.postedBy._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot request your own resource.' });
    }
    if (resource.status !== 'Available') {
      return res.status(400).json({ success: false, message: 'Resource is not available.' });
    }

    const existingRequest = await Request.findOne({
      resource: resourceId,
      requester: req.user._id,
      status: { $in: ['Pending', 'Accepted'] },
    });
    if (existingRequest) {
      return res.status(409).json({ success: false, message: 'You already have an active request for this resource.' });
    }

    const request = await Request.create({
      resource: resourceId,
      requester: req.user._id,
      resourceOwner: resource.postedBy._id,
      message,
      requestType,
      exchangeOffer,
    });

    // Update resource status
    await Resource.findByIdAndUpdate(resourceId, { status: 'Pending' });

    // Notify resource owner
    await createNotification({
      recipient: resource.postedBy._id,
      type: 'NEW_REQUEST',
      title: 'New Request',
      message: `${req.user.firstName} has requested your resource: ${resource.title}`,
      data: { requestId: request._id, resourceId },
      io: req.io,
    });

    await request.populate([
      { path: 'requester', select: 'firstName lastName profilePicture trustScore' },
      { path: 'resource', select: 'title images priceType' },
    ]);

    res.status(201).json({ success: true, message: 'Request sent.', data: { request } });
  } catch (error) {
    next(error);
  }
});

// GET /api/requests - Get user's requests (sent & received)
requestRouter.get('/', authenticate, async (req, res, next) => {
  try {
    const { type = 'received', status, page = 1, limit = 10 } = req.query;
    const filter = type === 'sent' ? { requester: req.user._id } : { resourceOwner: req.user._id };
    if (status) filter.status = status;

    const total = await Request.countDocuments(filter);
    const requests = await Request.find(filter)
      .populate('requester', 'firstName lastName profilePicture trustScore university')
      .populate('resourceOwner', 'firstName lastName profilePicture trustScore')
      .populate('resource', 'title images priceType price category')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: {
        requests,
        pagination: { currentPage: Number(page), totalPages: Math.ceil(total / limit), totalItems: total },
      },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/requests/:id - Accept / Reject / Complete
requestRouter.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { status, meetupDetails } = req.body;
    const request = await Request.findById(req.params.id)
      .populate('requester', '_id firstName')
      .populate('resource', 'title _id');

    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });

    const isOwner = request.resourceOwner.toString() === req.user._id.toString();
    const isRequester = request.requester._id.toString() === req.user._id.toString();

    if (!isOwner && !isRequester) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    // Owners can Accept/Reject, Requesters can Cancel, Both can Complete
    if (['Accepted', 'Rejected'].includes(status) && !isOwner) {
      return res.status(403).json({ success: false, message: 'Only resource owner can accept/reject.' });
    }
    if (status === 'Cancelled' && !isRequester) {
      return res.status(403).json({ success: false, message: 'Only requester can cancel.' });
    }

    request.status = status;
    if (meetupDetails) request.meetupDetails = meetupDetails;
    await request.save();

    // Update resource status
    let resourceStatus = 'Available';
    if (status === 'Accepted') resourceStatus = 'Pending';
    if (status === 'Completed') resourceStatus = 'Exchanged';
    if (['Rejected', 'Cancelled'].includes(status)) resourceStatus = 'Available';
    await Resource.findByIdAndUpdate(request.resource._id, { status: resourceStatus });

    // Notify requester
    if (['Accepted', 'Rejected'].includes(status)) {
      await createNotification({
        recipient: request.requester._id,
        type: status === 'Accepted' ? 'REQUEST_ACCEPTED' : 'REQUEST_REJECTED',
        title: `Request ${status}`,
        message: `Your request for "${request.resource.title}" has been ${status.toLowerCase()}.`,
        data: { requestId: request._id },
        io: req.io,
      });
    }

    res.json({ success: true, message: `Request ${status.toLowerCase()}.`, data: { request } });
  } catch (error) {
    next(error);
  }
});

module.exports = requestRouter;
