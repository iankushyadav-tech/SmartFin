import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  RotateCcw,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
  Bell,
  Coins,
  Shield,
  Award,
  Sparkles,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetToInitialData,
    clearAllData,
    expenses,
    income,
    goals,
    profile,
  } = useFinancial();

  const [currency, setCurrency] = useState(settings.currency);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [budgetAlerts, setBudgetAlerts] = useState(settings.budgetAlerts);
  const [savingsMilestoneAlerts, setSavingsMilestoneAlerts] = useState(settings.savingsMilestoneAlerts);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      currency,
      currencySymbol,
      budgetAlerts,
      savingsMilestoneAlerts,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCurrencyChange = (curr: string) => {
    setCurrency(curr);
    if (curr === 'INR') setCurrencySymbol('₹');
    else if (curr === 'USD') setCurrencySymbol('$');
    else if (curr === 'EUR') setCurrencySymbol('€');
    else if (curr === 'GBP') setCurrencySymbol('£');
  };

  // Export JSON
  const handleExportJSON = () => {
    const fullBackup = {
      app: 'SmartFin',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      profile,
      settings,
      expenses,
      income,
      goals,
    };
    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartfin-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Application Settings
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure currencies, notification alerts, telemetry, and local persistence controls.
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Regional & Currency Preferences</h3>
          </div>
          {savedSuccess && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Settings saved!</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Active Currency
            </label>
            <select
              value={currency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 bg-slate-50/50"
            >
              <option value="INR">INR (₹) - Indian Rupee (Default Student)</option>
              <option value="USD">USD ($) - US Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="GBP">GBP (£) - British Pound</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Currency Symbol
            </label>
            <input
              type="text"
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 bg-slate-50/50 font-bold"
            />
          </div>
        </div>

        {/* Notifications & Insights Section */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-purple-600" />
            <h3 className="text-base font-bold text-slate-900">Intelligent Alerts & Nudges</h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/70 transition-colors">
              <input
                type="checkbox"
                checked={budgetAlerts}
                onChange={(e) => setBudgetAlerts(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800 block">Monthly Budget Overrun Warnings</span>
                <span className="text-slate-500">
                  Notify when monthly expenditures surpass 75% and 90% of your allowance limit.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/70 transition-colors">
              <input
                type="checkbox"
                checked={savingsMilestoneAlerts}
                onChange={(e) => setSavingsMilestoneAlerts(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800 block">Savings Goal Milestone Celebrations</span>
                <span className="text-slate-500">
                  Highlight achievements when reaching 25%, 50%, 75%, and 100% of your targets.
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 transition-all shadow-md shadow-blue-600/20"
          >
            Save Preferences
          </button>
        </div>
      </form>

      {/* Data Management & Persistence */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
          Data Management & Local Persistence
        </h3>
        <p className="text-xs text-slate-500">
          Your SmartFin data is stored securely in your browser's persistent storage. You can backup, restore, or reset to sample data anytime.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Export JSON */}
          <button
            type="button"
            onClick={handleExportJSON}
            className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors flex items-start gap-3"
          >
            <Download className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-slate-900">Export Full Backup</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Download JSON snapshot</div>
            </div>
          </button>

          {/* Reset to Sample Data */}
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-left transition-colors flex items-start gap-3"
          >
            <RotateCcw className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-amber-900">Reset Demo Data</div>
              <div className="text-[11px] text-amber-700 mt-0.5">Restore initial student records</div>
            </div>
          </button>

          {/* Clear All Data */}
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="p-4 rounded-2xl border border-red-200 bg-red-50/50 hover:bg-red-50 text-left transition-colors flex items-start gap-3"
          >
            <Trash2 className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-red-900">Clear All Records</div>
              <div className="text-[11px] text-red-700 mt-0.5">Wipe all transactions</div>
            </div>
          </button>
        </div>
      </div>

      {/* Hackathon Project Showcase Card */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-3xl p-6 text-white border border-blue-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-extrabold uppercase tracking-wider text-blue-300">
              Hack in Hills 2026 Submission
            </div>
            <h4 className="text-lg font-black tracking-tight text-white">
              SMARTFIN by Team CodeCapital
            </h4>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Domain:</span>
            <span className="font-bold text-white">FinTech for Students</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">AI Architecture:</span>
            <span className="font-bold text-white">Server-side Gemini proxy</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Formulas:</span>
            <span className="font-bold text-white">Dynamic real-time telemetry</span>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">Reset to Sample Data?</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              This will overwrite your transactions with realistic sample student data (Ankush, Computer Science, ₹25,000 monthly income).
            </p>
            <div className="flex items-center justify-end gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetToInitialData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
              >
                Reset Demo Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">Wipe All Transactions?</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              This will remove all recorded expenses, income, and goals. You will start with a fresh 0 balance.
            </p>
            <div className="flex items-center justify-end gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAllData();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs"
              >
                Yes, Wipe Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
