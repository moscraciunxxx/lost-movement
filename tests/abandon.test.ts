import { describe, expect, it } from "vitest";
import { curateSeven } from "../src/engine/curate.ts";
import { expectedAtticIds, tonightAttic } from "../src/engine/fixture.ts";
import { recordsFromFixture, shouldIgnorePath } from "../src/engine/ingest.ts";
import { excerptOf } from "../src/engine/label.ts";
import { scoreFile } from "../src/engine/score.ts";
import { loadExhibition } from "../src/engine/storage.ts";

describe("ingest denylist", () => {
  it("ignores secrets, git, and node_modules", () => {
    expect(shouldIgnorePath("node_modules/foo/index.js")).toBeTruthy();
    expect(shouldIgnorePath(".env")).toBeTruthy();
    expect(shouldIgnorePath("keys/id_rsa")).toBeTruthy();
    expect(shouldIgnorePath("Untitled document (3).md")).toBeNull();
  });
});

describe("abandonment score", () => {
  it("explains why an untitled mid-sentence draft hangs", () => {
    const now = 1_000_000_000_000;
    const records = recordsFromFixture({
      files: [
        {
          path: "Untitled document (3).md",
          mtimeMs: now - 412 * 86_400_000,
          text: "# Untitled document (3)\n\nThe second theme enters in the left hand and then it\n",
        },
        {
          path: "done.md",
          mtimeMs: now - 2 * 86_400_000,
          text: "# Evening\n\nThis is finished and mentions untitled so it is not isolated.\n",
        },
      ],
    });
    const draft = records[0]!;
    const score = scoreFile(draft, records, now);
    expect(score.total).toBeGreaterThan(0.45);
    expect(score.reasons.some((r) => r.includes("412 days") || r.includes("filename") || r.includes("mid-sentence"))).toBe(true);
  });

  it("does not simply pick the oldest complete file", () => {
    const now = 2_000_000_000_000;
    const records = recordsFromFixture({
      files: [
        {
          path: "ancient-complete.md",
          mtimeMs: now - 800 * 86_400_000,
          text: "# Programme\n\nThis old essay is complete, titled properly, and ends with a period.",
        },
        {
          path: "draft-wip.md",
          mtimeMs: now - 40 * 86_400_000,
          text: "TODO finish this later I never\n",
        },
      ],
    });
    const show = curateSeven(records, now);
    expect(show.exhibits[0]?.file.id).toBe("draft-wip.md");
  });
});

describe("curate", () => {
  it("hangs at most seven rooms from the attic fixture", () => {
    const show = tonightAttic();
    expect(show.exhibits.length).toBeGreaterThan(0);
    expect(show.exhibits.length).toBeLessThanOrEqual(7);
    const expected = expectedAtticIds();
    const ids = new Set(show.exhibits.map((e) => e.file.id));
    const hits = expected.filter((id) => ids.has(id));
    expect(hits.length).toBeGreaterThanOrEqual(5);
    expect(ids.has("LICENSE")).toBe(false);
    expect(ids.has(".env.example")).toBe(false);
  });
});

describe("label", () => {
  it("keeps a mid-sentence excerpt", () => {
    const { excerpt, stopsMidSentence } = excerptOf(
      "# Untitled document (3)\n\nThe second theme enters in the left hand and then it\n",
    );
    expect(stopsMidSentence).toBe(true);
    expect(excerpt.endsWith(".")).toBe(false);
    expect(excerpt.toLowerCase()).toContain("second theme");
  });
});

describe("storage", () => {
  it("returns null on corrupt JSON", () => {
    expect(loadExhibition("{")).toBeNull();
    expect(loadExhibition(null)).toBeNull();
  });
});
