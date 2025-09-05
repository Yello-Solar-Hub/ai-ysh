import React from "react";

export interface AnomaliesFormProps {
  value: string;
  onChange: (value: string) => void;
}

export function AnomaliesForm({ value, onChange }: AnomaliesFormProps) {
  return (
    <input
      aria-label="Anomalies value"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border p-1"
    />
  );
}

export default AnomaliesForm;
