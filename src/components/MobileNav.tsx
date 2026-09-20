import React, { useState } from 'react';
import {
  LayoutDashboard,
  Receipt,
  ArrowDownLeft,
  Sparkles,
  Target,
  MoreHorizontal,
  HelpCircle,
  BarChart3,
  User,
  Settings,
  X,
} from 'lucide-react';
import { NavTab } from '../types';

interface MobileNavProps {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, setCurrentTab }) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mainItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'income', label: 'Income', icon: ArrowDownLeft },
    { id: 'ai-assistant', label: 'AI Chat', icon: Sparkles },
    { id: 'goals', label: 'Goals', icon: Target },
  ];

  const moreItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'affordability', label: 'Can I Afford It?', icon: HelpCircle },
    { id: 'reports', label: 'Financial Reports', icon: BarChart3 },
    { id: 'profile', label: 'User Profile', icon: User },
    { id: 'settings', label: 'App Settings', icon: Settings },
  ];

  return (
    <>
      {/* More menu drawer */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end lg:hidden">
          <div className="bg-white rounded-t-3xl p-5 border-t border-slate-200 shadow-2xl max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-slate-900">More SmartFin Features</span>
              <button
                type="button"
                onClick={() => setShowMoreMenu(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 py-4">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setCurrentTab(item.id);
                      setShowMoreMenu(false);
                    }}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left font-medium text-sm transition-all ${
                      isActive
                        ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200/70 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isActive ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 shadow-2xs'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Fixed bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 lg:hidden flex items-center justify-around shadow-lg">
        {mainItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-blue-50' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}

        {/* More toggle */}
        <button
          type="button"
          onClick={() => setShowMoreMenu(true)}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
            moreItems.some((m) => m.id === currentTab)
              ? 'text-blue-600 font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <div className={`p-1 rounded-lg ${moreItems.some((m) => m.id === currentTab) ? 'bg-blue-50' : ''}`}>
            <MoreHorizontal className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5">More</span>
        </button>
      </nav>
    </>
  );
};
