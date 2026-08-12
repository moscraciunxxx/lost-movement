import { churn } from "./metrics.ts";
import { FAMILIES, type OvertureScore } from "./types.ts";

export interface MeasureExplanation {
  headline: string;
  reasons: string[];
}

export function explainMeasure(score: OvertureScore, index: number): MeasureExplanation | null {
  const commit = score.commits[index];
  const measure = score.measures[index];
  if (!commit || !measure) return null;

  const reasons: string[] = [];
  const lines = churn(commit);
  const family = FAMILIES.filter((name) => (measure.families[name] ?? 0) >= 0.18)
    .map((name) => `${name} ${(measure.families[name] * 100).toFixed(0)}%`)
    .join(" · ");

  if (measure.conflicted) {
    reasons.push("This bar is marked conflicted — the pit plays a minor second.");
  }
  if (measure.isMerge) {
    reasons.push(
      `Merge cadence: ${commit.parents.length} parents. The fifth resolves unless the bar is still conflicted.`,
    );
  }
  if (lines >= 200) {
    reasons.push(`${lines} lines moved — this is the loud bar in the week.`);
  } else if (lines > 0) {
    reasons.push(`${lines} lines of churn. Loudness is log-scaled against the week’s peak.`);
  } else {
    reasons.push("No numstat on this commit — the bar is drawn, but it is silent.");
  }
  if (family) reasons.push(`Instrument mix: ${family}.`);

  const prev = score.commits[index - 1];
  if (prev && prev.author !== commit.author) {
    const shared = commit.files.filter((file) =>
      prev.files.some((other) => other.path === file.path),
    );
    if (shared[0]) {
      reasons.push(
        `${commit.author} and ${prev.author} both touch ${shared[0].path} — two desks on one part.`,
      );
    }
  }

  const files = commit.files.slice(0, 4).map((file) => file.path);
  if (files.length) reasons.push(`Touched: ${files.join(", ")}.`);

  const headline = measure.conflicted
    ? `${commit.author} · dissonance`
    : measure.isMerge
      ? `${commit.author} · cadence`
      : `${commit.author} · measure ${measure.index + 1}`;

  return { headline, reasons };
}
