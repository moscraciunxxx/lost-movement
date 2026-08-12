import { explainMeasure, type OvertureScore } from "../score/index.ts";
import { el, escapeHtml, roman } from "./dom.ts";
import { formatWhen, hunkLines, measureKind, shortSha } from "./format.ts";

export interface InspectorApi {
  el: HTMLElement;
  render(score: OvertureScore, cursor: number): void;
}

export function createInspector(): InspectorApi {
  const root = el("aside", {
    class: "program",
    id: "inspector",
    "aria-label": "Program notes for the selected measure",
  });
  const inner = el("div", { class: "program__inner" });
  root.append(inner);

  const render = (score: OvertureScore, cursor: number): void => {
    const commit = score.commits[cursor];
    const measure = score.measures[cursor];
    if (!commit || !measure) {
      root.classList.add("program--empty");
      inner.innerHTML = `
        <p class="program__eyebrow">Program</p>
        <p class="program__measure">—</p>
        <hr class="program__rule" />
        <h2>No bar selected</h2>
        <p class="program__body">Open the house. Every measure is a commit; the paper waits.</p>
      `;
      return;
    }

    root.classList.remove("program--empty");
    const flags = measureKind(commit, measure);
    const flagHtml = flags
      .map((flag) => {
        const kind = flag === "dissonance" ? "flag flag--blood" : "flag flag--cadence";
        return `<span class="${kind}">${flag}</span>`;
      })
      .join("");

    const hunks = commit.files
      .map((file) => {
        const body = hunkLines(file)
          .split("\n")
          .map((line) => {
            if (line.startsWith("+")) return `<span class="add">${escapeHtml(line)}</span>`;
            if (line.startsWith("-")) return `<span class="del">${escapeHtml(line)}</span>`;
            return escapeHtml(line);
          })
          .join("\n");
        return `<span class="path">${escapeHtml(file.path)}  +${file.added} −${file.deleted}</span>${body}`;
      })
      .join("");

    inner.innerHTML = `
      <p class="program__eyebrow">Program · ${escapeHtml(score.title)}</p>
      <p class="program__measure">Measure ${roman(measure.index + 1)}</p>
      <hr class="program__rule" />
      <h2>${escapeHtml(commit.subject)}</h2>
      <p class="program__by">${escapeHtml(explainMeasure(score, cursor)?.headline ?? commit.author)}</p>
      <p class="program__meta">${escapeHtml(shortSha(commit.sha))}${
        commit.timestamp ? ` · ${escapeHtml(formatWhen(commit.timestamp))}` : ""
      } · loud ${measure.loudness.toFixed(2)} · tension ${measure.tension.toFixed(2)}</p>
      <div class="program__flags">${flagHtml}</div>
      <p class="program__body">${escapeHtml(
        commit.body ?? "Every bar is a real commit. Mute a person, the week changes.",
      )}</p>
      <ul class="program__why">${(explainMeasure(score, cursor)?.reasons ?? [])
        .map((reason) => `<li>${escapeHtml(reason)}</li>`)
        .join("")}</ul>
      <div class="hunk">${hunks}</div>
    `;
  };

  return { el: root, render };
}
