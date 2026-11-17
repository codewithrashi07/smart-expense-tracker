const mongoose = require('mongoose');

const recurringTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please enter subscription/bill title'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please enter recurring amount'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      default: 'expense',
    },
    category: {
      type: String,
      default: 'Subscriptions & Bills',
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'],
      default: 'monthly',
    },
    nextDueDate: {
      type: Date,
      required: [true, 'Please specify the next due date'],
      index: true,
    },
    paymentMethod: {
      type: String,
      default: 'Credit Card',
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    reminderDaysBefore: {
      type: Number,
      default: 2,
    },
    lastProcessedDate: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

recurringTransactionSchema.index({ user: 1, active: 1, nextDueDate: 1 });

module.exports = mongoose.model('RecurringTransaction', recurringTransactionSchema);
