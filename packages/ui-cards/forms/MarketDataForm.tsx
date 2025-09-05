import React from "react";

export interface MarketDataFormProps {
  value: string;
  onChange: (value: string) => void;
}

export function MarketDataForm({ value, onChange }: MarketDataFormProps) {
  return (
    <input
      aria-label="MarketData value"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border p-1"
    />
  );
}

export default MarketDataForm;
