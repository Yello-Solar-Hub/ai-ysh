import React from "react";

export interface LeadFormProps {
  value: string;
  onChange: (value: string) => void;
}

export function LeadForm({ value, onChange }: LeadFormProps) {
  return (
    <input
      aria-label="Lead value"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border p-1"
    />
  );
}

export default LeadForm;
