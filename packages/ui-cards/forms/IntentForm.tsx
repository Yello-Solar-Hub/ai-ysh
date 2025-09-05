import React from "react";

export interface IntentFormProps {
  value: string;
  onChange: (value: string) => void;
}

export function IntentForm({ value, onChange }: IntentFormProps) {
  return (
    <input
      aria-label="Intent value"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border p-1"
    />
  );
}

export default IntentForm;
