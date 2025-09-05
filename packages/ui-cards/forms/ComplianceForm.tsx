import React from "react";

export interface ComplianceFormProps {
  value: string;
  onChange: (value: string) => void;
}

export function ComplianceForm({ value, onChange }: ComplianceFormProps) {
  return (
    <input
      aria-label="Compliance value"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border p-1"
    />
  );
}

export default ComplianceForm;
