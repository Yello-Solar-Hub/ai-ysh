import { describe, expect, it } from 'vitest';
import { filterIssuesBySeverity, type Issue } from './ComplianceCard';

describe('filterIssuesBySeverity', () => {
  const issues: Issue[] = [
    { id: '1', description: 'Issue 1', severity: 'low' },
    { id: '2', description: 'Issue 2', severity: 'medium' },
    { id: '3', description: 'Issue 3', severity: 'high' },
    { id: '4', description: 'Issue 4', severity: 'high' },
  ];

  it('returns all issues when severity is all', () => {
    expect(filterIssuesBySeverity(issues, 'all')).toHaveLength(4);
  });

  it('filters issues by given severity', () => {
    expect(filterIssuesBySeverity(issues, 'high')).toHaveLength(2);
    expect(filterIssuesBySeverity(issues, 'medium')).toHaveLength(1);
    expect(filterIssuesBySeverity(issues, 'low')).toHaveLength(1);
  });
});
