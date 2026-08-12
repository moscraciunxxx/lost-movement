# Lost Movement

A museum of the work you never finished.

Click **Tonight’s attic**. A filament finds a brass plaque. The first sentence types on and **stops mid-line**. Seven rooms. No trash. Nothing leaves the machine.

Built for [The Orchestra](https://ao-orchestra.devpost.com). **Lost Movement is not an agent dashboard and not a clone of AO.** Agent Orchestrator is how it was built. The piece is a museum.

> Built *in* [Agent Orchestrator](https://aoagents.dev/) (aoagents.dev), **not** Arweave AO.

---

## What it does

Lost Movement is a **local-first** Vite studio. No account, no cloud, no model API.

1. Load the committed fixture (`fixtures/lost-attic/`) or drop a folder of drafts.
2. Each text file gets an **abandonment score**: recency, filename cues (`untitled`, `draft`, `final_final`, `wip`), incompleteness (TODO, mid-sentence last line), isolation (no sibling mentions it).
3. A curator hangs **at most seven** exhibits, diversified by wing (manuscript, unsent letter, unbuilt project, notes, photograph, vows, remnant).
4. You walk **one room at a time**. Keyboard ←/→, Space, Esc, P for the catalogue.
5. The **House Program** is a printable catalogue of the same seven. Colophon: *Nothing left this machine.*

The surprise is not “AI cleaned your Downloads.” The surprise is that the disk already has a lost movement — the symphony that was written and withdrawn.

---

## How to run

Requires **Node.js 20+**.

```bash
cd "/Volumes/Seagate/Coding  Compete/projects/The Orchestra"
source ./scripts/dev-env.sh   # if node is not on PATH
npm install
npm test
npm run dev
```

Open `http://127.0.0.1:5173`. Click **Tonight’s attic**.

```bash
npm run build
npm run preview
```

---

## What was built with AO

**Agent Orchestrator** is the coding workspace. This repo was planned, delegated, implemented, and reviewed as a swarm (Research / Design / Execute / Overwatch plus inner agents).

Criterion #1 is proof the team used AO’s **Kanban / sessions**. The demo video must open the live AO board — not this quad-pipeline TUI.

- Workflow log: [`docs/ao-usage.md`](docs/ao-usage.md)
- Screenshot slots: [`docs/ao-evidence/`](docs/ao-evidence/)
- 90-second script: [`docs/demo-script.md`](docs/demo-script.md)

AO desktop was **not installed** on the build machine at ship time. Installing it and filming the board is a required human step.

---

## Demo / live links

Official entry is **Discord `#orchestra-project-showcase` + a public X/LinkedIn post**. Devpost is secondary.

| Artifact | Status |
| --- | --- |
| Public GitHub | **TODO** |
| Demo video (must show AO Kanban) | **TODO** — [`docs/demo-script.md`](docs/demo-script.md) |
| X | [`docs/submission/x-post.md`](docs/submission/x-post.md) |
| LinkedIn | [`docs/submission/linkedin-post.md`](docs/submission/linkedin-post.md) |
| Discord | [`docs/submission/discord-showcase.md`](docs/submission/discord-showcase.md) |
| Devpost | [`docs/submission/devpost.md`](docs/submission/devpost.md) |

Hard stop: **13 August 2026, 19:00 IST** (13:30 UTC).

---

## Submission reminders (humans only)

1. Register on [Lu.ma](https://luma.com/iw1v5erp).
2. Spider emoji in `#orchestra-announcements`.
3. Install AO from [aoagents.dev/download](https://aoagents.dev/download/), add this repo, spawn Kanban cards.
4. Public GitHub + 90s video that **shows the AO Kanban**.
5. X/LinkedIn with `#agentorchestrator` `@aoagents` `@agent_wrapper`.
6. Discord `#orchestra-project-showcase`.
