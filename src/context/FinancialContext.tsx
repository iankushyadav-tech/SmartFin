import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Expense,
  Income,
  SavingsGoal,
  UserProfile,
  AppSettings,
  ExpenseCategory,
  SmartInsight,
  AffordabilityResult,
  AffordabilityVerdict,
  ChatMessage,
} from '../types';
import {
  INITIAL_EXPENSES,
  INITIAL_INCOME,
  INITIAL_GOALS,
  INITIAL_PROFILE,
  INITIAL_SETTINGS,
} from '../data/initialData';

interface FinancialContextType {
  // State
  expenses: Expense[];
  income: Income[];
  goals: SavingsGoal[];
  profile: UserProfile;
  settings: AppSettings;
  chatMessages: ChatMessage[];
  isChatLoading: boolean;

  // Derived calculations
  totalIncome: number;
  totalExpenses: number;
  availableBalance: number;
  totalSavings: number;
  savingsRate: number;
  categoryBreakdown: Record<string, { amount: number; percentage: number; count: number }>;
  highestSpendingCategory: { category: string; amount: number; percentage: number } | null;
  averageDailySpending: number;
  smartInsights: SmartInsight[];

  // Actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  addIncome: (income: Omit<Income, 'id' | 'createdAt'>) => void;
  updateIncome: (id: string, income: Partial<Income>) => void;
  deleteIncome: (id: string) => void;

  addGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, goal: Partial<SavingsGoal>) => void;
  deleteGoal: (id: string) => void;
  addMoneyToGoal: (goalId: string, amount: number, recordAsExpense?: boolean) => void;

  updateProfile: (profile: Partial<UserProfile>) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetToSampleData: () => void;
  resetToInitialData: () => void;
  clearAllData: () => void;

  analyzeAffordability: (itemName: string, price: number) => AffordabilityResult;
  sendChatMessage: (text: string) => Promise<void>;
  clearChat: () => void;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

const STORAGE_KEYS = {
  EXPENSES: 'smartfin_expenses_v1',
  INCOME: 'smartfin_income_v1',
  GOALS: 'smartfin_goals_v1',
  PROFILE: 'smartfin_profile_v1',
  SETTINGS: 'smartfin_settings_v1',
  CHAT: 'smartfin_chat_v1',
};

