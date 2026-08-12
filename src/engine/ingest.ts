import type { FileRecord } from "../types.ts";

export const MAX_CANDIDATES = 200;
export const MAX_FILE_BYTES = 256 * 1024;
export const MAX_DEPTH = 6;
export const MAX_TEXT_BYTES = 2 * 1024 * 1024;

const IGNORE_DIR = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  ".next",
  ".vite",
  ".cache",
  ".quad-pipeline",
  ".ao",
  "worktrees",
  "vendor",
  "__pycache__",
]);

const SECRET_NAMES = new Set([".env", "credentials.json", ".npmrc", ".netrc", "id_rsa"]);

const READ_EXT = new Set(["md", "txt", "rst", "markdown", "csv", "json"]);

export interface FixtureFileSpec {
  path: string;
  text: string;
  mtimeMs: number;
}

export interface FixtureSpec {
  nowMs?: number;
  files: FixtureFileSpec[];
}

export function extOf(name: string): string {
  const base = name.split("/").pop() ?? name;
  const dot = base.lastIndexOf(".");
  if (dot < 0) return "";
  return base.slice(dot + 1).toLowerCase();
}

export function depthOf(relPath: string): number {
  return relPath.split("/").filter(Boolean).length;
}

export function shouldIgnorePath(relPath: string): string | null {
  const parts = relPath.split("/").filter(Boolean);
  const base = parts[parts.length - 1] ?? relPath;
  if (base === ".DS_Store") return "system junk";
  if (IGNORE_DIR.has(base) || parts.some((p) => IGNORE_DIR.has(p))) return "ignored directory";
  if (SECRET_NAMES.has(base) || base.startsWith(".env") || base.endsWith(".pem")) {
    return "secret denylist";
  }
  if (base.endsWith(".lock") || base === "package-lock.json" || base === "pnpm-lock.yaml") {
    return "lockfile";
  }
  return null;
}

export function canRead(name: string): boolean {
  const ext = extOf(name);
  if (ext === "json" && name.endsWith("package-lock.json")) return false;
  return READ_EXT.has(ext);
}

export function toRecord(spec: {
  relPath: string;
  text?: string | null;
  mtimeMs: number;
  bytes?: number;
}): FileRecord {
  const name = spec.relPath.split("/").pop() ?? spec.relPath;
  const ignore = shouldIgnorePath(spec.relPath);
  if (ignore) {
    return {
      id: spec.relPath,
      name,
      relPath: spec.relPath,
      ext: extOf(name),
      bytes: spec.bytes ?? spec.text?.length ?? 0,
      text: null,
      mtimeMs: spec.mtimeMs,
      skipped: true,
      skipReason: ignore,
    };
  }
  if (!canRead(name)) {
    return {
      id: spec.relPath,
      name,
      relPath: spec.relPath,
      ext: extOf(name),
      bytes: spec.bytes ?? spec.text?.length ?? 0,
      text: null,
      mtimeMs: spec.mtimeMs,
      skipped: true,
      skipReason: "unsupported type",
    };
  }
  const text = spec.text ?? "";
  const bytes = spec.bytes ?? new TextEncoder().encode(text).length;
  if (bytes > MAX_FILE_BYTES) {
    return {
      id: spec.relPath,
      name,
      relPath: spec.relPath,
      ext: extOf(name),
      bytes,
      text: null,
      mtimeMs: spec.mtimeMs,
      skipped: true,
      skipReason: "too large",
    };
  }
  if (depthOf(spec.relPath) > MAX_DEPTH) {
    return {
      id: spec.relPath,
      name,
      relPath: spec.relPath,
      ext: extOf(name),
      bytes,
      text: null,
      mtimeMs: spec.mtimeMs,
      skipped: true,
      skipReason: "too deep",
    };
  }
  return {
    id: spec.relPath,
    name,
    relPath: spec.relPath,
    ext: extOf(name),
    bytes,
    text,
    mtimeMs: spec.mtimeMs,
    skipped: false,
  };
}

export function recordsFromFixture(spec: FixtureSpec): FileRecord[] {
  const out: FileRecord[] = [];
  let textBytes = 0;
  for (const file of spec.files) {
    if (out.length >= MAX_CANDIDATES) break;
    const record = toRecord({
      relPath: file.path,
      text: file.text,
      mtimeMs: file.mtimeMs,
    });
    if (!record.skipped && record.text) {
      textBytes += record.text.length;
      if (textBytes > MAX_TEXT_BYTES) {
        out.push({ ...record, text: null, skipped: true, skipReason: "corpus cap" });
        continue;
      }
    }
    out.push(record);
  }
  return out;
}
