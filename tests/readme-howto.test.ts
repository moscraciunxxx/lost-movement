import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("README", () => {
  const text = readFileSync(new URL("../README.md", import.meta.url), "utf8");
  it("has what / how to run / built with AO", () => {
    expect(text).toMatch(/# Lost Movement/);
    expect(text).toMatch(/What it does/);
    expect(text).toMatch(/How to run/);
    expect(text).toMatch(/npm run dev/);
    expect(text).toMatch(/What was built with AO/);
    expect(text).toMatch(/Agent Orchestrator/);
  });
});
