import { describe, expect, it } from "vitest";
import {
  buildScore,
  churn,
  familyForPath,
  loadFixture,
  loudness,
  parseGitLog,
  playbackLoudness,
  tension,
  withMute,
} from "../src/score/index.ts";
import { commit, sumFamilies } from "./helpers.ts";

describe("familyForPath", () => {
  it("maps extensions to instrument families", () => {
    expect(familyForPath("docs/readme.md")).toBe("strings");
    expect(familyForPath("notes.txt")).toBe("strings");
    expect(familyForPath("history.rst")).toBe("strings");
    expect(familyForPath("src/score.ts")).toBe("brass");
    expect(familyForPath("src/hall.css")).toBe("woodwinds");
    expect(familyForPath("tokens.json")).toBe("woodwinds");
    expect(familyForPath("package-lock.json")).toBe("percussion");
    expect(familyForPath("shot.png")).toBe("percussion");
    expect(familyForPath("fixture.snap")).toBe("percussion");
  });
});

describe("loudness / tension / overlap scoring", () => {
  it("scores empty corpus as empty", () => {
    const score = buildScore([]);
    expect(score.measures).toEqual([]);
    expect(score.authors).toEqual([]);
    expect(score.commits).toEqual([]);
  });

  it("builds one measure and one author from a single-file commit", () => {
    const only = commit({
      sha: "solo",
      author: "Mira",
      files: [{ path: "a.ts", added: 5, deleted: 0 }],
    });
    const score = buildScore([only]);
    expect(score.measures).toHaveLength(1);
    expect(score.authors).toHaveLength(1);
    expect(score.authors[0]?.name).toBe("Mira");
    expect(score.measures[0]?.families.brass).toBeCloseTo(1);
    expect(sumFamilies(score.measures[0]!.families)).toBeCloseTo(1);
  });

  it("gives identical tiny commits the same low loudness", () => {
    const files = [{ path: "same.ts", added: 2, deleted: 0 }];
    const a = commit({ sha: "a", author: "Mira", files });
    const b = commit({ sha: "b", author: "Jules", files: files.map((file) => ({ ...file })) });
    const huge = commit({
      sha: "c",
      author: "Ada",
      files: [{ path: "big.ts", added: 400, deleted: 0 }],
    });
    const score = buildScore([a, b, huge]);
    expect(churn(a)).toBe(churn(b));
    expect(score.measures[0]?.loudness).toBe(score.measures[1]?.loudness);
    expect(score.measures[0]?.loudness ?? 1).toBeLessThan(0.5);
    expect(score.measures[2]?.loudness).toBeGreaterThan(score.measures[0]?.loudness ?? 1);
  });

  it("makes the huge commit the loudest bar among small ones", () => {
    const tiny = commit({
      sha: "a",
      author: "Mira",
      files: [{ path: "a.ts", added: 2, deleted: 0 }],
    });
    const huge = commit({
      sha: "b",
      author: "Jules",
      files: [{ path: "b.ts", added: 400, deleted: 80 }],
    });
    expect(churn(huge)).toBeGreaterThan(churn(tiny));
    expect(loudness(huge, 480)).toBeGreaterThan(loudness(tiny, 480));
    const score = buildScore([tiny, huge]);
    expect(score.measures[1]?.loudness).toBeGreaterThan(score.measures[0]?.loudness ?? 0);
    expect(score.measures[1]?.loudness).toBeGreaterThan(0.7);
  });

  it("treats totally disjoint files as separate family voices", () => {
    const prose = commit({
      sha: "doc",
      author: "Mira",
      files: [{ path: "essay.md", added: 20, deleted: 0 }],
    });
    const image = commit({
      sha: "img",
      author: "Jules",
      files: [{ path: "poster.png", added: 0, deleted: 0 }],
    });
    const score = buildScore([prose, image]);
    expect(score.measures[0]?.families.strings).toBeCloseTo(1);
    expect(score.measures[0]?.families.percussion).toBe(0);
    expect(score.measures[1]?.families.percussion).toBeCloseTo(1);
    expect(score.measures[1]?.families.strings).toBe(0);
    expect(score.authors).toHaveLength(2);
  });

  it("marks conflicted commits as high tension (dissonance)", () => {
    const clash = commit({
      sha: "c",
      author: "Nico",
      conflicted: true,
      files: [{ path: "tempo.ts", added: 3, deleted: 3 }],
    });
    expect(tension(clash)).toBeGreaterThanOrEqual(0.8);
    expect(buildScore([clash]).measures[0]?.tension).toBeGreaterThanOrEqual(0.8);
  });

  it("treats two-parent merges as cadences, not max tension", () => {
    const merge = commit({
      sha: "d",
      author: "Mira",
      parents: ["a", "b"],
      isMerge: true,
      files: [{ path: "src/main.ts", added: 4, deleted: 1 }],
    });
    const value = tension(merge);
    expect(value).toBeGreaterThan(0);
    expect(value).toBeLessThan(0.8);
  });

  it("raises tension when deletes dominate a long rewrite", () => {
    const rewrite = commit({
      sha: "cut",
      author: "Ada",
      files: [{ path: "legacy.ts", added: 10, deleted: 80 }],
    });
    expect(tension(rewrite)).toBeGreaterThanOrEqual(0.35);
  });

  it("keeps loudness and tension in [0, 1]", () => {
    const commits = [
      commit({ sha: "0", author: "A", files: [] }),
      commit({
        sha: "1",
        author: "B",
        conflicted: true,
        files: [{ path: "x.ts", added: 900, deleted: 900 }],
      }),
    ];
    for (const measure of buildScore(commits).measures) {
      expect(measure.loudness).toBeGreaterThanOrEqual(0);
      expect(measure.loudness).toBeLessThanOrEqual(1);
      expect(measure.tension).toBeGreaterThanOrEqual(0);
      expect(measure.tension).toBeLessThanOrEqual(1);
    }
  });
});

