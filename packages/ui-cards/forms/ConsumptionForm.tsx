import React from "react";

export interface ConsumptionFormProps {
  value: string;
  onChange: (value: string) => void;
}

export function ConsumptionForm({ value, onChange }: ConsumptionFormProps) {
  return (
    <input
      aria-label="Consumption value"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border p-1"
    />
  );
}

export default ConsumptionForm;
