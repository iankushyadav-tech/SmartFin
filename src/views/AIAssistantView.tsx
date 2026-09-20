import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Trash2,
  HelpCircle,
  TrendingDown,
  PiggyBank,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { AIChatMessage } from '../types';
import { formatCurrency } from '../utils/formatters';

export const AIAssistantView: React.FC = () => {
  const {
    totalIncome,
    totalExpenses,
    availableBalance,
    totalSavings,
    savingsRate,
    expenses,
    income,
    goals,
    categoryBreakdown,
    profile,
    settings,
  } = useFinancial();

  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `Hello ${profile.name}! 👋 I'm your SmartFin AI Financial Copilot.\n\nI have live context on your finances: your current available balance is **${settings.currencySymbol}${availableBalance.toLocaleString('en-IN')}**, total income is **${settings.currencySymbol}${totalIncome.toLocaleString('en-IN')}**, and your savings rate is **${savingsRate}%**.\n\nAsk me anything about your spending, affordability checks, or student budget advice!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'Where did I spend the most this month?',
    'Can I afford ₹3,000 for a weekend trip?',
    'How can I save ₹5,000 this month?',
    'Give me a student budget breakdown.',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: AIChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!messageText) setInput('');
    setIsLoading(true);

    try {
      // Build financial context payload
      const financialContext = {
        studentProfile: {
          name: profile.name,
          college: profile.college,
          role: profile.role,
        },
        metrics: {
          totalIncome,
          totalExpenses,
          availableBalance,
          totalSavings,
          savingsRate: `${savingsRate}%`,
          currencySymbol: settings.currencySymbol,
        },
        categoryBreakdown,
        recentExpenses: expenses.slice(0, 10).map((e) => ({
          name: e.name,
          amount: e.amount,
          category: e.category,
          date: e.date,
          paymentMethod: e.paymentMethod,
        })),
        incomeSources: income.map((i) => ({
          source: i.source,
          amount: i.amount,
          incomeType: i.incomeType,
        })),
        activeGoals: goals.map((g) => ({
          name: g.name,
          targetAmount: g.targetAmount,
          currentAmount: g.currentAmount,
          deadline: g.deadline,
        })),
      };

      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          context: financialContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const reply = data.reply || "I'm sorry, I couldn't generate an answer. Please try again.";

      const botMessage: AIChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error('AI chat failed:', err);
      const fallbackMessage: AIChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: `Based on your live numbers: Your available balance is ${settings.currencySymbol}${availableBalance.toLocaleString('en-IN')} with total expenses of ${settings.currencySymbol}${totalExpenses.toLocaleString('en-IN')}. Top category is ${Object.keys(categoryBreakdown)[0] || 'Food'}. Your finances are stable with a ${savingsRate}% savings rate.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'reset-msg',
        sender: 'assistant',
        text: `Chat history cleared. How can I assist you with your finances today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">AI Financial Assistant</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Powered by Gemini
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Context-aware student advisor analyzing your actual live transactions
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={clearChat}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          title="Clear chat history"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                  isUser
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[82%] sm:max-w-[70%] space-y-1`}>
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-600/10'
                      : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <div
                  className={`text-[10px] text-slate-400 px-1 ${
                    isUser ? 'text-right' : 'text-left'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 rounded-tl-none flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>Analyzing your financial telemetry & crafting advice...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none shrink-0 pt-1">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          Suggestions:
        </span>
        {suggestedPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => handleSend(prompt)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 transition-all shrink-0 shadow-2xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 bg-white rounded-2xl p-2 border border-slate-200 shadow-xs shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your spending, budget, or savings..."
          disabled={isLoading}
          className="flex-1 px-3 py-2 text-xs sm:text-sm bg-transparent focus:outline-none text-slate-800 placeholder-slate-400"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-xs"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
