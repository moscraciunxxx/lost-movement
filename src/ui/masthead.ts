import { el } from "./dom.ts";

export interface MastheadApi {
  el: HTMLElement;
  setPiece(title: string): void;
}

export function createMasthead(opts: {
  onOpenHouse: () => void;
  onImportFile: (file: File) => void;
  onPaste: () => void;
}): MastheadApi {
  const file = el("input", {
    class: "sr-only",
    type: "file",
    accept: ".json,.txt,.log",
    id: "overture-import",
    "aria-label": "Import git log or score JSON",
  });

  const piece = el("p", { class: "masthead__tag" }, [
    "A repository is already an orchestra. You just couldn’t hear it.",
  ]);

  const open = el("button", { class: "btn", type: "button" }, ["Open the house"]);
  open.addEventListener("click", () => opts.onOpenHouse());

  const importBtn = el("button", { class: "btn btn--ghost", type: "button" }, ["Import score"]);
  importBtn.addEventListener("click", () => file.click());
  file.addEventListener("change", () => {
    const next = file.files?.[0];
    if (next) opts.onImportFile(next);
    file.value = "";
  });

  const paste = el("button", { class: "btn btn--ghost", type: "button" }, ["Paste log"]);
  paste.addEventListener("click", () => opts.onPaste());

  const root = el("header", { class: "masthead" }, [
    el("div", { class: "masthead__brand" }, [
      el("p", { class: "masthead__kicker" }, ["Local concert hall · no cloud"]),
      el("h1", { class: "wordmark" }, ["Overture"]),
      piece,
    ]),
    el("div", { class: "masthead__tools" }, [
      el("p", { class: "masthead__venue" }, ["House · local only · space to play"]),
      open,
      importBtn,
      paste,
      file,
    ]),
  ]);

  return {
    el: root,
    setPiece(title: string) {
      piece.textContent = title;
    },
  };
}
