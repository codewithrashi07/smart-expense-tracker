import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Menu,
  Bell,
  Sun,
  Moon,
  Plus,
  Search,
  CheckCircle,
  AlertTriangle,
  Info,
  Sparkles,
} from 'lucide-react';

export default function Navbar({ onMenuClick, onAddTransactionClick }) {
  const { user, darkMode, setDarkMode } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res.data || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      // silent
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      // silent
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 glass-panel border-b border-white/10">
      {/* Left: Mobile hamburger & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onMenuClick}
          className="p-2 text-slate-400 rounded-lg md:hidden hover:bg-white/10"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search transactions, categories, budgets..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 transition"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Currency badge */}
        <div className="hidden sm:flex items-center px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-400/20 text-sky-400 text-xs font-semibold">
          {user?.currency || 'USD'}
        </div>

        {/* Dark / Light Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 text-slate-300 rounded-xl hover:bg-white/10 transition"
          title="Toggle Light/Dark Theme"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-300 rounded-xl hover:bg-white/10 transition"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-rose-500 rounded-full animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel rounded-2xl shadow-glass border border-white/15 p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-sky-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-white/5 mt-2">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`py-2.5 px-1 flex gap-3 items-start transition ${
                        !n.read ? 'bg-sky-500/5' : ''
                      }`}
                    >
                      <div className="mt-0.5">
                        {n.type === 'budget_alert' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        ) : n.type === 'ai_insight' ? (
                          <Sparkles className="w-4 h-4 text-purple-400" />
                        ) : n.severity === 'success' ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Info className="w-4 h-4 text-sky-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-white">{n.title}</p>
                        <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Add Transaction Button */}
        <button
          onClick={onAddTransactionClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-medium text-xs shadow-glow-cyan transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Entry</span>
        </button>
      </div>
    </header>
  );
}
