/**
 * Parse page and limit from request query parameters.
 * Supports both parsePagination(req.query) and parsePagination(page, limit).
 */
const parsePagination = (queryOrPage = {}, limitParam) => {
  let rawPage;
  let rawLimit;

  if (typeof queryOrPage === 'object' && queryOrPage !== null) {
    rawPage = queryOrPage.page;
    rawLimit = queryOrPage.limit;
  } else {
    rawPage = queryOrPage;
    rawLimit = limitParam;
  }

  const page = Math.max(1, parseInt(rawPage, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(rawLimit, 10) || 10));
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
};

module.exports = {
  parsePagination,
};
