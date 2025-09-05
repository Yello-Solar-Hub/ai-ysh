import React from "react";

export interface BOMFormProps {
  value: string;
  onChange: (value: string) => void;
}

export function BOMForm({ value, onChange }: BOMFormProps) {
  return (
    <input
      aria-label="BOM value"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border p-1"
    />
  );
}

export default BOMForm;
