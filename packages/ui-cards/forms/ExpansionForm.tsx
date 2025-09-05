import React from "react";

export interface ExpansionFormProps {
  value: string;
  onChange: (value: string) => void;
}

export function ExpansionForm({ value, onChange }: ExpansionFormProps) {
  return (
    <input
      aria-label="Expansion value"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border p-1"
    />
  );
}

export default ExpansionForm;
