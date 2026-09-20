import React, { useState } from 'react';
import { Modal } from './Modal';
import { SavingsGoal } from '../types';
import { useFinancial } from '../context/FinancialContext';

interface AddMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
}

export const AddMoneyModal: React.FC<AddMoneyModalProps> = ({
  isOpen,
  onClose,
  goal,
}) => {
  const { addMoneyToGoal, availableBalance, settings } = useFinancial();

  const [amount, setAmount] = useState('');
  const [recordExpense, setRecordExpense] = useState(false);
  const [error, setError] = useState('');

  if (!goal) return null;

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!amount || isNaN(val) || val <= 0) {
      setError('Please enter an amount greater than zero.');
      return;
    }
    if (val > remaining) {
      setError(`Amount cannot exceed remaining needed for this goal (${settings.currencySymbol}${remaining.toLocaleString('en-IN')}).`);
      return;
    }

    addMoneyToGoal(goal.id, val, recordExpense);
    setAmount('');
    setError('');
    onClose();
  };

  const quickPills = [500, 1000, 2000, 5000].filter((p) => p <= remaining);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Money: ${goal.name}`}
      subtitle={`Remaining needed: ${settings.currencySymbol}${remaining.toLocaleString('en-IN')}`}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Quick presets */}
        {quickPills.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-2">Quick Presets:</div>
            <div className="flex gap-2 flex-wrap">
              {quickPills.map((pill) => (
                <button
                  key={pill}
                  type="button"
                  onClick={() => {
                    setAmount(pill.toString());
                    setError('');
                  }}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                >
                  +{settings.currencySymbol}
                  {pill.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Deposit Amount ({settings.currencySymbol}) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">
              {settings.currencySymbol}
            </span>
            <input
              type="number"
              step="any"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError('');
              }}
              placeholder="e.g. 1500"
              className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                error
                  ? 'border-red-400 focus:ring-red-300 bg-red-50/20'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100 bg-slate-50/50'
              }`}
            />
          </div>
          {error && <p className="text-xs text-red-600 mt-1 font-medium">{error}</p>}
        </div>

        {/* Record as expense toggle */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
          <input
            type="checkbox"
            id="recordExpenseCheckbox"
            checked={recordExpense}
            onChange={(e) => setRecordExpense(e.target.checked)}
            className="mt-1 rounded text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="recordExpenseCheckbox" className="text-xs text-slate-700 cursor-pointer">
            <span className="font-semibold block">Deduct from Liquid Balance</span>
            Record this deposit as an expense transaction under Bills so your Available Balance reflects the deduction.
          </label>
        </div>

        <div className="text-[11px] text-slate-500">
          Your current available balance is{' '}
          <strong className="text-slate-800">
            {settings.currencySymbol}
            {availableBalance.toLocaleString('en-IN')}
          </strong>
          .
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 transition-all shadow-md shadow-blue-600/20"
          >
            Deposit Funds
          </button>
        </div>
      </form>
    </Modal>
  );
};
