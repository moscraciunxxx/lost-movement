import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("docs/ao-usage.md", () => {
  const text = readFileSync(new URL("../docs/ao-usage.md", import.meta.url), "utf8");
  it("names Lost Movement and Agent Orchestrator, not Arweave", () => {
    expect(text).toMatch(/Lost Movement/);
    expect(text).toMatch(/Agent Orchestrator/);
    expect(text).toMatch(/aoagents\.dev/);
    expect(text).toMatch(/not.*Arweave/i);
    expect(text).not.toMatch(/^# Overture/m);
  });
});
