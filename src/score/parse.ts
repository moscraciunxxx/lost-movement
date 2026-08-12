import type { FileDelta, GitCommit } from "./types.ts";

const NUMSTAT = /^(\d+|-)\t(\d+|-)\t(.+)$/;
const SHA = /^[0-9a-f]{4,40}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asFiles(value: unknown): FileDelta[] {
  if (!Array.isArray(value)) return [];
  const files: FileDelta[] = [];
  for (const item of value) {
    if (!isRecord(item) || typeof item.path !== "string") continue;
    const added = typeof item.added === "number" ? item.added : 0;
    const deleted = typeof item.deleted === "number" ? item.deleted : 0;
    const file: FileDelta = { path: item.path, added, deleted };
    if (typeof item.patch === "string") file.patch = item.patch;
    files.push(file);
  }
  return files;
}

function looksConflicted(subject: string, body?: string): boolean {
  const blob = `${subject}\n${body ?? ""}`;
  return /\bconflicts?\b/i.test(blob) || /^(<<<<<<<|>>>>>>>)/m.test(blob);
}

export function loadFixture(data: unknown): GitCommit[] {
  const rows = Array.isArray(data)
    ? data
    : isRecord(data) && Array.isArray(data.commits)
      ? data.commits
      : [];
  const commits: GitCommit[] = [];
  for (const row of rows) {
    if (!isRecord(row) || typeof row.sha !== "string" || typeof row.author !== "string") {
      continue;
    }
    const parents = Array.isArray(row.parents)
      ? row.parents.filter((parent): parent is string => typeof parent === "string")
      : [];
    const subject = typeof row.subject === "string" ? row.subject : "(no subject)";
    const body = typeof row.body === "string" ? row.body : undefined;
    const isMerge = typeof row.isMerge === "boolean" ? row.isMerge : parents.length >= 2;
    commits.push({
      sha: row.sha,
      author: row.author,
      email: typeof row.email === "string" ? row.email : undefined,
      timestamp: typeof row.timestamp === "number" ? row.timestamp : 0,
      subject,
      body,
      files: asFiles(row.files),
      parents,
      isMerge: isMerge || parents.length >= 2,
      conflicted: row.conflicted === true || looksConflicted(subject, body),
    });
  }
  return commits;
}

function parseNumstatLine(line: string): FileDelta | null {
  const match = NUMSTAT.exec(line);
  if (!match) return null;
  let path = match[3] ?? "";
  const rename = path.match(/\{(?:.*) => (.+)\}/) ?? path.match(/^(?:.*) => (.+)$/);
  if (rename?.[1]) path = rename[1].trim();
  const addedRaw = match[1] ?? "0";
  const deletedRaw = match[2] ?? "0";
  return {
    path,
    added: addedRaw === "-" ? 0 : Number(addedRaw) || 0,
    deleted: deletedRaw === "-" ? 0 : Number(deletedRaw) || 0,
  };
}

function peelLeadingNumstat(block: string): { files: FileDelta[]; rest: string } {
  const lines = block.split(/\r?\n/);
  const files: FileDelta[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index] ?? "";
    if (line.trim() === "") {
      index += 1;
      continue;
    }
    const file = parseNumstatLine(line);
    if (!file) break;
    files.push(file);
    index += 1;
  }
  return { files, rest: lines.slice(index).join("\n") };
}

function parseHeader(text: string): GitCommit | null {
  const trimmed = text.replace(/^\uFEFF/, "").trim();
  if (!trimmed) return null;
  const lines = trimmed.split(/\r?\n/);
  if (lines.length < 6) return null;
  const sha = lines[0] ?? "";
  if (!SHA.test(sha)) return null;
  const author = lines[1] ?? "";
  if (!author) return null;
  const email = lines[2] || undefined;
  const timestamp = Number(lines[3]) || 0;
  const parents = (lines[4] ?? "").split(/\s+/).filter(Boolean);
  const subject = lines[5] || "(no subject)";
  const bodyLines: string[] = [];
  const inlineFiles: FileDelta[] = [];
  for (const line of lines.slice(6)) {
    const file = parseNumstatLine(line);
    if (file) {
      inlineFiles.push(file);
      continue;
    }
    bodyLines.push(line);
  }
  const body = bodyLines.join("\n").trim() || undefined;
  return {
    sha,
    author,
    email,
    timestamp,
    subject,
    body,
    files: inlineFiles,
    parents,
    isMerge: parents.length >= 2,
    conflicted: looksConflicted(subject, body),
  };
}

/**
 * Parse `git log --numstat --pretty=format:'%H%n%an%n%ae%n%at%n%P%n%s%n%b%n==END=='`.
 * Numstat rows sit after each ==END== marker (git prints pretty, then stats).
 */
export function parseGitLog(raw: string): GitCommit[] {
  if (!raw.trim()) return [];
  const parts = raw.split(/\r?\n==END==\r?\n?/);
  const commits: GitCommit[] = [];
  let pending = parseHeader(parts[0] ?? "");

  for (let i = 1; i < parts.length; i++) {
    const { files, rest } = peelLeadingNumstat(parts[i] ?? "");
    if (pending) {
      commits.push(pending.files.length ? pending : { ...pending, files });
    }
    pending = parseHeader(rest);
  }

  if (pending) commits.push(pending);
  return commits;
}
