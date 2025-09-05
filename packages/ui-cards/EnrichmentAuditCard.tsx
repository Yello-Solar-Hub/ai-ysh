import React, { useRef } from 'react';
import { z } from 'zod';

// Schema for Enrichment Audit data
export const enrichmentAuditSchema = z.object({
  sources: z.array(z.string()),
  latency_ms: z.array(z.number().nonnegative()),
  cache_hits: z.number().nonnegative(),
  fallbacks_used: z.number().nonnegative(),
  logs_url: z.string().url(),
});

export type EnrichmentAuditData = z.infer<typeof enrichmentAuditSchema>;

// Build a simple histogram of latency values
export function buildLatencyHistogram(
  latencies: number[],
  binSize = 50,
): number[] {
  const max = Math.max(0, ...latencies);
  const bins = Math.floor(max / binSize) + 1;
  const counts = Array(bins).fill(0);
  for (const l of latencies) {
    const idx = Math.floor(l / binSize);
    counts[idx]++;
  }
  return counts;
}

export const EnrichmentAuditCard: React.FC<EnrichmentAuditData> = (props) => {
  const data = enrichmentAuditSchema.parse(props);
  const ref = useRef<HTMLDivElement>(null);

  const exportAsPNG = async () => {
    if (!ref.current) return;
    const { toPng } = await import('html-to-image');
    const dataUrl = await toPng(ref.current);
    const link = document.createElement('a');
    link.download = 'enrichment-audit.png';
    link.href = dataUrl;
    link.click();
  };

  const exportAsJSON = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'enrichment-audit.json';
    link.href = url;
    link.click();
  };

  const binSize = 50;
  const histogram = buildLatencyHistogram(data.latency_ms, binSize);
  const maxCount = Math.max(...histogram, 1);
  const barWidth = 20;

  return (
    <div ref={ref} className="p-4 border rounded w-80">
      <h3 className="font-bold text-lg mb-2">Enrichment Audit</h3>
      <div className="mb-2">
        <span className="font-semibold">Sources:</span>
        <ul className="list-disc list-inside">
          {data.sources.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>
      <div className="flex gap-2 mb-2">
        <span className="px-2 py-1 bg-green-100 rounded text-sm">
          Cache Hits: {data.cache_hits}
        </span>
        <span className="px-2 py-1 bg-yellow-100 rounded text-sm">
          Fallbacks: {data.fallbacks_used}
        </span>
      </div>
      <div className="mb-2">
        <svg
          width={histogram.length * barWidth}
          height={100}
          className="border"
        >
          {histogram.map((count, i) => {
            const height = (count / maxCount) * 100;
            const rangeLabel = `${i * binSize}-${i * binSize + binSize}`;
            return (
              <rect
                key={rangeLabel}
                x={i * barWidth}
                y={100 - height}
                width={barWidth - 2}
                height={height}
                fill="#60a5fa"
              />
            );
          })}
        </svg>
      </div>
      <a
        href={data.logs_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 underline"
      >
        View logs
      </a>
      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={exportAsPNG}
          className="px-2 py-1 border rounded"
        >
          PNG
        </button>
        <button
          type="button"
          onClick={exportAsJSON}
          className="px-2 py-1 border rounded"
        >
          JSON
        </button>
      </div>
    </div>
  );
};

export default EnrichmentAuditCard;
