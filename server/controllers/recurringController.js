const RecurringTransaction = require('../models/RecurringTransaction');
const Transaction = require('../models/Transaction');

exports.getRecurring = async (req, res, next) => {
  try {
    const items = await RecurringTransaction.find({ user: req.user.id }).sort({ nextDueDate: 1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (err) { next(err); }
};

exports.createRecurring = async (req, res, next) => {
  try {
    const { title, amount, type, category, frequency, nextDueDate, paymentMethod, notes } = req.body;
    if (!title || !amount || !nextDueDate) {
      return res.status(400).json({ success: false, message: 'Title, amount, and next due date are required' });
    }
    const item = await RecurringTransaction.create({
      user: req.user.id,
      title,
      amount: Number(amount),
      type: type || 'expense',
      category: category || 'Subscriptions & Bills',
      frequency: frequency || 'monthly',
      nextDueDate: new Date(nextDueDate),
      paymentMethod: paymentMethod || 'Credit Card',
      notes: notes || '',
    });
    res.status(201).json({ success: true, data: item, message: 'Recurring transaction scheduled' });
  } catch (err) { next(err); }
};

exports.updateRecurring = async (req, res, next) => {
  try {
    const item = await RecurringTransaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Recurring item not found' });
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};

exports.deleteRecurring = async (req, res, next) => {
  try {
    const item = await RecurringTransaction.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!item) return res.status(404).json({ success: false, message: 'Recurring item not found' });
    res.json({ success: true, message: 'Recurring item removed' });
  } catch (err) { next(err); }
};

// Process / Pay recurring bill now and log transaction
exports.processRecurring = async (req, res, next) => {
  try {
    const item = await RecurringTransaction.findOne({ _id: req.params.id, user: req.user.id });
    if (!item) return res.status(404).json({ success: false, message: 'Recurring item not found' });

    // Create corresponding transaction
    const tx = await Transaction.create({
      user: req.user.id,
      title: `${item.title} (Recurring)`,
      amount: item.amount,
      type: item.type,
      category: item.category,
      date: new Date(),
      paymentMethod: item.paymentMethod,
      notes: `Auto-logged recurring payment (${item.frequency})`,
      isRecurring: true,
      recurringId: item._id,
    });

    // Advance next due date
    const nextDate = new Date(item.nextDueDate);
    if (item.frequency === 'daily') nextDate.setDate(nextDate.getDate() + 1);
    else if (item.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
    else if (item.frequency === 'biweekly') nextDate.setDate(nextDate.getDate() + 14);
    else if (item.frequency === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);
    else nextDate.setMonth(nextDate.getMonth() + 1); // monthly

    item.nextDueDate = nextDate;
    item.lastProcessedDate = new Date();
    await item.save();

    res.json({ success: true, message: 'Payment recorded and next due date updated', transaction: tx, recurring: item });
  } catch (err) { next(err); }
};
