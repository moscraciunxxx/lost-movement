# The Salt Stave — bundled Overture corpus

Execute lock (2026-08-12T17:36:40Z): the product is **Overture**, not STAVE.  
Input is **git history**. These files are the baked hall so a judge never sees an empty staff.

## What to load

| File | Role |
| --- | --- |
| `overture.json` | **Primary.** `loadFixture` / `sampleCommits()` — 13 commits, 6 authors |
| `01`–`06` `*.md` | Literary source text (commit bodies / clicked-bar copy) |
| `manifest.json` + `manifest.ts` | Relative-path map for the notes |
| `expected-score.json` | Motif + contradiction map (how the fake history should *feel*) |

## App import (relative only)

From `src/` (bundled — preferred, works offline after `npm run build`):

```ts
import { sampleCommits, OVERTURE_PUBLIC_URL } from "./fixtures/index.ts";
// sampleCommits() → GitCommit[]  (Lantern week: src/fixtures/overture/history.json)
// OVERTURE_PUBLIC_URL === "/fixtures/overture/history.json"
// Salt Stave alternate: /fixtures/overture.json
```

Same-origin fetch (Vite serves `public/fixtures/`):

```ts
const commits = loadFixture(await (await fetch("/fixtures/overture.json")).json());
```

Do **not** fetch GitHub raw. Do **not** hard-code `/Volumes/Seagate/Coding  Compete/...`.

## Why the history slaps

Six witnesses keep naming the same objects and then denying them. The engine should hear that:

| Bar | Author | What you should hear |
| --- | --- | --- |
| 1–3 | Ada / Jules | Warm hall: strings (md) + brass (`pitch.ts`) + woodwinds (html/css) |
| 5, 8 | Nico | `conflicted: true` → tension ≥ 0.8 (A432 vs A440; no inland lighthouse) |
| 6 | Mira | Woodwinds (`tide.yml`); “tide never reaches” |
| 9 | Rowan | Huge delete of `conservatory.html` — loudest bar |
| 10, 13 | Ada / Ilya | Merges → cadence (mid tension, not max) |
| 11 | Jules | Percussion thud (`package-lock.json`, `mark.png`) |

Mute Nico: the grind bars go quiet; the hall changes.

If `01-plan.md` replaces Overture, delete or swap this folder so the corpus matches the plan.
