import { readFileSync } from "node:fs";
const text = readFileSync(new URL("../docs/ao-usage.md", import.meta.url), "utf8");
if (!/Agent Orchestrator/.test(text) || !/Lost Movement/.test(text)) {
  console.error("docs/ao-usage.md missing required names");
  process.exit(1);
}
console.log("ao-usage ok");
