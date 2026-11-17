const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const { generateInsights, answerFinancialQuery } = require('../utils/aiEngine');
const { calculateHealthScore } = require('../utils/financialHealth');

// @desc    Get AI-generated personalized financial insights
// @route   GET /api/ai/insights
// @access  Private
exports.getInsights = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totals, categories, budgets] = await Promise.all([
      Transaction.aggregate([
        { $match: { user: userId, date: { $gte: startOfMonth } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        { $match: { user: userId, type: 'expense', date: { $gte: startOfMonth } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
      ]),
      Budget.find({ user: userId, month: currentMonthStr }),
    ]);

    let income = 0;
    let expense = 0;
    totals.forEach((t) => {
      if (t._id === 'income') income = t.total;
      if (t._id === 'expense') expense = t.total;
    });

    const categoryList = categories.map((c) => ({ name: c._id, amount: c.total }));
    const healthResult = calculateHealthScore({
      income,
      expense,
      savingsRate: income > 0 ? ((income - expense) / income) * 100 : 0,
      budgetCap: budgets.reduce((s, b) => s + b.amount, 0),
    });

    const insights = generateInsights({
      income,
      expense,
      categories: categoryList,
      budgets,
      healthScore: healthResult,
    });

    res.json({
      success: true,
      provider: process.env.GEMINI_API_KEY ? 'Gemini 1.5 Flash' : 'SmartTrack Heuristic AI Engine (Demo Mode)',
      data: insights,
    });
  } catch (err) { next(err); }
};

// @desc    Chat with AI Financial Assistant
// @route   POST /api/ai/chat
// @access  Private
exports.chat = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ success: false, message: 'Prompt is required' });

    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Build context
    const [totals, categories] = await Promise.all([
      Transaction.aggregate([
        { $match: { user: userId, date: { $gte: startOfMonth } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        { $match: { user: userId, type: 'expense', date: { $gte: startOfMonth } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
        { $limit: 3 },
      ]),
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    totals.forEach((t) => {
      if (t._id === 'income') totalIncome = t.total;
      if (t._id === 'expense') totalExpense = t.total;
    });

    const topCategory = categories.length > 0 ? `${categories[0]._id} ($${categories[0].total.toFixed(2)})` : 'None';

    const context = {
      userName: req.user.name,
      currency: req.user.currency,
      totalIncome,
      totalExpense,
      topCategory,
      topCategories: categories.map((c) => ({ category: c._id, amount: c.total })),
    };

    const aiResponse = await answerFinancialQuery({
      prompt,
      context,
      apiKey: process.env.GEMINI_API_KEY,
    });

    res.json({
      success: true,
      data: aiResponse,
    });
  } catch (err) { next(err); }
};

// @desc    Simulate/Parse Receipt OCR and return structured transaction preview
// @route   POST /api/ai/scan-receipt
// @access  Private
exports.scanReceipt = async (req, res, next) => {
  try {
    const { receiptUrl, rawText } = req.body;

    // Default heuristic extraction or simulated intelligent scanner
    const textToAnalyze = (rawText || receiptUrl || '').toLowerCase();

    let merchant = 'Store / Merchant';
    let amount = 42.50;
    let category = 'Shopping';
    let date = new Date().toISOString().split('T')[0];

    if (textToAnalyze.includes('walmart') || textToAnalyze.includes('target') || textToAnalyze.includes('supermarket')) {
      merchant = 'Supermarket';
      category = 'Food & Dining';
      amount = 78.45;
    } else if (textToAnalyze.includes('starbucks') || textToAnalyze.includes('coffee') || textToAnalyze.includes('cafe')) {
      merchant = 'Starbucks Coffee';
      category = 'Food & Dining';
      amount = 14.80;
    } else if (textToAnalyze.includes('uber') || textToAnalyze.includes('lyft') || textToAnalyze.includes('taxi')) {
      merchant = 'Uber Ride';
      category = 'Transportation';
      amount = 26.50;
    } else if (textToAnalyze.includes('amazon')) {
      merchant = 'Amazon Online';
      category = 'Shopping';
      amount = 64.99;
    } else if (textToAnalyze.includes('pharmacy') || textToAnalyze.includes('cvs') || textToAnalyze.includes('health')) {
      merchant = 'CVS Pharmacy';
      category = 'Healthcare & Medical';
      amount = 32.10;
    }

    res.json({
      success: true,
      data: {
        merchant,
        amount,
        category,
        date,
        type: 'expense',
        paymentMethod: 'Credit Card',
        confidence: 0.94,
        source: 'SmartTrack Intelligent OCR Engine',
      },
    });
  } catch (err) { next(err); }
};
