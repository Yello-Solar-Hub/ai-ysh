import React from "react";

export interface PreSizingFormProps {
  value: string;
  onChange: (value: string) => void;
}

export function PreSizingForm({ value, onChange }: PreSizingFormProps) {
  return (
    <input
      aria-label="PreSizing value"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border p-1"
    />
  );
}

export default PreSizingForm;
