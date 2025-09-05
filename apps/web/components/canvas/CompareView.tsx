import React, { useEffect, useRef, useState, type ReactNode } from 'react';
import { toPng } from 'html-to-image';
import {
  DIFF_DELETE,
  DIFF_INSERT,
  diff_match_patch,
} from 'diff-match-patch';

interface CompareViewProps {
  left: ReactNode;
  right: ReactNode;
}

/**
 * Renders two panes side by side allowing visual comparison.
 *
 * Features:
 * - Responsive layout (stack on mobile, side-by-side on larger screens)
 * - Optional highlighting of textual differences
 * - Synchronized scrolling between panes
 * - Ability to export the combined view as a PNG file
 */
export function CompareView({ left, right }: CompareViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  const [highlight, setHighlight] = useState(false);
  const [leftHtml, setLeftHtml] = useState<string | null>(null);
  const [rightHtml, setRightHtml] = useState<string | null>(null);

  // keep scroll positions in sync
  useEffect(() => {
    const l = leftRef.current;
    const r = rightRef.current;
    if (!l || !r) return;

    let syncing = false;
    const handleLeft = () => {
      if (syncing) return;
      syncing = true;
      r.scrollTop = l.scrollTop;
      r.scrollLeft = l.scrollLeft;
      syncing = false;
    };
    const handleRight = () => {
      if (syncing) return;
      syncing = true;
      l.scrollTop = r.scrollTop;
      l.scrollLeft = r.scrollLeft;
      syncing = false;
    };

    l.addEventListener('scroll', handleLeft);
    r.addEventListener('scroll', handleRight);
    return () => {
      l.removeEventListener('scroll', handleLeft);
      r.removeEventListener('scroll', handleRight);
    };
  }, []);

  function toggleHighlight() {
    if (!highlight) {
      if (leftRef.current && rightRef.current) {
        const leftText = leftRef.current.textContent || '';
        const rightText = rightRef.current.textContent || '';
        const dmp = new diff_match_patch();
        const diffs = dmp.diff_main(leftText, rightText);
        dmp.diff_cleanupSemantic(diffs);

        const leftHighlighted = diffs
          .map(([op, text]) => {
            if (op === DIFF_INSERT) return '';
            if (op === DIFF_DELETE) {
              return `<mark class="bg-red-200">${text}</mark>`;
            }
            return text;
          })
          .join('');

        const rightHighlighted = diffs
          .map(([op, text]) => {
            if (op === DIFF_DELETE) return '';
            if (op === DIFF_INSERT) {
              return `<mark class="bg-green-200">${text}</mark>`;
            }
            return text;
          })
          .join('');

        setLeftHtml(leftHighlighted);
        setRightHtml(rightHighlighted);
      }
      setHighlight(true);
    } else {
      setHighlight(false);
      setLeftHtml(null);
      setRightHtml(null);
    }
  }

  // export combined panes as PNG
  async function handleExport() {
    if (!containerRef.current) return;
    const dataUrl = await toPng(containerRef.current);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `compare-${timestamp}.png`;
    link.href = dataUrl;
    link.click();
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end gap-2 text-xs">
        <button type="button" onClick={toggleHighlight}>
          {highlight ? 'Hide diffs' : 'Highlight diffs'}
        </button>
        <button type="button" onClick={handleExport}>
          Export PNG
        </button>
      </div>
      <div
        ref={containerRef}
        className="grid gap-2 grid-cols-1 md:grid-cols-2"
      >
        <div ref={leftRef} className="cv-pane border rounded overflow-auto p-2">
          {highlight ? (
            <div dangerouslySetInnerHTML={{ __html: leftHtml ?? '' }} />
          ) : (
            left
          )}
        </div>
        <div ref={rightRef} className="cv-pane border rounded overflow-auto p-2">
          {highlight ? (
            <div dangerouslySetInnerHTML={{ __html: rightHtml ?? '' }} />
          ) : (
            right
          )}
        </div>
      </div>
    </div>
  );
}

