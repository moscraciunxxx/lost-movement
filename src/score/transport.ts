import type { Measure, TransportState } from "./types.ts";
import { playbackLoudness } from "./build.ts";

export const TEMPO_MIN = 40;
export const TEMPO_MAX = 160;
export const TEMPO_DEFAULT = 88;

function uniqueNames(names: string[]): string[] {
  return [...new Set(names.filter((name) => name.length > 0))];
}

export function clampTempo(bpm: number): number {
  if (!Number.isFinite(bpm)) return TEMPO_DEFAULT;
  return Math.min(TEMPO_MAX, Math.max(TEMPO_MIN, Math.round(bpm)));
}

export function boundCursor(cursor: number, measureCount: number): number {
  if (measureCount <= 0 || !Number.isFinite(cursor)) return 0;
  const index = Math.floor(cursor);
  if (index < 0) return 0;
  if (index >= measureCount) return measureCount - 1;
  return index;
}

export function createTransport(partial: Partial<TransportState> = {}): TransportState {
  return {
    playing: partial.playing ?? false,
    tempoBpm: clampTempo(partial.tempoBpm ?? TEMPO_DEFAULT),
    cursor: Math.max(0, Number.isFinite(partial.cursor) ? Math.floor(partial.cursor as number) : 0),
    mutedAuthors: uniqueNames(partial.mutedAuthors ?? []),
    soloAuthor: partial.soloAuthor ?? null,
  };
}

export function play(state: TransportState): TransportState {
  return { ...state, playing: true };
}

export function pause(state: TransportState): TransportState {
  return { ...state, playing: false };
}

export function togglePlay(state: TransportState): TransportState {
  return { ...state, playing: !state.playing };
}

export function setTempo(state: TransportState, bpm: number): TransportState {
  return { ...state, tempoBpm: clampTempo(bpm) };
}

export function seek(
  state: TransportState,
  cursor: number,
  measureCount: number,
): TransportState {
  return { ...state, cursor: boundCursor(cursor, measureCount) };
}

/** Advance one bar while playing. Loops to 0 after the last measure. */
export function advance(state: TransportState, measureCount: number): TransportState {
  const cursor = boundCursor(state.cursor, measureCount);
  if (!state.playing || measureCount <= 0) return { ...state, cursor };
  const next = cursor + 1;
  return { ...state, cursor: next >= measureCount ? 0 : next };
}

export function muteAuthor(state: TransportState, name: string): TransportState {
  if (!name || state.mutedAuthors.includes(name)) return state;
  return { ...state, mutedAuthors: [...state.mutedAuthors, name] };
}

export function unmuteAuthor(state: TransportState, name: string): TransportState {
  return { ...state, mutedAuthors: state.mutedAuthors.filter((entry) => entry !== name) };
}

export function setSolo(state: TransportState, name: string | null): TransportState {
  return { ...state, soloAuthor: name && name.length > 0 ? name : null };
}

export function audibleLoudness(measure: Measure, state: TransportState): number {
  return playbackLoudness(measure, state.mutedAuthors, state.soloAuthor);
}
