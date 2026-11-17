const express = require('express');
const router = express.Router();
const { getOverview, getTrends, getCategories, getForecast } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/overview', getOverview);
router.get('/trends', getTrends);
router.get('/categories', getCategories);
router.get('/forecast', getForecast);

module.exports = router;
