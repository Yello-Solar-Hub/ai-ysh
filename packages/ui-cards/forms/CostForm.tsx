import React from "react";

export interface CostFormProps {
  value: string;
  onChange: (value: string) => void;
}

export function CostForm({ value, onChange }: CostFormProps) {
  return (
    <input
      aria-label="Cost value"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border p-1"
    />
  );
}

export default CostForm;
