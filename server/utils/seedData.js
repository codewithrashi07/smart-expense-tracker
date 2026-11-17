const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const SavingsGoal = require('../models/SavingsGoal');
const RecurringTransaction = require('../models/RecurringTransaction');
const Notification = require('../models/Notification');

const seedDemoData = async () => {
  try {
    const demoEmail = 'demo@smarttrack.ai';
    let user = await User.findOne({ email: demoEmail });

    if (!user) {
      console.log('[Seed] Seeding demo user and initial financial data...');
      user = await User.create({
        name: 'Alex Morgan',
        email: demoEmail,
        password: 'Password123!',
        currency: 'USD',
        monthlyIncomeTarget: 6500,
        bio: 'Tech professional focusing on wealth accumulation and smart budgeting.',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      });

      const now = new Date();
      const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      // 1. Transactions
      await Transaction.create([
        { user: user._id, title: 'Monthly Tech Salary', amount: 5800, type: 'income', category: 'Salary', date: new Date(now.getFullYear(), now.getMonth(), 1), paymentMethod: 'UPI / Bank Transfer' },
        { user: user._id, title: 'Freelance UI Design', amount: 1200, type: 'income', category: 'Freelance', date: new Date(now.getFullYear(), now.getMonth(), 5), paymentMethod: 'UPI / Bank Transfer' },
        { user: user._id, title: 'Luxury Apartment Rent', amount: 1850, type: 'expense', category: 'Housing & Rent', date: new Date(now.getFullYear(), now.getMonth(), 2), paymentMethod: 'UPI / Bank Transfer' },
        { user: user._id, title: 'Whole Foods Market', amount: 165.40, type: 'expense', category: 'Food & Dining', date: new Date(now.getFullYear(), now.getMonth(), 4), paymentMethod: 'Credit Card' },
        { user: user._id, title: 'Electric & High-Speed Internet', amount: 140, type: 'expense', category: 'Utilities & Bills', date: new Date(now.getFullYear(), now.getMonth(), 6), paymentMethod: 'Debit Card' },
        { user: user._id, title: 'Michelin Star Bistro Dinner', amount: 185.50, type: 'expense', category: 'Food & Dining', date: new Date(now.getFullYear(), now.getMonth(), 9), paymentMethod: 'Credit Card' },
        { user: user._id, title: 'Uber Premier Rides', amount: 72.80, type: 'expense', category: 'Transportation', date: new Date(now.getFullYear(), now.getMonth(), 11), paymentMethod: 'Credit Card' },
        { user: user._id, title: 'Nordstrom Designer Apparel', amount: 245.00, type: 'expense', category: 'Shopping', date: new Date(now.getFullYear(), now.getMonth(), 12), paymentMethod: 'Credit Card' },
        { user: user._id, title: 'Equinox Fitness Club', amount: 195.00, type: 'expense', category: 'Healthcare & Medical', date: new Date(now.getFullYear(), now.getMonth(), 13), paymentMethod: 'Credit Card' },
        { user: user._id, title: 'Vanguard Index Fund Investment', amount: 800, type: 'expense', category: 'Investments', date: new Date(now.getFullYear(), now.getMonth(), 14), paymentMethod: 'UPI / Bank Transfer' },
      ]);

      // 2. Budgets
      await Budget.create([
        { user: user._id, category: 'Overall', amount: 3800, month: currentMonthStr },
        { user: user._id, category: 'Food & Dining', amount: 650, month: currentMonthStr },
        { user: user._id, category: 'Housing & Rent', amount: 1900, month: currentMonthStr },
        { user: user._id, category: 'Shopping', amount: 400, month: currentMonthStr },
        { user: user._id, category: 'Transportation', amount: 250, month: currentMonthStr },
      ]);

      // 3. Savings Goals
      const deadlineNextYear = new Date();
      deadlineNextYear.setFullYear(deadlineNextYear.getFullYear() + 1);

      await SavingsGoal.create([
        {
          user: user._id,
          title: 'Emergency Rainy Day Reserve',
          targetAmount: 15000,
          currentAmount: 11200,
          category: 'Emergency Fund',
          deadline: deadlineNextYear,
          color: '#10B981',
          contributions: [{ amount: 1200, date: new Date(), note: 'Monthly auto-stash' }],
        },
        {
          user: user._id,
          title: 'Tokyo & Kyoto Vacation Fund',
          targetAmount: 5500,
          currentAmount: 3400,
          category: 'Travel & Vacation',
          deadline: new Date(now.getFullYear(), now.getMonth() + 6, 1),
          color: '#38BDF8',
          contributions: [{ amount: 600, date: new Date(), note: 'Tax refund portion' }],
        },
        {
          user: user._id,
          title: 'Apple Vision Pro / Tech Rig',
          targetAmount: 3500,
          currentAmount: 2800,
          category: 'Gadgets & Tech',
          deadline: new Date(now.getFullYear(), now.getMonth() + 2, 1),
          color: '#8B5CF6',
        },
      ]);

      // 4. Recurring Payments
      const nextDue1 = new Date(); nextDue1.setDate(nextDue1.getDate() + 5);
      const nextDue2 = new Date(); nextDue2.setDate(nextDue2.getDate() + 12);
      await RecurringTransaction.create([
        { user: user._id, title: 'Netflix 4K Ultra Premium', amount: 22.99, type: 'expense', category: 'Subscriptions & Bills', frequency: 'monthly', nextDueDate: nextDue1, paymentMethod: 'Credit Card' },
        { user: user._id, title: 'AWS Cloud Hosting', amount: 48.50, type: 'expense', category: 'Utilities & Bills', frequency: 'monthly', nextDueDate: nextDue2, paymentMethod: 'Credit Card' },
      ]);

      // 5. Notifications
      await Notification.create([
        {
          user: user._id,
          title: 'SmartTrack AI Optimization Alert',
          message: 'Your current savings rate is 45.2%! You are on track to hit your Emergency Fund milestone 2 months ahead of schedule.',
          type: 'ai_insight',
          severity: 'success',
        },
        {
          user: user._id,
          title: 'Budget Alert: Food & Dining',
          message: 'Notice: You have reached 54% of your Food & Dining monthly budget limit ($350.90 of $650.00).',
          type: 'budget_alert',
          severity: 'info',
        },
      ]);

      console.log('[Seed] Demo data seeded successfully for demo@smarttrack.ai');
    }
  } catch (err) {
    console.error('[Seed] Error seeding demo data:', err.message);
  }
};

module.exports = { seedDemoData };
