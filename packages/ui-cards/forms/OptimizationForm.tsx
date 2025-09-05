import React from "react";

export interface OptimizationFormProps {
  value: string;
  onChange: (value: string) => void;
}

export function OptimizationForm({ value, onChange }: OptimizationFormProps) {
  return (
    <input
      aria-label="Optimization value"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border p-1"
    />
  );
}

export default OptimizationForm;