export const FinancialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from localStorage or initial sample data
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  });

  const [income, setIncome] = useState<Income[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INCOME);
      return saved ? JSON.parse(saved) : INITIAL_INCOME;
    } catch {
      return INITIAL_INCOME;
    }
  });

  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
      return saved ? JSON.parse(saved) : INITIAL_GOALS;
    } catch {
      return INITIAL_GOALS;
    }
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : INITIAL_PROFILE;
    } catch {
      return INITIAL_PROFILE;
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHAT);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: 'msg-welcome',
        sender: 'ai',
        text: "Hello Ankush! 👋 I'm your SmartFin AI Financial Assistant. I can analyze your income, expenses, category spending, and savings goals in real-time. Ask me anything like:\n\n• *\"Where am I spending the most?\"*\n• *\"Can I afford ₹4,000 for noise-cancelling headphones?\"*\n• *\"How can I reach my laptop goal faster?\"*",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'gemini-3.8-flash',
      },
    ];
  });

  const [isChatLoading, setIsChatLoading] = useState(false);

  // Synchronize state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch (e) {
      console.error('Failed to save expenses:', e);
    }
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.INCOME, JSON.stringify(income));
    } catch (e) {
      console.error('Failed to save income:', e);
    }
  }, [income]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    } catch (e) {
      console.error('Failed to save goals:', e);
    }
  }, [goals]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile:', e);
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(chatMessages));
    } catch (e) {
      console.error('Failed to save chat:', e);
    }
  }, [chatMessages]);

  // Derived financial metrics - strictly calculated from stored transactions
  const totalIncome = useMemo(() => {
    return income.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [income]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [expenses]);

  // Available Balance = Total Income - Total Expenses
  const availableBalance = useMemo(() => {
    return totalIncome - totalExpenses;
  }, [totalIncome, totalExpenses]);

  // Savings = Total Income - Total Expenses
  const totalSavings = useMemo(() => {
    return totalIncome - totalExpenses;
  }, [totalIncome, totalExpenses]);

  // Savings Rate = (Savings / Total Income) * 100
  const savingsRate = useMemo(() => {
    if (totalIncome <= 0) return 0;
    const rate = (totalSavings / totalIncome) * 100;
    return Math.max(0, Math.round(rate * 10) / 10);
  }, [totalSavings, totalIncome]);

  // Category breakdown calculation
  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, { amount: number; percentage: number; count: number }> = {};
    
    // Group amounts
    expenses.forEach((item) => {
      const cat = item.category || 'Other';
      if (!breakdown[cat]) {
        breakdown[cat] = { amount: 0, percentage: 0, count: 0 };
      }
      breakdown[cat].amount += Number(item.amount) || 0;
      breakdown[cat].count += 1;
    });

    // Calculate dynamic percentages
    const total = totalExpenses > 0 ? totalExpenses : 1;
    Object.keys(breakdown).forEach((cat) => {
      const amt = breakdown[cat].amount;
      breakdown[cat].percentage = Math.round((amt / total) * 1000) / 10;
    });

    return breakdown;
  }, [expenses, totalExpenses]);

  // Highest spending category
  const highestSpendingCategory = useMemo(() => {
    const entries = Object.entries(categoryBreakdown);
    if (entries.length === 0) return null;
    entries.sort((a, b) => b[1].amount - a[1].amount);
    const [topCat, topData] = entries[0];
    return {
      category: topCat,
      amount: topData.amount,
      percentage: topData.percentage,
    };
  }, [categoryBreakdown]);

  // Average daily spending based on active expense range
  const averageDailySpending = useMemo(() => {
    if (expenses.length === 0) return 0;
    const dates = expenses.map((e) => new Date(e.date).getTime()).filter((t) => !isNaN(t));
    if (dates.length === 0) return Math.round(totalExpenses);
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates, Date.now());
    const dayDiff = Math.max(1, Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)));
    return Math.round(totalExpenses / dayDiff);
  }, [expenses, totalExpenses]);

  // Automatically generated Smart Financial Insights from actual data
  const smartInsights = useMemo(() => {
    const insights: SmartInsight[] = [];

    // Insight 1: Highest spending category
    if (highestSpendingCategory) {
      insights.push({
        id: 'ins-highest-cat',
        title: `Highest Spending: ${highestSpendingCategory.category}`,
        description: `You spent the most on ${highestSpendingCategory.category} (₹${highestSpendingCategory.amount.toLocaleString('en-IN')}), representing ${highestSpendingCategory.percentage}% of your total expenses.`,
        type: highestSpendingCategory.percentage > 40 ? 'warning' : 'info',
        metric: `${highestSpendingCategory.percentage}%`,
        iconName: 'PieChart',
      });
    }

    // Insight 2: Savings Rate status
    if (totalIncome > 0) {
      if (savingsRate >= 50) {
        insights.push({
          id: 'ins-savings-high',
          title: 'Outstanding Savings Rate',
          description: `Your current savings rate is ${savingsRate}%. You are saving significantly more than typical student benchmarks (20-30%).`,
          type: 'positive',
          metric: `${savingsRate}%`,
          iconName: 'TrendingUp',
        });
      } else if (savingsRate >= 20) {
        insights.push({
          id: 'ins-savings-healthy',
          title: 'Healthy Savings Rate',
          description: `Your savings rate is ${savingsRate}%. You are successfully maintaining positive cash flow this month.`,
          type: 'positive',
          metric: `${savingsRate}%`,
          iconName: 'ShieldCheck',
        });
      } else {
        insights.push({
          id: 'ins-savings-low',
          title: 'Tight Cash Flow Buffer',
          description: `Your savings rate is ${savingsRate}%. Expenses are consuming most of your income. Consider reviewing discretionary spending.`,
          type: 'warning',
          metric: `${savingsRate}%`,
          iconName: 'AlertTriangle',
        });
      }
    }

    // Insight 3: Goal progress milestone
    if (goals.length > 0) {
      // Find goal with closest remaining gap
      const activeGoals = [...goals].filter((g) => g.currentAmount < g.targetAmount);
      if (activeGoals.length > 0) {
        activeGoals.sort((a, b) => (a.targetAmount - a.currentAmount) - (b.targetAmount - b.currentAmount));
        const nearestGoal = activeGoals[0];
        const gap = nearestGoal.targetAmount - nearestGoal.currentAmount;
        const progressPct = Math.round((nearestGoal.currentAmount / nearestGoal.targetAmount) * 100);
        insights.push({
          id: 'ins-goal-gap',
          title: `Goal Target: ${nearestGoal.name}`,
          description: `You are ₹${gap.toLocaleString('en-IN')} away from completing your ${nearestGoal.name} goal (${progressPct}% saved).`,
          type: progressPct >= 75 ? 'milestone' : 'info',
          metric: `${progressPct}%`,
          iconName: 'Target',
        });
      }
    }

    // Insight 4: Education vs Discretionary
    const eduSpend = categoryBreakdown['Education']?.amount || 0;
    if (eduSpend > 0 && totalExpenses > 0) {
      const eduPct = categoryBreakdown['Education']?.percentage || 0;
      insights.push({
        id: 'ins-edu-ratio',
        title: 'Education Investment',
        description: `Education represents ${eduPct}% of your total expenses (₹${eduSpend.toLocaleString('en-IN')}), a productive investment in your academic success.`,
        type: 'info',
        metric: `${eduPct}%`,
        iconName: 'BookOpen',
      });
    }

    return insights;
  }, [highestSpendingCategory, totalIncome, savingsRate, goals, totalExpenses, categoryBreakdown]);

  // "Can I Afford It?" calculation engine
  const analyzeAffordability = (itemName: string, price: number): AffordabilityResult => {
    const itemClean = itemName.trim() || 'Specified Item';
    const cost = Math.max(0, Number(price) || 0);
    const balanceAfter = availableBalance - cost;

    // Evaluate against balance and monthly expense buffer
    // Rule:
    // If cost > availableBalance => NOT RECOMMENDED
    // If balanceAfter < monthlyExpenses * 0.5 (leaves less than half a month of expenses) or cost > availableBalance * 0.45 => CAUTION
    // If balanceAfter >= monthlyExpenses * 0.5 and cost <= availableBalance * 0.45 => SAFE

    let verdict: AffordabilityVerdict = 'SAFE';
    let safetyScore = 90;
    let explanation = '';
    let goalImpactText = 'No significant impact on your active savings targets.';

    // Check goal impact
    const activeGoals = goals.filter((g) => g.currentAmount < g.targetAmount);
    if (activeGoals.length > 0) {
      const topGoal = activeGoals[0];
      const gap = topGoal.targetAmount - topGoal.currentAmount;
      if (cost >= gap * 0.5) {
        goalImpactText = `This purchase could delay reaching your ${topGoal.name} goal by approximately 2-4 weeks.`;
      } else {
        goalImpactText = `Minor delay to your ${topGoal.name} timeline; still within healthy bounds.`;
      }
    }

    if (cost <= 0) {
      verdict = 'SAFE';
      safetyScore = 100;
      explanation = 'Please specify a valid item cost greater than zero.';
    } else if (cost > availableBalance) {
      verdict = 'NOT RECOMMENDED';
      safetyScore = 15;
      explanation = `This purchase exceeds your current available balance of ₹${availableBalance.toLocaleString('en-IN')}. Buying "${itemClean}" would create a deficit of ₹${Math.abs(balanceAfter).toLocaleString('en-IN')}.`;
    } else if (cost > availableBalance * 0.45 || balanceAfter < totalExpenses * 0.4) {
      verdict = 'CAUTION';
      const pctOfBalance = Math.round((cost / (availableBalance || 1)) * 100);
      safetyScore = Math.max(35, 100 - pctOfBalance);
      explanation = `This purchase is possible with your current balance of ₹${availableBalance.toLocaleString('en-IN')}, but it consumes ${pctOfBalance}% of your liquid funds. It leaves you with ₹${balanceAfter.toLocaleString('en-IN')}, which tightens your buffer for upcoming essentials and active goals.`;
    } else {
      verdict = 'SAFE';
      const pctOfBalance = Math.round((cost / (availableBalance || 1)) * 100);
      safetyScore = Math.min(95, 100 - pctOfBalance);
      explanation = `This purchase fits comfortably within your financial plan. You will retain ₹${balanceAfter.toLocaleString('en-IN')} after purchasing "${itemClean}", leaving sufficient reserve for your monthly routine.`;
    }

    const bufferRatio = availableBalance > 0 ? Math.max(0, Math.round((balanceAfter / availableBalance) * 100)) : 0;

    return {
      itemName: itemClean,
      price: cost,
      currentBalance: availableBalance,
      balanceAfter,
      monthlyIncome: totalIncome,
      monthlyExpenses: totalExpenses,
      activeGoalImpact: goalImpactText,
      verdict,
      explanation,
      safetyScore,
      bufferRatio,
    };
  };

  // CRUD Actions
  const addExpense = (newExpense: Omit<Expense, 'id' | 'createdAt'>) => {
    const item: Expense = {
      ...newExpense,
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      amount: Number(newExpense.amount),
      createdAt: Date.now(),
    };
    setExpenses((prev) => [item, ...prev]);
  };

  const updateExpense = (id: string, updated: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updated,
              amount: updated.amount !== undefined ? Number(updated.amount) : item.amount,
            }
          : item
      )
    );
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  const addIncome = (newIncome: Omit<Income, 'id' | 'createdAt'>) => {
    const item: Income = {
      ...newIncome,
      id: `inc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      amount: Number(newIncome.amount),
      createdAt: Date.now(),
    };
    setIncome((prev) => [item, ...prev]);
  };

  const updateIncome = (id: string, updated: Partial<Income>) => {
    setIncome((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updated,
              amount: updated.amount !== undefined ? Number(updated.amount) : item.amount,
            }
          : item
      )
    );
  };

  const deleteIncome = (id: string) => {
    setIncome((prev) => prev.filter((item) => item.id !== id));
  };

  const addGoal = (newGoal: Omit<SavingsGoal, 'id' | 'createdAt'>) => {
    const item: SavingsGoal = {
      ...newGoal,
      id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      targetAmount: Number(newGoal.targetAmount),
      currentAmount: Number(newGoal.currentAmount || 0),
      createdAt: Date.now(),
    };
    setGoals((prev) => [...prev, item]);
  };

  const updateGoal = (id: string, updated: Partial<SavingsGoal>) => {
    setGoals((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updated,
              targetAmount:
                updated.targetAmount !== undefined ? Number(updated.targetAmount) : item.targetAmount,
              currentAmount:
                updated.currentAmount !== undefined ? Number(updated.currentAmount) : item.currentAmount,
            }
          : item
      )
    );
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((item) => item.id !== id));
  };

  const addMoneyToGoal = (goalId: string, amount: number, recordAsExpense: boolean = false) => {
    const addAmt = Number(amount);
    if (isNaN(addAmt) || addAmt <= 0) return;

    setGoals((prev) =>
      prev.map((item) =>
        item.id === goalId
          ? { ...item, currentAmount: Math.min(item.targetAmount, item.currentAmount + addAmt) }
          : item
      )
    );

    if (recordAsExpense) {
      const targetGoal = goals.find((g) => g.id === goalId);
      addExpense({
        name: `Deposit to Goal: ${targetGoal ? targetGoal.name : 'Savings'}`,
        amount: addAmt,
        category: 'Bills',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'UPI',
        note: 'Goal savings transfer',
      });
    }
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  };

  const updateSettings = (updated: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updated }));
  };

  const resetToSampleData = () => {
    setExpenses(INITIAL_EXPENSES);
    setIncome(INITIAL_INCOME);
    setGoals(INITIAL_GOALS);
    setProfile(INITIAL_PROFILE);
    setSettings(INITIAL_SETTINGS);
  };

  const clearAllData = () => {
    setExpenses([]);
    setIncome([]);
    setGoals([]);
    setChatMessages([]);
  };

  // AI Assistant Chat Handler
  const sendChatMessage = async (userText: string) => {
    const text = userText.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    // Prepare real financial context for Gemini
    const financialContext = {
      name: profile.name,
      role: profile.role,
      currency: settings.currencySymbol,
      totalIncome,
      totalExpenses,
      availableBalance,
      totalSavings,
      savingsRate,
      topCategory: highestSpendingCategory?.category || 'None',
      categoryBreakdown: Object.fromEntries(
        Object.entries(categoryBreakdown).map(([k, v]) => [k, v.amount])
      ),
      goals: goals.map((g) => ({
        name: g.name,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        deadline: g.deadline,
      })),
      recentTransactions: expenses.slice(0, 8).map((e) => ({
        name: e.name,
        amount: e.amount,
        category: e.category,
        date: e.date,
      })),
    };

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          financialContext,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || 'I analyzed your financials, but could not produce a response.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || 'gemini-3.8-flash',
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.warn('AI chat error, using local fallback:', err);
      // Local fallback in case network/server failed
      const localReply = generateLocalRuleResponse(text, financialContext);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: localReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'rule-based-fallback',
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const clearChat = () => {
    setChatMessages([
      {
        id: 'msg-welcome',
        sender: 'ai',
        text: `Chat cleared! I'm ready to answer any questions about your current balance of ₹${availableBalance.toLocaleString('en-IN')}, your ${expenses.length} recorded expenses, or your savings goals.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'gemini-3.8-flash',
      },
    ]);
  };

  // Helper for local client rule fallback
  function generateLocalRuleResponse(query: string, ctx: any): string {
    const q = query.toLowerCase();
    const incomeAmt = ctx?.totalIncome || 25000;
    const expenseAmt = ctx?.totalExpenses || 2230;
    const bal = ctx?.availableBalance || incomeAmt - expenseAmt;
    const rate = ctx?.savingsRate || ((bal / incomeAmt) * 100).toFixed(1);

    if (q.includes('where am i spending') || q.includes('most') || q.includes('highest')) {
      return `Based on your live transaction records, your highest spending category is **${ctx.topCategory}**. Keeping a daily tab on non-essential purchases in ${ctx.topCategory} is your highest-leverage way to save more!`;
    }
    if (q.includes('spend this month') || q.includes('how much did i spend')) {
      return `You have recorded **₹${expenseAmt.toLocaleString('en-IN')}** in total expenses. Compared against your total income of **₹${incomeAmt.toLocaleString('en-IN')}**, you still retain **₹${bal.toLocaleString('en-IN')}** in liquid funds.`;
    }
    if (q.includes('can i afford')) {
      const match = query.match(/(\d[\d,]*)/);
      const itemPrice = match ? parseInt(match[1].replace(/,/g, ''), 10) : 4000;
      if (itemPrice <= bal * 0.35) {
        return `**SAFE**: You can afford ₹${itemPrice.toLocaleString('en-IN')}. After this purchase, you will retain ₹${(bal - itemPrice).toLocaleString('en-IN')}, maintaining a safe cushion for your monthly expenses and active goals.`;
      } else if (itemPrice <= bal) {
        return `**CAUTION**: While you technically have ₹${bal.toLocaleString('en-IN')} in your balance, spending ₹${itemPrice.toLocaleString('en-IN')} consumes ${Math.round((itemPrice / bal) * 100)}% of your available money, potentially putting stress on upcoming bills or your goals.`;
      } else {
        return `**NOT RECOMMENDED**: A purchase of ₹${itemPrice.toLocaleString('en-IN')} exceeds your available balance of ₹${bal.toLocaleString('en-IN')}.`;
      }
    }
    return `SmartFin AI Summary:\n• **Income**: ₹${incomeAmt.toLocaleString('en-IN')}\n• **Expenses**: ₹${expenseAmt.toLocaleString('en-IN')}\n• **Balance**: ₹${bal.toLocaleString('en-IN')}\n• **Savings Rate**: ${rate}%\n\nYou are managing a strong financial surplus! Keep track of everyday campus spending.`;
  }

  return (
    <FinancialContext.Provider
      value={{
        expenses,
        income,
        goals,
        profile,
        settings,
        chatMessages,
        isChatLoading,
        totalIncome,
        totalExpenses,
        availableBalance,
        totalSavings,
        savingsRate,
        categoryBreakdown,
        highestSpendingCategory,
        averageDailySpending,
        smartInsights,
        addExpense,
        updateExpense,
        deleteExpense,
        addIncome,
        updateIncome,
        deleteIncome,
        addGoal,
        updateGoal,
        deleteGoal,
        addMoneyToGoal,
        updateProfile,
        updateSettings,
        resetToSampleData,
        resetToInitialData: resetToSampleData,
        clearAllData,
        analyzeAffordability,
        sendChatMessage,
        clearChat,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};
