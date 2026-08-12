import { describe, expect, it } from "vitest";
import {
  TEMPO_DEFAULT,
  TEMPO_MAX,
  TEMPO_MIN,
  advance,
  audibleLoudness,
  boundCursor,
  buildScore,
  clampTempo,
  createTransport,
  muteAuthor,
  pause,
  play,
  seek,
  setSolo,
  setTempo,
  togglePlay,
  unmuteAuthor,
} from "../src/score/index.ts";
import { commit } from "./helpers.ts";

const twoAuthors = buildScore([
  commit({
    sha: "1",
    author: "Mira",
    files: [{ path: "a.ts", added: 10, deleted: 0 }],
  }),
  commit({
    sha: "2",
    author: "Jules",
    files: [{ path: "b.ts", added: 10, deleted: 0 }],
  }),
  commit({
    sha: "3",
    author: "Mira",
    files: [{ path: "c.ts", added: 4, deleted: 0 }],
  }),
]);

describe("transport defaults and clamps", () => {
  it("starts stopped at bar 0 with concert tempo 88", () => {
    const state = createTransport();
    expect(state.playing).toBe(false);
    expect(state.tempoBpm).toBe(TEMPO_DEFAULT);
    expect(state.cursor).toBe(0);
    expect(state.mutedAuthors).toEqual([]);
    expect(state.soloAuthor).toBeNull();
  });

  it("clamps tempo to 40..160", () => {
    expect(clampTempo(12)).toBe(TEMPO_MIN);
    expect(clampTempo(400)).toBe(TEMPO_MAX);
    expect(clampTempo(Number.NaN)).toBe(TEMPO_DEFAULT);
    expect(setTempo(createTransport(), 9).tempoBpm).toBe(TEMPO_MIN);
    expect(setTempo(createTransport(), 200).tempoBpm).toBe(TEMPO_MAX);
  });

  it("bounds the cursor to the staff", () => {
    expect(boundCursor(-3, 4)).toBe(0);
    expect(boundCursor(99, 4)).toBe(3);
    expect(boundCursor(2, 0)).toBe(0);
    expect(seek(createTransport(), 40, twoAuthors.measures.length).cursor).toBe(2);
  });
});

describe("play / pause / advance invariants", () => {
  it("play and pause do not move the cursor", () => {
    const atBar = seek(createTransport(), 1, 3);
    expect(play(atBar).cursor).toBe(1);
    expect(play(atBar).playing).toBe(true);
    expect(pause(play(atBar)).playing).toBe(false);
    expect(pause(play(atBar)).cursor).toBe(1);
  });

  it("does not advance while paused", () => {
    const paused = seek(createTransport({ playing: false }), 1, 3);
    expect(advance(paused, 3).cursor).toBe(1);
  });

  it("advances one bar while playing and loops at the end", () => {
    let state = play(createTransport());
    state = advance(state, 3);
    expect(state.cursor).toBe(1);
    state = advance(state, 3);
    expect(state.cursor).toBe(2);
    state = advance(state, 3);
    expect(state.cursor).toBe(0);
    expect(state.playing).toBe(true);
  });

  it("empty staff keeps cursor at 0 even if playing", () => {
    const state = advance(play(createTransport()), 0);
    expect(state.cursor).toBe(0);
    expect(state.playing).toBe(true);
  });

  it("togglePlay is a pure flip", () => {
    const started = togglePlay(createTransport());
    expect(started.playing).toBe(true);
    expect(togglePlay(started).playing).toBe(false);
  });
});

describe("mute / solo vs playback", () => {
  it("muting an author silences their bars and leaves others audible", () => {
    const muted = muteAuthor(createTransport(), "Mira");
    expect(muted.mutedAuthors).toEqual(["Mira"]);
    expect(audibleLoudness(twoAuthors.measures[0]!, muted)).toBe(0);
    expect(audibleLoudness(twoAuthors.measures[1]!, muted)).toBeGreaterThan(0);
    expect(audibleLoudness(twoAuthors.measures[0]!, unmuteAuthor(muted, "Mira"))).toBeGreaterThan(
      0,
    );
  });

  it("does not duplicate mute entries", () => {
    const once = muteAuthor(createTransport(), "Mira");
    expect(muteAuthor(once, "Mira")).toEqual(once);
  });

  it("solo makes only that author's measures audible", () => {
    const solo = setSolo(createTransport(), "Jules");
    expect(audibleLoudness(twoAuthors.measures[0]!, solo)).toBe(0);
    expect(audibleLoudness(twoAuthors.measures[1]!, solo)).toBeGreaterThan(0);
    expect(setSolo(solo, null).soloAuthor).toBeNull();
  });
});
