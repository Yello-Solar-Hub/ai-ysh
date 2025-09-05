import React from "react";

export interface OpportunityFormProps {
  value: string;
  onChange: (value: string) => void;
}

export function OpportunityForm({ value, onChange }: OpportunityFormProps) {
  return (
    <input
      aria-label="Opportunity value"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border p-1"
    />
  );
}

export default OpportunityForm;
