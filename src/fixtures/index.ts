import history from "./overture/history.json" with { type: "json" };
import { loadFixture } from "../score/parse.ts";
import type { GitCommit } from "../score/types.ts";

/** Live hall (what `src/ui/app.ts` plays). Relative, offline. */
export const OVERTURE_FROM_SRC = "./overture/history.json";
export const OVERTURE_PUBLIC_URL = "/fixtures/overture/history.json";
export const SALT_STAVE_FROM_SRC = "../../fixtures/overture.json";
export const SALT_STAVE_PUBLIC_URL = "/fixtures/overture.json";

export function sampleTitle(): string {
  const titled = history as { title?: string };
  return titled.title ?? "Overture";
}

export function sampleCommits(): GitCommit[] {
  return loadFixture(history);
}

export async function fetchSampleCommits(
  url: string = OVERTURE_PUBLIC_URL,
): Promise<GitCommit[]> {
  const res = await fetch(url);
  return loadFixture(await res.json());
}
