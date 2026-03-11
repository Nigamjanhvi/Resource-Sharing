const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer from multer (req.file.buffer)
 * @param {string} folderName - Subfolder inside 'student-resources/' on Cloudinary
 * @returns {Promise<object>} Cloudinary upload result (includes secure_url, public_id)
 */
const uploadFile = (fileBuffer, folderName = 'general') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `student-resources/${folderName}`,
        resource_type: 'auto', // Handles images, PDFs, and other files
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' }, // Resize large images
          { quality: 'auto:good' },                      // Auto compress
          { format: 'webp' },                            // Convert to WebP for speed
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    // Convert buffer to stream and pipe into Cloudinary
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

/**
 * Delete a file from Cloudinary by its public_id
 * @param {string} publicId - The public_id returned during upload
 * @returns {Promise<object>} Cloudinary deletion result
 */
const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'auto',
    });
    return result;
  } catch (error) {
    console.error('Cloudinary deletion error:', error.message);
    throw error;
  }
};

module.exports = { uploadFile, deleteFile, cloudinary };