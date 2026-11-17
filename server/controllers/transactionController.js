const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Notification = require('../models/Notification');

// Helper to check budget alerts when expense is added
const checkBudgetThresholds = async (userId, category, date) => {
  try {
    const txDate = new Date(date);
    const month = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;

    // Find budgets for this user (both specific category and 'Overall')
    const budgets = await Budget.find({
      user: userId,
      month,
      $or: [{ category }, { category: 'Overall' }],
    });

    if (!budgets.length) return;

    // Calculate total spent in this month for each budget
    const startOfMonth = new Date(txDate.getFullYear(), txDate.getMonth(), 1);
    const endOfMonth = new Date(txDate.getFullYear(), txDate.getMonth() + 1, 0, 23, 59, 59);

    for (const b of budgets) {
      const matchCriteria = {
        user: userId,
        type: 'expense',
        date: { $gte: startOfMonth, $lte: endOfMonth },
      };

      if (b.category !== 'Overall') {
        matchCriteria.category = b.category;
      }

      const expenses = await Transaction.aggregate([
        { $match: matchCriteria },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      const totalSpent = expenses.length > 0 ? expenses[0].total : 0;
      const percentage = (totalSpent / b.amount) * 100;

      let alertType = null;
      let severity = 'info';
      let msg = '';

      if (percentage >= 100) {
        alertType = 100;
        severity = 'critical';
        msg = `🚨 Budget Exceeded! You have spent ${percentage.toFixed(0)}% (${totalSpent.toFixed(2)}) of your ${b.category} budget limit (${b.amount.toFixed(2)}).`;
      } else if (percentage >= 90) {
        alertType = 90;
        severity = 'warning';
        msg = `⚠️ High Budget Usage: You have utilized ${percentage.toFixed(0)}% of your ${b.category} monthly budget.`;
      } else if (percentage >= 75) {
        alertType = 75;
        severity = 'info';
        msg = `Notice: You have reached ${percentage.toFixed(0)}% of your ${b.category} monthly budget.`;
      }

      if (alertType) {
        // Prevent duplicate spam: check if an identical notification was sent today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const existingNotif = await Notification.findOne({
          user: userId,
          type: 'budget_alert',
          'data.budgetId': b._id,
          'data.threshold': alertType,
          createdAt: { $gte: startOfDay },
        });

        if (!existingNotif) {
          await Notification.create({
            user: userId,
            title: `Budget Alert: ${b.category}`,
            message: msg,
            type: 'budget_alert',
            severity,
            link: '/budgets',
            data: { budgetId: b._id, threshold: alertType, percentage, totalSpent, budgetLimit: b.amount },
          });
        }
      }
    }
  } catch (err) {
    console.error('Error running checkBudgetThresholds:', err.message);
  }
};

