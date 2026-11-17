import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Repeat, Plus, Trash2, Calendar, CheckCircle2, Clock } from 'lucide-react';

export default function Recurring() {
  const { formatCurrency } = useAuth();
  const [recurringList, setRecurringList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [category, setCategory] = useState('Subscriptions & Bills');
  const [nextDueDate, setNextDueDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');

  useEffect(() => {
    loadRecurring();
  }, []);

  const loadRecurring = async () => {
    try {
      setLoading(true);
      const res = await api.getRecurring();
      setRecurringList(res.data || []);
    } catch (err) {
      console.error('Error fetching recurring:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !amount || !nextDueDate) return;

    try {
      await api.createRecurring({
        title,
        amount: Number(amount),
        frequency,
        category,
        nextDueDate,
        paymentMethod,
      });
      setModalOpen(false);
      setTitle('');
      setAmount('');
      loadRecurring();
    } catch (err) {
      alert(err.message || 'Failed to schedule recurring item');
    }
  };

  const handleProcess = async (id) => {
    try {
      await api.processRecurring(id);
      alert('Recurring bill marked as paid! Ledger transaction recorded.');
      loadRecurring();
    } catch (err) {
      alert(err.message || 'Failed to process recurring payment');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this scheduled recurring payment?')) return;
    try {
      await api.deleteRecurring(id);
      loadRecurring();
    } catch (err) {
      alert(err.message || 'Error deleting recurring item');
    }
  };

  const monthlyProjectedTotal = recurringList.reduce((sum, item) => {
    const amt = item.amount;
    if (item.frequency === 'weekly') return sum + amt * 4.33;
    if (item.frequency === 'yearly') return sum + amt / 12;
    return sum + amt;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-panel rounded-3xl border border-white/10">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Recurring Bills & Subscriptions</h1>
          <p className="text-xs text-slate-400 mt-1">
            Automate tracking for Netflix, AWS, rent, memberships, and utility schedules
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-semibold text-xs shadow-glow-cyan transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subscription</span>
        </button>
      </div>

      {/* Monthly summary card */}
      <div className="p-6 glass-panel rounded-3xl border border-white/10 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 block">Total Monthly Recurring Commitment</span>
          <p className="text-2xl font-bold text-white mt-1">{formatCurrency(monthlyProjectedTotal)}</p>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold">
          {recurringList.length} Active Subscriptions
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">
            Loading scheduled items...
          </div>
        ) : recurringList.length === 0 ? (
          <div className="col-span-full p-12 glass-panel rounded-3xl border border-white/10 text-center">
            <Repeat className="w-12 h-12 text-purple-400 mx-auto mb-3 opacity-80" />
            <h3 className="text-sm font-semibold text-white">No Subscriptions Added</h3>
            <p className="text-xs text-slate-400 mt-1">
              Add your monthly subscriptions and recurring bills to get due date reminders.
            </p>
          </div>
        ) : (
          recurringList.map((item) => (
            <div
              key={item._id}
              className="p-5 glass-panel rounded-2xl border border-white/10 flex flex-col justify-between hover:border-white/20 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                    {item.frequency}
                  </span>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-white">{item.title}</h3>
                <p className="text-lg font-extrabold text-white mt-1">
                  {formatCurrency(item.amount)}
                </p>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
                  <Calendar className="w-3.5 h-3.5 text-sky-400" />
                  <span>Next Due: {new Date(item.nextDueDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">{item.paymentMethod}</span>
                <button
                  onClick={() => handleProcess(item._id)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" /> Pay & Log
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel rounded-2xl shadow-glass border border-white/15 p-6 animate-in fade-in zoom-in-95">
            <h2 className="text-base font-bold text-white mb-4">Add Recurring Bill</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix Ultra HD"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    placeholder="19.99"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-sky-400"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Next Due Date</label>
                  <input
                    type="date"
                    required
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-sky-400"
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="UPI / Bank Transfer">UPI / Bank Transfer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
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
                  className="px-5 py-2 text-xs font-semibold text-white rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 shadow-glow-cyan"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
