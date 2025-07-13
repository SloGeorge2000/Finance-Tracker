export const calculateProjectedSavings = (currentSavings: number, monthlyIncome: number, monthlyExpenses: number, months: number): number => {
    const netMonthlyIncome = monthlyIncome - monthlyExpenses;
    return currentSavings + (netMonthlyIncome * months);
};

export const calculateSpendingRate = (monthlyExpenses: number, monthlyIncome: number): number => {
    if (monthlyIncome === 0) return 0;
    return (monthlyExpenses / monthlyIncome) * 100;
};

export const calculateTotalIncome = (incomeSources: number[]): number => {
    return incomeSources.reduce((total, income) => total + income, 0);
};