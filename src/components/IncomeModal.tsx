import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Income, IncomeType } from '../types';
import { useFinancial } from '../context/FinancialContext';

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  incomeToEdit?: Income | null;
}

const INCOME_TYPES: IncomeType[] = [
  'Pocket Money',
  'Scholarship',
  'Part-time Job',
  'Freelance',
  'Other',
];

export const IncomeModal: React.FC<IncomeModalProps> = ({
  isOpen,
  onClose,
  incomeToEdit,
}) => {
  const { addIncome, updateIncome, settings } = useFinancial();

  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [incomeType, setIncomeType] = useState<IncomeType>('Pocket Money');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (incomeToEdit) {
      setSource(incomeToEdit.source);
      setAmount(incomeToEdit.amount.toString());
      setDate(incomeToEdit.date);
      setIncomeType(incomeToEdit.incomeType);
      setNote(incomeToEdit.note || '');
      setErrors({});
    } else {
      setSource('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setIncomeType('Pocket Money');
      setNote('');
      setErrors({});
    }
  }, [incomeToEdit, isOpen]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!source.trim()) {
      errs.source = 'Income source is required.';
    } else if (source.trim().length < 2) {
      errs.source = 'Source must be at least 2 characters.';
    }

    const parsedAmt = parseFloat(amount);
    if (!amount || isNaN(parsedAmt) || parsedAmt <= 0) {
      errs.amount = 'Amount must be greater than zero.';
    }

    if (!date) {
      errs.date = 'Date is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      source: source.trim(),
      amount: parseFloat(amount),
      date,
      incomeType,
      note: note.trim() || undefined,
    };

    if (incomeToEdit) {
      updateIncome(incomeToEdit.id, payload);
    } else {
      addIncome(payload);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={incomeToEdit ? 'Edit Income' : 'Add New Income'}
      subtitle={
        incomeToEdit
          ? 'Update the recorded income entry.'
          : 'Record income from allowance, scholarships, or freelance work.'
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Source */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Income Source *
          </label>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="e.g. Monthly Allowance, Academic Scholarship, Freelance Project"
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
              errors.source
                ? 'border-red-400 focus:ring-red-300 bg-red-50/20'
                : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100 bg-slate-50/50'
            }`}
          />
          {errors.source && <p className="text-xs text-red-600 mt-1 font-medium">{errors.source}</p>}
        </div>

        {/* Amount & Date Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Amount ({settings.currencySymbol}) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">
                {settings.currencySymbol}
              </span>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10000"
                className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.amount
                    ? 'border-red-400 focus:ring-red-300 bg-red-50/20'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100 bg-slate-50/50'
                }`}
              />
            </div>
            {errors.amount && <p className="text-xs text-red-600 mt-1 font-medium">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                errors.date
                  ? 'border-red-400 focus:ring-red-300 bg-red-50/20'
                  : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100 bg-slate-50/50'
              }`}
            />
            {errors.date && <p className="text-xs text-red-600 mt-1 font-medium">{errors.date}</p>}
          </div>
        </div>

        {/* Income Type */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Income Type *
          </label>
          <select
            value={incomeType}
            onChange={(e) => setIncomeType(e.target.value as IncomeType)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 bg-slate-50/50 text-sm"
          >
            {INCOME_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Note */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Note (Optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Direct bank transfer, monthly stipend"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 bg-slate-50/50 text-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 transition-all shadow-md shadow-emerald-600/20"
          >
            {incomeToEdit ? 'Save Changes' : 'Record Income'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
