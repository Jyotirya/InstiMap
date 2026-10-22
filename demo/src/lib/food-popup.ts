import type { FoodProps } from "../../../src/index";

const MESS_MENU = "https://insti.app/mess";
const https = (url: string | undefined) => (url?.startsWith("https://") ? url : undefined);

/** Popup body for a food place. */
export function foodPopup(p: FoodProps): HTMLElement {
  const root = document.createElement("div");
  root.className = "food-popup";
  const line = (text: string, className = "") => {
    const el = root.appendChild(document.createElement("div"));
    el.textContent = text;
    el.className = className;
    return el;
  };
  const link = (parent: HTMLElement, href: string, textContent: string) =>
    Object.assign(parent.appendChild(document.createElement("a")), { href, target: "_blank", rel: "noopener", textContent });
  line(p.name, "font-medium");
  for (const text of [p.floor, p.hours]) if (text) line(text, "text-muted-foreground");
  if (p.amenity === "mess") link(line(""), MESS_MENU, "Mess menu on InstiApp");
  if (p.app) {
    const links = [["Android", https(p.android)], ["iOS", https(p.ios)]].filter((l): l is [string, string] => !!l[1]);
    const app = line(`Order on ${p.app}${links.length ? ": " : ""}`);
    links.forEach(([label, href], i) => {
      if (i) app.append(" · ");
      link(app, href, label);
    });
  }
  return root;
}
