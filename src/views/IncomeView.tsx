import React, { useState, useMemo } from 'react';
import {
  Plus,
  ArrowDownLeft,
  Search,
  Trash2,
  Edit2,
  TrendingUp,
  Wallet,
  Calendar,
  Layers,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency, formatDate, getIncomeTypeBadge } from '../utils/formatters';
import { Income, IncomeType } from '../types';

interface IncomeViewProps {
  onOpenAddIncome: () => void;
  onOpenEditIncome: (income: Income) => void;
}

const INCOME_TYPES: (IncomeType | 'All')[] = [
  'All',
  'Pocket Money',
  'Scholarship',
  'Part-time Job',
  'Freelance',
  'Other',
];

export const IncomeView: React.FC<IncomeViewProps> = ({
  onOpenAddIncome,
  onOpenEditIncome,
}) => {
  const { income, deleteIncome, totalIncome, settings } = useFinancial();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<IncomeType | 'All'>('All');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filtered income
  const filteredIncome = useMemo(() => {
    return income.filter((item) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchSource = item.source.toLowerCase().includes(q);
        const matchType = item.incomeType.toLowerCase().includes(q);
        const matchNote = item.note ? item.note.toLowerCase().includes(q) : false;
        if (!matchSource && !matchType && !matchNote) return false;
      }
      if (selectedType !== 'All' && item.incomeType !== selectedType) {
        return false;
      }
      return true;
    });
  }, [income, search, selectedType]);

  // Breakdown by type
  const typeBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    income.forEach((item) => {
      map[item.incomeType] = (map[item.incomeType] || 0) + item.amount;
    });
    return map;
  }, [income]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Income Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Record all cash inflows: monthly allowances, campus scholarships, stipends, and gig earnings.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddIncome}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Income</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Recorded Income
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">
            {formatCurrency(totalIncome, settings.currencySymbol)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Calculated dynamically from {income.length} record(s)
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Primary Income Stream
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {Object.entries(typeBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {formatCurrency(
              Object.entries(typeBreakdown).sort((a, b) => b[1] - a[1])[0]?.[1] || 0,
              settings.currencySymbol
            )}{' '}
            total contribution
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Income Sources
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {Object.keys(typeBreakdown).length} Category Types
          </div>
          <div className="text-xs text-slate-400 mt-1">Diversified student cash flows</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search income sources, notes..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-100 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Type:
          </span>
          {INCOME_TYPES.map((type) => {
            const isSelected = selectedType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Income Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredIncome.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Source & Description</th>
                  <th className="py-3.5 px-4">Income Type</th>
                  <th className="py-3.5 px-4">Date Received</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredIncome.map((item) => {
                  const badge = getIncomeTypeBadge(item.incomeType);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{item.source}</div>
                        {item.note && (
                          <div className="text-[11px] text-slate-400 mt-0.5 max-w-sm">{item.note}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold border ${badge.bg} ${badge.border} ${badge.text}`}
                        >
                          {item.incomeType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {formatDate(item.date)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-emerald-600 text-sm whitespace-nowrap">
                        +{formatCurrency(item.amount, settings.currencySymbol)}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => onOpenEditIncome(item)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(item.id)}
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
            <ArrowDownLeft className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No income records found</h4>
            <p className="text-xs text-slate-500 mt-1">
              Add your monthly pocket money, scholarship, or freelance checks.
            </p>
            <button
              type="button"
              onClick={onOpenAddIncome}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              + Record Income
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">Delete Income Record?</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Are you sure you want to remove this income entry? Your total income, available balance, and savings rate will update automatically.
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
                  deleteIncome(deleteConfirmId);
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
