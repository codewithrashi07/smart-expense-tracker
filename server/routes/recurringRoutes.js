const express = require('express');
const router = express.Router();
const { getRecurring, createRecurring, updateRecurring, deleteRecurring, processRecurring } = require('../controllers/recurringController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getRecurring);
router.post('/', createRecurring);
router.put('/:id', updateRecurring);
router.delete('/:id', deleteRecurring);
router.post('/:id/process', processRecurring);

module.exports = router;
