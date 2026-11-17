const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      default: 'Overall',
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please specify the budget limit amount'],
      min: [1, 'Budget must be at least 1'],
    },
    month: {
      type: String, // 'YYYY-MM'
      required: true,
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be in YYYY-MM format'],
      index: true,
    },
    alertThresholds: {
      type: [Number],
      default: [75, 90, 100],
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

// One budget per category per month per user
budgetSchema.index({ user: 1, month: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
