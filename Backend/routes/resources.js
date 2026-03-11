const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Resource = require('../models/Resource');
const User = require('../models/User');
const { authenticate, optionalAuth, authorize } = require('../middleware/auth');
const { uploadImage, deleteFromCloudinary } = require('../utils/cloudinary');
const multer = require('multer');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const resourceValidation = [
  body('title').trim().notEmpty().isLength({ max: 200 }),
  body('description').trim().notEmpty().isLength({ max: 2000 }),
  body('category').isIn(['Books', 'Notes', 'Electronics', 'Lab Tools', 'Stationery', 'Software', 'Other']),
  body('condition').isIn(['New', 'Good', 'Used', 'Worn']),
  body('priceType').isIn(['Free', 'Exchange', 'Rent', 'Sale']),
  body('price').optional().isNumeric().custom((val, { req }) => {
    if (req.body.priceType === 'Sale' && (!val || val <= 0)) {
      throw new Error('Price is required for sale items');
    }
    return true;
  }),
];

// GET /api/resources - Browse with filtering & pagination
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      priceType,
      condition,
      university,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minPrice,
      maxPrice,
    } = req.query;

    const filter = { isActive: true, status: 'Available' };

    if (category) filter.category = category;
    if (priceType) filter.priceType = priceType;
    if (condition) filter.condition = condition;
    if (university) filter.university = new RegExp(university, 'i');
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let query = Resource.find(filter);

    // Full-text search
    if (search) {
      query = Resource.find({ ...filter, $text: { $search: search } }, { score: { $meta: 'textScore' } });
      if (sortBy === 'relevance') {
        query = query.sort({ score: { $meta: 'textScore' } });
      }
    }

    if (sortBy !== 'relevance') {
      const sortObj = {};
      sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
      query = query.sort(sortObj);
    }

    const total = await Resource.countDocuments(filter);
    const resources = await query
      .populate('postedBy', 'firstName lastName profilePicture trustScore university')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    // If user is authenticated, mark bookmarked resources
    if (req.user) {
      const user = await User.findById(req.user._id).select('bookmarks');
      resources.forEach((r) => {
        r.isBookmarked = user.bookmarks.includes(r._id.toString());
      });
    }

    res.json({
      success: true,
      data: {
        resources,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: Number(limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/resources/:id - Single resource
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const resource = await Resource.findOne({ _id: req.params.id, isActive: true })
      .populate('postedBy', 'firstName lastName profilePicture trustScore university totalRatings createdAt');

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    // Increment views (don't await, fire-and-forget)
    Resource.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec();

    // Get related resources
    const related = await Resource.find({
      category: resource.category,
      _id: { $ne: resource._id },
      isActive: true,
      status: 'Available',
    })
      .limit(4)
      .populate('postedBy', 'firstName lastName')
      .select('title images priceType price condition createdAt');

    let isBookmarked = false;
    if (req.user) {
      const user = await User.findById(req.user._id).select('bookmarks');
      isBookmarked = user.bookmarks.includes(resource._id.toString());
    }

    res.json({
      success: true,
      data: { resource, related, isBookmarked },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/resources - Create resource
router.post(
  '/',
  authenticate,
  upload.array('images', 5),
  resourceValidation,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const imageUrls = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const result = await uploadImage(file.buffer, 'resources');
          imageUrls.push({ url: result.secure_url, publicId: result.public_id });
        }
      }

      const resource = await Resource.create({
        ...req.body,
        images: imageUrls,
        postedBy: req.user._id,
        university: req.user.university,
        tags: req.body.tags ? req.body.tags.split(',').map((t) => t.trim()) : [],
      });

      await resource.populate('postedBy', 'firstName lastName profilePicture trustScore');

      res.status(201).json({
        success: true,
        message: 'Resource posted successfully.',
        data: { resource },
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/resources/:id - Update resource
router.put('/:id', authenticate, upload.array('images', 5), async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    if (resource.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this resource.' });
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        const result = await uploadImage(file.buffer, 'resources');
        newImages.push({ url: result.secure_url, publicId: result.public_id });
      }
      req.body.images = [...(resource.images || []), ...newImages];
    }

    const updated = await Resource.findByIdAndUpdate(
      req.params.id,
      { ...req.body, tags: req.body.tags ? req.body.tags.split(',').map((t) => t.trim()) : resource.tags },
      { new: true, runValidators: true }
    ).populate('postedBy', 'firstName lastName profilePicture trustScore');

    res.json({ success: true, message: 'Resource updated.', data: { resource: updated } });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/resources/:id - Soft delete
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    if (resource.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    await Resource.findByIdAndUpdate(req.params.id, { isActive: false, status: 'Removed' });

    res.json({ success: true, message: 'Resource removed successfully.' });
  } catch (error) {
    next(error);
  }
});

// POST /api/resources/:id/bookmark - Toggle bookmark
router.post('/:id/bookmark', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const resourceId = req.params.id;

    const isBookmarked = user.bookmarks.includes(resourceId);
    let message;

    if (isBookmarked) {
      await User.findByIdAndUpdate(req.user._id, { $pull: { bookmarks: resourceId } });
      await Resource.findByIdAndUpdate(resourceId, { $inc: { bookmarkCount: -1 } });
      message = 'Bookmark removed.';
    } else {
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { bookmarks: resourceId } });
      await Resource.findByIdAndUpdate(resourceId, { $inc: { bookmarkCount: 1 } });
      message = 'Resource bookmarked.';
    }

    res.json({ success: true, message, data: { isBookmarked: !isBookmarked } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
