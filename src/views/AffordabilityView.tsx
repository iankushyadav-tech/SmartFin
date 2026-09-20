import React, { useState } from 'react';
import {
  HelpCircle,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  ArrowRight,
  TrendingDown,
  Target,
  Sparkles,
  Info,
  DollarSign,
  Layers,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency } from '../utils/formatters';
import { AffordabilityResult } from '../types';

export const AffordabilityView: React.FC = () => {
  const {
    availableBalance,
    totalIncome,
    totalExpenses,
    goals,
    settings,
    analyzeAffordability,
  } = useFinancial();

  const [itemName, setItemName] = useState('Wireless Noise-Cancelling Headphones');
  const [price, setPrice] = useState('4000');
  const [submittedResult, setSubmittedResult] = useState<AffordabilityResult | null>(() => {
    return analyzeAffordability('Wireless Noise-Cancelling Headphones', 4000);
  });

  const studentPresets = [
    { name: 'Wireless Headphones', price: 4000 },
    { name: 'Weekend Trip with Friends', price: 5500 },
    { name: 'Smartwatch / Fitness Tracker', price: 2800 },
    { name: 'Full-Stack Coding Bootcamp', price: 3500 },
    { name: 'New Gaming Smartphone', price: 22000 },
    { name: 'Campus Cafe Coffee & Snacks', price: 250 },
  ];

  const handleAnalyze = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsedPrice = parseFloat(price) || 0;
    const result = analyzeAffordability(itemName, parsedPrice);
    setSubmittedResult(result);
  };

  const handlePresetSelect = (preset: { name: string; price: number }) => {
    setItemName(preset.name);
    setPrice(preset.price.toString());
    const result = analyzeAffordability(preset.name, preset.price);
    setSubmittedResult(result);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Intelligent Decision Simulator</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Can I Afford It?
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-2xl">
          Evaluate prospective student purchases before swiping. We analyze your liquid balance, monthly run rate, and active savings goals to deliver a definitive verdict.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input Form (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Evaluate Prospective Purchase
            </h3>

            <form onSubmit={handleAnalyze} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Item or Experience Name *
                </label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Wireless Headphones, Manali Ticket"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 bg-slate-50/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Price ({settings.currencySymbol}) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">
                    {settings.currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="4000"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 bg-slate-50/50 font-bold text-slate-800"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 transition-all shadow-md shadow-blue-600/20"
              >
                Run Affordability Analysis
              </button>
            </form>

            {/* Quick Presets */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="text-xs font-semibold text-slate-500 mb-2.5">
                Popular Student Purchase Presets:
              </div>
              <div className="flex flex-wrap gap-2">
                {studentPresets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors text-left"
                  >
                    {preset.name} (
                    <strong className="text-slate-900">
                      {formatCurrency(preset.price, settings.currencySymbol)}
                    </strong>
                    )
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 mt-6 text-xs text-slate-500 flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Disclaimer: This evaluation is generated algorithmically from your recorded transactions for budgeting awareness, not certified professional financial advice.
            </span>
          </div>
        </div>

        {/* Right Verdict Display (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {submittedResult ? (
            <div
              className={`rounded-3xl p-6 border shadow-md transition-all ${
                submittedResult.verdict === 'SAFE'
                  ? 'bg-gradient-to-br from-white via-emerald-50/30 to-emerald-50/60 border-emerald-200'
                  : submittedResult.verdict === 'CAUTION'
                  ? 'bg-gradient-to-br from-white via-amber-50/30 to-amber-50/60 border-amber-200'
                  : 'bg-gradient-to-br from-white via-red-50/30 to-red-50/60 border-red-200'
              }`}
            >
              {/* Verdict Header Badge */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs ${
                      submittedResult.verdict === 'SAFE'
                        ? 'bg-emerald-500 text-white'
                        : submittedResult.verdict === 'CAUTION'
                        ? 'bg-amber-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {submittedResult.verdict === 'SAFE' && <ShieldCheck className="w-7 h-7" />}
                    {submittedResult.verdict === 'CAUTION' && <AlertTriangle className="w-7 h-7" />}
                    {submittedResult.verdict === 'NOT RECOMMENDED' && <XCircle className="w-7 h-7" />}
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      SmartFin Verdict
                    </div>
                    <div
                      className={`text-2xl font-black tracking-tight ${
                        submittedResult.verdict === 'SAFE'
                          ? 'text-emerald-700'
                          : submittedResult.verdict === 'CAUTION'
                          ? 'text-amber-700'
                          : 'text-red-700'
                      }`}
                    >
                      {submittedResult.verdict}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 font-semibold block">Safety Score</span>
                  <span className="text-xl font-extrabold text-slate-800">
                    {submittedResult.safetyScore}
                    <span className="text-xs text-slate-400 font-normal">/100</span>
                  </span>
                </div>
              </div>

              {/* Explanation Text */}
              <div className="mt-4 p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs">
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                  "{submittedResult.explanation}"
                </p>
              </div>

              {/* 5-Key Numbers Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                <div className="bg-white/80 p-3 rounded-2xl border border-slate-200/60">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                    Current Balance
                  </span>
                  <span className="text-base font-bold text-slate-900">
                    {formatCurrency(submittedResult.currentBalance, settings.currencySymbol)}
                  </span>
                </div>

                <div className="bg-white/80 p-3 rounded-2xl border border-slate-200/60">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                    Purchase Price
                  </span>
                  <span className="text-base font-bold text-blue-600">
                    {formatCurrency(submittedResult.price, settings.currencySymbol)}
                  </span>
                </div>

                <div className="bg-white/80 p-3 rounded-2xl border border-slate-200/60">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                    Balance After
                  </span>
                  <span
                    className={`text-base font-bold ${
                      submittedResult.balanceAfter >= 0 ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(submittedResult.balanceAfter, settings.currencySymbol)}
                  </span>
                </div>

                <div className="bg-white/80 p-3 rounded-2xl border border-slate-200/60">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                    Monthly Expenses
                  </span>
                  <span className="text-base font-bold text-slate-900">
                    {formatCurrency(submittedResult.monthlyExpenses, settings.currencySymbol)}
                  </span>
                </div>

                <div className="col-span-2 sm:col-span-2 bg-white/80 p-3 rounded-2xl border border-slate-200/60">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                    Active Goal Impact
                  </span>
                  <span className="text-xs font-semibold text-slate-800 line-clamp-2 mt-0.5">
                    {submittedResult.activeGoalImpact}
                  </span>
                </div>
              </div>

              {/* Liquid Balance Retention Gauge */}
              <div className="mt-4 p-4 rounded-2xl bg-white/80 border border-slate-200/60">
                <div className="flex items-center justify-between text-xs mb-1.5 font-bold text-slate-700">
                  <span>Liquid Buffer Retained After Purchase</span>
                  <span>{submittedResult.bufferRatio}% remaining</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      submittedResult.verdict === 'SAFE'
                        ? 'bg-emerald-500'
                        : submittedResult.verdict === 'CAUTION'
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, submittedResult.bufferRatio))}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-400">
              Enter an item name and price to calculate affordability.
            </div>
          )}

          {/* Active Goals Context Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Target className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-bold text-slate-900">Active Goals Being Protected</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              {goals.map((goal) => {
                const gap = Math.max(0, goal.targetAmount - goal.currentAmount);
                return (
                  <div key={goal.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                    <div className="font-bold text-slate-800 truncate">{goal.name}</div>
                    <div className="text-slate-500 mt-1">
                      Needs: <strong className="text-slate-800">{formatCurrency(gap, settings.currencySymbol)}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
