/* @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { CompareView } from './apps/web/components/canvas/CompareView';

vi.mock('html-to-image', () => ({
  toPng: vi.fn().mockResolvedValue('data:image/png;base64,abc'),
}));

import { toPng } from 'html-to-image';

afterEach(() => {
  cleanup();
});

describe('CompareView', () => {
  it('highlights differences when toggled', async () => {
    const { getByText, container } = render(
      React.createElement(CompareView, {
        left: React.createElement('div', null, 'foo bar'),
        right: React.createElement('div', null, 'foo baz'),
      }),
    );
    fireEvent.click(getByText('Highlight diffs'));
    await waitFor(() => {
      expect(container.querySelectorAll('mark').length).toBeGreaterThan(0);
    });
  });

  it('syncs scroll positions between panes', () => {
    const { container } = render(
      React.createElement(CompareView, {
        left: React.createElement('div', { style: { height: '2000px' } }, 'left'),
        right: React.createElement('div', { style: { height: '2000px' } }, 'right'),
      }),
    );
    const panes = container.querySelectorAll('.cv-pane');
    const leftPane = panes[0] as HTMLElement;
    const rightPane = panes[1] as HTMLElement;
    leftPane.scrollTop = 100;
    leftPane.dispatchEvent(new Event('scroll'));
    expect(rightPane.scrollTop).toBe(100);
  });

  it('exports combined PNG when requested', async () => {
    const { getByText } = render(
      React.createElement(CompareView, {
        left: React.createElement('div', null, 'foo'),
        right: React.createElement('div', null, 'bar'),
      }),
    );
    await fireEvent.click(getByText('Export PNG'));
    expect(toPng).toHaveBeenCalled();
  });
});
