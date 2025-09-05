import React from "react";

export interface TechnicalFormProps {
  value: string;
  onChange: (value: string) => void;
}

export function TechnicalForm({ value, onChange }: TechnicalFormProps) {
  return (
    <input
      aria-label="Technical value"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border p-1"
    />
  );
}

export default TechnicalForm;
