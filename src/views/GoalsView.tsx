import React, { useState } from 'react';
import {
  Plus,
  Target,
  Calendar,
  Sparkles,
  TrendingUp,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  PiggyBank,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { SavingsGoal } from '../types';

interface GoalsViewProps {
  onOpenCreateGoal: () => void;
  onOpenEditGoal: (goal: SavingsGoal) => void;
  onOpenAddMoney: (goal: SavingsGoal) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  onOpenCreateGoal,
  onOpenEditGoal,
  onOpenAddMoney,
}) => {
  const { goals, deleteGoal, totalSavings, settings } = useFinancial();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Total target amount
  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalSavedAcrossGoals = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalSavedAcrossGoals / totalTarget) * 100) : 0;

  // Calculate days remaining and monthly required
  const calculateGoalMetrics = (goal: SavingsGoal) => {
    const today = new Date();
    const targetDate = new Date(goal.deadline);
    const diffTime = targetDate.getTime() - today.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);

    const monthsRemaining = Math.max(1, Math.round(daysRemaining / 30));
    const monthlyNeeded = Math.round(remainingAmount / monthsRemaining);

    return { daysRemaining, remainingAmount, monthlyNeeded };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Savings Goals
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Turn aspirations into realistic targets. Track progress toward your laptop, study materials, and trips.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCreateGoal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Goal</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Saved In Goals
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-blue-600 mt-2">
            {formatCurrency(totalSavedAcrossGoals, settings.currencySymbol)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Across {goals.length} active goal(s)</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Cumulative Target
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {formatCurrency(totalTarget, settings.currencySymbol)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Remaining: {formatCurrency(Math.max(0, totalTarget - totalSavedAcrossGoals), settings.currencySymbol)}
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Overall Completion
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">
            {overallProgress}%
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((goal) => {
          const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const { daysRemaining, remainingAmount, monthlyNeeded } = calculateGoalMetrics(goal);
          const isComplete = goal.currentAmount >= goal.targetAmount;

          return (
            <div
              key={goal.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                      {goal.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1.5">{goal.name}</h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onOpenEditGoal(goal)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Goal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(goal.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Circle / Bar */}
                <div className="my-4">
                  <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                    <span className="text-slate-600">Progress</span>
                    <span className={isComplete ? 'text-emerald-600' : 'text-blue-600'}>
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isComplete ? 'bg-emerald-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Numbers */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                      Saved
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {formatCurrency(goal.currentAmount, settings.currencySymbol)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                      Target
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {formatCurrency(goal.targetAmount, settings.currencySymbol)}
                    </span>
                  </div>
                </div>

                {/* Recommendation metric */}
                {!isComplete ? (
                  <div className="mt-3 p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>Deadline:</span>
                      </span>
                      <span className="font-semibold text-slate-700">{formatDate(goal.deadline)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Days Left:</span>
                      <span className="font-bold text-slate-800">{daysRemaining} days</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-blue-200/60 pt-1 mt-1">
                      <span className="text-blue-700 font-semibold">Monthly Save Target:</span>
                      <span className="font-extrabold text-blue-900">
                        {formatCurrency(monthlyNeeded, settings.currencySymbol)}/mo
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Goal Accomplished! 🎉</span>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onOpenAddMoney(goal)}
                  disabled={isComplete}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    isComplete
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Deposit Funds</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">Delete Savings Goal?</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Are you sure you want to remove this goal? This action cannot be undone.
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
                  deleteGoal(deleteConfirmId);
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
