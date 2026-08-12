import { STORAGE_KEY, type Exhibition } from "../types.ts";

export function loadExhibition(raw: string | null): Exhibition | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return null;
    const show = data as Exhibition;
    if (!Array.isArray(show.exhibits) || typeof show.title !== "string") return null;
    return show;
  } catch {
    return null;
  }
}

export function readLastShow(storage: Pick<Storage, "getItem"> | null): Exhibition | null {
  if (!storage) return null;
  try {
    return loadExhibition(storage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export function writeLastShow(storage: Pick<Storage, "setItem"> | null, show: Exhibition): void {
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(show));
  } catch {
    // quota / private mode — ignore
  }
}
