import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { TrendingUp, Mail, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1 = request, 2 = reset
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.forgotPassword({ email });
      setMessage(res.message);
      if (res.resetToken) {
        setToken(res.resetToken);
        setStep(2);
      }
    } catch (err) {
      setError(err.message || 'Error processing request');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.resetPassword({ token, newPassword });
      setMessage(res.message);
      setStep(3); // success
    } catch (err) {
      setError(err.message || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-fintech-dark relative overflow-hidden">
      <div className="w-full max-w-md glass-panel rounded-3xl shadow-glass border border-white/15 p-8 relative z-10 animate-in fade-in zoom-in-95">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-400 text-white shadow-glow-indigo mb-3">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Password Recovery</h1>
          <p className="text-xs text-slate-400 mt-1">Regain access to your financial workspace</p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {message && step !== 3 && (
          <div className="p-3 mb-4 rounded-xl bg-sky-500/10 border border-sky-400/20 text-sky-300 text-xs">
            {message}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleRequestToken} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 block mb-1 font-medium">Registered Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="investor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 text-white font-bold text-xs shadow-glow-cyan transition disabled:opacity-50"
            >
              {loading ? 'Generating Reset Token...' : 'Send Recovery Token'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 block mb-1 font-medium">Reset Token</label>
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-medium">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 text-white font-bold text-xs shadow-glow-cyan transition disabled:opacity-50"
            >
              {loading ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="text-center py-4 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <p className="text-xs text-slate-200">{message}</p>
            <Link
              to="/login"
              className="inline-block px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
            >
              Proceed to Sign In
            </Link>
          </div>
        )}

        <div className="text-center mt-6">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
