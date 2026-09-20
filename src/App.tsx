import React, { useState } from 'react';
import { FinancialProvider } from './context/FinancialContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { ExpenseModal } from './components/ExpenseModal';
import { IncomeModal } from './components/IncomeModal';
import { GoalModal } from './components/GoalModal';
import { AddMoneyModal } from './components/AddMoneyModal';

import { DashboardView } from './views/DashboardView';
import { ExpensesView } from './views/ExpensesView';
import { IncomeView } from './views/IncomeView';
import { AIAssistantView } from './views/AIAssistantView';
import { AffordabilityView } from './views/AffordabilityView';
import { GoalsView } from './views/GoalsView';
import { ReportsView } from './views/ReportsView';
import { ProfileView } from './views/ProfileView';
import { SettingsView } from './views/SettingsView';

import { NavTab, Expense, Income, SavingsGoal } from './types';

function MainApp() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modal states
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [incomeToEdit, setIncomeToEdit] = useState<Income | null>(null);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<SavingsGoal | null>(null);

  const [isAddMoneyModalOpen, setIsAddMoneyModalOpen] = useState(false);
  const [selectedGoalForMoney, setSelectedGoalForMoney] = useState<SavingsGoal | null>(null);

  // Handlers
  const handleOpenAddExpense = () => {
    setExpenseToEdit(null);
    setIsExpenseModalOpen(true);
  };

  const handleOpenEditExpense = (expense: Expense) => {
    setExpenseToEdit(expense);
    setIsExpenseModalOpen(true);
  };

  const handleOpenAddIncome = () => {
    setIncomeToEdit(null);
    setIsIncomeModalOpen(true);
  };

  const handleOpenEditIncome = (inc: Income) => {
    setIncomeToEdit(inc);
    setIsIncomeModalOpen(true);
  };

  const handleOpenCreateGoal = () => {
    setGoalToEdit(null);
    setIsGoalModalOpen(true);
  };

  const handleOpenEditGoal = (goal: SavingsGoal) => {
    setGoalToEdit(goal);
    setIsGoalModalOpen(true);
  };

  const handleOpenAddMoney = (goal: SavingsGoal) => {
    setSelectedGoalForMoney(goal);
    setIsAddMoneyModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 flex flex-col antialiased">
      {/* Sidebar for Desktop & Offcanvas for Mobile */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        {/* Sticky Header */}
        <Header
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenAddExpense={handleOpenAddExpense}
          onOpenAddIncome={handleOpenAddIncome}
          setCurrentTab={setCurrentTab}
        />

        {/* View Switcher Container */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              setCurrentTab={setCurrentTab}
              onOpenAddExpense={handleOpenAddExpense}
              onOpenAddIncome={handleOpenAddIncome}
              onOpenExpenseModalWithEdit={handleOpenEditExpense}
              onOpenAddMoneyModal={handleOpenAddMoney}
            />
          )}

          {currentTab === 'expenses' && (
            <ExpensesView
              onOpenAddExpense={handleOpenAddExpense}
              onOpenEditExpense={handleOpenEditExpense}
            />
          )}

          {currentTab === 'income' && (
            <IncomeView
              onOpenAddIncome={handleOpenAddIncome}
              onOpenEditIncome={handleOpenEditIncome}
            />
          )}

          {currentTab === 'ai-assistant' && <AIAssistantView />}

          {currentTab === 'affordability' && <AffordabilityView />}

          {currentTab === 'goals' && (
            <GoalsView
              onOpenCreateGoal={handleOpenCreateGoal}
              onOpenEditGoal={handleOpenEditGoal}
              onOpenAddMoney={handleOpenAddMoney}
            />
          )}

          {currentTab === 'reports' && <ReportsView />}

          {currentTab === 'profile' && <ProfileView />}

          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Modals */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        expenseToEdit={expenseToEdit}
      />

      <IncomeModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        incomeToEdit={incomeToEdit}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        goalToEdit={goalToEdit}
      />

      <AddMoneyModal
        isOpen={isAddMoneyModalOpen}
        onClose={() => setIsAddMoneyModalOpen(false)}
        goal={selectedGoalForMoney}
      />
    </div>
  );
}

export default function App() {
  return (
    <FinancialProvider>
      <MainApp />
    </FinancialProvider>
  );
}
