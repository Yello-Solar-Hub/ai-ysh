import { describe, expect, it } from 'vitest';
import { buildLatencyHistogram } from './EnrichmentAuditCard';

describe('buildLatencyHistogram', () => {
  it('aggregates latencies into bins', () => {
    const latencies = [10, 20, 30, 55, 70];
    expect(buildLatencyHistogram(latencies, 50)).toEqual([3, 2]);
  });

  it('handles empty input', () => {
    expect(buildLatencyHistogram([])).toEqual([0]);
  });
});
