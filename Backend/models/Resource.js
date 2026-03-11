const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Books', 'Notes', 'Electronics', 'Lab Tools', 'Stationery', 'Software', 'Other'],
    },
    subject: {
      type: String,
      trim: true,
    },
    condition: {
      type: String,
      required: [true, 'Condition is required'],
      enum: ['New', 'Good', 'Used', 'Worn'],
    },
    priceType: {
      type: String,
      required: [true, 'Price type is required'],
      enum: ['Free', 'Exchange', 'Rent', 'Sale'],
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    rentDuration: {
      type: String,
      enum: ['Per Day', 'Per Week', 'Per Month'],
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: String, // Cloudinary public_id for deletion
      },
    ],
    files: [
      {
        url: String,
        publicId: String,
        name: String,
        type: String, // PDF, DOC, etc.
      },
    ],
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    university: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Available', 'Pending', 'Exchanged', 'Rented', 'Sold', 'Removed'],
      default: 'Available',
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    views: {
      type: Number,
      default: 0,
    },
    bookmarkCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Text index for full-text search
resourceSchema.index({
  title: 'text',
  description: 'text',
  subject: 'text',
  tags: 'text',
});

// Compound indexes for filtering performance
resourceSchema.index({ category: 1, status: 1 });
resourceSchema.index({ university: 1, status: 1 });
resourceSchema.index({ priceType: 1, status: 1 });
resourceSchema.index({ postedBy: 1 });
resourceSchema.index({ createdAt: -1 });
resourceSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual: primary image
resourceSchema.virtual('primaryImage').get(function () {
  return this.images && this.images.length > 0 ? this.images[0].url : null;
});

const Resource = mongoose.model('Resource', resourceSchema);
module.exports = Resource;
