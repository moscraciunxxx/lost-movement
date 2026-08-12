import type { GitCommit } from "./types.ts";

/** Churn used as a “forte” so two identical tiny commits stay quiet. */
const FORTE_CHURN = 80;

export function churn(commit: GitCommit): number {
  return commit.files.reduce((sum, file) => sum + file.added + file.deleted, 0);
}

export function loudness(commit: GitCommit, maxChurn: number): number {
  const c = churn(commit);
  if (c <= 0) return 0;
  const denom = Math.log1p(Math.max(maxChurn, FORTE_CHURN));
  if (denom <= 0) return 0;
  return Math.min(1, Math.log1p(c) / denom);
}

export function tension(commit: GitCommit): number {
  if (commit.conflicted) return 0.92;
  const added = commit.files.reduce((sum, file) => sum + file.added, 0);
  const deleted = commit.files.reduce((sum, file) => sum + file.deleted, 0);
  const paths = commit.files.length;
  const merge = commit.isMerge || commit.parents.length >= 2;

  if (merge) {
    let cadence = 0.42;
    if (paths >= 8) cadence += 0.12;
    if (deleted > added * 2 && deleted > 20) cadence += 0.14;
    return Math.min(0.72, cadence);
  }

  let t = 0;
  if (paths >= 8) t += 0.22;
  if (deleted > added * 2 && deleted > 20) t += 0.38;
  if (deleted + added > 400) t += 0.16;
  return Math.min(1, t);
}
