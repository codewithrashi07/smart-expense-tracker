function calculateHealthScore({ income = 0, expense = 0, savingsRate = 0, budgetCap = 0, goalsCount = 0 }) {
  let score = 0;
  const keyStrengths = [];
  const areasToImprove = [];

  // 1. Savings Rate Component (max 35)
  if (savingsRate >= 30) {
    score += 35;
    keyStrengths.push('Superb savings rate (>30% of income saved)');
  } else if (savingsRate >= 20) {
    score += 28;
    keyStrengths.push('Healthy savings habit (20-29% of income saved)');
  } else if (savingsRate >= 10) {
    score += 20;
    areasToImprove.push('Aim to increase savings rate from 10% to at least 20%');
  } else if (savingsRate > 0) {
    score += 12;
    areasToImprove.push('Low savings cushion. Try cutting discretionary expenses');
  } else {
    score += 4;
    areasToImprove.push('Spending exceeds or matches income this month');
  }

  // 2. Budget Compliance Component (max 30)
  if (budgetCap > 0) {
    const budgetUsage = (expense / budgetCap) * 100;
    if (budgetUsage <= 75) {
      score += 30;
      keyStrengths.push('Well within monthly budget limits (<75% utilized)');
    } else if (budgetUsage <= 95) {
      score += 22;
      keyStrengths.push('Budget tracking is active and on target');
    } else if (budgetUsage <= 105) {
      score += 12;
      areasToImprove.push('Expenses nearing or at 100% of defined budget');
    } else {
      score += 5;
      areasToImprove.push('Budget exceeded. Review highest-spend categories');
    }
  } else {
    score += 18; // Neutral if no budget configured yet
    areasToImprove.push('Set monthly category budgets to boost financial control');
  }

  // 3. Expense-to-Income Ratio (max 25)
  if (income > 0) {
    const ratio = (expense / income) * 100;
    if (ratio <= 50) {
      score += 25;
      keyStrengths.push('Low living costs ratio relative to earnings');
    } else if (ratio <= 75) {
      score += 18;
    } else if (ratio <= 90) {
      score += 12;
      areasToImprove.push('Over 75% of your earnings go straight to expenses');
    } else {
      score += 5;
      areasToImprove.push('High burn rate: living paycheck to paycheck');
    }
  } else {
    score += 10;
  }

  // 4. Goal Discipline Component (max 10)
  if (goalsCount > 0) {
    score += 10;
    keyStrengths.push(`Active savings goals registered (${goalsCount})`);
  } else {
    score += 3;
    areasToImprove.push('Create at least one savings goal (e.g. Emergency Fund)');
  }

  score = Math.min(100, Math.max(10, Math.round(score)));

  let grade = 'Moderate';
  let badgeColor = 'amber';
  if (score >= 85) {
    grade = 'Excellent';
    badgeColor = 'emerald';
  } else if (score >= 70) {
    grade = 'Strong';
    badgeColor = 'cyan';
  } else if (score >= 50) {
    grade = 'Moderate';
    badgeColor = 'indigo';
  } else {
    grade = 'Needs Attention';
    badgeColor = 'rose';
  }

  return {
    score,
    grade,
    badgeColor,
    keyStrengths,
    areasToImprove,
  };
}

module.exports = { calculateHealthScore };
