const catalogService = require('../services/catalog.service');
const { globalSearchQuerySchema } = require('../validators/catalog.validator');
const { sendSuccess } = require('../utils/response');
const { ROLES } = require('../utils/constants');

/**
 * Handle Unified Global Search across Mobiles, Parts, Brands, and Categories.
 */
const globalSearch = async (req, res, next) => {
  try {
    const validatedQuery = globalSearchQuerySchema.parse(req.query);
    const queryText = validatedQuery.q || validatedQuery.search || '';
    const userRole = req.user?.role || ROLES.CUSTOMER;

    const searchResults = await catalogService.unifiedSearch(queryText, userRole, validatedQuery.limit);
    return sendSuccess(res, 'Global search executed successfully', searchResults);
  } catch (error) {
    return next(error);
  }
};

/**
 * Handle Catalog Filter Metadata retrieval.
 */
const getCatalogFilters = async (req, res, next) => {
  try {
    const userRole = req.user?.role || ROLES.CUSTOMER;
    const filterMetadata = await catalogService.getCatalogFilterMetadata(userRole);
    return sendSuccess(res, 'Catalog filter metadata retrieved successfully', filterMetadata);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  globalSearch,
  getCatalogFilters,
};
