import React, { useState } from 'react';
import {
  TrendingUp,
  Receipt,
  PiggyBank,
  Wallet,
  Percent,
  ArrowUpRight,
  Plus,
  Search,
  Sparkles,
  HelpCircle,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Target,
  Filter,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency, formatDate, getCategoryBadge } from '../utils/formatters';
import { NavTab, Expense, SavingsGoal } from '../types';

interface DashboardViewProps {
  setCurrentTab: (tab: NavTab) => void;
  onOpenAddExpense: () => void;
  onOpenAddIncome: () => void;
  onOpenExpenseModalWithEdit: (expense: Expense) => void;
  onOpenAddMoneyModal: (goal: SavingsGoal) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setCurrentTab,
  onOpenAddExpense,
  onOpenAddIncome,
  onOpenExpenseModalWithEdit,
  onOpenAddMoneyModal,
}) => {
  const {
    totalIncome,
    totalExpenses,
    availableBalance,
    totalSavings,
    savingsRate,
    expenses,
    income,
    goals,
    categoryBreakdown,
    smartInsights,
    settings,
    deleteExpense,
  } = useFinancial();

  const [searchQuery, setSearchQuery] = useState('');
  const [quickAffordItem, setQuickAffordItem] = useState('');
  const [quickAffordPrice, setQuickAffordPrice] = useState('');

  // Prepare monthly spending trend data for Recharts
  const monthlyChartData = React.useMemo(() => {
    const monthMap: Record<string, { month: string; income: number; expenses: number; savings: number }> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Pre-populate recent months
    const now = new Date();
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${monthNames[d.getMonth()]}`;
      monthMap[key] = { month: label, income: 0, expenses: 0, savings: 0 };
    }

    // Populate from actual income
    income.forEach((item) => {
      const key = item.date.substring(0, 7);
      if (monthMap[key]) {
        monthMap[key].income += Number(item.amount) || 0;
      } else {
        const parts = key.split('-');
        const monthIndex = parseInt(parts[1], 10) - 1;
        monthMap[key] = {
          month: monthNames[monthIndex] || key,
          income: Number(item.amount) || 0,
          expenses: 0,
          savings: 0,
        };
      }
    });

    // Populate from actual expenses
    expenses.forEach((item) => {
      const key = item.date.substring(0, 7);
      if (monthMap[key]) {
        monthMap[key].expenses += Number(item.amount) || 0;
      } else {
        const parts = key.split('-');
        const monthIndex = parseInt(parts[1], 10) - 1;
        monthMap[key] = {
          month: monthNames[monthIndex] || key,
          income: 0,
          expenses: Number(item.amount) || 0,
          savings: 0,
        };
      }
    });

    // Compute savings
    return Object.values(monthMap).map((m) => ({
      ...m,
      savings: Math.max(0, m.income - m.expenses),
    }));
  }, [income, expenses]);

  // Prepare category pie data for Recharts
  const categoryPieData = React.useMemo(() => {
    const COLORS = ['#f97316', '#0ea5e9', '#8b5cf6', '#ec4899', '#f43f5e', '#64748b', '#10b981', '#6b7280'];
    return Object.entries(categoryBreakdown).map(([category, data], index) => ({
      name: category,
      value: data.amount,
      percentage: data.percentage,
      color: COLORS[index % COLORS.length],
    }));
  }, [categoryBreakdown]);

  // Filtered recent transactions
  const filteredRecentExpenses = React.useMemo(() => {
    return expenses
      .filter((e) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          e.name.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          (e.note && e.note.toLowerCase().includes(q))
        );
      })
      .slice(0, 6);
  }, [expenses, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top 5 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Monthly Income Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Monthly Income
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(totalIncome, settings.currencySymbol)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{income.length} active stream(s)</span>
            </div>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Expenses
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(totalExpenses, settings.currencySymbol)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500 font-medium">
              <span>{expenses.length} transaction(s)</span>
            </div>
          </div>
        </div>

        {/* Total Savings Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Savings
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(totalSavings, settings.currencySymbol)}
            </div>
            <div className="text-xs text-blue-600 font-medium mt-1">
              Formula: Income - Expenses
            </div>
          </div>
        </div>

        {/* Available Balance Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Available Balance
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(availableBalance, settings.currencySymbol)}
            </div>
            <div className="text-xs text-indigo-600 font-medium mt-1">
              {availableBalance > 0 ? 'Liquid positive funds' : 'Needs attention'}
            </div>
          </div>
        </div>

        {/* Savings Rate Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Savings Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {savingsRate}%
            </div>
            <div className="text-xs text-emerald-600 font-medium mt-1">
              {savingsRate >= 50 ? 'Excellent buffer' : 'Target: 25%+'}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Affordability Checker Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30 mb-2">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Smart Student Decision Engine</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              Thinking of buying something today?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1">
              Check if an expense fits safely within your current balance without hurting your active savings goals.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentTab('affordability')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-white text-slate-900 hover:bg-slate-100 shadow-md transition-all active:scale-98 flex items-center gap-2"
            >
              <span>Launch Affordability Simulator</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentTab('ai-assistant')}
              className="px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-blue-600/80 text-white hover:bg-blue-600 border border-blue-400/30 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Spending Trend (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">Monthly Spending & Income</h3>
              <p className="text-xs text-slate-500">Live dynamic comparison of cash inflows vs expenses</p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentTab('reports')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View Detailed Analytics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 sm:h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${val / 1000}k` : val}`}
                />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value) || 0), '']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[6, 6, 0, 0]} />
                <Bar dataKey="savings" name="Savings" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Breakdown Chart (1 col) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Expense Categories</h3>
            <p className="text-xs text-slate-500">Calculated automatically from real data</p>
          </div>

          {categoryPieData.length > 0 ? (
            <div className="flex-1 flex flex-col justify-center my-2">
              <div className="h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Amount']}
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
                  <span className="text-xs text-slate-400 font-medium">Total</span>
                  <span className="text-sm font-extrabold text-slate-800">
                    {formatCurrency(totalExpenses, settings.currencySymbol)}
                  </span>
                </div>
              </div>

              {/* Category legend list */}
              <div className="space-y-1.5 mt-2 max-h-36 overflow-y-auto pr-1">
                {categoryPieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs py-0.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                      <span className="font-medium text-slate-700">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">{item.percentage}%</span>
                      <span className="font-bold text-slate-900">{formatCurrency(item.value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              No expenses recorded yet.
            </div>
          )}

          <button
            type="button"
            onClick={onOpenAddExpense}
            className="w-full mt-3 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-center"
          >
            + Add New Expense
          </button>
        </div>
      </div>

      {/* Smart Financial Insights & Savings Progress Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Smart Financial Insights (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Smart Financial Insights</h3>
                <p className="text-xs text-slate-500">Autonomous insights computed from actual transaction numbers</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
              Live Engine
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {smartInsights.length > 0 ? (
              smartInsights.map((insight) => (
                <div
                  key={insight.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    insight.type === 'positive'
                      ? 'bg-emerald-50/50 border-emerald-200/70 text-emerald-900'
                      : insight.type === 'warning'
                      ? 'bg-amber-50/50 border-amber-200/70 text-amber-900'
                      : insight.type === 'milestone'
                      ? 'bg-blue-50/50 border-blue-200/70 text-blue-900'
                      : 'bg-slate-50/70 border-slate-200/70 text-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider">{insight.title}</h4>
                    {insight.metric && (
                      <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-white/80 shadow-2xs">
                        {insight.metric}
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-1.5 opacity-90 leading-relaxed">{insight.description}</p>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-6 text-xs text-slate-400">
                Add transactions to generate smart insights!
              </div>
            )}
          </div>
        </div>

        {/* Savings Goals Widget (1 col) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Savings Goals</h3>
            </div>
            <button
              type="button"
              onClick={() => setCurrentTab('goals')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              View All ({goals.length})
            </button>
          </div>

          <div className="space-y-3.5 my-3">
            {goals.slice(0, 3).map((goal) => {
              const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
              return (
                <div key={goal.id} className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 truncate max-w-[150px]">{goal.name}</span>
                    <span className="font-bold text-blue-600">{progress}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                    <span>
                      Saved: <strong className="text-slate-800">{formatCurrency(goal.currentAmount)}</strong>
                    </span>
                    <span>
                      Target: <strong>{formatCurrency(goal.targetAmount)}</strong>
                    </span>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Due {formatDate(goal.deadline)}</span>
                    <button
                      type="button"
                      onClick={() => onOpenAddMoneyModal(goal)}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-white px-2 py-0.5 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors shadow-2xs"
                    >
                      + Add Money
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setCurrentTab('goals')}
            className="w-full py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-center"
          >
            Manage All Goals
          </button>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Transactions</h3>
            <p className="text-xs text-slate-500">Your latest recorded expenses and outlays</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transactions..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 bg-slate-50/50 w-40 sm:w-56"
              />
            </div>
            <button
              type="button"
              onClick={() => setCurrentTab('expenses')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              View All
            </button>
          </div>
        </div>

        {/* Transactions list */}
        {filteredRecentExpenses.length > 0 ? (
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 uppercase tracking-wider border-b border-slate-100 font-semibold text-[11px]">
                  <th className="py-3 px-2">Expense</th>
                  <th className="py-3 px-2">Category</th>
                  <th className="py-3 px-2">Payment Method</th>
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2 text-right">Amount</th>
                  <th className="py-3 px-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredRecentExpenses.map((expense) => {
                  const badge = getCategoryBadge(expense.category);
                  return (
                    <tr key={expense.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-2">
                        <div className="font-bold text-slate-900">{expense.name}</div>
                        {expense.note && (
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">{expense.note}</div>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.bg} ${badge.border} ${badge.text}`}
                        >
                          {expense.category}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-slate-600">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-700">
                          {expense.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-slate-500 whitespace-nowrap">
                        {formatDate(expense.date)}
                      </td>
                      <td className="py-3 px-2 text-right font-extrabold text-red-600 whitespace-nowrap">
                        -{formatCurrency(expense.amount, settings.currencySymbol)}
                      </td>
                      <td className="py-3 px-2 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenExpenseModalWithEdit(expense)}
                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteExpense(expense.id)}
                            className="text-[11px] font-semibold text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center text-slate-400 text-xs">
            No transactions match your search.
          </div>
        )}
      </div>
    </div>
  );
};
