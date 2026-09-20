import { Expense, Income, SavingsGoal, UserProfile, AppSettings } from '../types';

export const INITIAL_PROFILE: UserProfile = {
  name: 'Ankush',
  role: 'Student',
  avatarInitials: 'AY',
  email: 'ankushyadav9580@gmail.com',
  college: 'Himachal Pradesh Technical University',
  major: 'Computer Science & Engineering',
  yearOfStudy: '3rd Year',
  monthlyBudgetTarget: 5000,
  institution: 'Himachal Pradesh Technical University',
  monthlyIncomeTarget: 25000,
  currency: 'INR (₹)',
  riskPreference: 'Moderate',
  bio: 'CS Undergrad passionate about FinTech, building SmartFin at Hack in Hills 2026.',
};

export const INITIAL_SETTINGS: AppSettings = {
  theme: 'light',
  currency: 'INR',
  currencySymbol: '₹',
  enableNotifications: true,
  enableBudgetAlerts: true,
  budgetAlerts: true,
  savingsMilestoneAlerts: true,
  budgetAlertThreshold: 80,
  sampleDataLoaded: true,
};

export const INITIAL_INCOME: Income[] = [
  {
    id: 'inc-1',
    source: 'Monthly Allowance / Pocket Money',
    amount: 10000,
    date: '2026-09-01',
    incomeType: 'Pocket Money',
    note: 'Parents monthly living support',
    createdAt: 1788220800000,
  },
  {
    id: 'inc-2',
    source: 'Merit Academic Scholarship',
    amount: 15000,
    date: '2026-09-05',
    incomeType: 'Scholarship',
    note: 'University STEM achievement grant',
    createdAt: 1788566400000,
  },
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    name: 'Food & Campus Lunch',
    amount: 450,
    category: 'Food',
    date: '2026-09-18',
    paymentMethod: 'UPI',
    note: 'Hostel mess dinner & cafe coffee',
    createdAt: 1789689600000,
  },
  {
    id: 'exp-2',
    name: 'Bus Pass & Metro Recharge',
    amount: 280,
    category: 'Travel',
    date: '2026-09-17',
    paymentMethod: 'UPI',
    note: 'Weekly city transit pass',
    createdAt: 1789603200000,
  },
  {
    id: 'exp-3',
    name: 'Semester Books & Stationery',
    amount: 650,
    category: 'Education',
    date: '2026-09-15',
    paymentMethod: 'Debit Card',
    note: 'Algorithms reference book and notebook pack',
    createdAt: 1789430400000,
  },
  {
    id: 'exp-4',
    name: 'Casual Apparel & T-Shirt',
    amount: 850,
    category: 'Shopping',
    date: '2026-09-14',
    paymentMethod: 'UPI',
    note: 'Student festival sale discount',
    createdAt: 1789344000000,
  },
];

export const INITIAL_GOALS: SavingsGoal[] = [
  {
    id: 'goal-1',
    name: 'New Laptop (M-Series / RTX)',
    targetAmount: 60000,
    currentAmount: 22000,
    deadline: '2026-11-30',
    category: 'Education',
    color: '#3b82f6',
    createdAt: 1787000000000,
  },
  {
    id: 'goal-2',
    name: 'Emergency Fund',
    targetAmount: 20000,
    currentAmount: 12000,
    deadline: '2026-12-31',
    category: 'Savings',
    color: '#10b981',
    createdAt: 1787100000000,
  },
  {
    id: 'goal-3',
    name: 'Manali Trip (College Batch)',
    targetAmount: 15000,
    currentAmount: 6500,
    deadline: '2026-10-15',
    category: 'Travel',
    color: '#f59e0b',
    createdAt: 1787200000000,
  },
];
