import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { X, Upload, CheckCircle2, DollarSign } from 'lucide-react';

const CATEGORIES = {
  expense: [
    'Food & Dining',
    'Housing & Rent',
    'Utilities & Bills',
    'Transportation',
    'Healthcare & Medical',
    'Entertainment',
    'Shopping',
    'Education',
    'Investments',
    'Subscriptions & Bills',
    'Other',
  ],
  income: [
    'Salary',
    'Freelance',
    'Business',
    'Investments',
    'Gifts & Grants',
    'Refunds',
    'Other',
  ],
};

const PAYMENT_METHODS = [
  'Credit Card',
  'Debit Card',
  'UPI / Bank Transfer',
  'Cash',
  'Digital Wallet',
  'Other',
];

export default function TransactionModal({ isOpen, onClose, onSuccess, initialData = null }) {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: 'Food & Dining',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Credit Card',
    notes: '',
    receiptUrl: '',
  });

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        amount: initialData.amount || '',
        type: initialData.type || 'expense',
        category: initialData.category || 'Food & Dining',
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        paymentMethod: initialData.paymentMethod || 'Credit Card',
        notes: initialData.notes || '',
        receiptUrl: initialData.receiptUrl || '',
      });
    } else {
      setFormData({
        title: '',
        amount: '',
        type: 'expense',
        category: 'Food & Dining',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Credit Card',
        notes: '',
        receiptUrl: '',
      });
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleTypeChange = (newType) => {
    setFormData((prev) => ({
      ...prev,
      type: newType,
      category: CATEGORIES[newType][0],
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('receipt', file);

    setUploading(true);
    setError('');
    try {
      const res = await api.uploadReceipt(data);
      setFormData((prev) => ({ ...prev, receiptUrl: res.receiptUrl }));
    } catch (err) {
      setError(err.message || 'Failed to upload receipt');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) {
      setError('Title and amount are required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      if (initialData?._id) {
        await api.updateTransaction(initialData._id, formData);
      } else {
        await api.createTransaction(formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Error saving transaction');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg glass-panel rounded-2xl shadow-glass border border-white/15 p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">
            {initialData ? 'Edit Transaction' : 'Record New Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 my-3 text-xs text-rose-300 rounded-xl bg-rose-500/10 border border-rose-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Income vs Expense Toggle */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-black/30 border border-white/10">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 text-xs font-semibold rounded-lg transition ${
                formData.type === 'expense'
                  ? 'bg-rose-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Expense (-)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 text-xs font-semibold rounded-lg transition ${
                formData.type === 'income'
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Income (+)
            </button>
          </div>

          {/* Title & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Whole Foods Market"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-sky-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-sky-400"
              >
                {CATEGORIES[formData.type].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-sky-400"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Receipt Attachment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Transaction Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Receipt Attachment</label>
              <label className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-xl border border-dashed border-white/20 hover:border-sky-400 cursor-pointer text-slate-300 hover:text-white transition bg-white/5">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading ? 'Uploading...' : formData.receiptUrl ? 'Receipt Attached ✓' : 'Upload Receipt'}</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Business lunch with client"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-sky-400"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 rounded-xl hover:bg-white/10 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 shadow-glow-cyan transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : initialData ? 'Update Transaction' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
