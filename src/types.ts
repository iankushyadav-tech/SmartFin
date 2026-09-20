export type ExpenseCategory =
  | 'Food'
  | 'Travel'
  | 'Education'
  | 'Shopping'
  | 'Entertainment'
  | 'Bills'
  | 'Healthcare'
  | 'Other';

export type PaymentMethod =
  | 'UPI'
  | 'Cash'
  | 'Debit Card'
  | 'Net Banking'
  | 'Credit Card';

export type IncomeType =
  | 'Pocket Money'
  | 'Scholarship'
  | 'Part-time Job'
  | 'Freelance'
  | 'Other';

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  note?: string;
  createdAt: number;
}

export interface Income {
  id: string;
  source: string;
  amount: number;
  date: string; // YYYY-MM-DD
  incomeType: IncomeType;
  note?: string;
  createdAt: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  category: string;
  color?: string;
  createdAt: number;
}

export interface UserProfile {
  name: string;
  role: string;
  avatarInitials: string;
  email: string;
  college?: string;
  major?: string;
  yearOfStudy?: string;
  monthlyBudgetTarget?: number;
  institution?: string;
  monthlyIncomeTarget?: number;
  currency?: string;
  riskPreference?: 'Conservative' | 'Moderate' | 'Aggressive';
  bio?: string;
}

export interface AppSettings {
  theme?: 'light' | 'dark' | 'system';
  currency: string;
  currencySymbol: string;
  enableNotifications?: boolean;
  enableBudgetAlerts?: boolean;
  budgetAlerts?: boolean;
  savingsMilestoneAlerts?: boolean;
  budgetAlertThreshold?: number; // percentage, e.g. 80%
  sampleDataLoaded?: boolean;
}

export type AffordabilityVerdict = 'SAFE' | 'CAUTION' | 'NOT RECOMMENDED';

export interface AffordabilityResult {
  itemName: string;
  price: number;
  currentBalance: number;
  balanceAfter: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  activeGoalImpact: string;
  verdict: AffordabilityVerdict;
  explanation: string;
  safetyScore: number; // 0 to 100
  bufferRatio: number; // remaining percentage
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  source?: 'gemini-3.8-flash' | 'rule-based-fallback';
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface SmartInsight {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'warning' | 'info' | 'milestone';
  metric?: string;
  iconName?: string;
}

export type NavTab =
  | 'dashboard'
  | 'expenses'
  | 'income'
  | 'ai-assistant'
  | 'affordability'
  | 'goals'
  | 'reports'
  | 'profile'
  | 'settings';
