import type { Family } from "./types.ts";

const STRINGS = new Set(["md", "markdown", "mdx", "txt", "rst", "adoc", "org", "docs"]);

const BRASS = new Set([
  "ts",
  "tsx",
  "js",
  "jsx",
  "mjs",
  "cjs",
  "go",
  "rs",
  "py",
  "rb",
  "java",
  "kt",
  "c",
  "cc",
  "cpp",
  "h",
  "hpp",
  "swift",
]);

const WOODWINDS = new Set([
  "css",
  "scss",
  "sass",
  "less",
  "html",
  "htm",
  "svg",
  "json",
  "yml",
  "yaml",
  "toml",
  "xml",
]);

const PERCUSSION = new Set([
  "lock",
  "wasm",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "bin",
  "snap",
  "woff",
  "woff2",
  "ttf",
  "map",
  "ico",
  "pdf",
]);

function basename(path: string): string {
  const parts = path.split(/[\\/]/);
  return parts[parts.length - 1] ?? path;
}

export function extOf(path: string): string {
  const base = basename(path);
  if (base === "Dockerfile" || base.startsWith("Makefile")) return "bin";
  if (
    base.endsWith(".lock") ||
    base === "package-lock.json" ||
    base === "pnpm-lock.yaml" ||
    base === "yarn.lock" ||
    base === "Cargo.lock" ||
    base === "composer.lock"
  ) {
    return "lock";
  }
  if (base.endsWith(".snap")) return "snap";
  const dot = base.lastIndexOf(".");
  if (dot < 0) return "";
  return base.slice(dot + 1).toLowerCase();
}

export function familyForPath(path: string): Family {
  const ext = extOf(path);
  if (STRINGS.has(ext)) return "strings";
  if (PERCUSSION.has(ext)) return "percussion";
  if (WOODWINDS.has(ext)) return "woodwinds";
  if (BRASS.has(ext)) return "brass";
  if (/(^|\/)docs\//.test(path) || /(^|\/)fixtures\//.test(path)) return "strings";
  if (ext === "") return "percussion";
  return "brass";
}
