import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, Shield, CheckCircle2, Lock } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [incomeTarget, setIncomeTarget] = useState(user?.monthlyIncomeTarget || 0);
  const [bio, setBio] = useState(user?.bio || '');
  const [profileMsg, setProfileMsg] = useState('');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    try {
      const res = await api.updateProfile({
        name,
        currency,
        monthlyIncomeTarget: Number(incomeTarget),
        bio,
      });
      updateUser(res.user);
      setProfileMsg('Profile updated successfully!');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Error updating profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordError('');
    try {
      await api.changePassword({ currentPassword, newPassword });
      setPasswordMsg('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPasswordMsg(''), 3000);
    } catch (err) {
      setPasswordError(err.message || 'Error changing password');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="p-6 glass-panel rounded-3xl border border-white/10">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Account & Preference Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Customize currency symbols, profile bio, monthly income targets, and security credentials
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="p-6 glass-panel rounded-3xl border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-bold text-white">Profile Details</h2>
          </div>

          {profileMsg && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {profileMsg}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Email (Immutable)</label>
              <input
                type="text"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 opacity-60 cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 block mb-1">Primary Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-sky-400"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD (CA$)</option>
                  <option value="AUD">AUD (A$)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Monthly Income Target</label>
                <input
                  type="number"
                  min="0"
                  value={incomeTarget}
                  onChange={(e) => setIncomeTarget(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Bio / Financial Philosophy</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief investor statement..."
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-semibold text-xs shadow-glow-cyan transition"
            >
              Save Profile
            </button>
          </form>
        </div>

        {/* Security & Password */}
        <div className="p-6 glass-panel rounded-3xl border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-purple-400" />
              <h2 className="text-base font-bold text-white">Security & Password</h2>
            </div>

            {passwordMsg && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                {passwordMsg}
              </div>
            )}

            {passwordError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">New Password (Min 6 Characters)</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-xs transition"
              >
                Update Password
              </button>
            </form>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-400">
            <p className="flex items-center gap-1 font-semibold text-slate-300 mb-1">
              <Shield className="w-3.5 h-3.5 text-sky-400" /> Encryption Standard
            </p>
            Passwords are encrypted using bcrypt hashing with salt rounds. Tokens use signed HMAC SHA-256 JWTs.
          </div>
        </div>
      </div>
    </div>
  );
}
