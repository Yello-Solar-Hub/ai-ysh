import { describe, expect, it } from 'vitest';
import { type BOMItem, calculateTotals } from './BOMEditor';

describe('calculateTotals', () => {
  it('sums quantity and cost correctly', () => {
    const items: BOMItem[] = [
      { id: '1', sku: 'A', brand: 'X', qty: 2, unit_cost: 5 },
      { id: '2', sku: 'B', brand: 'Y', qty: 3, unit_cost: 4 },
    ];
    const totals = calculateTotals(items);
    expect(totals.totalQty).toBe(5);
    expect(totals.totalCost).toBe(22);
  });
});

