import React from "react";

export interface SystemSizeFormProps {
  value: string;
  onChange: (value: string) => void;
}

export function SystemSizeForm({ value, onChange }: SystemSizeFormProps) {
  return (
    <input
      aria-label="SystemSize value"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border p-1"
    />
  );
}

export default SystemSizeForm;
