import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  BarChart3,
  Target,
  Repeat,
  Sparkles,
  FileText,
  User,
  LogOut,
  X,
  CreditCard,
  TrendingUp,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Smart Budgets', path: '/budgets', icon: PieChart },
    { name: 'Analytics & Trends', path: '/analytics', icon: BarChart3 },
    { name: 'Savings Goals', path: '/goals', icon: Target },
    { name: 'Recurring Bills', path: '/recurring', icon: Repeat },
    { name: 'AI Finance Advisor', path: '/ai-assistant', icon: Sparkles, badge: 'AI' },
    { name: 'Reports & Export', path: '/reports', icon: FileText },
    { name: 'Account Settings', path: '/profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 glass-panel border-r border-white/10 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-sky-400 text-white shadow-glow-indigo">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-sky-400 bg-clip-text text-transparent">
                SmartTrack <span className="text-sky-400 text-xs px-1.5 py-0.5 rounded-full bg-sky-400/10 border border-sky-400/20">AI</span>
              </h1>
              <p className="text-[11px] text-slate-400">Intelligent Wealth OS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 rounded-lg md:hidden hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onClose && onClose()}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/20 text-sky-400 border border-sky-500/30 shadow-glow-cyan'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-gradient-to-r from-purple-500 to-sky-500 text-white">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-sky-300 font-semibold text-sm">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full gap-2 px-3 py-2 text-xs font-medium text-rose-400 transition-colors rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
