import React from "react";

export interface ProposalFormProps {
  value: string;
  onChange: (value: string) => void;
}

export function ProposalForm({ value, onChange }: ProposalFormProps) {
  return (
    <input
      aria-label="Proposal value"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border p-1"
    />
  );
}

export default ProposalForm;
