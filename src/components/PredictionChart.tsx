import React from 'react';
import { Line } from 'react-chartjs-2';
import { PredictionInput } from './PredictionForm';

function monthsBetween(start: Date, end: Date) {
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
}

function findIndexForDate(labels: string[], targetDate: Date) {
  const targetStr = targetDate.toLocaleDateString('en-GB', { year: 'numeric', month: 'short' });
  return labels.findIndex(label => label === targetStr);
}

const PredictionChart: React.FC<{ input: PredictionInput }> = ({ input }) => {
  const now = new Date();
  const target = new Date(input.targetDate);
  const fiveYears = new Date(now.getFullYear() + 5, now.getMonth(), 1);
  const jan1 = new Date(now.getFullYear() + 1, 0, 1);

  // Calculate up to the later of target date or 5 years from now for data, but graph only up to target
  const endDate = target > fiveYears ? target : fiveYears;
  const months = monthsBetween(now, endDate);
  const monthsToTarget = monthsBetween(now, target);

  let etoro = input.currentSavingsEtoro || 0;
  let bank = input.currentSavingsBank || 0;
  const monthlyEtoroInterest = (input.etoroInterest || 0) / 100 / 12;
  const monthlySpending =
    input.spending.apartment +
    input.spending.apartmentCosts +
    input.spending.foodAndDrinks +
    input.spending.travel +
    input.spending.accessories +
    input.spending.socialLife +
    input.spending.wifi +
    input.spending.misc;

  const labels: string[] = [];
  const data: number[] = [];

  let salary = input.monthlySalary || 0;
  let salaryGrowth = Math.max((typeof input.salaryGrowth === 'number' ? input.salaryGrowth : 4) / 100, -0.99); // Clamp to -99%
  let inflation = (typeof input.inflation === 'number' ? input.inflation : 2) / 100; // default 2%
  let monthlyEtoroContribution = typeof input.monthlyEtoroContribution === 'number' ? input.monthlyEtoroContribution : 100;
  let monthlyInflation = Math.pow(1 + inflation, 1 / 12) - 1;
  let monthlySalaryGrowth = Math.pow(1 + salaryGrowth, 1 / 12) - 1;

  for (let i = 0; i <= months; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    labels.push(date.toLocaleDateString('en-GB', { year: 'numeric', month: 'short' }));
    data.push(Number((bank + etoro).toFixed(2)));
    // Add user-defined EUR from salary to etoro each month
    if (salary >= monthlyEtoroContribution) {
      etoro += monthlyEtoroContribution;
      bank = bank + salary - monthlyEtoroContribution - (monthlySpending * Math.pow(1 + monthlyInflation, i));
    } else {
      bank = bank + salary - (monthlySpending * Math.pow(1 + monthlyInflation, i));
    }
    // Apply E-toro interest, adjusted for inflation
    etoro = etoro * (1 + monthlyEtoroInterest - monthlyInflation);
    // Increase salary for next month
    salary = salary * (1 + monthlySalaryGrowth - monthlyInflation);
  }

  // For numbers, continue simulation up to 5 years if needed
  let bank5 = input.currentSavingsBank || 0;
  let etoro5 = input.currentSavingsEtoro || 0;
  let salary5 = input.monthlySalary || 0;
  let savingsAtJan1 = null;
  let savingsAt5Years = null;
  for (let i = 0; i <= months; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    if (date.getFullYear() === jan1.getFullYear() && date.getMonth() === jan1.getMonth()) {
      savingsAtJan1 = bank5 + etoro5;
    }
    if (date.getFullYear() === fiveYears.getFullYear() && date.getMonth() === fiveYears.getMonth()) {
      savingsAt5Years = bank5 + etoro5;
    }
    // Use user-defined values for growth, inflation, and etoro contribution
    let salaryGrowth5 = (typeof input.salaryGrowth === 'number' ? input.salaryGrowth : 4) / 100;
    let inflation5 = (typeof input.inflation === 'number' ? input.inflation : 2) / 100;
    let monthlyEtoroContribution5 = typeof input.monthlyEtoroContribution === 'number' ? input.monthlyEtoroContribution : 100;
    let monthlyInflation5 = Math.pow(1 + inflation5, 1 / 12) - 1;
    let monthlySalaryGrowth5 = Math.pow(1 + salaryGrowth5, 1 / 12) - 1;
    if (salary5 >= monthlyEtoroContribution5) {
      etoro5 += monthlyEtoroContribution5;
      bank5 = bank5 + salary5 - monthlyEtoroContribution5 - monthlySpending;
    } else {
      bank5 = bank5 + salary5 - monthlySpending;
    }
    etoro5 = etoro5 * (1 + monthlyEtoroInterest - monthlyInflation5);
    salary5 = salary5 * (1 + monthlySalaryGrowth5 - monthlyInflation5);
  }

  return (
    <div>
      <h2 className="predicted-net-valuation">Predicted Net Valuation</h2>
      <div className="predicted-net-valuation">
        <strong>Predicted Savings on Target Date: {data[monthsToTarget].toFixed(2)} EUR</strong>
      </div>
      <div className="predicted-net-valuation">
        <strong>
          Predicted Savings on Jan 1st next year: {savingsAtJan1 !== null ? savingsAtJan1.toFixed(2) : 'N/A'} EUR
        </strong>
      </div>
      <div className="predicted-net-valuation">
        <strong>
          Predicted Savings in 5 years: {savingsAt5Years !== null ? savingsAt5Years.toFixed(2) : 'N/A'} EUR
        </strong>
      </div>
      <Line
        data={{
          labels,
          datasets: [
            {
              label: 'Predicted Savings',
              data,
              borderColor: '#FFB6C1',
              backgroundColor: 'rgba(255,182,193,0.2)',
              fill: true,
              pointBackgroundColor: '#FFB6C1',
              pointBorderColor: '#FFB6C1',
             },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { display: true, labels: { font: { family: 'Roboto' } } },
            title: {
              display: true,
              text: 'Predicted Net Valuation Over Time',
              font: { size: 18, family: 'Roboto' },
            },
          },
          scales: {
            x: {
              title: { display: true, text: 'Date', font: { family: 'Roboto' } },
            },
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Savings (EUR)', font: { family: 'Roboto' } },
            },
          },
        }}
      />
    </div>
  );
};

export default PredictionChart;