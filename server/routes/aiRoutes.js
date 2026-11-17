const express = require('express');
const router = express.Router();
const { getInsights, chat, scanReceipt } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/insights', getInsights);
router.post('/chat', chat);
router.post('/scan-receipt', scanReceipt);

module.exports = router;
