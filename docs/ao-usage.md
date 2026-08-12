# What we built with Agent Orchestrator

**Product:** Lost Movement  
**Hackathon:** The Orchestra  
**AO:** [aoagents.dev](https://aoagents.dev/) — **not** Arweave AO  
**AO version:** 0.12.3 (stable, Apple silicon)  
**Recorded:** 2026-08-12, Vitalie’s MacBook Pro, live AO window

AO is the **workspace**. Lost Movement is the **object**. The demo video must show this desktop app. The Grok quad-pipeline TUI is **not** AO.

## Install

| Item | Value |
| --- | --- |
| App | `/Applications/Agent Orchestrator.app` |
| CLI | `~/.local/bin/ao` |
| Data | `~/.ao/` |
| Project id | `lost-movement` |
| Path | `/Volumes/Seagate/Coding  Compete/projects/The Orchestra` |
| Worker harness on tape | Claude Code Chat (Opus 4.8). Grok TUI needs `tmux`, which is not installed. |

## Board (photographed)

Project **Lost Movement** is selected. Sidebar shows three orange session dots plus **Scratch**. Top-right bell shows **3**. No pull request on any card.

| Session id | Board name | Harness | CLI status | What the window showed |
| --- | --- | --- | --- | --- |
| `lost-movement-1` | **ao-proof** | claude-code | `needs_input` / `waiting_input` | Prompt: update `docs/ao-usage.md` and stop. Agent read the file, said the Local AO status section was outdated, produced **1 file changed +9/−8**. Composer: Working ~11m 43s. Activity: **Input Needed** → Created workspace. Still: `docs/ao-evidence/screenshots/sessions/lost-movement-1-ao-proof.jpg` |
| `lost-movement-2` | **lost-attic** | claude-code | `needs_input` / `waiting_input` | Prompt: confirm Tonight’s attic / Untitled document (3). Ran 1 command + 5 tools, then 2 commands (**1 failed**). Checking curation of exhibit index 0. Composer: Working ~11m 48s. Activity: **Input Needed**. Still: `…/lost-movement-2-lost-attic.jpg` |
| `lost-movement-3` | **npm-tests** | claude-code | `needs_input` / `waiting_input` | Prompt: run `npm test`, fix only if red. Said it would run tests; “Ran command”. Composer: Working ~11m 55s. Activity: **Input Needed**. Still: `…/lost-movement-3-npm-tests.jpg` |

Worktrees: `~/.ao/data/worktrees/lost-movement/lost-movement-{1,2,3}` on branches `ao/lost-movement-{1,2,3}/root`.

## What “Needs you” / “Input Needed” is

It is **not** a missing text box. The chat composer is empty on purpose.

AO puts a session in **Needs you** when the derived status is `needs_input`. On this machine that happened right after **Created workspace**. The middle of the window still says **Working** because a turn is in flight. The composer text is:

> Agent is working — this sends when it finishes

So there is nothing to type until the turn ends.

The thing that actually wants a click is **not** the composer:

1. **Bell (3)** in the top-right — open it. That is the notification / permission queue for the three sessions.
2. If a card there says Allow / Approve / Continue, click it.
3. On **ao-proof**, expand **1 file changed** if you want to review the `docs/ao-usage.md` edit. You do not have to merge it.
4. Do **not** press Kill. Do **not** type in the composer while it says Working.

If the bell is empty and the orange **Input Needed** row is the only signal: wait for Working to finish, then leave the three cards on the board. That is enough for the first 12 seconds of the demo tape. You do not owe these agents another prompt.

## How to film

1. Agent Orchestrator window, Lost Movement selected, three orange cards visible (ao-proof, lost-attic, npm-tests).
2. Optional: click one card so the chat + **Input Needed** activity is on screen.
3. Smash cut to `http://127.0.0.1:5173` → Tonight’s attic.
4. Full script: `docs/demo-script.md`