describe("mute / playback", () => {
  it("zeroes playback loudness without deleting the bar", () => {
    const a = commit({
      sha: "1",
      author: "Mira",
      files: [{ path: "a.ts", added: 10, deleted: 0 }],
    });
    const b = commit({
      sha: "2",
      author: "Jules",
      files: [{ path: "b.ts", added: 10, deleted: 0 }],
    });
    const score = buildScore([a, b]);
    const muted = withMute(score, ["Mira"]);
    expect(muted.measures).toHaveLength(2);
    expect(muted.measures[0]?.loudness).toBe(0);
    expect(muted.measures[1]?.loudness).toBeGreaterThan(0);
    expect(muted.authors.find((author) => author.name === "Mira")?.muted).toBe(true);
    expect(playbackLoudness(score.measures[0]!, ["Mira"], null)).toBe(0);
  });

  it("solo silences every other author", () => {
    const a = commit({
      sha: "1",
      author: "Mira",
      files: [{ path: "a.ts", added: 10, deleted: 0 }],
    });
    const b = commit({
      sha: "2",
      author: "Jules",
      files: [{ path: "b.ts", added: 10, deleted: 0 }],
    });
    const score = buildScore([a, b]);
    expect(playbackLoudness(score.measures[0]!, [], "Mira")).toBeGreaterThan(0);
    expect(playbackLoudness(score.measures[1]!, [], "Mira")).toBe(0);
  });
});

describe("parse + fixture smoke", () => {
  it("loads a JSON fixture", () => {
    const commits = loadFixture({
      commits: [
        {
          sha: "abc123",
          author: "Ada",
          timestamp: 10,
          subject: "init",
          files: [{ path: "README.md", added: 12, deleted: 0 }],
          parents: [],
        },
      ],
    });
    expect(commits).toHaveLength(1);
    expect(commits[0]?.author).toBe("Ada");
    expect(buildScore(commits).authors[0]?.name).toBe("Ada");
  });

  it("parses git log --numstat pretty blocks", () => {
    const raw = [
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "Mira Chen",
      "mira@local",
      "1700000000",
      "",
      "light the hall",
      "first lantern",
      "==END==",
      "12\t0\tREADME.md",
      "4\t0\tsrc/main.ts",
      "",
      "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      "Jules Okonkwo",
      "jules@local",
      "1700000100",
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "gold staves",
      "",
      "==END==",
      "40\t2\tsrc/styles/hall.css",
      "",
    ].join("\n");
    const commits = parseGitLog(raw);
    expect(commits).toHaveLength(2);
    expect(commits[0]?.files).toHaveLength(2);
    expect(commits[1]?.author).toBe("Jules Okonkwo");
    expect(commits[1]?.files[0]?.added).toBe(40);
  });
});
