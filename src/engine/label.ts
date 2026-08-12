import type { Exhibit, FileRecord, ScoreBreakdown, Wing } from "../types.ts";

export function prettifyName(name: string): string {
  return name.replace(/\.[^.]+$/, "").replaceAll("_", " ").replaceAll("-", " ").trim();
}

export function detectWing(record: FileRecord): Wing {
  const n = record.name.toLowerCase();
  const t = (record.text ?? "").toLowerCase();
  if (n.includes("unsent") || n.includes("letter") || t.includes("dear ")) return "unsent";
  if (n.includes("photo") || n.includes("caption") || n.endsWith(".jpg")) return "photograph";
  if (n.includes("vow") || /i will |never again|promise/i.test(t)) return "vows";
  if (n.includes("note") || n.includes("2am") || n.includes("scratch")) return "notes";
  if (n.includes("readme") || n.includes("final") || n.includes("project")) return "unbuilt";
  if (n.includes("untitled") || n.includes("chapter") || n.includes("document")) return "manuscript";
  return "remnant";
}

export function plaqueTitle(record: FileRecord): string {
  const text = record.text ?? "";
  const heading = text.match(/^#\s+(.+)$/m);
  if (heading?.[1]) return heading[1].trim();
  return prettifyName(record.name);
}

export function dateLine(mtimeMs: number, nowMs: number): string {
  const days = Math.max(0, Math.round((nowMs - mtimeMs) / 86_400_000));
  if (days <= 1) return "last touched yesterday";
  return `last touched ${days} days ago`;
}

export function excerptOf(text: string | null): { excerpt: string; stopsMidSentence: boolean } {
  if (!text) return { excerpt: "(the page is blank)", stopsMidSentence: true };
  const cleaned = text.replace(/^#.+\n+/, "").trim();
  const para = cleaned.split(/\n\s*\n/)[0] ?? cleaned;
  let excerpt = para.replaceAll("\n", " ").trim();
  if (excerpt.length > 280) excerpt = excerpt.slice(0, 277).trimEnd() + "…";
  const lines = text.replaceAll("\r\n", "\n").trimEnd().split("\n");
  const last = [...lines].reverse().find((l) => l.trim()) ?? "";
  const stopsMidSentence = Boolean(last) && !/[.!?…"”']\s*$/.test(last) && !last.startsWith("#");
  if (stopsMidSentence && /[.!?]$/.test(excerpt)) {
    excerpt = excerpt.replace(/[.!?]+$/, "");
  }
  return { excerpt, stopsMidSentence };
}

export function codaFor(wing: Wing, score: ScoreBreakdown, stops: boolean): string {
  if (stops && (wing === "manuscript" || wing === "notes")) {
    return "the second movement, never orchestrated";
  }
  if (wing === "unsent") return "addressed, never posted";
  if (wing === "unbuilt") return "a project that stopped at the title";
  if (wing === "photograph") return "a picture that kept only its caption";
  if (wing === "vows") return "promises still in draft";
  if (score.reasons.some((r) => r.includes("TODO"))) return "still waiting for a later self";
  return "withdrawn before the premiere";
}

export function toExhibit(record: FileRecord, score: ScoreBreakdown, nowMs: number): Exhibit {
  const wing = detectWing(record);
  const { excerpt, stopsMidSentence } = excerptOf(record.text);
  return {
    file: record,
    score,
    wing,
    plaqueTitle: plaqueTitle(record),
    plaqueDateLine: dateLine(record.mtimeMs, nowMs),
    coda: codaFor(wing, score, stopsMidSentence),
    excerpt,
    stopsMidSentence,
  };
}
