import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { sampleCommits } from "../src/fixtures/index.ts";
import {
  buildScore,
  familyForPath,
  loadFixture,
  parseGitLog,
  tension,
  withMute,
} from "../src/score/index.ts";

const here = dirname(fileURLToPath(import.meta.url));
const hallJson = JSON.parse(
  readFileSync(join(here, "fixtures/hall.json"), "utf8"),
) as unknown;
const sampleLog = readFileSync(join(here, "fixtures/sample.log"), "utf8");

describe("ingest: JSON fixture documents", () => {
  it("loads the hall fixture from disk and scores every commit", () => {
    const commits = loadFixture(hallJson);
    expect(commits).toHaveLength(7);
    expect(commits.map((row) => row.author)).toEqual([
      "Mira Chen",
      "Jules Okonkwo",
      "Nico Park",
      "Mira Chen",
      "Ada Lovelace",
      "Jules Okonkwo",
      "Nico Park",
    ]);

    const score = buildScore(commits, "Hall of Parallel Work");
    expect(score.title).toBe("Hall of Parallel Work");
    expect(score.measures).toHaveLength(7);
    expect(score.commits).toHaveLength(7);
    expect(score.authors.map((author) => author.name)).toEqual([
      "Nico Park",
      "Jules Okonkwo",
      "Mira Chen",
      "Ada Lovelace",
    ]);
    expect(score.measures.map((measure) => measure.sha)).toEqual(
      commits.map((row) => row.sha),
    );
  });

  it("infers merge from two parents and keeps conflict flags", () => {
    const commits = loadFixture(hallJson);
    const merge = commits.find((row) => row.subject === "merge halls");
    const clash = commits.find((row) => row.subject === "conflicted lighting");
    expect(merge?.isMerge).toBe(true);
    expect(merge?.parents).toHaveLength(2);
    expect(clash?.conflicted).toBe(true);
    expect(tension(clash!)).toBeGreaterThanOrEqual(0.8);
  });

  it("accepts a bare commit array as well as { commits }", () => {
    const wrapped = loadFixture(hallJson);
    const bare = loadFixture(wrapped);
    expect(bare).toHaveLength(wrapped.length);
    expect(bare[0]?.sha).toBe(wrapped[0]?.sha);
  });

  it("ingests the shipped Overture hall fixture", () => {
    const commits = sampleCommits();
    expect(commits.length).toBeGreaterThanOrEqual(12);
    const score = buildScore(commits, "Lantern");
    expect(score.measures).toHaveLength(commits.length);
    expect(score.authors.map((author) => author.name).sort()).toEqual([
      "Jules Okonkwo",
      "Mira Chen",
      "Nico Varga",
    ]);
    const clash = commits.find((row) => row.conflicted);
    const merge = commits.find((row) => row.isMerge);
    expect(clash).toBeTruthy();
    expect(merge?.parents.length).toBeGreaterThanOrEqual(2);
    expect(tension(clash!)).toBeGreaterThanOrEqual(0.8);
    const flood = score.measures.find((measure) => measure.sha.startsWith("8f278233"));
    const first = score.measures[0];
    expect(flood?.loudness ?? 0).toBeGreaterThan(first?.loudness ?? 1);
    const muted = withMute(score, ["Jules Okonkwo"]);
    expect(muted.measures.some((measure) => measure.author === "Jules Okonkwo" && measure.loudness === 0)).toBe(
      true,
    );
    expect(muted.measures.some((measure) => measure.author !== "Jules Okonkwo" && measure.loudness > 0)).toBe(
      true,
    );
  });

  it("skips invalid rows instead of throwing", () => {
    expect(loadFixture(null)).toEqual([]);
    expect(loadFixture("nope")).toEqual([]);
    expect(loadFixture({ commits: [{ author: "no-sha" }, { sha: "abc", author: "Ok" }] })).toHaveLength(
      1,
    );
  });
});

describe("ingest: git log --numstat documents", () => {
  it("parses the contract pretty+numstat format from disk", () => {
    const commits = parseGitLog(sampleLog);
    expect(commits).toHaveLength(5);
    expect(commits[0]?.author).toBe("Mira Chen");
    expect(commits[0]?.files).toEqual([
      { path: "README.md", added: 12, deleted: 0 },
      { path: "src/main.ts", added: 4, deleted: 0 },
    ]);
    expect(commits[0]?.body).toBe("first lantern");
    expect(commits[1]?.files[0]?.added).toBe(40);
    expect(commits[3]?.isMerge).toBe(true);
    expect(commits[3]?.parents).toHaveLength(2);
    expect(commits[4]?.files[0]).toEqual({ path: "public/shot.png", added: 0, deleted: 0 });
    expect(familyForPath(commits[4]!.files[0]!.path)).toBe("percussion");
  });

  it("returns an empty list for empty or whitespace input", () => {
    expect(parseGitLog("")).toEqual([]);
    expect(parseGitLog("\n\n  \n")).toEqual([]);
  });

  it("ignores a truncated block that is not a commit", () => {
    expect(parseGitLog("not-a-sha\nshort")).toEqual([]);
  });
});
