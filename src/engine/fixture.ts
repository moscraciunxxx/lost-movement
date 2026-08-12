import manifest from "../fixtures/lost-attic/manifest.json";
import { recordsFromFixture, type FixtureSpec } from "./ingest.ts";
import { curateSeven } from "./curate.ts";
import type { Exhibition, FileRecord } from "../types.ts";

export function atticSpec(): FixtureSpec {
  return manifest as FixtureSpec;
}

export function atticNow(): number {
  const n = (manifest as { nowMs?: number }).nowMs;
  return typeof n === "number" ? n : Date.now();
}

export function atticRecords(): FileRecord[] {
  return recordsFromFixture(atticSpec());
}

export function tonightAttic(): Exhibition {
  return curateSeven(atticRecords(), atticNow(), "fixture");
}

export function expectedAtticIds(): string[] {
  const ids = (manifest as { expectedIds?: unknown }).expectedIds;
  return Array.isArray(ids) ? ids.filter((x): x is string => typeof x === "string") : [];
}
