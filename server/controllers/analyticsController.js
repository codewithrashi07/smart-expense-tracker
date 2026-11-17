const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const RecurringTransaction = require('../models/RecurringTransaction');
const SavingsGoal = require('../models/SavingsGoal');
const { calculateHealthScore } = require('../utils/financialHealth');

// @desc    Get dashboard executive overview metrics
// @route   GET /api/analytics/overview
// @access  Private
exports.getOverview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

    const startOfPrevMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfPrevMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    // 1. All-time totals
    const allTimeAgg = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    let totalAllTimeIncome = 0;
    let totalAllTimeExpense = 0;
    let totalTransactions = 0;

    allTimeAgg.forEach((item) => {
      totalTransactions += item.count;
      if (item._id === 'income') totalAllTimeIncome = item.total;
      if (item._id === 'expense') totalAllTimeExpense = item.total;
    });

    const netBalance = totalAllTimeIncome - totalAllTimeExpense;

    // 2. Current Month Totals
    const currentMonthAgg = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let monthIncome = 0;
    let monthExpense = 0;
    currentMonthAgg.forEach((item) => {
      if (item._id === 'income') monthIncome = item.total;
      if (item._id === 'expense') monthExpense = item.total;
    });

    const monthSavings = monthIncome - monthExpense;
    const savingsRate = monthIncome > 0 ? Math.max(0, Math.round((monthSavings / monthIncome) * 100)) : 0;

    // 3. Previous Month Totals (for comparison growth %)
    const prevMonthAgg = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: startOfPrevMonth, $lte: endOfPrevMonth },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let prevMonthIncome = 0;
    let prevMonthExpense = 0;
    prevMonthAgg.forEach((item) => {
      if (item._id === 'income') prevMonthIncome = item.total;
      if (item._id === 'expense') prevMonthExpense = item.total;
    });

    const expenseGrowthPercent = prevMonthExpense > 0
      ? Math.round(((monthExpense - prevMonthExpense) / prevMonthExpense) * 100)
      : 0;

    // 4. Budget progress for current month
    const budgets = await Budget.find({ user: userId, month: currentMonthStr });
    const overallBudget = budgets.find((b) => b.category === 'Overall');
    const totalBudgetCap = overallBudget
      ? overallBudget.amount
      : budgets.reduce((sum, b) => sum + b.amount, 0);

    const budgetProgress = totalBudgetCap > 0
      ? Math.min(100, Math.round((monthExpense / totalBudgetCap) * 100))
      : 0;

    // 5. Recent 5 Transactions
    const recentTransactions = await Transaction.find({ user: userId })
      .sort({ date: -1 })
      .limit(5);

    // 6. Upcoming Recurring Payments in next 14 days
    const upcomingLimit = new Date();
    upcomingLimit.setDate(upcomingLimit.getDate() + 14);

    const upcomingRecurring = await RecurringTransaction.find({
      user: userId,
      active: true,
      nextDueDate: { $gte: new Date(), $lte: upcomingLimit },
    }).sort({ nextDueDate: 1 }).limit(4);

    // 7. Active Savings Goals
    const goals = await SavingsGoal.find({ user: userId, isCompleted: false }).limit(3);

    // 8. Compute Dynamic Financial Health Score (0 - 100)
    const healthScoreResult = calculateHealthScore({
      income: monthIncome,
      expense: monthExpense,
      savingsRate,
      budgetCap: totalBudgetCap,
      goalsCount: goals.length,
      debtPayment: 0,
    });

    res.json({
      success: true,
      data: {
        kpis: {
          totalBalance: Math.round(netBalance * 100) / 100,
          totalIncome: Math.round(monthIncome * 100) / 100,
          totalExpense: Math.round(monthExpense * 100) / 100,
          monthlySavings: Math.round(monthSavings * 100) / 100,
          savingsRate,
          expenseGrowthPercent,
          allTimeIncome: Math.round(totalAllTimeIncome * 100) / 100,
          allTimeExpense: Math.round(totalAllTimeExpense * 100) / 100,
          totalTransactions,
        },
        financialHealth: healthScoreResult,
        budgetSummary: {
          totalBudget: totalBudgetCap,
          spent: monthExpense,
          remaining: Math.max(0, totalBudgetCap - monthExpense),
          percentage: budgetProgress,
        },
        recentTransactions,
        upcomingRecurring,
        activeGoals: goals,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get income vs expense spending trends over 6/12 months
// @route   GET /api/analytics/trends
// @access  Private
exports.getTrends = async (req, res, next) => {
  try {
    const monthsCount = parseInt(req.query.months, 10) || 6;
    const now = new Date();
    const result = [];

    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      const monthLabel = d.toLocaleString('default', { month: 'short' });
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      const agg = await Transaction.aggregate([
        {
          $match: {
            user: req.user._id,
            date: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
          },
        },
      ]);

      let income = 0;
      let expense = 0;
      agg.forEach((item) => {
        if (item._id === 'income') income = item.total;
        if (item._id === 'expense') expense = item.total;
      });

      result.push({
        month: monthLabel,
        monthKey,
        income: Math.round(income * 100) / 100,
        expense: Math.round(expense * 100) / 100,
        savings: Math.round((income - expense) * 100) / 100,
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category-wise expense distribution
// @route   GET /api/analytics/categories
// @access  Private
exports.getCategories = async (req, res, next) => {
  try {
    const { timeRange = 'month' } = req.query; // 'month', 'quarter', 'year', 'all'
    const now = new Date();
    let startDate = new Date(now.getFullYear(), now.getMonth(), 1);

    if (timeRange === 'quarter') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    } else if (timeRange === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else if (timeRange === 'all') {
      startDate = new Date(2000, 0, 1);
    }

    const categoryAgg = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'expense',
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const totalExpense = categoryAgg.reduce((sum, item) => sum + item.total, 0);

    const categories = categoryAgg.map((item) => ({
      name: item._id,
      amount: Math.round(item.total * 100) / 100,
      count: item.count,
      percentage: totalExpense > 0 ? Math.round((item.total / totalExpense) * 1000) / 10 : 0,
    }));

    res.json({
      success: true,
      totalExpense: Math.round(totalExpense * 100) / 100,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get intelligent expense forecast for current month
// @route   GET /api/analytics/forecast
// @access  Private
exports.getForecast = async (req, res, next) => {
  try {
    const now = new Date();
    const currentDay = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const remainingDays = daysInMonth - currentDay;

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const monthAgg = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let spentSoFar = 0;
    let earnedSoFar = 0;
    monthAgg.forEach((item) => {
      if (item._id === 'expense') spentSoFar = item.total;
      if (item._id === 'income') earnedSoFar = item.total;
    });

    const dailyBurnRate = currentDay > 0 ? spentSoFar / currentDay : 0;
    const projectedMonthEndExpense = Math.round((spentSoFar + dailyBurnRate * remainingDays) * 100) / 100;
    const projectedSavings = Math.round((earnedSoFar - projectedMonthEndExpense) * 100) / 100;

    // Upcoming recurring bills due before end of month
    const upcomingBills = await RecurringTransaction.aggregate([
      {
        $match: {
          user: req.user._id,
          active: true,
          type: 'expense',
          nextDueDate: { $gte: now, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const upcomingFixedBills = upcomingBills.length > 0 ? upcomingBills[0].total : 0;

    res.json({
      success: true,
      data: {
        currentDay,
        daysInMonth,
        remainingDays,
        spentSoFar: Math.round(spentSoFar * 100) / 100,
        earnedSoFar: Math.round(earnedSoFar * 100) / 100,
        dailyBurnRate: Math.round(dailyBurnRate * 100) / 100,
        projectedMonthEndExpense,
        projectedSavings,
        upcomingFixedBills: Math.round(upcomingFixedBills * 100) / 100,
        safeDailySpendingLimit: remainingDays > 0 && (earnedSoFar - spentSoFar - upcomingFixedBills) > 0
          ? Math.round(((earnedSoFar - spentSoFar - upcomingFixedBills) / remainingDays) * 100) / 100
          : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
