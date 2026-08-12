import type { GitCommit } from "../src/score/index.ts";

export function commit(
  partial: Partial<GitCommit> & Pick<GitCommit, "sha" | "author">,
): GitCommit {
  return {
    timestamp: 1_700_000_000,
    subject: "wip",
    files: [],
    parents: ["0"],
    isMerge: false,
    ...partial,
  };
}

export function sumFamilies(families: Record<string, number>): number {
  return Object.values(families).reduce((sum, value) => sum + value, 0);
}
