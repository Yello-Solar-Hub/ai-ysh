import React from "react";

export interface ContractFormProps {
  value: string;
  onChange: (value: string) => void;
}

export function ContractForm({ value, onChange }: ContractFormProps) {
  return (
    <input
      aria-label="Contract value"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border p-1"
    />
  );
}

export default ContractForm;
