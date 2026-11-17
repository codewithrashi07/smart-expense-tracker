/**
 * SmartTrack AI Engine
 * Combines Algorithmic Financial Intelligence with LLM APIs (Gemini/OpenAI) when configured.
 */

const generateInsights = ({ income = 0, expense = 0, categories = [], budgets = [], healthScore = {} }) => {
  const insights = [];
  const topCategory = categories.length > 0 ? categories[0] : null;

  // 1. Spending Anomaly & Concentration
  if (topCategory && expense > 0) {
    const topPct = ((topCategory.amount / expense) * 100).toFixed(1);
    if (topPct > 35) {
      insights.push({
        type: 'warning',
        title: `Heavy Concentration in ${topCategory.name}`,
        description: `${topPct}% of your total spending is concentrated in ${topCategory.name} ($${topCategory.amount.toFixed(2)}). Consider setting a dedicated sub-budget to trim discretionary leakage.`,
        tag: 'Spending Optimization',
        impact: 'High',
      });
    }
  }

  // 2. Savings Rate Strategy
  const savings = income - expense;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;
  if (savingsRate < 15 && income > 0) {
    const potentialSavings = (income * 0.20) - Math.max(0, savings);
    insights.push({
      type: 'tip',
      title: 'Accelerate Savings to 20% Benchmark',
      description: `Your current savings rate is ${savingsRate.toFixed(1)}%. Trimming $${Math.max(50, potentialSavings).toFixed(0)} across Dining and Entertainment would elevate your financial health into the top tier.`,
      tag: 'Wealth Building',
      impact: 'Medium',
    });
  } else if (savingsRate >= 25) {
    insights.push({
      type: 'success',
      title: 'Strong Capital Accumulation',
      description: `You are saving ${savingsRate.toFixed(1)}% of your earnings this period! You have sufficient cash flow to allocate $${(savings * 0.4).toFixed(0)} towards high-yield index funds or emergency reserves.`,
      tag: 'Investment Potential',
      impact: 'High',
    });
  }

  // 3. 50/30/20 Rule Analysis
  if (income > 0) {
    const needsCategories = ['Housing & Rent', 'Utilities & Bills', 'Food & Dining', 'Healthcare & Medical'];
    const wantsCategories = ['Entertainment', 'Shopping', 'Other'];

    const needsSum = categories
      .filter((c) => needsCategories.includes(c.name))
      .reduce((sum, c) => sum + c.amount, 0);

    const wantsSum = categories
      .filter((c) => wantsCategories.includes(c.name))
      .reduce((sum, c) => sum + c.amount, 0);

    const needsPct = Math.round((needsSum / income) * 100);
    const wantsPct = Math.round((wantsSum / income) * 100);

    insights.push({
      type: 'info',
      title: '50/30/20 Rule Alignment',
      description: `Current allocation: Essentials (${needsPct}% vs 50% target), Discretionary (${wantsPct}% vs 30% target), Savings (${savingsRate.toFixed(0)}% vs 20% target).`,
      tag: 'Financial Rule',
      impact: 'Informational',
    });
  }

  // 4. Budget Compliance
  const exceededBudgets = budgets.filter((b) => b.percentage >= 100);
  if (exceededBudgets.length > 0) {
    insights.push({
      type: 'danger',
      title: `${exceededBudgets.length} Budget Limits Exceeded`,
      description: `You have crossed the ceiling for ${exceededBudgets.map((b) => b.category).join(', ')}. Halting non-essential purchases in these categories for the rest of the month will restore balance.`,
      tag: 'Budget Alert',
      impact: 'Immediate',
    });
  }

  return insights;
};

const answerFinancialQuery = async ({ prompt, context, apiKey = '' }) => {
  // If API key is present for Gemini
  if (apiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are SmartTrack AI, an elite personal finance and fintech advisor. 
The user is asking: "${prompt}".
Here is their real financial context:
${JSON.stringify(context, null, 2)}

Provide an insightful, concise, highly actionable response formatted with clean markdown bullets and numerical metrics. Maintain a professional, encouraging fintech tone.`
            }]
          }]
        })
      });

      const data = await response.json();
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        return {
          reply: data.candidates[0].content.parts[0].text,
          provider: 'Gemini Cloud LLM',
        };
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to built-in SmartTrack AI engine:', err.message);
    }
  }

  // Intelligent built-in contextual rule engine fallback
  const lowerPrompt = prompt.toLowerCase();
  const { totalIncome = 0, totalExpense = 0, topCategory = 'None', healthScore = 70 } = context;
  const net = totalIncome - totalExpense;

  if (lowerPrompt.includes('save') || lowerPrompt.includes('saving')) {
    return {
      reply: `### 💡 SmartTrack Savings Recommendations
Based on your current cashflow:
- **Current Net Savings:** $${net.toFixed(2)} (${totalIncome > 0 ? ((net / totalIncome) * 100).toFixed(1) : 0}% savings rate)
- **Primary Optimization Target:** Your highest expenditure is currently **${topCategory}**. Trimming 15% from this category alone would recover ~$${(totalExpense * 0.15).toFixed(2)} monthly.
- **Automated Rule:** Setup an automated transfer on salary day to move 20% straight to a dedicated savings or high-yield vault before discretionary spending begins.`,
      provider: 'SmartTrack Heuristic AI Engine (Demo Mode)',
    };
  }

  if (lowerPrompt.includes('health') || lowerPrompt.includes('score')) {
    return {
      reply: `### 📊 Financial Health Diagnostic
- **Current Health Score:** **${healthScore}/100**
- **Living Expense Ratio:** ${totalIncome > 0 ? ((totalExpense / totalIncome) * 100).toFixed(1) : 0}% of earnings.
- **Assessment:** Your financial profile shows solid fundamentals. To reach an 'Excellent' rating (85+), ensure all high-spend categories have dedicated monthly budgets and keep non-essential recurring bills below 10% of monthly income.`,
      provider: 'SmartTrack Heuristic AI Engine (Demo Mode)',
    };
  }

  if (lowerPrompt.includes('budget') || lowerPrompt.includes('overspend')) {
    return {
      reply: `### 🎯 Budget & Overspending Analysis
- **Total Burn Rate:** $${totalExpense.toFixed(2)} so far this cycle.
- **Top Expense Category:** **${topCategory}**.
- **Action Plan:** We recommend applying the **70/20/10 rule** (70% essentials, 20% wealth goals, 10% fun). Review your active subscriptions to verify whether any recurring services can be cancelled or shared.`,
      provider: 'SmartTrack Heuristic AI Engine (Demo Mode)',
    };
  }

  // General financial summary
  return {
    reply: `### 📈 SmartTrack AI Financial Snapshot
- **Total Income Recorded:** $${totalIncome.toFixed(2)}
- **Total Outflow:** $${totalExpense.toFixed(2)}
- **Net Position:** $${net >= 0 ? '+' : ''}$${net.toFixed(2)}
- **Health Rating:** ${healthScore >= 75 ? 'Strong 🟢' : 'Needs Optimization 🟡'} (${healthScore}/100)
- **Top Spend Driver:** ${topCategory}

*Ask me questions like:*
- *"How can I save $300 more this month?"*
- *"Analyze my spending habits"*
- *"Where am I overspending?"*`,
    provider: 'SmartTrack Heuristic AI Engine (Demo Mode)',
  };
};

module.exports = { generateInsights, answerFinancialQuery };
