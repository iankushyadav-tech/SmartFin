import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Initialize Google GenAI lazily / safely
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    try {
      return new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (err) {
      console.error("Failed to initialize GoogleGenAI client:", err);
      return null;
    }
  };

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      app: "SmartFin",
      hackathon: "Hack in Hills 2026",
      team: "CodeCapital",
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // AI Chat endpoint for SmartFin financial assistant
  app.post("/api/ai-chat", async (req, res) => {
    const { message, financialContext, history } = req.body;

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Message is required." });
      return;
    }

    const ai = getGeminiClient();

    // Context description prepared for Gemini
    const contextSummary = financialContext
      ? `
USER FINANCIAL PROFILE & DATA:
- Name: ${financialContext.name || "Ankush"} (${financialContext.role || "Student"})
- Currency: ${financialContext.currency || "INR (₹)"}
- Monthly Income: ₹${financialContext.totalIncome?.toLocaleString("en-IN") || 0}
- Total Expenses: ₹${financialContext.totalExpenses?.toLocaleString("en-IN") || 0}
- Available Balance: ₹${financialContext.availableBalance?.toLocaleString("en-IN") || 0}
- Savings: ₹${financialContext.totalSavings?.toLocaleString("en-IN") || 0}
- Savings Rate: ${financialContext.savingsRate || 0}%
- Category Breakdown: ${JSON.stringify(financialContext.categoryBreakdown || {})}
- Active Savings Goals: ${JSON.stringify(financialContext.goals || [])}
- Recent Transactions: ${JSON.stringify(financialContext.recentTransactions || [])}
`
      : "No detailed financial snapshot provided.";

    const systemInstruction = `
You are SmartFin AI, an expert, encouraging, student-friendly personal finance assistant for the SmartFin platform (Team CodeCapital, Hack in Hills 2026).
Your target users are university students and young adults learning to budget, cut unnecessary expenses, and build real savings habits.

Guidelines:
1. Ground your answers in the user's REAL provided financial numbers. Quote actual amounts (e.g. ₹ amounts, percentages, category names, goal names).
2. If asked "Where am I spending the most?", "How much did I spend this month?", "Can I afford X?", "How can I reach my goal?", calculate mathematically using the provided data.
3. For affordability questions (e.g. "Can I afford ₹X?"):
   - Compare X with their Available Balance, current month's remaining buffer, and active goal targets.
   - Categorize whether it is SAFE, CAUTION, or NOT RECOMMENDED, and explain why.
4. Keep answers concise, actionable, and formatted with clean bullet points or short paragraphs.
5. Empathize with student life (campus food, textbooks, travel, pocket money, freelance income).
6. Provide practical student tips (e.g., student discounts, bulk cooking, splitting subscriptions, 50/30/20 rule adapted for students).
7. Maintain a disclaimer when necessary: "SmartFin AI provides financial education and budgeting guidance, not certified financial advice."
`;

    if (!ai) {
      // Fallback rule-based smart response when API key is not configured
      const fallbackReply = generateRuleBasedResponse(message, financialContext);
      res.json({
        reply: fallbackReply,
        source: "rule-based-fallback",
        hasGeminiKey: false,
      });
      return;
    }

    try {
      // Construct prompt with context
      const prompt = `
${contextSummary}

User question: "${message}"

Please provide a direct, insightful, and helpful response for the student using the financial data above.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const reply = response.text || "I was unable to analyze your financial query right now. Please try again.";
      res.json({
        reply,
        source: "gemini-3.8-flash",
        hasGeminiKey: true,
      });
    } catch (err: any) {
      console.error("Gemini API error:", err);
      // Fallback smoothly to rule-based engine on error
      const fallbackReply = generateRuleBasedResponse(message, financialContext);
      res.json({
        reply: fallbackReply,
        source: "rule-based-fallback",
        fallbackReason: err?.message || "API request failed",
        hasGeminiKey: true,
      });
    }
  });

  // Rule-based fallback generator
  function generateRuleBasedResponse(query: string, ctx: any): string {
    const q = query.toLowerCase();
    const income = ctx?.totalIncome || 25000;
    const expenses = ctx?.totalExpenses || 2230;
    const balance = ctx?.availableBalance || income - expenses;
    const savingsRate = ctx?.savingsRate || ((balance / income) * 100).toFixed(1);
    const topCategory = ctx?.topCategory || "Shopping";
    const goals = ctx?.goals || [];

    if (q.includes("where am i spending") || q.includes("highest") || q.includes("most")) {
      const breakdown = ctx?.categoryBreakdown || {};
      const sorted = Object.entries(breakdown).sort((a: any, b: any) => b[1] - a[1]);
      if (sorted.length > 0) {
        const [cat, amt] = sorted[0];
        const pct = ((Number(amt) / (expenses || 1)) * 100).toFixed(1);
        return `Based on your recent transactions, your highest spending category is **${cat}** at **₹${Number(amt).toLocaleString("en-IN")}** (${pct}% of total expenses). You can look for student discounts or track daily impulse purchases in ${cat} to save an extra ₹500–₹1,000 this month.`;
      }
      return `Your highest spending category this month is **${topCategory}**. Keeping a daily cap on discretionary purchases here will quickly boost your savings!`;
    }

    if (q.includes("how much did i spend") || q.includes("total spend") || q.includes("expenses")) {
      return `Your total recorded expenses are **₹${expenses.toLocaleString("en-IN")}**. Your total income is **₹${income.toLocaleString("en-IN")}**, leaving you with an available balance of **₹${balance.toLocaleString("en-IN")}** and a healthy savings rate of **${savingsRate}%**.`;
    }

    if (q.includes("can i afford") || q.includes("afford")) {
      const match = query.match(/(\d[\d,]*)/);
      const amount = match ? parseInt(match[1].replace(/,/g, ""), 10) : 4000;
      if (amount <= balance * 0.3) {
        return `**SAFE**: You can comfortably afford ₹${amount.toLocaleString("en-IN")}. Your current available balance is ₹${balance.toLocaleString("en-IN")}. After this purchase, you will still retain ₹${(balance - amount).toLocaleString("en-IN")}, preserving adequate buffer for your monthly expenses and active goals.`;
      } else if (amount <= balance) {
        return `**CAUTION**: While you have ₹${balance.toLocaleString("en-IN")} available, spending ₹${amount.toLocaleString("en-IN")} consumes ${((amount / balance) * 100).toFixed(0)}% of your remaining balance. This may slow down your savings goals. We recommend waiting 48 hours or checking if you have upcoming bill payments.`;
      } else {
        return `**NOT RECOMMENDED**: A purchase of ₹${amount.toLocaleString("en-IN")} exceeds your current available balance of ₹${balance.toLocaleString("en-IN")}. Proceeding would put you into a negative cash flow. Consider allocating savings towards this over the next 2–3 months instead.`;
      }
    }

    if (q.includes("goal") || q.includes("laptop") || q.includes("save for")) {
      const laptopGoal = goals.find((g: any) => g.name.toLowerCase().includes("laptop")) || goals[0];
      if (laptopGoal) {
        const remaining = Math.max(0, laptopGoal.targetAmount - laptopGoal.currentAmount);
        const progress = Math.min(100, Math.round((laptopGoal.currentAmount / laptopGoal.targetAmount) * 100));
        return `For your **${laptopGoal.name}** goal (Target: ₹${laptopGoal.targetAmount.toLocaleString("en-IN")}), you have saved **₹${laptopGoal.currentAmount.toLocaleString("en-IN")}** (${progress}% achieved). You need **₹${remaining.toLocaleString("en-IN")}** more. With your current monthly surplus of ~₹${balance.toLocaleString("en-IN")}, you are well on track to reach this target before your deadline!`;
      }
      return `You currently have **${goals.length}** active savings goals. Setting aside just 20% of each new income immediately into your goals helps ensure you reach them without stress.`;
    }

    if (q.includes("summary") || q.includes("finances") || q.includes("overview")) {
      return `Here is your **SmartFin Financial Snapshot**:
• **Total Income:** ₹${income.toLocaleString("en-IN")}
• **Total Expenses:** ₹${expenses.toLocaleString("en-IN")}
• **Available Balance:** ₹${balance.toLocaleString("en-IN")}
• **Savings Rate:** ${savingsRate}% (Benchmark for students: 20–30%)
• **Top Spending Area:** ${topCategory}
• **Active Goals:** ${goals.length} target(s) tracked.
You are maintaining a strong positive cashflow! Keep monitoring your discretionary food and shopping transactions.`;
    }

    if (q.includes("reduce") || q.includes("unnecessary") || q.includes("save money") || q.includes("cut")) {
      return `Here are 4 high-impact student savings strategies for SmartFin users:
1. **The 48-Hour Impulse Rule**: For non-essential items over ₹1,000, wait 48 hours before purchasing.
2. **Student Identity Discounts**: Leverage university ID for software subscriptions, transit passes, and food deals.
3. **Audit Group Subscriptions**: Split streaming and cloud storage plans with roommates.
4. **Automate Goal Transfers**: Whenever pocket money or freelance income arrives, transfer ₹500–₹1,000 immediately to your savings goals before spending starts.`;
    }

    return `I analyzed your SmartFin profile! You have an income of **₹${income.toLocaleString("en-IN")}**, total expenses of **₹${expenses.toLocaleString("en-IN")}**, and **₹${balance.toLocaleString("en-IN")}** in available funds. Ask me questions like:
• "Where am I spending the most?"
• "Can I afford ₹4,500?"
• "How can I reach my laptop goal faster?"
• "Give me a summary of my finances."`;
  }

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SmartFin server running on http://localhost:${PORT}`);
  });
}

startServer();
