/** Salt Stave corpus manifest. Import from src as `../fixtures/manifest`. */

export type FixtureInstrument =
  | "cello"
  | "viola"
  | "violin"
  | "bass"
  | "horn"
  | "clarinet";

export interface FixtureEntry {
  id: string;
  title: string;
  file: string;
  /** Path from the repo root. */
  relativePath: string;
  /** ESM path from `src/`. */
  fromSrc: string;
  /** Vite `public/fixtures` URL (offline, same origin). */
  publicUrl: string;
  instrument: FixtureInstrument;
  registerHz: number;
}

export const SALT_STAVE_ID = "salt-stave";
export const FIXTURES_DIR = "fixtures";
export const FIXTURES_FROM_SRC = "../fixtures";
export const FIXTURES_PUBLIC_BASE = "/fixtures/";

export const FIXTURES: readonly FixtureEntry[] = [
  {
    id: "archivist",
    title: "The Archivist",
    file: "01-archivist.md",
    relativePath: "fixtures/01-archivist.md",
    fromSrc: "../fixtures/01-archivist.md",
    publicUrl: "/fixtures/01-archivist.md",
    instrument: "cello",
    registerHz: 65.41,
  },
  {
    id: "tuner",
    title: "The Tuner's Log",
    file: "02-tuner.md",
    relativePath: "fixtures/02-tuner.md",
    fromSrc: "../fixtures/02-tuner.md",
    publicUrl: "/fixtures/02-tuner.md",
    instrument: "viola",
    registerHz: 130.81,
  },
  {
    id: "lightkeeper",
    title: "The Lightkeeper",
    file: "03-lightkeeper.md",
    relativePath: "fixtures/03-lightkeeper.md",
    fromSrc: "../fixtures/03-lightkeeper.md",
    publicUrl: "/fixtures/03-lightkeeper.md",
    instrument: "violin",
    registerHz: 196.0,
  },
  {
    id: "hydrographer",
    title: "The Hydrographer",
    file: "04-hydrographer.md",
    relativePath: "fixtures/04-hydrographer.md",
    fromSrc: "../fixtures/04-hydrographer.md",
    publicUrl: "/fixtures/04-hydrographer.md",
    instrument: "bass",
    registerHz: 41.2,
  },
  {
    id: "surveyor",
    title: "The Surveyor",
    file: "05-surveyor.md",
    relativePath: "fixtures/05-surveyor.md",
    fromSrc: "../fixtures/05-surveyor.md",
    publicUrl: "/fixtures/05-surveyor.md",
    instrument: "horn",
    registerHz: 87.31,
  },
  {
    id: "physician",
    title: "The Conservatory Physician",
    file: "06-physician.md",
    relativePath: "fixtures/06-physician.md",
    fromSrc: "../fixtures/06-physician.md",
    publicUrl: "/fixtures/06-physician.md",
    instrument: "clarinet",
    registerHz: 146.83,
  },
] as const;

export function fixturePublicUrl(file: string): string {
  return `${FIXTURES_PUBLIC_BASE}${file}`;
}
