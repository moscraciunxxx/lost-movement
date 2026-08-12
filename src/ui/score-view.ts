import { FAMILIES, playbackLoudness, type OvertureScore } from "../score/index.ts";
import { el, escapeHtml } from "./dom.ts";
import { FAMILY_COLOR, FAMILY_LABEL, initials } from "./format.ts";

export interface ScoreViewApi {
  el: HTMLElement;
  render(model: {
    score: OvertureScore;
    cursor: number;
    muted: string[];
    solo: string | null;
    playing: boolean;
    onSelect: (index: number) => void;
  }): void;
  scrollToCursor(): void;
}

const LINE = 8;
const STAFF_H = LINE * 4;
const STAFF_GAP = 22;
const LEFT = 108;
const TOP = 36;
const BOTTOM = 34;

export function createScoreView(): ScoreViewApi {
  const piece = el("span", { class: "score__piece" }, ["Untitled"]);
  const counts = el("span", {}, ["0 measures"]);
  const scroll = el("div", { class: "score__scroll", tabindex: "0" });
  const host = el("div", { class: "score", id: "score" }, [
    el("div", { class: "score__ledger" }, [piece, counts]),
    scroll,
  ]);

  const wrap = el("div", { class: "score-wrap" }, [host]);

  for (let i = 0; i < 5; i++) {
    const mote = el("span", { class: "mote", "aria-hidden": "true" });
    mote.style.left = `${12 + i * 18}%`;
    mote.style.bottom = `${8 + (i % 3) * 10}%`;
    mote.style.animationDelay = `${i * 1.4}s`;
    wrap.append(mote);
  }

  const staffY = (familyIndex: number, line: number): number =>
    TOP + familyIndex * (STAFF_H + STAFF_GAP) + line * LINE;

  const render: ScoreViewApi["render"] = (model) => {
    const { score, cursor, muted, solo, onSelect } = model;
    piece.textContent = score.title;
    counts.textContent = `${score.measures.length} measures · ${score.authors.length} sections`;

    const n = Math.max(1, score.measures.length);
    const measureW = Math.max(56, Math.min(76, Math.floor(920 / n) + 28));
    const width = LEFT + n * measureW + 28;
    const height = TOP + FAMILIES.length * STAFF_H + (FAMILIES.length - 1) * STAFF_GAP + BOTTOM;
    wrap.style.setProperty("--score-w", `${width}px`);

    const parts: string[] = [];
    parts.push(`
      <defs>
        <linearGradient id="spot" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#f3e6c0" stop-opacity=".22"/>
          <stop offset="100%" stop-color="#f3e6c0" stop-opacity="0"/>
        </linearGradient>
      </defs>
    `);

    FAMILIES.forEach((family, fi) => {
      const color = FAMILY_COLOR[family];
      const y0 = staffY(fi, 0);
      for (let line = 0; line < 5; line++) {
        const y = staffY(fi, line);
        const opacity = 0.28 + (line % 2) * 0.05;
        parts.push(
          `<line x1="${LEFT}" y1="${y}" x2="${width - 18}" y2="${y}" stroke="${color}" stroke-opacity="${opacity}" stroke-width="1"/>`,
        );
      }
      parts.push(
        `<text x="16" y="${y0 + 22}" fill="${color}" fill-opacity="0.86" font-size="11" font-family="Newsreader, Palatino, serif" letter-spacing="1.8">${FAMILY_LABEL[family].toUpperCase()}</text>`,
      );
      parts.push(
        `<path d="M92 ${y0 + 2} v${STAFF_H - 4} M92 ${y0 + 10} c8 0 8 10 0 10 c8 0 8 10 0 10" fill="none" stroke="${color}" stroke-opacity=".7" stroke-width="1.3"/>`,
      );
    });

    parts.push(
      `<line x1="${LEFT + n * measureW}" y1="${TOP}" x2="${LEFT + n * measureW}" y2="${height - BOTTOM + 6}" stroke="#edd9a0" stroke-opacity=".55" stroke-width="1.6"/>`,
      `<line x1="${LEFT + n * measureW + 4}" y1="${TOP}" x2="${LEFT + n * measureW + 4}" y2="${height - BOTTOM + 6}" stroke="#c9a45c" stroke-opacity=".7" stroke-width="2.4"/>`,
    );

    score.measures.forEach((measure, i) => {
      const x = LEFT + i * measureW;
      const mid = x + measureW / 2;
      const commit = score.commits[i];
      const active = i === cursor;
      const aud = playbackLoudness(measure, muted, solo);
      const author = score.authors.find((a) => a.name === measure.author);
      const authorColor = author ? FAMILY_COLOR[author.family] : "#c9a45c";
      const conflict = measure.conflicted || Boolean(commit?.conflicted) || measure.tension >= 0.8;
      const merge = measure.isMerge || Boolean(commit?.isMerge);

      if (active) {
        parts.push(
          `<rect class="playhead" x="${x}" y="${TOP - 18}" width="${measureW}" height="${height - TOP - 8}" fill="url(#spot)"/>`,
        );
      }

      if (i % 4 === 0 || i === 0) {
        parts.push(
          `<text x="${mid}" y="18" text-anchor="middle" fill="#c9a45c" fill-opacity=".7" font-size="10" font-family="IBM Plex Mono, monospace">${i + 1}</text>`,
        );
      }

      const barOpacity = active ? 0.55 : 0.18;
      parts.push(
        `<line x1="${x}" y1="${TOP}" x2="${x}" y2="${height - BOTTOM + 6}" stroke="#c9a45c" stroke-opacity="${barOpacity}"/>`,
      );

      FAMILIES.forEach((family, fi) => {
        const mix = measure.families[family];
        if (mix < 0.06) return;
        const y = staffY(fi, mix > 0.55 ? 1 : mix > 0.25 ? 2 : 3);
        const r = 3.1 + aud * 5.2 * Math.max(0.35, mix);
        const fill = conflict ? "#8f2d2a" : FAMILY_COLOR[family];
        const opacity = aud <= 0 ? 0.16 : active ? 0.96 : 0.78;
        const rot = -20 + (i % 3) * 3;
        parts.push(
          `<g transform="translate(${mid} ${y}) rotate(${rot})">
            <ellipse rx="${r}" ry="${r * 0.68}" fill="${fill}" fill-opacity="${opacity}"/>
          </g>`,
        );
        if (aud > 0.2) {
          parts.push(
            `<path d="M${mid + r * 0.7} ${y} v${-10 - aud * 14}" stroke="${fill}" stroke-opacity="${opacity}" stroke-width="1.1"/>`,
          );
        }
        if (conflict) {
          parts.push(
            `<ellipse cx="${mid + 5}" cy="${y - 6}" rx="${r * 0.85}" ry="${r * 0.58}" transform="rotate(-18 ${mid + 5} ${y - 6})" fill="#8f2d2a" fill-opacity="${opacity * 0.85}"/>`,
          );
        }
      });

      if (merge) {
        parts.push(
          `<path d="M ${mid - 7} ${TOP - 6} Q ${mid} ${TOP - 16} ${mid + 7} ${TOP - 6}" fill="none" stroke="#c9a45c" stroke-width="1.2"/>
           <circle cx="${mid}" cy="${TOP - 3}" r="1.4" fill="#edd9a0"/>`,
        );
      }

      parts.push(
        `<text x="${mid}" y="${height - 12}" text-anchor="middle" fill="${authorColor}" fill-opacity="${aud <= 0 ? 0.25 : 0.8}" font-size="10" font-family="Fraunces, Palatino, serif">${escapeHtml(initials(measure.author))}</text>`,
      );
      parts.push(
        `<rect class="hit" data-i="${i}" x="${x}" y="${TOP - 20}" width="${measureW}" height="${height - TOP + 8}" fill="transparent" tabindex="0" role="button" aria-label="Measure ${i + 1}, ${escapeHtml(commit?.subject ?? measure.author)}"/>`,
      );
    });

    scroll.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Overture score, ${score.measures.length} measures">${parts.join("")}</svg>`;
    scroll.querySelectorAll<SVGRectElement>("rect.hit").forEach((hit) => {
      const index = Number(hit.dataset.i);
      hit.addEventListener("click", () => onSelect(index));
      hit.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(index);
        }
      });
    });
  };

  const scrollToCursor = (): void => {
    const playhead = scroll.querySelector("rect.playhead");
    playhead?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  return { el: wrap, render, scrollToCursor };
}
