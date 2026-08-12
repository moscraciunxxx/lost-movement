import { sampleCommits } from "../fixtures/index.ts";
import history from "../fixtures/overture/history.json";
import { HallAudio } from "../score/audio.ts";
import {
  GIT_LOG_COMMAND,
  advance,
  audibleLoudness,
  buildScore,
  createTransport as createTransportState,
  loadFixture,
  muteAuthor,
  parseGitLog,
  pause as pauseState,
  play as playState,
  seek,
  setSolo,
  setTempo,
  unmuteAuthor,
  type GitCommit,
  type TransportState,
} from "../score/index.ts";
import { el, isTypingTarget } from "./dom.ts";
import { createEmptyState } from "./empty-state.ts";
import { createInspector } from "./inspector.ts";
import { createMasthead } from "./masthead.ts";
import { mockCommits, shouldUseUiMock } from "./mock-score.ts";
import { createScoreView } from "./score-view.ts";
import { createTransport } from "./transport.ts";

export interface HallHandle {
  destroy(): void;
  play(): void;
  pause(): void;
}

function fixtureCommits(): GitCommit[] {
  return sampleCommits();
}

function fixtureTitle(): string {
  const titled = history as { title?: string };
  return titled.title ?? "Overture";
}

function conflictIndex(commits: GitCommit[]): number {
  const found = commits.findIndex((c) => c.conflicted);
  return found >= 0 ? found : 0;
}

function resetBus(cursor = 0): TransportState {
  return createTransportState({ cursor });
}

export function mount(root: HTMLElement): HallHandle {
  return mountHall(root);
}