// @desc    Get all transactions with filtering, search, pagination, and sorting
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
  try {
    const {
      type,
      category,
      paymentMethod,
      startDate,
      endDate,
      search,
      sortBy = 'date',
      order = 'desc',
      page = 1,
      limit = 15,
    } = req.query;

    const query = { user: req.user.id };

    if (type && ['income', 'expense'].includes(type)) {
      query.type = type;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (paymentMethod && paymentMethod !== 'All') {
      query.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { notes: searchRegex },
        { category: searchRegex },
        { paymentMethod: searchRegex },
      ];
    }

    const sortOption = {};
    const sortField = ['date', 'amount', 'title', 'createdAt'].includes(sortBy) ? sortBy : 'date';
    sortOption[sortField] = order === 'asc' ? 1 : -1;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 15));
    const skip = (pageNum - 1) * limitNum;

    const [transactions, totalCount] = await Promise.all([
      Transaction.find(query).sort(sortOption).skip(skip).limit(limitNum),
      Transaction.countDocuments(query),
    ]);

    // Calculate sum metrics for current filtered query
    const totalsAgg = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let filteredIncome = 0;
    let filteredExpense = 0;
    totalsAgg.forEach((item) => {
      if (item._id === 'income') filteredIncome = item.total;
      if (item._id === 'expense') filteredExpense = item.total;
    });

    res.json({
      success: true,
      count: transactions.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      summary: {
        income: filteredIncome,
        expense: filteredExpense,
        net: filteredIncome - filteredExpense,
      },
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
exports.getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
exports.createTransaction = async (req, res, next) => {
  try {
    const { title, amount, type, category, date, paymentMethod, notes, receiptUrl, tags, isRecurring } = req.body;

    if (!title || !amount || !type || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, amount, type and category',
      });
    }

    const transaction = await Transaction.create({
      user: req.user.id,
      title,
      amount: Number(amount),
      type,
      category,
      date: date ? new Date(date) : new Date(),
      paymentMethod: paymentMethod || 'Credit Card',
      notes: notes || '',
      receiptUrl: receiptUrl || '',
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' && tags ? tags.split(',').map((t) => t.trim()) : [],
      isRecurring: Boolean(isRecurring),
    });

    // If it's an expense, asynchronously verify budget thresholds
    if (type === 'expense') {
      checkBudgetThresholds(req.user.id, category, transaction.date);
    }

    res.status(201).json({
      success: true,
      data: transaction,
      message: 'Transaction created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update existing transaction
// @route   PUT /api/transactions/:id
// @access  Private
exports.updateTransaction = async (req, res, next) => {
  try {
    let transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    const { title, amount, type, category, date, paymentMethod, notes, receiptUrl, tags, isRecurring } = req.body;

    if (title) transaction.title = title;
    if (amount !== undefined) transaction.amount = Number(amount);
    if (type) transaction.type = type;
    if (category) transaction.category = category;
    if (date) transaction.date = new Date(date);
    if (paymentMethod) transaction.paymentMethod = paymentMethod;
    if (notes !== undefined) transaction.notes = notes;
    if (receiptUrl !== undefined) transaction.receiptUrl = receiptUrl;
    if (tags !== undefined) {
      transaction.tags = Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : [];
    }
    if (isRecurring !== undefined) transaction.isRecurring = Boolean(isRecurring);

    await transaction.save();

    if (transaction.type === 'expense') {
      checkBudgetThresholds(req.user.id, transaction.category, transaction.date);
    }

    res.json({
      success: true,
      data: transaction,
      message: 'Transaction updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
exports.deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    res.json({
      success: true,
      message: 'Transaction removed successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload a receipt image
// @route   POST /api/transactions/upload-receipt
// @access  Private
exports.uploadReceipt = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please select a receipt file to upload',
    });
  }

  const receiptUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    message: 'Receipt uploaded successfully',
    receiptUrl,
    filename: req.file.filename,
    size: req.file.size,
  });
};

// @desc    Export transactions as CSV
// @route   GET /api/transactions/export/csv
// @access  Private
exports.exportCSV = async (req, res, next) => {
  try {
    const { startDate, endDate, type, category } = req.query;
    const query = { user: req.user.id };

    if (type) query.type = type;
    if (category && category !== 'All') query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });

    let csvContent = 'ID,Date,Title,Type,Category,Amount,Payment Method,Notes,Receipt URL\n';
    transactions.forEach((tx) => {
      const d = new Date(tx.date).toISOString().split('T')[0];
      const cleanTitle = `"${(tx.title || '').replace(/"/g, '""')}"`;
      const cleanNotes = `"${(tx.notes || '').replace(/"/g, '""')}"`;
      const cleanReceipt = `"${(tx.receiptUrl || '').replace(/"/g, '""')}"`;
      csvContent += `${tx._id},${d},${cleanTitle},${tx.type},${tx.category},${tx.amount.toFixed(2)},${tx.paymentMethod},${cleanNotes},${cleanReceipt}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=transactions-${new Date().toISOString().split('T')[0]}.csv`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
