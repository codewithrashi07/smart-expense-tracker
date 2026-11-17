import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { Target, Plus, CheckCircle, Trash2, Calendar, Award, DollarSign } from 'lucide-react';

export default function Goals() {
  const { formatCurrency } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [contributeModalOpen, setContributeModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formTarget, setFormTarget] = useState('');
  const [formCurrent, setFormCurrent] = useState('0');
  const [formCategory, setFormCategory] = useState('General Savings');
  const [formDeadline, setFormDeadline] = useState('');
  const [formColor, setFormColor] = useState('#38BDF8');

  // Contribution state
  const [contribAmount, setContribAmount] = useState('');
  const [contribNote, setContribNote] = useState('');

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const res = await api.getGoals();
      setGoals(res.data || []);
    } catch (err) {
      console.error('Error fetching goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!formTitle || !formTarget || !formDeadline) return;

    try {
      await api.createGoal({
        title: formTitle,
        targetAmount: Number(formTarget),
        currentAmount: Number(formCurrent) || 0,
        category: formCategory,
        deadline: formDeadline,
        color: formColor,
      });
      setCreateModalOpen(false);
      setFormTitle('');
      setFormTarget('');
      loadGoals();
    } catch (err) {
      alert(err.message || 'Error creating savings goal');
    }
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    if (!selectedGoal || !contribAmount) return;

    try {
      const res = await api.contributeGoal(selectedGoal._id, Number(contribAmount), contribNote);

      if (res.data?.isCompleted) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      setContributeModalOpen(false);
      setContribAmount('');
      setContribNote('');
      loadGoals();
    } catch (err) {
      alert(err.message || 'Failed to record contribution');
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Delete this savings goal?')) return;
    try {
      await api.deleteGoal(id);
      loadGoals();
    } catch (err) {
      alert(err.message || 'Error deleting goal');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-panel rounded-3xl border border-white/10">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Savings Goals & Vaults</h1>
          <p className="text-xs text-slate-400 mt-1">
            Target capital accumulation milestones and track progress
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-semibold text-xs shadow-glow-cyan transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">
            Loading savings milestones...
          </div>
        ) : goals.length === 0 ? (
          <div className="col-span-full p-12 glass-panel rounded-3xl border border-white/10 text-center">
            <Target className="w-12 h-12 text-sky-400 mx-auto mb-3 opacity-80" />
            <h3 className="text-sm font-semibold text-white">No Savings Goals Active</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Setting specific financial goals dramatically accelerates savings discipline. Create your first goal today!
            </p>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 text-white text-xs font-semibold shadow-glow-cyan"
            >
              Create First Goal
            </button>
          </div>
        ) : (
          goals.map((g) => {
            const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
            const remaining = Math.max(0, g.targetAmount - g.currentAmount);

            return (
              <div
                key={g._id}
                className="p-6 glass-panel rounded-3xl border border-white/10 flex flex-col justify-between hover:border-white/20 transition relative overflow-hidden"
              >
                {g.isCompleted && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Completed
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: g.color || '#38BDF8' }}
                    />
                    <span className="text-[11px] font-medium text-slate-400">{g.category}</span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2">{g.title}</h3>

                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-xl font-extrabold text-white">
                      {formatCurrency(g.currentAmount)}
                    </span>
                    <span className="text-xs text-slate-400">
                      Goal: {formatCurrency(g.targetAmount)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: g.color || '#38BDF8',
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                    <span>{pct}% reached</span>
                    <span>{formatCurrency(remaining)} to go</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(g.deadline).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setSelectedGoal(g); setContributeModalOpen(true); }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 border border-sky-500/30 transition"
                    >
                      + Deposit
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(g._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/5 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Goal Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel rounded-2xl shadow-glass border border-white/15 p-6 animate-in fade-in zoom-in-95">
            <h2 className="text-base font-bold text-white mb-4">Create Savings Goal</h2>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New Electric Vehicle"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Amount ($)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="5000"
                    value={formTarget}
                    onChange={(e) => setFormTarget(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Current Saved ($)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formCurrent}
                    onChange={(e) => setFormCurrent(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Deadline</label>
                  <input
                    type="date"
                    required
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-300 rounded-xl hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 shadow-glow-cyan"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {contributeModalOpen && selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm glass-panel rounded-2xl shadow-glass border border-white/15 p-6 animate-in fade-in zoom-in-95">
            <h2 className="text-base font-bold text-white mb-2">Add Contribution</h2>
            <p className="text-xs text-slate-400 mb-4">Adding deposit towards: {selectedGoal.title}</p>
            <form onSubmit={handleContribute} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Contribution Amount ($)</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  autoFocus
                  placeholder="e.g. 250"
                  value={contribAmount}
                  onChange={(e) => setContribAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Bonus allocation"
                  value={contribNote}
                  onChange={(e) => setContribNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setContributeModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-300 rounded-xl hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white rounded-xl bg-gradient-to-r from-emerald-600 to-sky-500 shadow-glow-cyan"
                >
                  Record Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
