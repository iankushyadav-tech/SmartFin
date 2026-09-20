import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { SavingsGoal } from '../types';
import { useFinancial } from '../context/FinancialContext';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: SavingsGoal | null;
}

const GOAL_CATEGORIES = [
  'Education',
  'Technology',
  'Travel',
  'Savings',
  'Emergency Fund',
  'Gadget',
  'Personal',
  'Other',
];

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  goalToEdit,
}) => {
  const { addGoal, updateGoal, settings } = useFinancial();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('Education');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (goalToEdit) {
      setName(goalToEdit.name);
      setTargetAmount(goalToEdit.targetAmount.toString());
      setCurrentAmount(goalToEdit.currentAmount.toString());
      setDeadline(goalToEdit.deadline);
      setCategory(goalToEdit.category);
      setErrors({});
    } else {
      setName('');
      setTargetAmount('');
      setCurrentAmount('0');
      // default deadline 3 months from now
      const d = new Date();
      d.setMonth(d.getMonth() + 3);
      setDeadline(d.toISOString().split('T')[0]);
      setCategory('Education');
      setErrors({});
    }
  }, [goalToEdit, isOpen]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) {
      errs.name = 'Goal name is required.';
    }

    const target = parseFloat(targetAmount);
    if (!targetAmount || isNaN(target) || target <= 0) {
      errs.targetAmount = 'Target amount must be greater than zero.';
    }

    const current = parseFloat(currentAmount);
    if (isNaN(current) || current < 0) {
      errs.currentAmount = 'Current saved amount must be zero or positive.';
    }

    if (!deadline) {
      errs.deadline = 'Target deadline date is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: name.trim(),
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount) || 0,
      deadline,
      category,
    };

    if (goalToEdit) {
      updateGoal(goalToEdit.id, payload);
    } else {
      addGoal(payload);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={goalToEdit ? 'Edit Savings Goal' : 'Create Savings Goal'}
      subtitle={
        goalToEdit
          ? 'Modify your goal parameters and target deadline.'
          : 'Define a goal like a New Laptop, Manali Trip, or Emergency Fund.'
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Goal Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Goal Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. New Laptop, Manali Trip, Emergency Fund"
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
              errors.name
                ? 'border-red-400 focus:ring-red-300 bg-red-50/20'
                : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100 bg-slate-50/50'
            }`}
          />
          {errors.name && <p className="text-xs text-red-600 mt-1 font-medium">{errors.name}</p>}
        </div>

        {/* Target Amount & Initial Saved Amount */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Target Amount ({settings.currencySymbol}) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">
                {settings.currencySymbol}
              </span>
              <input
                type="number"
                step="any"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="60000"
                className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.targetAmount
                    ? 'border-red-400 focus:ring-red-300 bg-red-50/20'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100 bg-slate-50/50'
                }`}
              />
            </div>
            {errors.targetAmount && (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.targetAmount}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Already Saved ({settings.currencySymbol})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">
                {settings.currencySymbol}
              </span>
              <input
                type="number"
                step="any"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                placeholder="0"
                className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.currentAmount
                    ? 'border-red-400 focus:ring-red-300 bg-red-50/20'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100 bg-slate-50/50'
                }`}
              />
            </div>
            {errors.currentAmount && (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.currentAmount}</p>
            )}
          </div>
        </div>

        {/* Deadline & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Target Deadline *
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                errors.deadline
                  ? 'border-red-400 focus:ring-red-300 bg-red-50/20'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100 bg-slate-50/50'
              }`}
            />
            {errors.deadline && (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.deadline}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-slate-50/50 text-sm"
            >
              {GOAL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
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
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 transition-all shadow-md shadow-blue-600/20"
          >
            {goalToEdit ? 'Save Changes' : 'Create Goal'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
