const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Extract Cloudinary public_id from secure URL
 * Example: https://res.cloudinary.com/demo/image/upload/v1573840393/mobiles/sample.png -> mobiles/sample
 */
const extractPublicId = (url) => {
  if (typeof url !== 'string' || !url.includes('cloudinary.com')) {
    return null;
  }
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    let pathPart = parts[1];
    // Remove version prefix (e.g. v123456789/)
    pathPart = pathPart.replace(/^v\d+\//, '');
    // Remove extension
    const lastDotIndex = pathPart.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      pathPart = pathPart.substring(0, lastDotIndex);
    }
    return pathPart;
  } catch (err) {
    return null;
  }
};

/**
 * Upload a buffer to Cloudinary
 * @param {Buffer} fileBuffer
 * @param {string} folder
 * @returns {Promise<string>} secure_url
 */
const uploadToCloudinary = (fileBuffer, folder = 'mobile-adda') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete an asset from Cloudinary using its secure URL
 * @param {string} imageUrl
 * @returns {Promise<boolean>} success status
 */
const deleteFromCloudinary = async (imageUrl) => {
  const publicId = extractPublicId(imageUrl);
  if (!publicId) return false;
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Failed to delete asset from Cloudinary:', error);
    return false;
  }
};

module.exports = {
  cloudinary,
  extractPublicId,
  uploadToCloudinary,
  deleteFromCloudinary,
};
