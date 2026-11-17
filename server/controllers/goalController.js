const SavingsGoal = require('../models/SavingsGoal');
const Notification = require('../models/Notification');

exports.getGoals = async (req, res, next) => {
  try {
    const goals = await SavingsGoal.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, count: goals.length, data: goals });
  } catch (err) { next(err); }
};

exports.createGoal = async (req, res, next) => {
  try {
    const { title, targetAmount, currentAmount, category, deadline, color, notes } = req.body;
    if (!title || !targetAmount || !deadline) {
      return res.status(400).json({ success: false, message: 'Title, target amount, and deadline are required' });
    }
    const goal = await SavingsGoal.create({
      user: req.user.id,
      title,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount) || 0,
      category: category || 'General Savings',
      deadline: new Date(deadline),
      color: color || '#38BDF8',
      notes: notes || '',
    });
    res.status(201).json({ success: true, data: goal, message: 'Savings goal created' });
  } catch (err) { next(err); }
};

exports.updateGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.json({ success: true, data: goal });
  } catch (err) { next(err); }
};

exports.deleteGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.json({ success: true, message: 'Goal deleted' });
  } catch (err) { next(err); }
};

exports.contributeToGoal = async (req, res, next) => {
  try {
    const { amount, note } = req.body;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Please enter a valid contribution amount' });
    }
    const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.user.id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

    goal.currentAmount += Number(amount);
    goal.contributions.push({ amount: Number(amount), date: new Date(), note: note || '' });

    if (goal.currentAmount >= goal.targetAmount && !goal.isCompleted) {
      goal.isCompleted = true;
      await Notification.create({
        user: req.user.id,
        title: '🎯 Savings Goal Reached!',
        message: `Congratulations! You reached your goal "${goal.title}" of ${goal.targetAmount.toFixed(2)}!`,
        type: 'goal_milestone',
        severity: 'success',
        link: '/goals',
      });
    }

    await goal.save();
    res.json({ success: true, data: goal, message: 'Contribution added successfully' });
  } catch (err) { next(err); }
};
