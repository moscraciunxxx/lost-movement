/**
 * Visual fallback only. Set `?mock=1` or `data-ui-mock="true"` to force it.
 * Real demo path uses `fixtures/overture/history.json` + `buildScore`.
 */
import type { GitCommit } from "../score/types.ts";

export const UI_MOCK_FLAG = "mock";

export function shouldUseUiMock(): boolean {
  if (typeof location === "undefined") return false;
  return new URLSearchParams(location.search).get(UI_MOCK_FLAG) === "1";
}

export function mockCommits(): GitCommit[] {
  return [
    {
      sha: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      author: "Mira Chen",
      timestamp: 1710003600,
      subject: "light the hall",
      body: "Mock bar. The real lantern week lives in fixtures/overture.",
      files: [{ path: "README.md", added: 12, deleted: 0, patch: "+# Overture\n" }],
      parents: [],
      isMerge: false,
    },
    {
      sha: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      author: "Jules Okonkwo",
      timestamp: 1710007200,
      subject: "gold staves",
      files: [{ path: "src/styles/hall.css", added: 40, deleted: 2, patch: "+.staff{stroke:#c9a45c}\n" }],
      parents: ["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"],
      isMerge: false,
    },
    {
      sha: "cccccccccccccccccccccccccccccccccccccccc",
      author: "Nico Varga",
      timestamp: 1710010800,
      subject: "the other clock",
      body: "Planted conflict for the inspector screenshot.",
      files: [{ path: "src/score/transport.ts", added: 18, deleted: 14, patch: "+export const tempo = 72\n" }],
      parents: ["bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"],
      isMerge: false,
      conflicted: true,
    },
  ];
}
