const mobileImageService = require('../services/mobile-image.service');
const cloudinaryService = require('../services/cloudinary.service');
const { addImageSchema } = require('../validators/catalog.validator');
const { sendSuccess } = require('../utils/response');
const { HTTP_STATUS } = require('../utils/constants');

const addImage = async (req, res, next) => {
  try {
    if (req.file) {
      const uploadedUrl = await cloudinaryService.uploadToCloudinary(req.file.buffer, 'mobiles');
      req.body.imageUrl = uploadedUrl;
    }
    const validatedData = addImageSchema.parse(req.body);
    const image = await mobileImageService.addImage(req.params.id, validatedData);
    return sendSuccess(res, 'Mobile image added successfully', { image }, HTTP_STATUS.CREATED);
  } catch (error) {
    return next(error);
  }
};

const replaceImage = async (req, res, next) => {
  try {
    if (req.file) {
      const uploadedUrl = await cloudinaryService.uploadToCloudinary(req.file.buffer, 'mobiles');
      req.body.imageUrl = uploadedUrl;
    }
    if (!req.body.imageUrl || typeof req.body.imageUrl !== 'string') {
      return res.status(400).json({ success: false, message: 'No image file or URL provided for replacement' });
    }
    const image = await mobileImageService.replaceImage(req.params.id, req.params.imageId, req.body.imageUrl);
    return sendSuccess(res, 'Mobile image replaced successfully', { image });
  } catch (error) {
    return next(error);
  }
};

const setPrimaryImage = async (req, res, next) => {
  try {
    const image = await mobileImageService.setPrimaryImage(req.params.id, req.params.imageId);
    return sendSuccess(res, 'Primary image updated successfully', { image });
  } catch (error) {
    return next(error);
  }
};

const deleteImage = async (req, res, next) => {
  try {
    const result = await mobileImageService.deleteImage(req.params.id, req.params.imageId);
    return sendSuccess(res, result.message);
  } catch (error) {
    return next(error);
  }
};

const getMobileImages = async (req, res, next) => {
  try {
    const images = await mobileImageService.getMobileImages(req.params.id);
    return sendSuccess(res, 'Mobile images retrieved successfully', { images });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  addImage,
  replaceImage,
  setPrimaryImage,
  deleteImage,
  getMobileImages,
};
