import { el } from "./dom.ts";

export function createEmptyState(onOpen: () => void): HTMLElement {
  const stand = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  stand.setAttribute("class", "empty__stand");
  stand.setAttribute("viewBox", "0 0 72 88");
  stand.setAttribute("aria-hidden", "true");
  stand.innerHTML = `
    <path d="M18 22h36l-6 18H24L18 22z" fill="none" stroke="#c9a45c" stroke-width="1.4"/>
    <path d="M22 26h28" stroke="#c9a45c" stroke-opacity=".45"/>
    <path d="M23 31h26M24 36h24" stroke="#edd9a0" stroke-opacity=".35"/>
    <path d="M36 40v30M18 78h36" stroke="#c9a45c" stroke-width="1.4"/>
    <circle cx="36" cy="72" r="3" fill="#c9a45c"/>
  `;

  const go = el("button", { class: "btn", type: "button" }, ["Open the lantern week"]);
  go.addEventListener("click", onOpen);

  return el("div", { class: "empty", hidden: "" }, [
    el("div", { class: "empty__card" }, [
      stand,
      el("h2", {}, ["The house is dark"]),
      el("p", {}, [
        "Drop a git history — or raise the lights on a week that already happened.",
      ]),
      go,
      el("p", { class: "empty__hint" }, ["JSON score · git log --numstat · nowhere leaves this machine"]),
    ]),
  ]);
}
