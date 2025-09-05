import React from "react";

export interface LayoutFormProps {
  value: string;
  onChange: (value: string) => void;
}

export function LayoutForm({ value, onChange }: LayoutFormProps) {
  return (
    <input
      aria-label="Layout value"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border p-1"
    />
  );
}

export default LayoutForm;
