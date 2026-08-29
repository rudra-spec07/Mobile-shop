/**
 * Generates a clean URL-friendly slug from a string.
 * Example: "Samsung Galaxy S26 Ultra 5G" -> "samsung-galaxy-s26-ultra-5g"
 */
const generateSlug = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove invalid chars
    .replace(/[\s_]+/g, '-')     // Replace spaces/underscores with -
    .replace(/-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+|-+$/g, '');    // Trim - from start and end
};

module.exports = {
  generateSlug,
};
