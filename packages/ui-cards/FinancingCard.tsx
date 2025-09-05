import React from 'react';

export interface FinancingCardProps {
  principal: number;
  annualRate: number;
  termMonths: number;
  monthlyPayment: number;
  paybackPeriodMonths?: number;
}

function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export const FinancingCard: React.FC<FinancingCardProps> = ({
  principal,
  annualRate,
  termMonths,
  monthlyPayment,
  paybackPeriodMonths,
}) => {
  return (
    <div className="p-4 border rounded w-64 text-sm">
      <div className="mb-2">
        <strong>Principal:</strong> ${'{'}formatCurrency(principal){'}'}
      </div>
      <div className="mb-2">
        <strong>Rate:</strong> {(annualRate * 100).toFixed(2)}%
      </div>
      <div className="mb-2">
        <strong>Term:</strong> {termMonths} months
      </div>
      <div className="mb-2">
        <strong>Monthly Payment:</strong> ${'{'}formatCurrency(monthlyPayment)
        {'}'}
      </div>
      {paybackPeriodMonths !== undefined && (
        <div>
          <strong>Payback:</strong> {paybackPeriodMonths} months
        </div>
      )}
    </div>
  );
};

export default FinancingCard;
