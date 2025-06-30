import React, { useState } from 'react';

interface FinanceFormProps {
    onSubmit: (data: {
        netSalary: number;
        savingsBank: number;
        savingsEtoro: number;
        etoroInterest: number;
        spending: number;
        targetDate: string;
    }) => void;
}

const todayStr = new Date().toISOString().split('T')[0];

const FinanceForm: React.FC<FinanceFormProps> = ({ onSubmit }) => {
    const [salaryType, setSalaryType] = useState<'net' | 'gross'>('net');
    const [grossSalary, setGrossSalary] = useState('');
    const [netSalary, setNetSalary] = useState('');
    const [region, setRegion] = useState<'osnovna' | 'pomozna'>('osnovna');
    const [dependents, setDependents] = useState('');
    const [savingsBank, setSavingsBank] = useState('');
    const [savingsEtoro, setSavingsEtoro] = useState('');
    const [etoroInterest, setEtoroInterest] = useState('10');
    const [spending, setSpending] = useState('');
    const [targetDate, setTargetDate] = useState<string>(todayStr);
    const [error, setError] = useState<string>('');

    // Slovenian gross-to-net calculation (demo, not official)
    const calculateNet = (gross: number, region: string, dependents: number) => {
        let net = gross * 0.72;
        if (region === 'pomozna') net *= 0.98;
        net += dependents * 20;
        return Math.round(net);
    };

    const handleSalaryTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSalaryType(e.target.value as 'net' | 'gross');
    };

    const handleGrossSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setGrossSalary(value);
        const gross = Number(value);
        if (!isNaN(gross)) {
            setNetSalary(String(calculateNet(gross, region, Number(dependents) || 0)));
        }
    };

    const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value as 'osnovna' | 'pomozna';
        setRegion(value);
        const gross = Number(grossSalary) || 0;
        setNetSalary(String(calculateNet(gross, value, Number(dependents) || 0)));
    };

    const handleDependentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setDependents(value);
        const gross = Number(grossSalary) || 0;
        setNetSalary(String(calculateNet(gross, region, Number(value) || 0)));
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const net = Number(netSalary) || 0;
        const bank = Number(savingsBank) || 0;
        const etoro = Number(savingsEtoro) || 0;
        const etoroInt = Number(etoroInterest) || 0;
        const spend = Number(spending) || 0;
        if (net < 0 || bank < 0 || etoro < 0 || spend < 0) {
            setError('All values must be non-negative.');
            return;
        }
        setError('');
        onSubmit({
            netSalary: net,
            savingsBank: bank,
            savingsEtoro: etoro,
            etoroInterest: etoroInt,
            spending: spend,
            targetDate,
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
                <label>
                    Salary type:
                    <select value={salaryType} onChange={handleSalaryTypeChange}>
                        <option value="net">Net</option>
                        <option value="gross">Gross</option>
                    </select>
                </label>
            </div>
            {salaryType === 'gross' ? (
                <div className="gross-salary-section" style={{ marginBottom: '5px' }}>
                    <div style={{ marginBottom: '16px' }}>
                        <label>
                            Gross Salary:
                            <input
                                type="number"
                                value={grossSalary}
                                onChange={handleGrossSalaryChange}
                                inputMode="numeric"
                                min={0}
                                placeholder="Gross"
                            />
                        </label>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label>
                            Region:
                            <select value={region} onChange={handleRegionChange}>
                                <option value="osnovna">Osnovna</option>
                                <option value="pomozna">Pomožna</option>
                            </select>
                        </label>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label>
                            Number of dependents:
                            <input
                                type="number"
                                value={dependents}
                                onChange={handleDependentsChange}
                                min={0}
                                inputMode="numeric"
                                placeholder="0"
                            />
                        </label>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <strong>Estimated Net Salary: {netSalary || 0} EUR</strong>
                    </div>
                </div>
            ) : (
                <div style={{ marginBottom: '16px' }}>
                    <label>
                        Net Salary:
                        <input
                            type="number"
                            value={netSalary}
                            onChange={e => setNetSalary(e.target.value)}
                            inputMode="numeric"
                            min={0}
                            placeholder="Net"
                        />
                    </label>
                </div>
            )}
            <div style={{ marginBottom: '16px' }}>
                <label>
                    Current Savings (bank account):
                    <span className="button-group" style={{ marginLeft: 8 }}>
                        <button type="button" style={{ marginRight: 4 }} onClick={() => setSavingsBank(String(Math.max(0, Number(savingsBank) - 50)))}>-50</button>
                        <input
                            type="number"
                            value={savingsBank}
                            onChange={e => setSavingsBank(e.target.value)}
                            inputMode="numeric"
                            min={0}
                            placeholder="Bank"
                            style={{ margin: '0 4px' }}
                        />
                        <button type="button" style={{ marginLeft: 4 }} onClick={() => setSavingsBank(String(Number(savingsBank) + 50))}>+50</button>
                    </span>
                </label>
            </div>
            <div style={{ marginBottom: '16px' }}>
                <label>
                    Current Savings (E-toro):
                    <span className="button-group" style={{ marginLeft: 8 }}>
                        <button type="button" style={{ marginRight: 4 }} onClick={() => setSavingsEtoro(String(Math.max(0, Number(savingsEtoro) - 50)))}>-50</button>
                        <input
                            type="number"
                            value={savingsEtoro}
                            onChange={e => setSavingsEtoro(e.target.value)}
                            inputMode="numeric"
                            min={0}
                            placeholder="E-toro"
                            style={{ margin: '0 4px' }}
                        />
                        <button type="button" style={{ marginLeft: 4 }} onClick={() => setSavingsEtoro(String(Number(savingsEtoro) + 50))}>+50</button>
                    </span>
                </label>
            </div>
            <div style={{ marginBottom: '16px' }}>
                <label>
                    E-toro Interest Rate (% per year):
                    <input
                        type="number"
                        value={etoroInterest}
                        onChange={e => setEtoroInterest(e.target.value)}
                        inputMode="numeric"
                        min={0}
                        placeholder="10"
                        style={{ marginLeft: 8 }}
                    />
                </label>
            </div>
            <div style={{ marginBottom: '16px' }}>
                <label>
                    Monthly Spending (EUR):
                    <input
                        type="number"
                        value={spending}
                        onChange={e => setSpending(e.target.value)}
                        placeholder="Average for Slovenia: 900"
                        inputMode="numeric"
                        min={0}
                        style={{ marginLeft: 8 }}
                    />
                </label>
            </div>
            <div style={{ marginBottom: '16px' }}>
                <label>
                    Target Date:
                    <input
                        type="date"
                        value={targetDate}
                        onChange={e => setTargetDate(e.target.value)}
                        style={{ marginLeft: 8 }}
                    />
                </label>
            </div>
            {error && <p style={{ color: 'red', marginBottom: '16px' }}>{error}</p>}
            <button type="submit" style={{ marginTop: '8px' }}>Submit</button>
        </form>
    );
};

export default FinanceForm;