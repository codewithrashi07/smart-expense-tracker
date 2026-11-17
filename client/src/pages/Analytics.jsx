import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, Flame, Calendar, DollarSign, ArrowUpRight } from 'lucide-react';

export default function Analytics() {
  const { formatCurrency } = useAuth();
  const [trends, setTrends] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [trRes, fcRes, catRes] = await Promise.all([
        api.getTrends(12).catch(() => ({ data: [] })),
        api.getForecast().catch(() => ({ data: {} })),
        api.getCategories('all').catch(() => ({ data: [] })),
      ]);

      setTrends(trRes.data || []);
      setForecast(fcRes.data || {});
      setCategories(catRes.data || []);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fc = forecast || {
    dailyBurnRate: 104.50,
    projectedMonthEndExpense: 3135.00,
    projectedSavings: 3865.00,
    safeDailySpendingLimit: 75.00,
    remainingDays: 14,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 glass-panel rounded-3xl border border-white/10">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Financial Analytics & Forecasting</h1>
        <p className="text-xs text-slate-400 mt-1">
          Algorithmic predictive cashflow modeling and historical performance metrics
        </p>
      </div>

      {/* Predictive Forecasting Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 glass-panel rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Daily Burn Rate</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{formatCurrency(fc.dailyBurnRate)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Average daily expense outflow</p>
        </div>

        <div className="p-5 glass-panel rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Projected Month-End Spend</span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{formatCurrency(fc.projectedMonthEndExpense)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Forecasted final outflow</p>
        </div>

        <div className="p-5 glass-panel rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Projected Net Savings</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2">{formatCurrency(fc.projectedSavings)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Estimated monthly surplus</p>
        </div>

        <div className="p-5 glass-panel rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Safe Daily Spending Limit</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-sky-400 mt-2">{formatCurrency(fc.safeDailySpendingLimit)}</p>
          <p className="text-[11px] text-slate-400 mt-1">For remaining {fc.remainingDays} days</p>
        </div>
      </div>

      {/* 12-Month Bar Chart */}
      <div className="p-6 glass-panel rounded-3xl border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-white">Historical Cashflow Breakdown</h2>
            <p className="text-xs text-slate-400">Income vs. Expense volume across cycles</p>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} />
              <Tooltip
                formatter={(val) => formatCurrency(val)}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#fff',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="income" name="Income Inflows" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expense Outflows" fill="#F43F5E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lifetime Category Breakdown Table */}
      <div className="p-6 glass-panel rounded-3xl border border-white/10">
        <h2 className="text-base font-bold text-white mb-4">All-Time Category Breakdown</h2>
        <div className="divide-y divide-white/5">
          {categories.map((c) => (
            <div key={c.name} className="py-3 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-white">{c.name}</p>
                <p className="text-[10px] text-slate-400">{c.count} transactions recorded</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-white block">{formatCurrency(c.amount)}</span>
                <span className="text-[10px] text-sky-400 font-medium">{c.percentage}% of total</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
