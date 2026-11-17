const express = require('express');
const router = express.Router();
const {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  uploadReceipt,
  exportCSV,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect); // all routes protected

router.get('/', getTransactions);
router.post('/', createTransaction);
router.get('/export/csv', exportCSV);
router.post('/upload-receipt', upload.single('receipt'), uploadReceipt);
router.get('/:id', getTransactionById);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
