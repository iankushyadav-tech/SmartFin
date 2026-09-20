import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  ArrowDownLeft,
  Sparkles,
  HelpCircle,
  Target,
  BarChart3,
  User,
  Settings,
  X,
  Award,
} from 'lucide-react';
import { NavTab } from '../types';
import { useFinancial } from '../context/FinancialContext';

interface SidebarProps {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isOpen,
  setIsOpen,
}) => {
  const { profile, availableBalance, settings } = useFinancial();

  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'income', label: 'Income', icon: ArrowDownLeft },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Sparkles, badge: 'Gemini' },
    { id: 'affordability', label: 'Can I Afford It?', icon: HelpCircle },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelect = (tab: NavTab) => {
    setCurrentTab(tab);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-800 shadow-xl lg:shadow-none`}
      >
        {/* Brand Header */}
        <div className="p-5 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-500/20">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white">
                  SMART<span className="text-blue-400">FIN</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  STUDENT
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Personal Finance OS</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hackathon Badge Card */}
        <div className="mx-4 mt-4 p-3 rounded-xl bg-gradient-to-r from-slate-800/90 to-blue-950/40 border border-blue-500/20 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <div className="text-[11px] font-bold text-blue-300 truncate uppercase tracking-wider">
              Hack in Hills 2026
            </div>
            <div className="text-xs text-slate-400 font-medium truncate">
              Team: <span className="text-slate-200 font-semibold">CodeCapital</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Available Balance Preview & User Card */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
              Available Balance
            </div>
            <div className="text-lg font-bold text-white tracking-tight mt-0.5">
              {settings.currencySymbol}
              {availableBalance.toLocaleString('en-IN')}
            </div>
          </div>

          <div
            onClick={() => handleSelect('profile')}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm ring-2 ring-blue-400/30 shrink-0">
              {profile.avatarInitials || 'AY'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-white truncate">{profile.name}</div>
              <div className="text-xs text-slate-400 truncate">{profile.role}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
