import React, { useState } from 'react';
import {
  Menu,
  Plus,
  ArrowDownLeft,
  Bell,
  Sparkles,
  HelpCircle,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { NavTab } from '../types';

interface HeaderProps {
  onOpenSidebar: () => void;
  onOpenAddExpense: () => void;
  onOpenAddIncome: () => void;
  setCurrentTab: (tab: NavTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSidebar,
  onOpenAddExpense,
  onOpenAddIncome,
  setCurrentTab,
}) => {
  const { profile, savingsRate, availableBalance, settings } = useFinancial();
  const [showNotifications, setShowNotifications] = useState(false);

  // Dynamic greeting based on current hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-4 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left greeting & subtitle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {getGreeting()}, {profile.name} 👋
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active Student FinTech
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
              Track your money. Understand your spending. Build better financial habits.
            </p>
          </div>
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Quick Affordability Checker pill */}
          <button
            type="button"
            onClick={() => setCurrentTab('affordability')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200/80"
          >
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>Can I Afford It?</span>
          </button>

          {/* Add Income Button */}
          <button
            type="button"
            onClick={onOpenAddIncome}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors border border-emerald-200 shadow-2xs"
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
            <span>Add Income</span>
          </button>

          {/* Add Expense Primary Button */}
          <button
            type="button"
            onClick={onOpenAddExpense}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 transition-all shadow-md shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>

          {/* Notifications Dropdown Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200 relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="font-bold text-sm text-slate-900">Notifications & Alerts</div>
                  <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    SmartFin Realtime
                  </span>
                </div>

                <div className="space-y-3 mt-3">
                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-blue-50/70 border border-blue-100">
                    <TrendingUp className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-blue-900">Savings Rate is {savingsRate}%</div>
                      <div className="text-[11px] text-blue-700 mt-0.5">
                        Your liquid available balance is {settings.currencySymbol}
                        {availableBalance.toLocaleString('en-IN')}.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-emerald-900">Automatic Analytics Ready</div>
                      <div className="text-[11px] text-emerald-700 mt-0.5">
                        All charts and category percentages are reactive to your transactions.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-purple-50/70 border border-purple-100">
                    <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-purple-900">Gemini AI Assistant Connected</div>
                      <div className="text-[11px] text-purple-700 mt-0.5">
                        Ask about your highest spending areas or affordability checks anytime.
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  className="w-full mt-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium text-center border-t border-slate-100"
                >
                  Close Notifications
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
