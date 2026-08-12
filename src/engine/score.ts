import type { FileRecord, ScoreBreakdown } from "../types.ts";

const NAME_CUES = [
  "untitled",
  "draft",
  "final_final",
  "wip",
  "copy",
  "asdf",
  "unsent",
  "tmp",
  "old",
];

const DAY = 86_400_000;

export function recencyScore(mtimeMs: number, nowMs: number): { value: number; days: number } {
  const days = Math.max(0, (nowMs - mtimeMs) / DAY);
  const value = Math.min(1, days / 400);
  return { value, days: Math.round(days) };
}

export function nameCueScore(name: string): { value: number; hits: string[] } {
  const lower = name.toLowerCase();
  const hits: string[] = [];
  for (const cue of NAME_CUES) {
    if (lower.includes(cue)) hits.push(cue);
  }
  if (/\(\d+\)/.test(name)) hits.push("numbered copy");
  const value = Math.min(1, hits.length * 0.45);
  return { value, hits };
}

export function incompletenessScore(text: string | null): { value: number; notes: string[] } {
  if (!text) return { value: 0.2, notes: ["empty body"] };
  const notes: string[] = [];
  let value = 0;
  if (/TODO|FIXME|XXX/i.test(text)) {
    value += 0.28;
    notes.push("still marked TODO");
  }
  const lines = text.replaceAll("\r\n", "\n").trimEnd().split("\n");
  const last = [...lines].reverse().find((l) => l.trim().length > 0) ?? "";
  if (last && !/[.!?…"”']\s*$/.test(last) && last.length > 12 && !last.startsWith("#")) {
    value += 0.35;
    notes.push("stops mid-sentence");
  }
  const headings = (text.match(/^#{1,3}\s.+$/gm) ?? []).length;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (headings >= 1 && words < 80) {
    value += 0.25;
    notes.push("a title with almost no body");
  }
  if (/^##\s.+\n\s*$/m.test(text) || /##\s.+\n+(##|$)/.test(text)) {
    value += 0.15;
    notes.push("an empty section");
  }
  return { value: Math.min(1, value), notes };
}

export function isolationScore(record: FileRecord, corpus: FileRecord[]): { value: number } {
  if (!record.text) return { value: 0.5 };
  const stem = record.name.replace(/\.[^.]+$/, "").toLowerCase();
  const tokens = stem.split(/[^a-z0-9]+/).filter((t) => t.length > 3);
  let mentions = 0;
  for (const other of corpus) {
    if (other.id === record.id || !other.text) continue;
    const hay = other.text.toLowerCase();
    if (tokens.some((t) => hay.includes(t))) mentions += 1;
  }
  const value = mentions === 0 ? 1 : mentions === 1 ? 0.45 : 0.1;
  return { value };
}

export function scoreFile(record: FileRecord, corpus: FileRecord[], nowMs: number): ScoreBreakdown {
  if (record.skipped) {
    return { total: 0, recency: 0, nameCues: 0, incompleteness: 0, isolation: 0, reasons: [] };
  }
  const recency = recencyScore(record.mtimeMs, nowMs);
  const names = nameCueScore(record.name);
  const incomplete = incompletenessScore(record.text);
  const isol = isolationScore(record, corpus);
  const total =
    0.35 * recency.value + 0.25 * names.value + 0.25 * incomplete.value + 0.15 * isol.value;
  const reasons: string[] = [];
  if (recency.days >= 30) reasons.push(`last touched ${recency.days} days ago`);
  if (names.hits.length) reasons.push("the filename still says it is not a work");
  reasons.push(...incomplete.notes);
  if (isol.value >= 0.9) reasons.push("nothing else in the attic points here");
  return {
    total,
    recency: recency.value,
    nameCues: names.value,
    incompleteness: incomplete.value,
    isolation: isol.value,
    reasons,
  };
}
