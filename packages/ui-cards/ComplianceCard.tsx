'use client';

import React, { useRef, useState } from 'react';
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'secondary' | 'default' | 'destructive';
  className?: string;
}

function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const base =
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold';
  const variants: Record<string, string> = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
  };
  return (
    <span className={`${base} ${variants[variant]} ${className}`.trim()}>{
      children
    }</span>
  );
}

type Severity = 'low' | 'medium' | 'high';

export interface Issue {
  id: string;
  description: string;
  severity: Severity;
  resolved?: boolean;
}

export interface ComplianceCardProps {
  status: 'ok' | 'warn' | 'fail';
  issues: Issue[];
  reg_refs: string[];
}

export function filterIssuesBySeverity(
  issues: Issue[],
  severity: Severity | 'all',
): Issue[] {
  return severity === 'all'
    ? issues
    : issues.filter((issue) => issue.severity === severity);
}

const severityVariant = (
  severity: Severity,
): 'secondary' | 'default' | 'destructive' => {
  switch (severity) {
    case 'high':
      return 'destructive';
    case 'medium':
      return 'default';
    default:
      return 'secondary';
  }
};

const ComplianceCard: React.FC<ComplianceCardProps> = ({
  status,
  issues,
  reg_refs,
}) => {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<Severity | 'all'>('all');
  const [localIssues, setLocalIssues] = useState<Issue[]>(issues);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleResolve = (id: string) => {
    setLocalIssues((prev) =>
      prev.map((issue) =>
        issue.id === id ? { ...issue, resolved: true } : issue,
      ),
    );
  };

  const exportJSON = () => {
    const data = JSON.stringify(
      { status, issues: localIssues, reg_refs },
      null,
      2,
    );
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'compliance-card.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPNG = async () => {
    if (!cardRef.current) return;
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(cardRef.current);
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'compliance-card.png';
    link.click();
  };

  const filtered = filterIssuesBySeverity(localIssues, filter);

  const severityCounts = {
    low: issues.filter((i) => i.severity === 'low').length,
    medium: issues.filter((i) => i.severity === 'medium').length,
    high: issues.filter((i) => i.severity === 'high').length,
  };

  return (
    <div
      ref={cardRef}
      className="rounded-lg border p-4"
      aria-live="polite"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Compliance Status: {status}</h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="compliance-checklist"
          onClick={() => setOpen((o) => !o)}
          className="text-sm underline"
        >
          {open ? 'Hide checklist' : 'Open checklist'}
        </button>
      </div>
      <div className="mt-2 flex gap-2">
        <Badge variant="secondary">Low {severityCounts.low}</Badge>
        <Badge>Medium {severityCounts.medium}</Badge>
        <Badge variant="destructive">High {severityCounts.high}</Badge>
      </div>
      {open && (
        <div id="compliance-checklist" className="mt-4">
          <label htmlFor="severity-filter" className="sr-only">
            Filter by severity
          </label>
          <select
            id="severity-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as Severity | 'all')}
            className="rounded border p-1"
          >
            <option value="all">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <ul className="mt-2 space-y-2">
            {filtered.map((issue) => (
              <li
                key={issue.id}
                className="flex items-center justify-between"
              >
                <span
                  className={issue.resolved ? 'line-through' : ''}
                >
                  {issue.description}
                </span>
                <Badge
                  className="ml-2"
                  variant={severityVariant(issue.severity)}
                >
                  {issue.severity}
                </Badge>
                <button
                  type="button"
                  onClick={() => handleResolve(issue.id)}
                  className="ml-2 text-xs underline"
                >
                  Mark as resolved
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {reg_refs.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium">Regulatory References</h3>
          <ul className="list-inside list-disc">
            {reg_refs.map((ref) => (
              <li key={ref}>
                <a
                  href={ref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  {ref}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={exportJSON}
          className="text-sm underline"
        >
          Export JSON
        </button>
        <button
          type="button"
          onClick={exportPNG}
          className="text-sm underline"
        >
          Export PNG
        </button>
      </div>
    </div>
  );
};

export default ComplianceCard;
export type { Severity };
