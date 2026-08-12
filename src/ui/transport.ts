import type { OvertureScore } from "../score/types.ts";
import { el } from "./dom.ts";
import { FAMILY_LABEL, initials } from "./format.ts";

export interface TransportApi {
  el: HTMLElement;
  render(model: {
    score: OvertureScore;
    cursor: number;
    playing: boolean;
    tempo: number;
    muted: string[];
    solo: string | null;
  }): void;
}

const PLAY = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.4v11.2L13.2 8 4 2.4z"/></svg>`;
const PAUSE = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.2 2.4h3.2v11.2H3.2zM9.6 2.4h3.2v11.2H9.6z"/></svg>`;

export function createTransport(opts: {
  onTogglePlay: () => void;
  onTempo: (bpm: number) => void;
  onMute: (name: string) => void;
  onSolo: (name: string) => void;
}): TransportApi {
  const play = el("button", {
    class: "attacca",
    type: "button",
    id: "play",
    "aria-pressed": "false",
    "aria-label": "Play",
  });
  play.innerHTML = PLAY;
  play.addEventListener("click", () => opts.onTogglePlay());

  const bar = el("span", { class: "transport__bar", id: "bar-readout" }, ["m. —"]);
  const meta = el("span", { class: "transport__meta" }, ["Attacca · one beat a commit"]);

  const tempoValue = el("label", { for: "tempo" }, ["♩ = 88"]);
  const slider = el("input", {
    id: "tempo",
    type: "range",
    min: "40",
    max: "160",
    value: "88",
    "aria-label": "Tempo in beats per minute",
  });
  slider.addEventListener("input", () => {
    const bpm = Number(slider.value);
    tempoValue.textContent = `♩ = ${bpm}`;
    opts.onTempo(bpm);
  });

  const seats = el("div", { class: "pit-seats", id: "sections", role: "group", "aria-label": "Sections" });

  const root = el("footer", { class: "transport" }, [
    el("div", { class: "transport__desk" }, [
      play,
      el("div", { class: "transport__readout" }, [bar, meta]),
    ]),
    el("div", { class: "transport__tempo" }, [tempoValue, slider]),
    seats,
  ]);

  const render: TransportApi["render"] = (model) => {
    const total = model.score.measures.length;
    const current = total ? model.cursor + 1 : 0;
    bar.textContent = total ? `m.${current}` : "m. —";
    meta.textContent = total
      ? `${current} of ${total} · ${model.score.authors.length} sections`
      : "The pit is empty";
    play.setAttribute("aria-pressed", String(model.playing));
    play.setAttribute("aria-label", model.playing ? "Pause" : "Play");
    play.innerHTML = model.playing ? PAUSE : PLAY;
    slider.value = String(model.tempo);
    tempoValue.textContent = `♩ = ${model.tempo}`;

    seats.replaceChildren();
    for (const author of model.score.authors) {
      const muted = model.muted.includes(author.name);
      const soloed = model.solo === author.name;
      const btn = el("button", {
        class: "seat",
        type: "button",
        "data-family": author.family,
        "aria-pressed": String(muted),
        "data-solo": String(soloed),
        title: soloed
          ? `${author.name} soloed. Double-click to clear solo.`
          : `Mute ${author.name}. Double-click to solo.`,
      }, [
        el("span", { class: "seat__mono" }, [initials(author.name)]),
        el("span", { class: "seat__name" }, [author.name]),
        el("span", { class: "seat__meta" }, [
          `${author.commitCount} bars · ${FAMILY_LABEL[author.family]}`,
        ]),
      ]);
      btn.addEventListener("click", () => opts.onMute(author.name));
      btn.addEventListener("dblclick", (event) => {
        event.preventDefault();
        opts.onSolo(author.name);
      });
      seats.append(btn);
    }
  };

  return { el: root, render };
}
