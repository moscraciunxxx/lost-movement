import { familyForPath } from "./families.ts";
import { churn, loudness, tension } from "./metrics.ts";
import {
  EMPTY_FAMILIES,
  FAMILIES,
  type AuthorSection,
  type Family,
  type GitCommit,
  type Measure,
  type OvertureScore,
} from "./types.ts";

const FAMILY_BIAS: Family[] = ["brass", "woodwinds", "strings", "percussion"];

function familiesFor(commit: GitCommit): Record<Family, number> {
  const raw = { ...EMPTY_FAMILIES };
  let total = 0;
  for (const file of commit.files) {
    const weight = Math.max(1, file.added + file.deleted);
    raw[familyForPath(file.path)] += weight;
    total += weight;
  }
  if (total === 0) return raw;
  const out = { ...EMPTY_FAMILIES };
  for (const family of FAMILIES) out[family] = raw[family] / total;
  return out;
}

function dominantFamily(mix: Record<Family, number>, fallback: Family): Family {
  let best = fallback;
  let amount = -1;
  for (const family of FAMILIES) {
    if (mix[family] > amount) {
      amount = mix[family];
      best = family;
    }
  }
  return amount > 0 ? best : fallback;
}

export function buildScore(commits: GitCommit[], title = "Overture"): OvertureScore {
  if (commits.length === 0) {
    return { title, commits: [], measures: [], authors: [] };
  }

  const maxChurn = commits.reduce((max, commit) => Math.max(max, churn(commit)), 0);
  const authorMap = new Map<
    string,
    { count: number; churn: number; families: Record<Family, number> }
  >();

  const measures: Measure[] = commits.map((commit, index) => {
    const mix = familiesFor(commit);
    const prev = authorMap.get(commit.author) ?? {
      count: 0,
      churn: 0,
      families: { ...EMPTY_FAMILIES },
    };
    prev.count += 1;
    prev.churn += churn(commit);
    for (const family of FAMILIES) prev.families[family] += mix[family];
    authorMap.set(commit.author, prev);

    return {
      index,
      sha: commit.sha,
      loudness: loudness(commit, maxChurn),
      tension: tension(commit),
      families: mix,
      author: commit.author,
      isMerge: commit.isMerge || commit.parents.length >= 2,
      conflicted: commit.conflicted === true,
    };
  });

  const authors: AuthorSection[] = [...authorMap.entries()]
    .map(([name, info], i) => {
      const fallback = FAMILY_BIAS[i % FAMILY_BIAS.length] ?? "brass";
      return {
        name,
        commitCount: info.count,
        churn: info.churn,
        muted: false,
        family: dominantFamily(info.families, fallback),
      };
    })
    .sort((a, b) => b.churn - a.churn || a.name.localeCompare(b.name));

  return { title, commits, measures, authors };
}

export function withMute(score: OvertureScore, muted: string[]): OvertureScore {
  const mutedSet = new Set(muted);
  return {
    ...score,
    authors: score.authors.map((author) => ({
      ...author,
      muted: mutedSet.has(author.name),
    })),
    measures: score.measures.map((measure) => ({
      ...measure,
      loudness: mutedSet.has(measure.author) ? 0 : measure.loudness,
    })),
  };
}

export function playbackLoudness(
  measure: Measure,
  muted: string[],
  solo: string | null,
): number {
  if (solo && measure.author !== solo) return 0;
  if (muted.includes(measure.author)) return 0;
  return measure.loudness;
}
