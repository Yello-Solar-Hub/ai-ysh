import React from "react";

export interface FinancingFormProps {
  value: string;
  onChange: (value: string) => void;
}

export function FinancingForm({ value, onChange }: FinancingFormProps) {
  return (
    <input
      aria-label="Financing value"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border p-1"
    />
  );
}

export default FinancingForm;
