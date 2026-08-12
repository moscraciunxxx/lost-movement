import { toExhibit } from "./label.ts";
import { scoreFile } from "./score.ts";
import type { Exhibit, Exhibition, FileRecord, Wing } from "../types.ts";

export function curateSeven(
  records: FileRecord[],
  nowMs: number,
  source: Exhibition["source"] = "fixture",
): Exhibition {
  const live = records.filter((r) => !r.skipped && r.text !== null);
  const ranked = live
    .map((file) => {
      const score = scoreFile(file, live, nowMs);
      return toExhibit(file, score, nowMs);
    })
    .sort((a, b) => b.score.total - a.score.total || a.file.id.localeCompare(b.file.id));

  const used = new Set<Wing>();
  const picked: Exhibit[] = [];
  for (const exhibit of ranked) {
    if (picked.length >= 7) break;
    if (used.has(exhibit.wing)) continue;
    picked.push(exhibit);
    used.add(exhibit.wing);
  }
  for (const exhibit of ranked) {
    if (picked.length >= 7) break;
    if (!picked.some((p) => p.file.id === exhibit.file.id)) picked.push(exhibit);
  }

  return {
    id: `show-${nowMs}`,
    title: "Lost Movement",
    hungAt: nowMs,
    exhibits: picked.slice(0, 7),
    source,
  };
}
