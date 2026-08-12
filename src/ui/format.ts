import type { Family, FileDelta, GitCommit, Measure } from "../score/types.ts";

export const FAMILY_COLOR: Record<Family, string> = {
  strings: "#e4d3ae",
  brass: "#e0b15a",
  woodwinds: "#8fa87a",
  percussion: "#c17a4a",
};

export const FAMILY_LABEL: Record<Family, string> = {
  strings: "Strings",
  brass: "Brass",
  woodwinds: "Woodwinds",
  percussion: "Percussion",
};

export function shortSha(sha: string): string {
  return sha.slice(0, 8);
}

export function formatWhen(timestamp: number): string {
  if (!timestamp) return "";
  const date = new Date(timestamp * 1000);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return (parts[0] ?? "?").slice(0, 1).toUpperCase();
  return `${parts[0]?.slice(0, 1) ?? ""}${parts[1]?.slice(0, 1) ?? ""}`.toUpperCase();
}

export function hunkLines(file: FileDelta): string {
  if (file.patch?.trim()) return file.patch;
  return `+${file.added}  −${file.deleted}`;
}

export function measureKind(commit: GitCommit, measure: Measure): string[] {
  const flags: string[] = [];
  if (measure.conflicted || commit.conflicted || measure.tension >= 0.8) {
    flags.push("dissonance");
  }
  if (measure.isMerge || commit.isMerge) flags.push("cadence");
  return flags;
}
