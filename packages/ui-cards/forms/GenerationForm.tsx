import React from "react";

export interface GenerationFormProps {
  value: string;
  onChange: (value: string) => void;
}

export function GenerationForm({ value, onChange }: GenerationFormProps) {
  return (
    <input
      aria-label="Generation value"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border p-1"
    />
  );
}

export default GenerationForm;
