import React from "react";

export interface PanelFormProps {
  value: string;
  onChange: (value: string) => void;
}

export function PanelForm({ value, onChange }: PanelFormProps) {
  return (
    <input
      aria-label="Panel value"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border p-1"
    />
  );
}

export default PanelForm;
