const { prisma } = require('../config/database');
const AppError = require('../middleware/error.middleware').AppError;
const { HTTP_STATUS, ERROR_CODES } = require('../utils/constants');

/**
 * Add a new image to a mobile listing (Super Admin only).
 */
const addImage = async (mobileId, { imageUrl, isPrimary = false, sortOrder = 0 }) => {
  const mobile = await prisma.mobile.findUnique({ where: { id: mobileId } });
  if (!mobile) {
    throw new AppError('Mobile model not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.MOBILE_NOT_FOUND);
  }

  const existingImagesCount = await prisma.mobileImage.count({ where: { mobileId } });

  // If this is the first image, force it to be primary
  const shouldBePrimary = existingImagesCount === 0 ? true : Boolean(isPrimary);

  let newImage;
  if (shouldBePrimary) {
    // Transactionally reset all existing primary flags and create new primary image
    newImage = await prisma.$transaction(async (tx) => {
      await tx.mobileImage.updateMany({
        where: { mobileId },
        data: { isPrimary: false },
      });
      return tx.mobileImage.create({
        data: {
          mobileId,
          imageUrl,
          isPrimary: true,
          sortOrder: Number(sortOrder) || 0,
        },
      });
    });
  } else {
    newImage = await prisma.mobileImage.create({
      data: {
        mobileId,
        imageUrl,
        isPrimary: false,
        sortOrder: Number(sortOrder) || 0,
      },
    });
  }

  return newImage;
};

/**
 * Set an image as primary for a mobile (Super Admin only).
 */
const setPrimaryImage = async (mobileId, imageId) => {
  const image = await prisma.mobileImage.findUnique({ where: { id: imageId } });

  if (!image || image.mobileId !== mobileId) {
    throw new AppError('Image not found for this mobile', HTTP_STATUS.NOT_FOUND, ERROR_CODES.IMAGE_NOT_FOUND);
  }

  const updatedImage = await prisma.$transaction(async (tx) => {
    // Reset primary flag for all images belonging to this mobile
    await tx.mobileImage.updateMany({
      where: { mobileId },
      data: { isPrimary: false },
    });

    // Set target image as primary
    return tx.mobileImage.update({
      where: { id: imageId },
      data: { isPrimary: true },
    });
  });

  return updatedImage;
};

/**
 * Delete a mobile image (Super Admin only).
 * ENFORCES AUTOMATIC PRIMARY IMAGE PROMOTION RULE:
 * If the deleted image was primary and other images remain, automatically promote the image
 * with lowest sortOrder / oldest createdAt to primary.
 */
const deleteImage = async (mobileId, imageId) => {
  const image = await prisma.mobileImage.findUnique({ where: { id: imageId } });

  if (!image || image.mobileId !== mobileId) {
    throw new AppError('Image not found for this mobile', HTTP_STATUS.NOT_FOUND, ERROR_CODES.IMAGE_NOT_FOUND);
  }

  const wasPrimary = image.isPrimary;

  await prisma.$transaction(async (tx) => {
    // Delete target image
    await tx.mobileImage.delete({ where: { id: imageId } });

    // If deleted image was primary, check for remaining images to promote
    if (wasPrimary) {
      const remainingImage = await tx.mobileImage.findFirst({
        where: { mobileId },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      });

      if (remainingImage) {
        await tx.mobileImage.update({
          where: { id: remainingImage.id },
          data: { isPrimary: true },
        });
      }
    }
  });

  return { message: 'Image deleted successfully' };
};

/**
 * Get all images for a mobile model.
 */
const getMobileImages = async (mobileId) => {
  const images = await prisma.mobileImage.findMany({
    where: { mobileId },
    orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
  });

  return images;
};

module.exports = {
  addImage,
  setPrimaryImage,
  deleteImage,
  getMobileImages,
};
