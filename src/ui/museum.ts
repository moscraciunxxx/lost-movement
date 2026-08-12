import { tonightAttic } from "../engine/fixture.ts";
import { recordsFromFixture } from "../engine/ingest.ts";
import { curateSeven } from "../engine/curate.ts";
import { readLastShow, writeLastShow } from "../engine/storage.ts";
import type { Exhibition } from "../types.ts";

type Screen = "foyer" | "room" | "catalogue" | "colophon";

function roman(n: number): string {
  const table = ["I", "II", "III", "IV", "V", "VI", "VII"];
  return table[n] ?? String(n + 1);
}

export function mountMuseum(root: HTMLElement): void {
  let screen: Screen = "foyer";
  let show: Exhibition | null = readLastShow(typeof localStorage === "undefined" ? null : localStorage);
  let index = 0;
  let typed = "";

  const render = (): void => {
    if (screen === "foyer") renderFoyer();
    else if (screen === "room" && show) renderRoom();
    else if (screen === "catalogue" && show) renderCatalogue();
    else renderColophon();
  };

  const openAttic = (next: Exhibition): void => {
    show = next;
    index = 0;
    typed = "";
    writeLastShow(typeof localStorage === "undefined" ? null : localStorage, next);
    screen = "room";
    render();
    typeExcerpt();
  };

  const typeExcerpt = (): void => {
    const exhibit = show?.exhibits[index];
    if (!exhibit) return;
    typed = "";
    const target = exhibit.excerpt;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      typed = target;
      const node = root.querySelector("[data-excerpt]");
      if (node) node.textContent = typed;
      return;
    }
    let i = 0;
    const tick = (): void => {
      typed = target.slice(0, i);
      const node = root.querySelector("[data-excerpt]");
      if (node) node.textContent = typed;
      i += 1;
      if (i <= target.length) window.setTimeout(tick, 18);
    };
    tick();
  };

  function renderFoyer(): void {
    const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    root.dataset.testid = "state-foyer";
    root.innerHTML = `
      <section class="foyer" data-testid="state-foyer">
        <p class="tag">${date}</p>
        <h1 class="lockup">Lost Movement</h1>
        <p class="tag">A museum of the work you never finished</p>
        <button type="button" data-testid="btn-attic" id="attic">Tonight’s attic</button>
        <label class="drop">Or hang a local folder
          <input id="folder" type="file" webkitdirectory multiple class="sr-only" />
        </label>
        ${show ? `<p class="drop">Last exhibition still on the wall.</p><button type="button" id="resume">Resume</button>` : ""}
      </section>
    `;
    root.querySelector("#attic")?.addEventListener("click", () => openAttic(tonightAttic()));
    root.querySelector("#resume")?.addEventListener("click", () => {
      if (show) {
        screen = "room";
        render();
        typeExcerpt();
      }
    });
    root.querySelector<HTMLInputElement>("#folder")?.addEventListener("change", async (event) => {
      const files = (event.target as HTMLInputElement).files;
      if (!files?.length) return;
      const specs = [];
      for (const file of [...files].slice(0, 200)) {
        const path = file.webkitRelativePath || file.name;
        const text = await file.text().catch(() => "");
        specs.push({ path, text, mtimeMs: file.lastModified });
      }
      openAttic(curateSeven(recordsFromFixture({ files: specs }), Date.now(), "folder"));
    });
  }

  function renderRoom(): void {
    const exhibit = show!.exhibits[index];
    if (!exhibit) {
      screen = "foyer";
      render();
      return;
    }
    root.innerHTML = `
      <section class="room" data-testid="room-stage">
        <div>
          <div class="lamp" aria-hidden="true"></div>
          <article class="plaque" data-testid="plaque">
            <p class="index">${roman(index)} / ${roman(show!.exhibits.length - 1)}</p>
            <h1 class="plaque-title">${escapeHtml(exhibit.plaqueTitle)}</h1>
            <p class="plaque-date">${escapeHtml(exhibit.plaqueDateLine)}</p>
            <p class="coda">${escapeHtml(exhibit.coda)}</p>
            <p class="excerpt" data-excerpt></p>
            <span class="stamp">UNFINISHED</span>
          </article>
        </div>
        <nav class="nav">
          <button type="button" id="prev">Previous</button>
          <button type="button" id="cat">Catalogue</button>
          <button type="button" id="next">Next</button>
        </nav>
      </section>
    `;
    root.querySelector("#prev")?.addEventListener("click", () => step(-1));
    root.querySelector("#next")?.addEventListener("click", () => step(1));
    root.querySelector("#cat")?.addEventListener("click", () => {
      screen = "catalogue";
      render();
    });
    const node = root.querySelector("[data-excerpt]");
    if (node) node.textContent = typed;
  }

  function renderCatalogue(): void {
    const entries = show!.exhibits
      .map(
        (exhibit, i) => `
        <article class="entry">
          <h2>${roman(i)}. ${escapeHtml(exhibit.plaqueTitle)}</h2>
          <p>${escapeHtml(exhibit.plaqueDateLine)} — ${escapeHtml(exhibit.coda)}</p>
          <p>${escapeHtml(exhibit.excerpt)}</p>
        </article>`,
      )
      .join("");
    root.innerHTML = `
      <section class="catalogue" data-testid="catalogue">
        <p class="tag">House program</p>
        <h1>Lost Movement</h1>
        ${entries}
        <p class="colophon-line">Nothing left this machine.</p>
        <nav class="nav">
          <button type="button" id="back">Back to the rooms</button>
          <button type="button" id="print">Print</button>
          <button type="button" id="about">Colophon</button>
        </nav>
      </section>
    `;
    root.querySelector("#back")?.addEventListener("click", () => {
      screen = "room";
      render();
      typeExcerpt();
    });
    root.querySelector("#print")?.addEventListener("click", () => window.print());
    root.querySelector("#about")?.addEventListener("click", () => {
      screen = "colophon";
      render();
    });
  }

  function renderColophon(): void {
    root.innerHTML = `
      <section class="colophon foyer">
        <h1 class="lockup">Colophon</h1>
        <p>Files hang here because they are old, named like drafts, incomplete, or unmentioned by their siblings. Nothing is uploaded. The score is a weighted sum you can read on the plaque.</p>
        <button type="button" id="home">Foyer</button>
      </section>
    `;
    root.querySelector("#home")?.addEventListener("click", () => {
      screen = "foyer";
      render();
    });
  }

  const step = (delta: number): void => {
    if (!show) return;
    index = (index + delta + show.exhibits.length) % show.exhibits.length;
    typed = "";
    render();
    typeExcerpt();
  };

  window.addEventListener("keydown", (event) => {
    if (event.target instanceof HTMLInputElement) return;
    if (event.key === "ArrowRight" || event.key === " ") {
      event.preventDefault();
      if (screen === "foyer") openAttic(tonightAttic());
      else if (screen === "room") step(1);
    }
    if (event.key === "ArrowLeft" && screen === "room") {
      event.preventDefault();
      step(-1);
    }
    if (event.key === "Escape") {
      screen = "foyer";
      render();
    }
    if (event.key === "p" || event.key === "P") {
      if (show) {
        screen = "catalogue";
        render();
      }
    }
  });

  render();
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
