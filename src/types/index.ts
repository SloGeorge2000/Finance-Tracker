export interface FinanceData {
    income: number;
    savings: number;
    spending: number;
}

export interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor: string;
    }[];
}