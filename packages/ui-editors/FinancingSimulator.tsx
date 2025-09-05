import React, { useMemo, useState } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import Papa from 'papaparse';
import FinancingCard from '../ui-cards/FinancingCard';
import { simulateFinancing } from '../../lib/finance/financingSimulator';

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function generateSchedule(
  principal: number,
  annualRate: number,
  termMonths: number,
) {
  const { monthlyPayment } = simulateFinancing({
    principal,
    annualRate,
    termMonths,
  });
  const monthlyRate = annualRate / 12;
  let balance = principal;
  const rows = [] as Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
  for (let month = 1; month <= termMonths; month++) {
    const interest = round(balance * monthlyRate);
    const principalPaid = round(monthlyPayment - interest);
    balance = round(balance - principalPaid);
    rows.push({
      month,
      payment: monthlyPayment,
      principal: principalPaid,
      interest,
      balance: balance < 0 ? 0 : balance,
    });
  }
  return rows;
}

export const FinancingSimulator: React.FC = () => {
  const [principal, setPrincipal] = useState(10000);
  const [annualRate, setAnnualRate] = useState(0.05);
  const [termMonths, setTermMonths] = useState(24);
  const [monthlySavings, setMonthlySavings] = useState(0);

  const result = useMemo(
    () =>
      simulateFinancing({ principal, annualRate, termMonths, monthlySavings }),
    [principal, annualRate, termMonths, monthlySavings],
  );

  const exportCSV = () => {
    const schedule = generateSchedule(principal, annualRate, termMonths);
    const csv = Papa.unparse(schedule);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'financing-schedule.csv';
    link.click();
  };

  const formulaPayment = 'M = P * r / (1 - (1+r)^-n)';
  const formulaPayback = 'n = ceil(P / (S - M))';

  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-1">Principal</label>
        <input
          type="number"
          className="border p-1 w-full"
          value={principal}
          onChange={(e) => setPrincipal(Number(e.target.value))}
        />
      </div>
      <div>
        <label className="block mb-1">
          Interest Rate: {(annualRate * 100).toFixed(2)}%
        </label>
        <input
          type="range"
          min={0}
          max={0.2}
          step={0.001}
          value={annualRate}
          onChange={(e) => setAnnualRate(Number(e.target.value))}
        />
      </div>
      <div>
        <label className="block mb-1">Term: {termMonths} months</label>
        <input
          type="range"
          min={1}
          max={360}
          value={termMonths}
          onChange={(e) => setTermMonths(Number(e.target.value))}
        />
      </div>
      <div>
        <label className="block mb-1">Monthly Savings</label>
        <input
          type="number"
          className="border p-1 w-full"
          value={monthlySavings}
          onChange={(e) => setMonthlySavings(Number(e.target.value))}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Monthly Payment</span>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span className="underline cursor-help text-xs">formula</span>
              </Tooltip.Trigger>
              <Tooltip.Content className="bg-black text-white p-1 rounded text-xs">
                {formulaPayment}
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
          <span>
            ${'{'}result.monthlyPayment.toFixed(2){'}'}
          </span>
        </div>
        {result.paybackPeriodMonths !== undefined && (
          <div className="flex items-center gap-2">
            <span className="font-semibold">Payback Period</span>
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <span className="underline cursor-help text-xs">formula</span>
                </Tooltip.Trigger>
                <Tooltip.Content className="bg-black text-white p-1 rounded text-xs">
                  {formulaPayback}
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
            <span>{result.paybackPeriodMonths} months</span>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={exportCSV}
        className="px-2 py-1 border rounded"
      >
        Export CSV
      </button>

      <FinancingCard
        principal={principal}
        annualRate={annualRate}
        termMonths={termMonths}
        monthlyPayment={result.monthlyPayment}
        paybackPeriodMonths={result.paybackPeriodMonths}
      />
    </div>
  );
};

export default FinancingSimulator;
