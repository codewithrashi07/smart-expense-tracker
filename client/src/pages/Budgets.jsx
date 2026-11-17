import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PieChart, Plus, Trash2, AlertTriangle, CheckCircle, Info, Calendar } from 'lucide-react';

const CATEGORIES = [
  'Overall',
  'Food & Dining',
  'Housing & Rent',
  'Utilities & Bills',
  'Transportation',
  'Healthcare & Medical',
  'Entertainment',
  'Shopping',
  'Education',
  'Other',
];

export default function Budgets() {
  const { formatCurrency } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState({ totalBudget: 0, totalSpent: 0, remaining: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [formCategory, setFormCategory] = useState('Overall');
  const [formAmount, setFormAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadBudgets();
  }, [selectedMonth]);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const res = await api.getBudgets(selectedMonth);
      setBudgets(res.data || []);
      setSummary(res.summary || { totalBudget: 0, totalSpent: 0, remaining: 0, percentage: 0 });
    } catch (err) {
      console.error('Error fetching budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    if (!formAmount || Number(formAmount) <= 0) return;
    setSubmitting(true);
    try {
      await api.setBudget({
        category: formCategory,
        amount: Number(formAmount),
        month: selectedMonth,
      });
      setModalOpen(false);
      setFormAmount('');
      loadBudgets();
    } catch (err) {
      alert(err.message || 'Failed to save budget');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBudget = async (id) => {
    if (!window.confirm('Delete this budget limit?')) return;
    try {
      await api.deleteBudget(id);
      loadBudgets();
    } catch (err) {
      alert(err.message || 'Failed to delete budget');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-panel rounded-3xl border border-white/10">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Smart Budget Manager</h1>
          <p className="text-xs text-slate-400 mt-1">
            Set proactive guardrails and automated threshold warnings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none"
          />
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-semibold text-xs shadow-glow-cyan transition"
          >
            <Plus className="w-4 h-4" />
            <span>Set Budget</span>
          </button>
        </div>
      </div>

      {/* Aggregate Overview Card */}
      <div className="p-6 glass-panel rounded-3xl border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Month-to-Date Budget Consumption</h2>
            <p className="text-xs text-slate-400">Total spending against allocated ceiling</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Total Limit</span>
            <span className="text-lg font-bold text-white">{formatCurrency(summary.totalBudget)}</span>
          </div>
        </div>

        {/* Big Progress Bar */}
        <div className="w-full h-4 rounded-full bg-white/10 overflow-hidden relative">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              summary.percentage >= 100
                ? 'bg-rose-500'
                : summary.percentage >= 85
                ? 'bg-amber-400'
                : 'bg-gradient-to-r from-indigo-500 to-sky-400'
            }`}
            style={{ width: `${Math.min(100, summary.percentage)}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-3 text-xs">
          <span className="text-slate-300 font-medium">
            Spent: <strong className="text-white">{formatCurrency(summary.totalSpent)}</strong> ({summary.percentage}%)
          </span>
          <span className="text-emerald-400 font-semibold">
            Remaining: {formatCurrency(summary.remaining)}
          </span>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">
            Loading budget allocations...
          </div>
        ) : budgets.length === 0 ? (
          <div className="col-span-full p-12 glass-panel rounded-3xl border border-white/10 text-center">
            <PieChart className="w-10 h-10 text-sky-400 mx-auto mb-3 opacity-80" />
            <h3 className="text-sm font-semibold text-white">No Budgets Defined for {selectedMonth}</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Create a monthly budget cap for overall spending or specific categories to protect your savings goals.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 text-white text-xs font-semibold shadow-glow-cyan"
            >
              Add First Budget
            </button>
          </div>
        ) : (
          budgets.map((b) => (
            <div
              key={b._id}
              className="p-5 glass-panel rounded-2xl border border-white/10 flex flex-col justify-between hover:border-white/20 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-white">{b.category}</h3>
                  <button
                    onClick={() => handleDeleteBudget(b._id)}
                    className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/5 transition"
                    title="Delete Budget"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-baseline justify-between mb-3 text-xs">
                  <span className="text-slate-400">Limit: {formatCurrency(b.amount)}</span>
                  <span
                    className={`font-semibold ${
                      b.status === 'exceeded'
                        ? 'text-rose-400'
                        : b.status === 'critical'
                        ? 'text-amber-400'
                        : 'text-slate-300'
                    }`}
                  >
                    Spent: {formatCurrency(b.spent)}
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full ${
                      b.status === 'exceeded'
                        ? 'bg-rose-500'
                        : b.status === 'critical'
                        ? 'bg-amber-400'
                        : 'bg-sky-400'
                    }`}
                    style={{ width: `${Math.min(100, b.percentage)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/5">
                <span className="text-slate-400">{b.percentage}% utilized</span>
                <span className="font-semibold text-emerald-400">
                  {formatCurrency(b.remaining)} left
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Set Budget Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel rounded-2xl shadow-glass border border-white/15 p-6 animate-in fade-in zoom-in-95">
            <h2 className="text-base font-bold text-white mb-4">Set Budget Ceiling</h2>
            <form onSubmit={handleCreateBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-sky-400"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Monthly Budget Limit ($)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  placeholder="e.g. 500"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-300 rounded-xl hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold text-white rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 shadow-glow-cyan"
                >
                  {submitting ? 'Saving...' : 'Save Limit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
