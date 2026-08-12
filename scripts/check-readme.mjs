import { readFileSync } from "node:fs";
const text = readFileSync(new URL("../README.md", import.meta.url), "utf8");
for (const needle of ["What it does", "How to run", "What was built with AO", "npm run dev"]) {
  if (!text.includes(needle)) {
    console.error("README missing", needle);
    process.exit(1);
  }
}
console.log("readme ok");
