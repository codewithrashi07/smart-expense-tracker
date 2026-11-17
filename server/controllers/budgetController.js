const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// @desc    Get all budgets for a given month with spent calculation
// @route   GET /api/budgets
// @access  Private
exports.getBudgets = async (req, res, next) => {
  try {
    const now = new Date();
    const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const month = req.query.month || defaultMonth;

    // Parse start and end of that month
    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr, 10);
    const mIndex = parseInt(monthStr, 10) - 1;

    const startOfMonth = new Date(year, mIndex, 1);
    const endOfMonth = new Date(year, mIndex + 1, 0, 23, 59, 59, 999);

    // Retrieve user budgets for this month
    const budgets = await Budget.find({ user: req.user.id, month });

    // Aggregate user expenses for this month grouped by category
    const expenseAgg = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'expense',
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const spentByCategory = {};
    let totalSpentMonth = 0;
    expenseAgg.forEach((item) => {
      spentByCategory[item._id] = item.totalSpent;
      totalSpentMonth += item.totalSpent;
    });

    // Format budget items with real-time stats
    let totalBudgetLimit = 0;
    const enrichedBudgets = budgets.map((b) => {
      const spent = b.category === 'Overall' ? totalSpentMonth : spentByCategory[b.category] || 0;
      const remaining = Math.max(0, b.amount - spent);
      const percentage = b.amount > 0 ? (spent / b.amount) * 100 : 0;

      let status = 'normal';
      if (percentage >= 100) status = 'exceeded';
      else if (percentage >= 90) status = 'critical';
      else if (percentage >= 75) status = 'warning';

      if (b.category !== 'Overall') {
        totalBudgetLimit += b.amount;
      }

      return {
        _id: b._id,
        category: b.category,
        amount: b.amount,
        month: b.month,
        notes: b.notes,
        alertThresholds: b.alertThresholds,
        spent,
        remaining,
        percentage: Math.round(percentage * 10) / 10,
        status,
      };
    });

    // Check if an 'Overall' budget exists
    const overallBudget = enrichedBudgets.find((b) => b.category === 'Overall');
    const effectiveOverallLimit = overallBudget ? overallBudget.amount : totalBudgetLimit;

    res.json({
      success: true,
      month,
      summary: {
        totalBudget: effectiveOverallLimit,
        totalSpent: totalSpentMonth,
        remaining: Math.max(0, effectiveOverallLimit - totalSpentMonth),
        percentage: effectiveOverallLimit > 0 ? Math.round((totalSpentMonth / effectiveOverallLimit) * 1000) / 10 : 0,
      },
      data: enrichedBudgets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update budget for category/month
// @route   POST /api/budgets
// @access  Private
exports.setBudget = async (req, res, next) => {
  try {
    const { category, amount, month, notes, alertThresholds } = req.body;

    if (!category || amount === undefined || !month) {
      return res.status(400).json({
        success: false,
        message: 'Category, amount and month (YYYY-MM) are required',
      });
    }

    const budget = await Budget.findOneAndUpdate(
      { user: req.user.id, category, month },
      {
        amount: Number(amount),
        notes: notes || '',
        alertThresholds: alertThresholds || [75, 90, 100],
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json({
      success: true,
      data: budget,
      message: 'Budget saved successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private
exports.deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found',
      });
    }

    res.json({
      success: true,
      message: 'Budget removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
