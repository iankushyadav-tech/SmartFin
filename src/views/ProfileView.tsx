import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  Building,
  Calendar,
  Award,
  Wallet,
  Save,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency } from '../utils/formatters';

export const ProfileView: React.FC = () => {
  const { profile, updateProfile, settings } = useFinancial();

  const [name, setName] = useState(profile.name || 'Ankush');
  const [email, setEmail] = useState(profile.email || 'ankushyadav9580@gmail.com');
  const [college, setCollege] = useState(profile.college || 'Himachal Pradesh Technical University');
  const [major, setMajor] = useState(profile.major || 'Computer Science & Engineering');
  const [yearOfStudy, setYearOfStudy] = useState(profile.yearOfStudy || '3rd Year');
  const [monthlyBudgetTarget, setMonthlyBudgetTarget] = useState(
    (profile.monthlyBudgetTarget ?? 5000).toString()
  );
  const [role, setRole] = useState(profile.role || 'Student');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    updateProfile({
      name: name.trim(),
      email: email.trim(),
      college: college.trim(),
      major: major.trim(),
      yearOfStudy: yearOfStudy.trim(),
      monthlyBudgetTarget: parseFloat(monthlyBudgetTarget) || 0,
      role: role.trim(),
      avatarInitials: initials || 'AY',
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Student Profile
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage your personal university credentials, academic major, and monthly budget limits.
        </p>
      </div>

      {/* Hero Badge Card */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white font-black text-3xl flex items-center justify-center shadow-lg ring-4 ring-white/10 shrink-0">
          {profile.avatarInitials || 'AY'}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h3 className="text-2xl font-extrabold tracking-tight">{profile.name}</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              {profile.role}
            </span>
          </div>

          <p className="text-sm text-slate-300 font-medium flex items-center justify-center sm:justify-start gap-1.5">
            <GraduationCap className="w-4 h-4 text-blue-400" />
            <span>{profile.major} • {profile.yearOfStudy}</span>
          </p>

          <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1.5">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <span>{profile.college}</span>
          </p>

          {/* Hackathon metadata */}
          <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-xl bg-white/10 text-white font-semibold flex items-center gap-1.5 border border-white/10">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Hack in Hills 2026</span>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-white/10 text-slate-200 font-semibold border border-white/10">
              Team: CodeCapital
            </span>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Academic & Financial Settings</h3>
          {savedSuccess && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Profile updated!</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 bg-slate-50/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 bg-slate-50/50"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                College / University
              </label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 bg-slate-50/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Major / Course
              </label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 bg-slate-50/50"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Year of Study
              </label>
              <input
                type="text"
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
                placeholder="e.g. 3rd Year"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 bg-slate-50/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Monthly Expense Budget Target ({settings.currencySymbol})
              </label>
              <input
                type="number"
                value={monthlyBudgetTarget}
                onChange={(e) => setMonthlyBudgetTarget(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 bg-slate-50/50 font-bold"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 transition-all shadow-md shadow-blue-600/20"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
