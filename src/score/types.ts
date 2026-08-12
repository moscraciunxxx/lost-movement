export type Family = "strings" | "brass" | "woodwinds" | "percussion";

export interface FileDelta {
  path: string;
  added: number;
  deleted: number;
  patch?: string;
}

export interface GitCommit {
  sha: string;
  author: string;
  email?: string;
  timestamp: number;
  subject: string;
  body?: string;
  files: FileDelta[];
  parents: string[];
  isMerge: boolean;
  conflicted?: boolean;
}

export interface Measure {
  index: number;
  sha: string;
  loudness: number;
  tension: number;
  families: Record<Family, number>;
  author: string;
  isMerge: boolean;
  conflicted: boolean;
}

export interface AuthorSection {
  name: string;
  commitCount: number;
  churn: number;
  muted: boolean;
  family: Family;
}

export interface OvertureScore {
  title: string;
  commits: GitCommit[];
  measures: Measure[];
  authors: AuthorSection[];
}

export interface TransportState {
  playing: boolean;
  tempoBpm: number;
  cursor: number;
  mutedAuthors: string[];
  soloAuthor: string | null;
}

export const FAMILIES: Family[] = ["strings", "brass", "woodwinds", "percussion"];

export const EMPTY_FAMILIES: Record<Family, number> = {
  strings: 0,
  brass: 0,
  woodwinds: 0,
  percussion: 0,
};

export const GIT_LOG_COMMAND =
  "git log --numstat --pretty=format:'%H%n%an%n%ae%n%at%n%P%n%s%n%b%n==END==' -n 80";
