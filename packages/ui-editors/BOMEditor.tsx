import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import { z } from 'zod';
import { nanoid } from 'nanoid';

// Validation schema for a BOM line item
export const bomItemSchema = z.object({
  id: z.string(),
  sku: z.string().min(1, 'SKU required'),
  brand: z.string().min(1, 'Brand required'),
  qty: z.number().nonnegative(),
  unit_cost: z.number().nonnegative(),
});

export type BOMItem = z.infer<typeof bomItemSchema>;
export type BOMTotals = { totalQty: number; totalCost: number };

// Utility to calculate totals across all items
export function calculateTotals(items: BOMItem[]): BOMTotals {
  return items.reduce(
    (acc, item) => {
      acc.totalQty += item.qty;
      acc.totalCost += item.qty * item.unit_cost;
      return acc;
    },
    { totalQty: 0, totalCost: 0 },
  );
}

const emptyItem = (): BOMItem => ({
  id: nanoid(),
  sku: '',
  brand: '',
  qty: 0,
  unit_cost: 0,
});

export const BOMEditor: React.FC = () => {
  const [items, setItems] = useState<BOMItem[]>([emptyItem()]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateItem = (id: string, field: keyof BOMItem, value: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === 'qty' || field === 'unit_cost' ? Number(value) || 0 : value,
            }
          : item,
      ),
    );
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);

  const deleteItem = (id: string) =>
    setItems((prev) => prev.filter((item) => item.id !== id));

  const handleKey = (e: React.KeyboardEvent, id: string) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
    if (e.ctrlKey && (e.key === 'Backspace' || e.key === 'Delete')) {
      e.preventDefault();
      deleteItem(id);
    }
  };

  const importCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const data = (result.data as any[]).map((row) => ({
          id: nanoid(),
          sku: row.sku ?? '',
          brand: row.brand ?? '',
          qty: Number(row.qty) || 0,
          unit_cost: Number(row.unit_cost) || 0,
        }));
        setItems(data.length ? data : [emptyItem()]);
      },
    });
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) importCSV(file);
  };

  const exportCSV = () => {
    const csv = Papa.unparse(items.map(({ id, ...rest }) => rest));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'bom.csv';
    link.click();
  };

  const exportJSON = () => {
    const json = JSON.stringify(items.map(({ id, ...rest }) => rest), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'bom.json';
    link.click();
  };

  const totals = calculateTotals(
    items.filter((item) => bomItemSchema.safeParse(item).success),
  );

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <button type="button" onClick={addItem} className="px-2 py-1 border rounded">
          Add Row
        </button>
        <button
          type="button"
          onClick={handleImportClick}
          className="px-2 py-1 border rounded"
        >
          Import CSV
        </button>
        <button type="button" onClick={exportCSV} className="px-2 py-1 border rounded">
          Export CSV
        </button>
        <button type="button" onClick={exportJSON} className="px-2 py-1 border rounded">
          Export JSON
        </button>
        <input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-1 border">SKU</th>
            <th className="p-1 border">Brand</th>
            <th className="p-1 border">Qty</th>
            <th className="p-1 border">Unit Cost</th>
            <th className="p-1 border">Line Total</th>
            <th className="p-1 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const validation = bomItemSchema.safeParse(item);
            const isValid = validation.success;
            const lineTotal = item.qty * item.unit_cost;
            return (
              <tr key={item.id} className={!isValid ? 'bg-red-50' : ''}>
                <td className="border p-1">
                  <input
                    type="text"
                    value={item.sku}
                    onChange={(e) => updateItem(item.id, 'sku', e.target.value)}
                    onKeyDown={(e) => handleKey(e, item.id)}
                    className="w-full outline-none"
                  />
                </td>
                <td className="border p-1">
                  <input
                    type="text"
                    value={item.brand}
                    onChange={(e) => updateItem(item.id, 'brand', e.target.value)}
                    onKeyDown={(e) => handleKey(e, item.id)}
                    className="w-full outline-none"
                  />
                </td>
                <td className="border p-1">
                  <input
                    type="number"
                    value={item.qty}
                    onChange={(e) => updateItem(item.id, 'qty', e.target.value)}
                    onKeyDown={(e) => handleKey(e, item.id)}
                    className="w-full outline-none text-right"
                  />
                </td>
                <td className="border p-1">
                  <input
                    type="number"
                    value={item.unit_cost}
                    onChange={(e) => updateItem(item.id, 'unit_cost', e.target.value)}
                    onKeyDown={(e) => handleKey(e, item.id)}
                    className="w-full outline-none text-right"
                  />
                </td>
                <td className="border p-1 text-right">{lineTotal.toFixed(2)}</td>
                <td className="border p-1 text-center">
                  <button type="button" onClick={() => deleteItem(item.id)} className="px-1">
                    ✕
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="font-bold">
            <td className="border p-1" colSpan={2}>
              Totals
            </td>
            <td className="border p-1 text-right">{totals.totalQty}</td>
            <td className="border p-1" />
            <td className="border p-1 text-right">{totals.totalCost.toFixed(2)}</td>
            <td className="border p-1" />
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default BOMEditor;

