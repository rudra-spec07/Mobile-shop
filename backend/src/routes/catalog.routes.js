const express = require('express');
const catalogController = require('../controllers/catalog.controller');
const { optionalAuthenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Unified Global Search Route
router.get('/search', optionalAuthenticate, catalogController.globalSearch);

// Catalog Filter Metadata Routes
router.get('/catalog/filters', optionalAuthenticate, catalogController.getCatalogFilters);
router.get('/catalog/discovery', optionalAuthenticate, catalogController.getCatalogFilters);

module.exports = router;
