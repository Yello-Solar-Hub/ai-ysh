import React from "react";

export interface ProductRecsFormProps {
  value: string;
  onChange: (value: string) => void;
}

export function ProductRecsForm({ value, onChange }: ProductRecsFormProps) {
  return (
    <input
      aria-label="ProductRecs value"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border p-1"
    />
  );
}

export default ProductRecsForm;
