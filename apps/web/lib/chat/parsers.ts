import type { SourceRef } from './types';

export function parseSources(text: string): SourceRef[] {
  const regex = /\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g;
  const out: SourceRef[] = [];
  let match: RegExpExecArray | null = regex.exec(text);
  let idx = 0;
  while (match !== null) {
    out.push({ id: String(idx++), label: match[1], url: match[2] });
    match = regex.exec(text);
  }
  return out;
}
