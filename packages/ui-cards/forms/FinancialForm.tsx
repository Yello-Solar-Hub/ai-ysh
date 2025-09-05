import React from "react";

export interface FinancialFormProps {
  value: string;
  onChange: (value: string) => void;
}

export function FinancialForm({ value, onChange }: FinancialFormProps) {
  return (
    <input
      aria-label="Financial value"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border p-1"
    />
  );
}

export default FinancialForm;
