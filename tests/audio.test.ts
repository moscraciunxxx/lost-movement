import { describe, expect, it } from "vitest";
import { HallAudio } from "../src/score/audio.ts";
import { EMPTY_FAMILIES } from "../src/score/index.ts";

describe("HallAudio (impure, no AudioContext in node)", () => {
  it("playMeasure and stop do not throw before resume", () => {
    const hall = new HallAudio();
    expect(() => {
      hall.playMeasure({
        index: 0,
        sha: "deadbeef",
        loudness: 0.5,
        tension: 0.2,
        families: { ...EMPTY_FAMILIES, brass: 1 },
        author: "Mira",
      });
      hall.stop();
    }).not.toThrow();
    expect(hall.currentTime).toBe(0);
  });
});
