import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Edit2,
  Calendar,
  Receipt,
  Download,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency, formatDate, getCategoryBadge } from '../utils/formatters';
import { Expense, ExpenseCategory } from '../types';

interface ExpensesViewProps {
  onOpenAddExpense: () => void;
  onOpenEditExpense: (expense: Expense) => void;
}

const CATEGORIES: (ExpenseCategory | 'All')[] = [
  'All',
  'Food',
  'Travel',
  'Education',
  'Shopping',
  'Entertainment',
  'Bills',
  'Healthcare',
  'Other',
];

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  onOpenAddExpense,
  onOpenEditExpense,
}) => {
  const { expenses, deleteExpense, settings } = useFinancial();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'All'>('All');
  const [selectedDateFilter, setSelectedDateFilter] = useState<'all' | 'this_month' | 'last_30_days'>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter and sort expenses
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((item) => {
        // Search
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = item.name.toLowerCase().includes(q);
          const matchCat = item.category.toLowerCase().includes(q);
          const matchNote = item.note ? item.note.toLowerCase().includes(q) : false;
          if (!matchName && !matchCat && !matchNote) return false;
        }

        // Category filter
        if (selectedCategory !== 'All' && item.category !== selectedCategory) {
          return false;
        }

        // Date filter
        if (selectedDateFilter === 'this_month') {
          const currentYearMonth = new Date().toISOString().substring(0, 7);
          if (!item.date.startsWith(currentYearMonth)) return false;
        } else if (selectedDateFilter === 'last_30_days') {
          const itemTime = new Date(item.date).getTime();
          const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
          if (itemTime < thirtyDaysAgo) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sortBy === 'date_asc') {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (sortBy === 'amount_desc') {
          return b.amount - a.amount;
        }
        if (sortBy === 'amount_asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [expenses, search, selectedCategory, selectedDateFilter, sortBy]);

  // Summary figures
  const totalFiltered = useMemo(() => {
    return filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredExpenses]);

  const maxExpense = useMemo(() => {
    if (filteredExpenses.length === 0) return 0;
    return Math.max(...filteredExpenses.map((e) => e.amount));
  }, [filteredExpenses]);

  const avgExpense = useMemo(() => {
    if (filteredExpenses.length === 0) return 0;
    return Math.round(totalFiltered / filteredExpenses.length);
  }, [filteredExpenses, totalFiltered]);

  // Export CSV
  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) return;
    const headers = 'Name,Amount,Category,Date,Payment Method,Note\n';
    const rows = filteredExpenses
      .map(
        (e) =>
          `"${e.name}",${e.amount},"${e.category}","${e.date}","${e.paymentMethod}","${e.note || ''}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartfin-expenses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Expense Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Log and audit every rupee. Track student costs across campus life, travel, and studies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={onOpenAddExpense}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total In View
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {formatCurrency(totalFiltered, settings.currencySymbol)}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {filteredExpenses.length} transaction(s)
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Average Expense
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {formatCurrency(avgExpense, settings.currencySymbol)}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">Per recorded item</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Highest Single Outlay
          </div>
          <div className="text-2xl font-extrabold text-red-600 mt-1">
            {formatCurrency(maxExpense, settings.currencySymbol)}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">Peak expenditure</div>
        </div>
      </div>

      {/* Search & Filtering Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by expense name, notes, category..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 bg-slate-50/50"
            />
          </div>

          {/* Date & Sort controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={selectedDateFilter}
                onChange={(e: any) => setSelectedDateFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-700 font-medium focus:outline-none"
              >
                <option value="all">All Dates</option>
                <option value="this_month">This Month</option>
                <option value="last_30_days">Last 30 Days</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-transparent text-xs text-slate-700 font-medium focus:outline-none"
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="amount_desc">Highest Amount</option>
                <option value="amount_asc">Lowest Amount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Category:
          </span>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredExpenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Expense Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredExpenses.map((expense) => {
                  const badge = getCategoryBadge(expense.category);
                  return (
                    <tr key={expense.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{expense.name}</div>
                        {expense.note && (
                          <div className="text-[11px] text-slate-400 mt-0.5 max-w-sm">{expense.note}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold border ${badge.bg} ${badge.border} ${badge.text}`}
                        >
                          {expense.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-700">
                          {expense.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {formatDate(expense.date)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-red-600 text-sm whitespace-nowrap">
                        -{formatCurrency(expense.amount, settings.currencySymbol)}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => onOpenEditExpense(expense)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(expense.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
          <div className="p-12 text-center">
            <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No expenses found</h4>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search query, date filter, or add a new expense.
            </p>
            <button
              type="button"
              onClick={onOpenAddExpense}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              + Add Expense Now
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">Delete Expense?</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Are you sure you want to delete this expense? Your available balance, category percentages, and reports will update dynamically.
            </p>
            <div className="flex items-center justify-end gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteExpense(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
