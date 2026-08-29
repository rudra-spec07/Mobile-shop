const mobileImageService = require('../services/mobile-image.service');
const { addImageSchema } = require('../validators/catalog.validator');
const { sendSuccess } = require('../utils/response');
const { HTTP_STATUS } = require('../utils/constants');

const addImage = async (req, res, next) => {
  try {
    const validatedData = addImageSchema.parse(req.body);
    const image = await mobileImageService.addImage(req.params.id, validatedData);
    return sendSuccess(res, 'Mobile image added successfully', { image }, HTTP_STATUS.CREATED);
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
  setPrimaryImage,
  deleteImage,
  getMobileImages,
};
