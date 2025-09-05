import React from "react";
import { z } from "zod";

export const baseCardSchema = z.object({
  title: z.string(),
  value: z.any(),
  editable: z.boolean().optional(),
  sources: z.array(z.string()).optional(),
});

export type BaseCardProps = z.infer<typeof baseCardSchema>;

export function BaseCard({ title, value, editable = false, sources = [] }: BaseCardProps) {
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ title, value }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const csv = `title,value\n${title},${value}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPNG = () => {
    console.log("export PNG not implemented");
  };

  return (
    <div className="border p-2" role="group" aria-label={title}>
      <header className="font-bold mb-2">{title}</header>
      {editable ? (
        <input
          aria-label={title}
          defaultValue={String(value)}
          className="border p-1"
        />
      ) : (
        <p>{String(value)}</p>
      )}
      {sources.length > 0 && (
        <ul className="mt-2 list-disc pl-4">
          {sources.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      )}
      <div className="mt-2 flex gap-2">
        <button onClick={exportJSON}>JSON</button>
        <button onClick={exportCSV}>CSV</button>
        <button onClick={exportPNG}>PNG</button>
      </div>
    </div>
  );
}

export default BaseCard;
