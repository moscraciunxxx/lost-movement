export type Wing =
  | "manuscript"
  | "unsent"
  | "unbuilt"
  | "notes"
  | "photograph"
  | "vows"
  | "remnant";

export interface FileRecord {
  id: string;
  name: string;
  relPath: string;
  ext: string;
  bytes: number;
  text: string | null;
  mtimeMs: number;
  skipped: boolean;
  skipReason?: string;
}

export interface ScoreBreakdown {
  total: number;
  recency: number;
  nameCues: number;
  incompleteness: number;
  isolation: number;
  reasons: string[];
}

export interface Exhibit {
  file: FileRecord;
  score: ScoreBreakdown;
  wing: Wing;
  plaqueTitle: string;
  plaqueDateLine: string;
  coda: string;
  excerpt: string;
  stopsMidSentence: boolean;
}

export interface Exhibition {
  id: string;
  title: string;
  hungAt: number;
  exhibits: Exhibit[];
  source: "fixture" | "folder" | "paste";
}

export const WINGS: Wing[] = [
  "manuscript",
  "unsent",
  "unbuilt",
  "notes",
  "photograph",
  "vows",
  "remnant",
];

export const STORAGE_KEY = "lost-movement:v1";
