const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { prisma } = require('../config/database');
const AppError = require('../middleware/error.middleware').AppError;
const { HTTP_STATUS, ERROR_CODES } = require('../utils/constants');

/**
 * Add a new image to a mobile listing (Super Admin only).
 * Supports standard image URLs as well as Base64 data URLs (which are saved locally to disk under /uploads/mobiles/).
 */
const addImage = async (mobileId, { imageUrl, isPrimary = false, sortOrder = 0 }) => {
  const mobile = await prisma.mobile.findUnique({ where: { id: mobileId } });
  if (!mobile) {
    throw new AppError('Mobile model not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.MOBILE_NOT_FOUND);
  }

  let finalImageUrl = imageUrl;
  if (typeof imageUrl === 'string' && imageUrl.startsWith('data:image/')) {
    const matches = imageUrl.match(/^data:image\/([a-zA-Z0-9-+.]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      let ext = matches[1].toLowerCase();
      if (ext === 'jpeg') ext = 'jpg';
      const buffer = Buffer.from(matches[2], 'base64');

      const uploadsDir = path.join(process.cwd(), 'uploads', 'mobiles');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const randomStr = crypto.randomBytes(4).toString('hex');
      const filename = `mobile-${mobileId}-${Date.now()}-${randomStr}.${ext}`;
      const filePath = path.join(uploadsDir, filename);

      fs.writeFileSync(filePath, buffer);
      finalImageUrl = `/uploads/mobiles/${filename}`;
    }
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
          imageUrl: finalImageUrl,
          isPrimary: true,
          sortOrder: Number(sortOrder) || 0,
        },
      });
    });
  } else {
    newImage = await prisma.mobileImage.create({
      data: {
        mobileId,
        imageUrl: finalImageUrl,
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

  // If local file exists, attempt to remove it from disk
  if (image.imageUrl && image.imageUrl.startsWith('/uploads/mobiles/')) {
    try {
      const localPath = path.join(process.cwd(), image.imageUrl);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    } catch (e) {
      // Ignore file cleanup errors
    }
  }

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
