import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Calendar,
  AlertCircle,
  Plus,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Link } from 'react-router-dom';

const PIE_COLORS = ['#38BDF8', '#818CF8', '#C084FC', '#F472B6', '#34D399', '#FBBF24', '#F87171'];

export default function Dashboard({ onOpenAddTransaction }) {
  const { user, formatCurrency } = useAuth();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [categories, setCategories] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [ovRes, trRes, catRes, aiRes] = await Promise.all([
        api.getOverview().catch(() => ({ data: {} })),
        api.getTrends(6).catch(() => ({ data: [] })),
        api.getCategories('month').catch(() => ({ data: [] })),
        api.getAIInsights().catch(() => ({ data: [] })),
      ]);

      setOverview(ovRes.data || {});
      setTrends(trRes.data || []);
      setCategories(catRes.data || []);
      setAiInsights(aiRes.data || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const kpis = overview?.kpis || {
    totalBalance: 4850.50,
    totalIncome: 7000.00,
    totalExpense: 3240.20,
    monthlySavings: 3759.80,
    savingsRate: 53.7,
  };

  const health = overview?.financialHealth || {
    score: 82,
    grade: 'Strong',
    badgeColor: 'cyan',
    keyStrengths: ['Healthy savings rate (>20%)', 'Controlled discretionary expenses'],
  };

  const budgetSummary = overview?.budgetSummary || {
    totalBudget: 4000,
    spent: 3240.20,
    remaining: 759.80,
    percentage: 81,
  };

  const recentTransactions = overview?.recentTransactions || [];
  const upcomingRecurring = overview?.upcomingRecurring || [];

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-panel rounded-3xl border border-white/10 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-gradient-to-br from-sky-500/20 to-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-400/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> SmartTrack AI Command Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name || 'Investor'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Here is your real-time financial trajectory and portfolio health overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAddTransaction}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-semibold text-xs shadow-glow-cyan transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance */}
        <div className="p-5 glass-panel rounded-2xl border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Net Balance</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-white tracking-tight">
              {formatCurrency(kpis.totalBalance)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-400 font-semibold">Active Capital</span> in portfolio
            </p>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="p-5 glass-panel rounded-2xl border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Monthly Income</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-emerald-400 tracking-tight">
              +{formatCurrency(kpis.totalIncome)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Current month inflows</p>
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="p-5 glass-panel rounded-2xl border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Monthly Expenses</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-rose-400 tracking-tight">
              -{formatCurrency(kpis.totalExpense)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Total recorded outflow</p>
          </div>
        </div>

        {/* Financial Health Score */}
        <div className="p-5 glass-panel rounded-2xl border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Financial Health</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <p className="text-2xl font-bold text-white tracking-tight">
                {health.score}<span className="text-sm text-slate-400">/100</span>
              </p>
              <span className="inline-block mt-1 text-[11px] font-semibold text-sky-400">
                Grade: {health.grade}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Savings Rate</span>
              <span className="text-sm font-bold text-emerald-400">{kpis.savingsRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Area Chart (2 Cols) */}
        <div className="lg:col-span-2 p-6 glass-panel rounded-3xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Cashflow Trends</h2>
              <p className="text-xs text-slate-400">Income vs. Expense comparison over time</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
              Last 6 Months
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            {trends.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs text-slate-400">
                Record transactions to view visual cashflow trends.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                  />
                  <Area type="monotone" dataKey="income" name="Income" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#incomeGrad)" />
                  <Area type="monotone" dataKey="expense" name="Expense" stroke="#F43F5E" strokeWidth={2} fillOpacity={1} fill="url(#expenseGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Expense Category Donut Chart (1 Col) */}
        <div className="p-6 glass-panel rounded-3xl border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-white">Expense Distribution</h2>
              <Link to="/analytics" className="text-xs text-sky-400 hover:underline">
                View All
              </Link>
            </div>
            <p className="text-xs text-slate-400 mb-4">Current month spending by category</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            {categories.length === 0 ? (
              <p className="text-xs text-slate-400">No expenses logged yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => formatCurrency(val)}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-3 space-y-1.5 max-h-32 overflow-y-auto">
            {categories.slice(0, 4).map((cat, i) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="text-slate-300 truncate max-w-[120px]">{cat.name}</span>
                </div>
                <span className="font-semibold text-white">{formatCurrency(cat.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Budget Progress & AI Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Budget Tracker */}
        <div className="p-6 glass-panel rounded-3xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Monthly Budget Ceiling</h2>
              <p className="text-xs text-slate-400">
                {formatCurrency(budgetSummary.spent)} of {formatCurrency(budgetSummary.totalBudget)} limit
              </p>
            </div>
            <Link to="/budgets" className="text-xs text-sky-400 hover:underline">
              Manage
            </Link>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetSummary.percentage >= 100
                  ? 'bg-rose-500'
                  : budgetSummary.percentage >= 85
                  ? 'bg-amber-400'
                  : 'bg-gradient-to-r from-indigo-500 to-sky-400'
              }`}
              style={{ width: `${Math.min(100, budgetSummary.percentage)}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-3 text-xs">
            <span className="text-slate-400">{budgetSummary.percentage}% spent</span>
            <span className="font-semibold text-emerald-400">
              {formatCurrency(budgetSummary.remaining)} left
            </span>
          </div>

          {budgetSummary.percentage >= 85 && (
            <div className="flex items-center gap-2 p-2.5 mt-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Budget alert: You have exceeded 85% of your defined limit!</span>
            </div>
          )}
        </div>

        {/* AI Insight Highlights (2 cols) */}
        <div className="lg:col-span-2 p-6 glass-panel rounded-3xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">AI Financial Insights</h2>
                <p className="text-xs text-slate-400">Algorithmic analysis & recommendations</p>
              </div>
            </div>
            <Link to="/ai-assistant" className="text-xs text-sky-400 hover:underline flex items-center gap-1">
              <span>Ask AI</span> <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {aiInsights.length === 0 ? (
              <div className="p-4 rounded-xl bg-white/5 text-xs text-slate-400 col-span-2">
                Log more income and expense transactions to activate continuous AI anomaly detection.
              </div>
            ) : (
              aiInsights.slice(0, 2).map((insight, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-500/30 transition flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-1 block">
                      {insight.tag}
                    </span>
                    <h4 className="text-xs font-bold text-white mb-1">{insight.title}</h4>
                    <p className="text-[11px] text-slate-300 line-clamp-3 leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions & Upcoming Recurring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions (2 cols) */}
        <div className="lg:col-span-2 p-6 glass-panel rounded-3xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Recent Transactions</h2>
              <p className="text-xs text-slate-400">Latest recorded ledger entries</p>
            </div>
            <Link to="/transactions" className="text-xs text-sky-400 hover:underline">
              View All Ledger
            </Link>
          </div>

          <div className="divide-y divide-white/5">
            {recentTransactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No recent transactions recorded yet.
              </div>
            ) : (
              recentTransactions.map((tx) => (
                <div key={tx._id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-xl ${
                        tx.type === 'income'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {tx.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{tx.title}</p>
                      <p className="text-[10px] text-slate-400">
                        {tx.category} • {new Date(tx.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-bold block ${
                        tx.type === 'income' ? 'text-emerald-400' : 'text-slate-200'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                    <span className="text-[10px] text-slate-400">{tx.paymentMethod}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Recurring Bills */}
        <div className="p-6 glass-panel rounded-3xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Upcoming Bills</h2>
              <p className="text-xs text-slate-400">Scheduled within 14 days</p>
            </div>
            <Link to="/recurring" className="text-xs text-sky-400 hover:underline">
              Schedule
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingRecurring.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">
                No upcoming recurring bills due soon.
              </p>
            ) : (
              upcomingRecurring.map((item) => (
                <div
                  key={item._id}
                  className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <div>
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="text-[10px] text-slate-400">
                        Due {new Date(item.nextDueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-white">{formatCurrency(item.amount)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
