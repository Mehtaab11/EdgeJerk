'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { TopHeaderBar } from '@/components/layout/TopHeaderBar';
import { BottomFooterBar } from '@/components/layout/BottomFooterBar';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { fetchApi } from '@/lib/api-client';
import {
  User,
  DollarSign,
  Save,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Sun,
  Moon,
  Monitor,
  Shield,
  Mail,
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, displayName, defaultAccountSize, checkSession } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  // Profile form state
  const [name, setName] = useState('');
  const [accountSize, setAccountSize] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Populate form with existing data
  useEffect(() => {
    if (displayName) setName(displayName);
    if (defaultAccountSize) setAccountSize(String(defaultAccountSize));
  }, [displayName, defaultAccountSize]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    const res = await fetchApi('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        display_name: name.trim(),
        default_account_size: parseFloat(accountSize) || 10000,
      }),
    });

    setSaving(false);

    if (res.success) {
      setSaveSuccess(true);
      await checkSession();
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setSaveError(res.error || 'Failed to update profile');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;

    setDeleting(true);
    setDeleteError(null);

    const res = await fetchApi('/api/auth/delete-account', {
      method: 'DELETE',
    });

    if (res.success) {
      // Clear local state and redirect to login
      router.push('/login');
    } else {
      setDeleteError(res.error || 'Failed to delete account');
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f3fa] dark:bg-[#070a14] flex flex-col font-sans text-slate-900 dark:text-slate-200">
      <TopHeaderBar />
      <SidebarNav />

      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-3xl mx-auto w-full space-y-6 pb-32">
        {/* PAGE HEADER */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h1 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
            Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your profile, preferences, and account
          </p>
        </div>

        {/* ─────────────────────────────────────── */}
        {/* PROFILE SECTION                         */}
        {/* ─────────────────────────────────────── */}
        <section className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <User className="w-4 h-4 text-[#2962ff] dark:text-[#388bfd]" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Profile
            </span>
          </div>

          <form onSubmit={handleSaveProfile} className="p-5 space-y-4">
            {/* Email (read-only) */}
            <div>
              <label className="form-label flex items-center gap-1.5 mb-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email</span>
              </label>
              <div className="form-input text-xs flex items-center text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-70">
                {user?.email || '—'}
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="form-label flex items-center gap-1.5 mb-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Display Name</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your display name"
                className="form-input text-xs"
              />
            </div>

            {/* Account Size */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="form-label flex items-center gap-1.5 mb-0">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                  <span>Account Size ($)</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  Used for risk % calculations
                </span>
              </div>
              <input
                type="number"
                value={accountSize}
                onChange={(e) => setAccountSize(e.target.value)}
                placeholder="10000"
                min="1"
                step="0.01"
                className="form-input text-xs"
              />
            </div>

            {/* Save Feedback */}
            {saveSuccess && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Profile updated successfully</span>
              </div>
            )}
            {saveError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-mono">
                {saveError}
              </div>
            )}

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="py-2.5 px-6 rounded-lg bg-[#2962ff] hover:bg-[#1e4bd8] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </form>
        </section>

        {/* ─────────────────────────────────────── */}
        {/* APPEARANCE SECTION                      */}
        {/* ─────────────────────────────────────── */}
        <section className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Monitor className="w-4 h-4 text-[#2962ff] dark:text-[#388bfd]" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Appearance
            </span>
          </div>

          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Theme
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Switch between light and dark mode
                </span>
              </div>

              <button
                onClick={toggleTheme}
                className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                {theme === 'dark' ? (
                  <>
                    <Moon className="w-4 h-4 text-blue-400" />
                    <span>Dark</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>Light</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────── */}
        {/* DANGER ZONE                             */}
        {/* ─────────────────────────────────────── */}
        <section className="bg-white dark:bg-[#0d1322] border border-rose-200 dark:border-rose-900/40 rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-rose-100 dark:border-rose-900/30 flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Danger Zone
            </span>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Delete Account
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Permanently remove your account and all associated data.
                  This action cannot be undone.
                </span>
              </div>

              {!showDeleteConfirm && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="shrink-0 py-2 px-4 rounded-lg border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Account
                  </span>
                </button>
              )}
            </div>

            {/* CONFIRMATION PANEL */}
            {showDeleteConfirm && (
              <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-500/5 border border-rose-200 dark:border-rose-800/50 space-y-3">
                <div className="flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-rose-500" />
                  <div>
                    <p className="font-bold mb-1">This is irreversible!</p>
                    <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80">
                      All your trades, analytics, trade plans, and profile data will be permanently
                      deleted. Type <strong className="font-mono">DELETE</strong> below to confirm.
                    </p>
                  </div>
                </div>

                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                  placeholder='Type "DELETE" to confirm'
                  className="form-input text-xs !border-rose-300 dark:!border-rose-800 !bg-white dark:!bg-[#0d1322]"
                />

                {deleteError && (
                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-mono">
                    {deleteError}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== 'DELETE' || deleting}
                    className="py-2 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{deleting ? 'Deleting...' : 'Permanently Delete'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmText('');
                      setDeleteError(null);
                    }}
                    className="py-2 px-4 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <BottomFooterBar />
    </div>
  );
}
