import type { FoodProps } from "../../../src/index";

const https = (url: string | undefined) => (url?.startsWith("https://") ? url : undefined);

/** Popup body for a food place: name, floor and hours, then its ordering app's store links. */
export function foodPopup(p: FoodProps): HTMLElement {
  const root = document.createElement("div");
  root.className = "food-popup";
  const line = (text: string, className = "") => {
    const el = root.appendChild(document.createElement("div"));
    el.textContent = text;
    el.className = className;
    return el;
  };
  line(p.name, "font-medium");
  for (const text of [p.floor, p.hours]) if (text) line(text, "text-muted-foreground");
  if (p.app) {
    const links = [["Android", https(p.android)], ["iOS", https(p.ios)]].filter((l): l is [string, string] => !!l[1]);
    const app = line(`Order on ${p.app}${links.length ? ": " : ""}`);
    links.forEach(([label, href], i) => {
      if (i) app.append(" · ");
      const a = app.appendChild(document.createElement("a"));
      Object.assign(a, { href, target: "_blank", rel: "noopener", textContent: label });
    });
  }
  return root;
}
