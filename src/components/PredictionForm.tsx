import React, { useState } from 'react';

export interface PredictionInput {
  currentSavingsBank: number;
  currentSavingsEtoro: number;
  monthlySalary: number;
  etoroInterest: number;
  interestRate?: number; // legacy, not used
  targetDate: string;
  spending: {
    apartment: number;
    apartmentCosts: number;
    foodAndDrinks: number;
    travel: number;
    accessories: number;
    socialLife: number;
    wifi: number;
    misc: number;
  };
  salaryType: 'net' | 'gross';
  grossSalary?: number;
  region?: 'osnovna' | 'pomozna';
  dependents?: number;
  mealReimbursement?: number;
  travelReimbursement?: number;
  salaryGrowth?: number; // yearly, percent
  inflation?: number; // yearly, percent
  monthlyEtoroContribution?: number;
}

const defaultSpending = {
  apartment: 400,
  apartmentCosts: 120,
  foodAndDrinks: 350,
  travel: 40,
  accessories: 30,
  socialLife: 120,
  wifi: 30,
  misc: 60,
};

const defaultSalaryGrowth = 4; // percent
const defaultInflation = 2; // percent
const defaultEtoroContribution = 100;

const todayStr = new Date().toISOString().split('T')[0];

const PredictionForm: React.FC<{ onSubmit: (input: PredictionInput) => void }> = ({ onSubmit }) => {
  const [form, setForm] = useState<PredictionInput>({
    currentSavingsBank: '',
    currentSavingsEtoro: '',
    monthlySalary: '',
    etoroInterest: '10',
    targetDate: todayStr,
    spending: defaultSpending,
    salaryType: 'net',
    grossSalary: '',
    region: 'osnovna',
    dependents: '',
    mealReimbursement: '',
    travelReimbursement: '',
    salaryGrowth: defaultSalaryGrowth,
    inflation: defaultInflation,
    monthlyEtoroContribution: defaultEtoroContribution,
  } as any);

  // Slovenian gross-to-net salary calculation (2024/2025, approximate)
  const calculateNet = (
    gross: number,
    region: string, // not used
    dependents: number,
    meal: number,
    travel: number
  ) => {
    // Social contributions (employee share)
    const social = gross * 0.221;
    let taxable = gross - social;

    // General allowance
    const generalAllowance = 500;
    // Dependent allowance (per dependent, monthly)
    const dependentAllowance = 243.57;
    taxable = Math.max(0, taxable - generalAllowance - dependents * dependentAllowance);

    // Tax brackets (monthly, 2024/2025)
    let dohodnina = 0;
    if (taxable <= 1047.62) dohodnina = taxable * 0.16;
    else if (taxable <= 1700) dohodnina = 167.62 + (taxable - 1047.62) * 0.26;
    else if (taxable <= 2916.67) dohodnina = 304.01 + (taxable - 1700) * 0.33;
    else if (taxable <= 5833.33) dohodnina = 693.51 + (taxable - 2916.67) * 0.39;
    else dohodnina = 1832.51 + (taxable - 5833.33) * 0.50;

    let net = gross - social - dohodnina + meal + travel;
    return Math.round(net);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name in form.spending) {
      setForm({ ...form, spending: { ...form.spending, [name]: Number(value) } });
    } else if (name === 'salaryType') {
      setForm({ ...form, salaryType: value as 'net' | 'gross' });
    } else if (
      name === 'grossSalary' ||
      name === 'dependents' ||
      name === 'mealReimbursement' ||
      name === 'travelReimbursement'
    ) {
      const gross = name === 'grossSalary' ? Number(value) : Number(form.grossSalary) || 0;
      const dependents = name === 'dependents' ? Number(value) : Number(form.dependents) || 0;
      const meal = name === 'mealReimbursement' ? Number(value) : Number(form.mealReimbursement) || 0;
      const travel = name === 'travelReimbursement' ? Number(value) : Number(form.travelReimbursement) || 0;
      setForm({
        ...form,
        [name]: value,
        monthlySalary: calculateNet(
          name === 'grossSalary' ? Number(value) : gross,
          form.region || 'osnovna',
          name === 'dependents' ? Number(value) : dependents,
          name === 'mealReimbursement' ? Number(value) : meal,
          name === 'travelReimbursement' ? Number(value) : travel
        ),
      });
    } else if (name === 'region') {
      setForm({
        ...form,
        region: value as 'osnovna' | 'pomozna',
        monthlySalary: calculateNet(
          Number(form.grossSalary) || 0,
          value,
          Number(form.dependents) || 0,
          Number(form.mealReimbursement) || 0,
          Number(form.travelReimbursement) || 0
        ),
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // +10/-10 handlers for spending
  const handleSpendingStep = (field: keyof PredictionInput['spending'], step: number) => {
    setForm(prev => ({
      ...prev,
      spending: {
        ...prev.spending,
        [field]: Math.max(0, (prev.spending[field] || 0) + step),
      },
    }));
  };

  // +50/-50 handlers for salary and savings
  const handleStep = (field: keyof PredictionInput, step: number) => {
    setForm(prev => ({
      ...prev,
      [field]: Math.max(0, Number(prev[field] || 0) + step),
    }));
  };

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit({
          ...form,
          currentSavingsBank: Number(form.currentSavingsBank) || 0,
          currentSavingsEtoro: Number(form.currentSavingsEtoro) || 0,
          monthlySalary: Number(form.monthlySalary) || 0,
          etoroInterest: Number(form.etoroInterest) || 0,
          grossSalary: Number(form.grossSalary) || 0,
          dependents: Number(form.dependents) || 0,
          mealReimbursement: Number(form.mealReimbursement) || 0,
          travelReimbursement: Number(form.travelReimbursement) || 0,
          salaryGrowth: Number(form.salaryGrowth) || 0,
          inflation: Number(form.inflation) || 0,
          monthlyEtoroContribution: Number(form.monthlyEtoroContribution) || 0,
        });
      }}
    >
      <div style={{ marginLeft: 30, marginBottom: 12 }}>
        <label>
          Current Savings (bank account):{' '}
          <button type="button" style={{ margin: '0 6px' }} onClick={() => handleStep('currentSavingsBank', -50)}>-50</button>
          <input
            type="number"
            name="currentSavingsBank"
            value={form.currentSavingsBank}
            onChange={handleChange}
            inputMode="numeric"
            min={0}
            autoFocus
            placeholder="0"
            style={{ margin: '0 6px' }}
          />
          <button type="button" style={{ margin: '0 6px' }} onClick={() => handleStep('currentSavingsBank', 50)}>+50</button>
        </label>
      </div>
      <div style={{ marginLeft: 30, marginBottom: 12 }}>
        <label>
          Current Savings (stocks and other property):{' '}
          <button type="button" style={{ margin: '0 6px' }} onClick={() => handleStep('currentSavingsEtoro', -50)}>-50</button>
          <input
            type="number"
            name="currentSavingsEtoro"
            value={form.currentSavingsEtoro}
            onChange={handleChange}
            inputMode="numeric"
            min={0}
            placeholder="0"
            style={{ margin: '0 6px' }}
          />
          <button type="button" style={{ margin: '0 6px' }} onClick={() => handleStep('currentSavingsEtoro', 50)}>+50</button>
        </label>
      </div>
      <div style={{ marginLeft: 30, marginBottom: 12 }}>
        <label>
          Salary type:{' '}
          <select name="salaryType" value={form.salaryType} onChange={handleChange}>
            <option value="net">Net</option>
            <option value="gross">Gross</option>
          </select>
        </label>
      </div>
      <div style={{ marginLeft: 30, marginBottom: 12 }}>
        {form.salaryType === 'gross' ? (
          <>
            <div style={{ marginBottom: 12 }}>
              <label style={{ marginRight: 12 }}>
                Gross Salary:{' '}
                <button type="button" style={{ margin: '0 6px' }} onClick={() => handleStep('grossSalary', -50)}>-50</button>
                <input
                  type="number"
                  name="grossSalary"
                  value={form.grossSalary}
                  onChange={handleChange}
                  inputMode="numeric"
                  min={0}
                  placeholder="0"
                  style={{ margin: '0 6px' }}
                />
                <button type="button" style={{ margin: '0 6px' }} onClick={() => handleStep('grossSalary', 50)}>+50</button>
              </label>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ marginRight: 12 }}>
                Number of dependents:{' '}
                <input
                  type="number"
                  name="dependents"
                  value={form.dependents}
                  onChange={handleChange}
                  min={0}
                  inputMode="numeric"
                  placeholder="0"
                  style={{ margin: '0 6px' }}
                />
              </label>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ marginRight: 12 }}>
                Meal reimbursement (EUR, monthly):{' '}
                <input
                  type="number"
                  name="mealReimbursement"
                  value={form.mealReimbursement}
                  onChange={handleChange}
                  min={0}
                  inputMode="numeric"
                  placeholder="0"
                  style={{ margin: '0 6px' }}
                />
              </label>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ marginRight: 12 }}>
                Travel reimbursement (EUR, monthly):{' '}
                <input
                  type="number"
                  name="travelReimbursement"
                  value={form.travelReimbursement}
                  onChange={handleChange}
                  min={0}
                  inputMode="numeric"
                  placeholder="0"
                  style={{ margin: '0 6px' }}
                />
              </label>
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong>Estimated Net Salary: {form.monthlySalary || 0} EUR</strong>
            </div>
          </>
        ) : (
          <>
            <label>
              Net Salary:{' '}
              <button type="button" style={{ margin: '0 6px' }} onClick={() => handleStep('monthlySalary', -50)}>-50</button>
              <input
                type="number"
                name="monthlySalary"
                value={form.monthlySalary}
                onChange={handleChange}
                inputMode="numeric"
                min={0}
                placeholder="0"
                style={{ margin: '0 6px' }}
              />
              <button type="button" style={{ margin: '0 6px' }} onClick={() => handleStep('monthlySalary', 50)}>+50</button>
            </label>
            <div style={{ marginTop: 12, marginBottom: 12 }}>
              <label>
                Monthly investment to stocks/property (EUR):{' '}
                <input
                  type="number"
                  name="monthlyEtoroContribution"
                  value={form.monthlyEtoroContribution}
                  onChange={handleChange}
                  inputMode="numeric"
                  min={0}
                  placeholder="100"
                  style={{ margin: '0 6px' }}
                />
              </label>
            </div>
          </>
        )}
      </div>
      <div style={{ marginLeft: 30, marginBottom: 12 }}>
        <label>
          Property Interest Rate (% per year):{' '}
          <input
            type="number"
            name="etoroInterest"
            value={form.etoroInterest}
            onChange={handleChange}
            inputMode="numeric"
            min={0}
            placeholder="10"
          />
        </label>
      </div>
      <fieldset style={{ marginLeft: 30 }}>
        <legend>Monthly Spending</legend>
        <ul style={{ listStyleType: 'disc', paddingLeft: 30 }}>
          {([
            'apartment',
            'apartmentCosts',
            'foodAndDrinks',
            'travel',
            'accessories',
            'socialLife',
            'wifi',
            'misc',
          ] as const).map(field => (
            <li key={field} style={{ marginBottom: 8 }}>
              <label>
                {(() => {
                  switch (field) {
                    case 'apartment': return 'Apartment';
                    case 'apartmentCosts': return 'Apartment costs';
                    case 'foodAndDrinks': return 'Food & Drinks';
                    case 'travel': return 'Travel';
                    case 'accessories': return 'Accessories';
                    case 'socialLife': return 'Social life';
                    case 'wifi': return 'Wifi';
                    case 'misc': return 'Misc';
                    default: return field;
                  }
                })()}: {' '}
                <button type="button" style={{ margin: '0 6px' }} onClick={() => handleSpendingStep(field, -10)}>-10</button>
                <input
                  type="number"
                  name={field}
                  value={form.spending[field]}
                  onChange={handleChange}
                  min={0}
                  inputMode="numeric"
                  placeholder="0"
                  style={{ margin: '0 6px' }}
                />
                <button type="button" style={{ margin: '0 6px' }} onClick={() => handleSpendingStep(field, 10)}>+10</button>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>
      <div style={{ marginLeft: 30, marginBottom: 12 }}>
        <label>
          Salary growth (% per year):{' '}
          <input
            type="number"
            name="salaryGrowth"
            value={form.salaryGrowth}
            onChange={handleChange}
            inputMode="numeric"
            min={-100}
            max={100}
            step="0.1"
            placeholder="4"
            style={{ margin: '0 6px' }}
          />
        </label>
      </div>
      <div style={{ marginLeft: 30, marginBottom: 12 }}>
        <label>
          Inflation (% per year):{' '}
          <input
            type="number"
            name="inflation"
            value={form.inflation}
            onChange={handleChange}
            inputMode="numeric"
            min={0}
            placeholder="2"
            style={{ margin: '0 6px' }}
          />
        </label>
      </div>
      <div style={{ marginLeft: 30, marginBottom: 12 }}>
        <label>
          Target Date:{' '}
          <input type="date" name="targetDate" value={form.targetDate} onChange={handleChange} />
        </label>
      </div>
      <div className="predict-section">
        <button type="submit">Predict</button>
      </div>
    </form>
  );
};
export default PredictionForm;