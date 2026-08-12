import "./styles/museum.css";
import { mountMuseum } from "./ui/museum.ts";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("Lost Movement: #app is missing");
mountMuseum(app);