export function mountHall(root: HTMLElement): HallHandle {
  const params = new URLSearchParams(location.search);
  const wantEmpty = params.get("empty") === "1";
  const wantPlay = params.get("play") === "1";
  const wantConflict = params.get("conflict") === "1";
  const usingMock = shouldUseUiMock();

  const hallAudio = new HallAudio();
  let commits: GitCommit[] = [];
  let title = fixtureTitle();
  let bus = resetBus();
  let timer: number | null = null;

  const masthead = createMasthead({
    onOpenHouse: () => void openHouse(true),
    onImportFile: (file) => void importFile(file),
    onPaste: () => dialog.showModal(),
  });
  const scoreView = createScoreView();
  const inspector = createInspector();
  const transport = createTransport({
    onTogglePlay: () => {
      if (bus.playing) pause();
      else void start();
    },
    onTempo: (bpm) => {
      bus = setTempo(bus, bpm);
    },
    onMute: (name) => {
      bus = bus.mutedAuthors.includes(name) ? unmuteAuthor(bus, name) : muteAuthor(bus, name);
      if (bus.soloAuthor === name) bus = setSolo(bus, null);
      paint();
    },
    onSolo: (name) => {
      bus = setSolo(bus, bus.soloAuthor === name ? null : name);
      paint();
    },
  });
  const empty = createEmptyState(() => void openHouse(true));
  const veil = el("div", { class: "drop-veil", hidden: "" }, ["Drop a git log or score JSON"]);
  const live = el("div", { class: "live", "aria-live": "polite" });
  const dialog = el("dialog", { class: "paste-dialog" }) as HTMLDialogElement;
  const pasteBox = el("textarea", {
    "aria-label": "Paste git log --numstat",
    spellcheck: "false",
  });
  const applyPaste = el("button", { class: "btn", type: "button" }, ["Raise this log"]);
  const closePaste = el("button", { class: "btn btn--ghost", type: "button" }, ["Close"]);
  applyPaste.addEventListener("click", () => {
    const next = parseGitLog(pasteBox.value);
    if (next.length) {
      commits = next;
      title = "Imported log";
      bus = resetBus();
      dialog.close();
      paint();
    }
  });
  closePaste.addEventListener("click", () => dialog.close());
  dialog.append(
    el("div", { class: "paste-dialog__body" }, [
      el("h2", {}, ["Paste a book of days"]),
      el("p", {}, [GIT_LOG_COMMAND]),
      pasteBox,
      el("div", { class: "paste-dialog__row" }, [closePaste, applyPaste]),
    ]),
  );

  const pit = el("section", { class: "pit", "aria-label": "The pit" }, [
    el("div", { class: "curtain curtain--l", "aria-hidden": "true" }),
    el("div", { class: "curtain curtain--r", "aria-hidden": "true" }),
    empty,
    scoreView.el,
    veil,
  ]);

  const shell = el("div", {
    class: "hall",
    "data-state": "empty",
    "data-ui-mock": String(usingMock),
  }, [
    el("a", { class: "skip-link", href: "#score" }, ["Skip to the score"]),
    masthead.el,
    el("div", { class: "hall__stage" }, [pit, inspector.el]),
    transport.el,
    live,
    dialog,
  ]);

  root.replaceChildren(shell);

  const scoreNow = () => buildScore(commits, title);

  const setState = (state: "empty" | "loading" | "ready" | "playing"): void => {
    if (commits.length === 0) {
      shell.dataset.state = "empty";
      empty.hidden = false;
      return;
    }
    shell.dataset.state = bus.playing ? "playing" : state;
    empty.hidden = true;
  };

  const paint = (): void => {
    const score = scoreNow();
    masthead.setPiece(score.title);
    scoreView.render({
      score,
      cursor: bus.cursor,
      muted: bus.mutedAuthors,
      solo: bus.soloAuthor,
      playing: bus.playing,
      onSelect: (index) => {
        bus = seek(bus, index, score.measures.length);
        paint();
        announce();
      },
    });
    inspector.render(score, bus.cursor);
    transport.render({
      score,
      cursor: bus.cursor,
      playing: bus.playing,
      tempo: bus.tempoBpm,
      muted: bus.mutedAuthors,
      solo: bus.soloAuthor,
    });
    setState(bus.playing ? "playing" : commits.length ? "ready" : "empty");
  };

  const announce = (): void => {
    const score = scoreNow();
    const commit = score.commits[bus.cursor];
    if (!commit) {
      live.textContent = "Empty hall.";
      return;
    }
    live.textContent = `Measure ${bus.cursor + 1}, ${commit.subject}, ${commit.author}`;
  };

  const stopTimer = (): void => {
    if (timer !== null) {
      window.clearTimeout(timer);
      timer = null;
    }
  };

  const pause = (): void => {
    bus = pauseState(bus);
    stopTimer();
    hallAudio.stop();
    paint();
  };

  const tick = async (): Promise<void> => {
    if (!bus.playing) return;
    const score = scoreNow();
    const measure = score.measures[bus.cursor];
    if (!measure) {
      pause();
      return;
    }
    await hallAudio.resume();
    const audible = audibleLoudness(measure, bus);
    if (audible > 0) {
      hallAudio.playMeasure({ ...measure, loudness: audible }, hallAudio.currentTime, 60 / bus.tempoBpm);
    }
    paint();
    announce();
    scoreView.scrollToCursor();
    timer = window.setTimeout(() => {
      const before = bus.cursor;
      bus = advance(bus, score.measures.length);
      if (score.measures.length > 1 && bus.cursor === 0 && before === score.measures.length - 1) {
        pause();
        return;
      }
      void tick();
    }, (60 / bus.tempoBpm) * 1000);
  };

  const start = async (): Promise<void> => {
    if (!commits.length) await openHouse(false);
    if (!commits.length) return;
    if (bus.cursor >= commits.length - 1) bus = seek(bus, 0, commits.length);
    bus = playState(bus);
    setState("playing");
    await tick();
  };

  const openHouse = async (thenPlay: boolean): Promise<void> => {
    setState("loading");
    commits = usingMock ? mockCommits() : fixtureCommits();
    title = usingMock ? "Mock week (UI_MOCK)" : fixtureTitle();
    bus = resetBus(wantConflict ? conflictIndex(commits) : 0);
    paint();
    if (thenPlay || wantPlay) await start();
  };

  const importFile = async (file: File): Promise<void> => {
    const text = await file.text();
    const next = file.name.endsWith(".json")
      ? loadFixture(JSON.parse(text) as unknown)
      : parseGitLog(text);
    if (!next.length) return;
    commits = next;
    title = file.name.replace(/\.[^.]+$/, "");
    bus = resetBus();
    paint();
  };

  const onKey = (event: KeyboardEvent): void => {
    if (isTypingTarget(event.target)) return;
    const count = commits.length;
    if (event.code === "Space") {
      event.preventDefault();
      if (bus.playing) pause();
      else void start();
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      bus = seek(bus, bus.cursor + 1, count);
      paint();
      announce();
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      bus = seek(bus, bus.cursor - 1, count);
      paint();
      announce();
    }
    if (event.key === "Home") {
      event.preventDefault();
      bus = seek(bus, 0, count);
      paint();
    }
    if (event.key === "End") {
      event.preventDefault();
      bus = seek(bus, Math.max(0, count - 1), count);
      paint();
    }
    if (event.key === "Escape" && bus.playing) {
      pause();
    }
  };

  const onDragEnter = (event: DragEvent): void => {
    if (!event.dataTransfer?.types.includes("Files")) return;
    event.preventDefault();
    veil.hidden = false;
  };
  const onDragOver = (event: DragEvent): void => {
    event.preventDefault();
  };
  const onDragLeave = (event: DragEvent): void => {
    if (event.target === shell) veil.hidden = true;
  };
  const onDrop = (event: DragEvent): void => {
    event.preventDefault();
    veil.hidden = true;
    const file = event.dataTransfer?.files?.[0];
    if (file) void importFile(file);
  };

  window.addEventListener("keydown", onKey);
  shell.addEventListener("dragenter", onDragEnter);
  shell.addEventListener("dragover", onDragOver);
  shell.addEventListener("dragleave", onDragLeave);
  shell.addEventListener("drop", onDrop);

  if (wantEmpty) {
    setState("empty");
    paint();
  } else {
    void openHouse(wantPlay);
  }

  return {
    destroy() {
      pause();
      window.removeEventListener("keydown", onKey);
      root.replaceChildren();
    },
    play() {
      void start();
    },
    pause,
  };
}
