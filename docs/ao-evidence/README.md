# AO evidence pack

**Run:** `qp-20260812T172446Z-d32d1d19`  
**Why this folder exists:** Criterion #1 is proof we used [Agent Orchestrator](https://aoagents.dev/) as the coding workspace. The demo video **must** show the AO board / sessions. This pack is the still-frame backup a judge can open offline if the video compresses the UI.

AO is **not installed** on the build machine as of 2026-08-12 (see `docs/ao-usage.md`). Every screenshot below is a **capture TODO**. Slots are `.gitkeep` placeholders.

Also drop finished PNGs into `public/ao-proof/` so Overture can display them in-app without a network.

---

## Shot list (capture after AO is running)

Film in this order so the demo script can cut 1:1.

### A. Kanban / board — `screenshots/kanban/`

| File to save | What must be readable | Why |
| --- | --- | --- |
| `01-board-overview.png` | Full AO window. Sidebar shows project **The Orchestra**. Center board shows columns **Pending Work / Iterating / In Review / Ready to merge** (Archive optional). | Establishing shot. This *is* the required “show the Kanban.” |
| `02-board-this-project-cards.png` | Cards named for this repo: `plan-overture`, `research-rules`, `exec-overture`, `overwatch`, plus at least one inner card (`ao-evidence` or `engine-score`). Branch names visible (`ao/…` or session branch). | Proves the board is *ours*, not a stock landing-page mock. |
| `03-board-columns-close.png` | Crop of two columns with status chrome (agent name, branch, PR/CI if any). | Readable on a phone when the X video is tiny. |

**Framing notes:** 16:9, full window, not a cropped hero GIF. Increase display resolution before capture. Do not cover the board with the Overture browser preview for shot 01.

### B. Session list — `screenshots/sessions/`

| File to save | What must be readable | Why |
| --- | --- | --- |
| `01-sidebar-sessions.png` | Sidebar list of worker + orchestrator sessions for this project. | “Parallel sessions” proof. |
| `02-session-chat-or-tui.png` | One session open (Chat preferred — `tmux` is not installed). Prompt or transcript mentions Overture / Salt Stave / this path. | Shows a live agent, not an empty shell. |
| `03-session-inspector.png` | Inspector: files changed, optional PR, browser preview of `http://127.0.0.1:5173` if the app is up. | Ties AO to the working demo. |

### C. Worktrees — `screenshots/worktrees/`

| File to save | What must be readable | Why |
| --- | --- | --- |
| `01-ao-worktrees-ui.png` | Any AO UI that shows the session worktree / branch path. | Isolated workspaces are AO’s whole point. |
| `02-git-worktree-list.png` | Terminal: `git worktree list` from the quoted project path, multiple checkouts. | Independent of AO chrome; survives if the UI is redesigned. |
| `03-finder-or-path.png` | Finder or `pwd` showing a session worktree still under this project / `~/.ao` worktree store. | Path-spacing evidence (`Coding  Compete`). |

Suggested terminal for shot C2 (quote the path):

```bash
git -C "/Volumes/Seagate/Coding  Compete/projects/The Orchestra" worktree list
git -C "/Volumes/Seagate/Coding  Compete/projects/The Orchestra" branch -vv
```

---

## Naming and format

- PNG, sRGB, no mockups, no Figma stand-ins.
- Filenames exactly as in the tables so `docs/demo-script.md` and `public/ao-proof/` can stay in sync.
- Optional: a 5–8 second screen recording `screenshots/kanban/board-pan.mov` for the X/LinkedIn cut.

---

## Checklist

- [ ] AO desktop installed; `~/.ao` exists
- [ ] This folder is a git repo and an AO project
- [ ] Four role sessions + at least one inner session visible
- [ ] `screenshots/kanban/01-board-overview.png`
- [ ] `screenshots/kanban/02-board-this-project-cards.png`
- [ ] `screenshots/kanban/03-board-columns-close.png`
- [ ] `screenshots/sessions/01-sidebar-sessions.png`
- [ ] `screenshots/sessions/02-session-chat-or-tui.png`
- [ ] `screenshots/sessions/03-session-inspector.png`
- [ ] `screenshots/worktrees/01-ao-worktrees-ui.png`
- [ ] `screenshots/worktrees/02-git-worktree-list.png`
- [ ] `screenshots/worktrees/03-finder-or-path.png`
- [ ] Copies in `public/ao-proof/`
- [ ] Demo video opens on the board before Overture audio

**Current gap:** every box above is unchecked. The product corpus in `fixtures/overture.json` can still be replayed offline; AO proof cannot.
