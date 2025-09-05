import React from "react";

export interface RiskFormProps {
  value: string;
  onChange: (value: string) => void;
}

export function RiskForm({ value, onChange }: RiskFormProps) {
  return (
    <input
      aria-label="Risk value"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border p-1"
    />
  );
}

export default RiskForm;
