const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please enter a goal title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    targetAmount: {
      type: Number,
      required: [true, 'Please enter a target amount'],
      min: [1, 'Target amount must be at least 1'],
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, 'Current amount cannot be negative'],
    },
    category: {
      type: String,
      default: 'General Savings',
    },
    deadline: {
      type: Date,
      required: [true, 'Please specify a target completion date'],
    },
    color: {
      type: String,
      default: '#38BDF8', // Electric Cyan
    },
    notes: {
      type: String,
      default: '',
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    contributions: [
      {
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        note: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

savingsGoalSchema.index({ user: 1, isCompleted: 1 });

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);
