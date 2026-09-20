import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  TrendingUp,
  Receipt,
  PiggyBank,
  CheckCircle2,
  Download,
  Printer,
  Sparkles,
  PieChart as PieIcon,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency, formatDate, getCategoryBadge } from '../utils/formatters';

export const ReportsView: React.FC = () => {
  const { expenses, income, totalIncome, totalExpenses, savingsRate, settings } = useFinancial();
  const [timeframe, setTimeframe] = useState<'this_month' | 'last_3_months' | 'all'>('this_month');

  // Filter transactions based on timeframe
  const filteredData = useMemo(() => {
    const now = new Date();
    const currentYearMonth = now.toISOString().substring(0, 7);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - 3);

    const matchDate = (dateStr: string) => {
      if (timeframe === 'this_month') {
        return dateStr.startsWith(currentYearMonth);
      }
      if (timeframe === 'last_3_months') {
        return new Date(dateStr) >= threeMonthsAgo;
      }
      return true; // all
    };

    const exp = expenses.filter((e) => matchDate(e.date));
    const inc = income.filter((i) => matchDate(i.date));

    const totalInc = inc.reduce((acc, curr) => acc + curr.amount, 0);
    const totalExp = exp.reduce((acc, curr) => acc + curr.amount, 0);
    const netSavings = Math.max(0, totalInc - totalExp);
    const rate = totalInc > 0 ? Math.round((netSavings / totalInc) * 100) : 0;

    return { expenses: exp, income: inc, totalInc, totalExp, netSavings, rate };
  }, [expenses, income, timeframe]);

  // Highlights calculations
  const highlights = useMemo(() => {
    // Highest expense day
    const dayMap: Record<string, number> = {};
    filteredData.expenses.forEach((e) => {
      dayMap[e.date] = (dayMap[e.date] || 0) + e.amount;
    });

    let peakDate = 'None';
    let peakDayAmount = 0;
    Object.entries(dayMap).forEach(([date, amount]) => {
      if (amount > peakDayAmount) {
        peakDayAmount = amount;
        peakDate = date;
      }
    });

    // Top Category
    const catMap: Record<string, number> = {};
    filteredData.expenses.forEach((e) => {
      catMap[e.category] = (catMap[e.category] || 0) + e.amount;
    });

    let topCategory = 'None';
    let topCatAmount = 0;
    Object.entries(catMap).forEach(([cat, amount]) => {
      if (amount > topCatAmount) {
        topCatAmount = amount;
        topCategory = cat;
      }
    });

    // Essential vs Discretionary
    const essentialCategories = ['Food', 'Education', 'Bills', 'Healthcare'];
    let essentialTotal = 0;
    let discretionaryTotal = 0;

    filteredData.expenses.forEach((e) => {
      if (essentialCategories.includes(e.category)) {
        essentialTotal += e.amount;
      } else {
        discretionaryTotal += e.amount;
      }
    });

    const essentialPercentage =
      filteredData.totalExp > 0 ? Math.round((essentialTotal / filteredData.totalExp) * 100) : 0;
    const discretionaryPercentage =
      filteredData.totalExp > 0 ? 100 - essentialPercentage : 0;

    // Average daily spending (over 30 days)
    const avgDailySpending = Math.round(filteredData.totalExp / 30);

    return {
      peakDate,
      peakDayAmount,
      topCategory,
      topCatAmount,
      essentialTotal,
      discretionaryTotal,
      essentialPercentage,
      discretionaryPercentage,
      avgDailySpending,
      categoryMap: catMap,
    };
  }, [filteredData]);

  // Category chart data
  const categoryChartData = useMemo(() => {
    const COLORS = ['#f97316', '#0ea5e9', '#8b5cf6', '#ec4899', '#f43f5e', '#64748b', '#10b981', '#6b7280'];
    return Object.entries(highlights.categoryMap).map(([cat, amount], idx) => ({
      name: cat,
      amount,
      percentage: filteredData.totalExp > 0 ? Math.round((amount / filteredData.totalExp) * 100) : 0,
      color: COLORS[idx % COLORS.length],
    }));
  }, [highlights.categoryMap, filteredData.totalExp]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Financial Reports & Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Audit monthly performance, spending habits, and capital accumulation trends.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Timeframe Switcher */}
          <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs flex items-center">
            <button
              type="button"
              onClick={() => setTimeframe('this_month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                timeframe === 'this_month' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('last_3_months')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                timeframe === 'last_3_months' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Last 3 Months
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                timeframe === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              All Time
            </button>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs transition-colors"
            title="Print Report"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top 4 Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Peak Expense Day */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Highest Expense Day
          </span>
          <div className="text-xl font-extrabold text-slate-900 mt-1">
            {highlights.peakDate !== 'None' ? formatDate(highlights.peakDate) : 'N/A'}
          </div>
          <div className="text-xs text-red-500 font-semibold mt-1">
            {formatCurrency(highlights.peakDayAmount, settings.currencySymbol)} spent
          </div>
        </div>

        {/* Top Spending Category */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Top Spending Category
          </span>
          <div className="text-xl font-extrabold text-slate-900 mt-1">{highlights.topCategory}</div>
          <div className="text-xs text-blue-600 font-semibold mt-1">
            {formatCurrency(highlights.topCatAmount, settings.currencySymbol)} total
          </div>
        </div>

        {/* Percentage Saved */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Percentage Saved
          </span>
          <div className="text-xl font-extrabold text-emerald-600 mt-1">{filteredData.rate}%</div>
          <div className="text-xs text-slate-400 mt-1">
            {formatCurrency(filteredData.netSavings, settings.currencySymbol)} retained
          </div>
        </div>

        {/* Average Daily Spending */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Daily Spending Burn
          </span>
          <div className="text-xl font-extrabold text-slate-900 mt-1">
            {formatCurrency(highlights.avgDailySpending, settings.currencySymbol)}
            <span className="text-xs text-slate-400 font-normal">/day</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">Normalized 30-day run rate</div>
        </div>
      </div>

      {/* Spending Habits Report: Essential vs Discretionary */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Spending Habits & Budget Health</h3>
            <p className="text-xs text-slate-500">
              Analysis of needs (Food, Books, Bills) vs wants (Shopping, Entertainment)
            </p>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            50/30/20 Rule Benchmarking
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
          {/* Essential Spending Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Essential Spending (Needs)
              </span>
              <span className="text-xs font-extrabold text-slate-900">
                {highlights.essentialPercentage}%
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {formatCurrency(highlights.essentialTotal, settings.currencySymbol)}
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-3">
              <div
                className="bg-blue-600 h-full rounded-full"
                style={{ width: `${highlights.essentialPercentage}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Includes Food, Education, Bills, and Healthcare. Healthy benchmark is ≤ 50% of income.
            </p>
          </div>

          {/* Discretionary Spending Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Discretionary Spending (Wants)
              </span>
              <span className="text-xs font-extrabold text-amber-600">
                {highlights.discretionaryPercentage}%
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {formatCurrency(highlights.discretionaryTotal, settings.currencySymbol)}
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-3">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{ width: `${highlights.discretionaryPercentage}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Includes Shopping, Entertainment, and leisure travel. Ideal benchmark is ≤ 30% of income.
            </p>
          </div>
        </div>
      </div>

      {/* Category Breakdown Table & Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Category Breakdown Summary
          </h3>

          <div className="space-y-4 mt-4">
            {categoryChartData.map((item) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="font-bold text-slate-800">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-medium">{item.percentage}%</span>
                    <span className="font-extrabold text-slate-900">
                      {formatCurrency(item.amount, settings.currencySymbol)}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Donut (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Spending Distribution
            </h3>

            <div className="h-56 mt-2 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="amount"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val) || 0), 'Amount']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '10px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-slate-400 font-semibold uppercase">Total Outlay</span>
                <span className="text-base font-black text-slate-900">
                  {formatCurrency(filteredData.totalExp, settings.currencySymbol)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 mt-2">
            <strong>Key takeaway:</strong> Your savings surplus for this timeframe is{' '}
            {formatCurrency(filteredData.netSavings, settings.currencySymbol)} ({filteredData.rate}%).
          </div>
        </div>
      </div>
    </div>
  );
};
