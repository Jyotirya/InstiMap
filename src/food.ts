import type { CircleLayerSpecification, Map as MaplibreMap, SymbolLayerSpecification } from "maplibre-gl";
import type { FeatureCollection, Point } from "geojson";
import food from "./iitb-food.json";
import { MAP_BG, MAP_BG_DARK } from "./geo";

/** Named food places on campus, as points, with floor ("1st floor") where known. */
export const IITB_FOOD = food as FeatureCollection<Point, { name: string; amenity: string; floor?: string }>;

export const FOOD_SOURCE_ID = "food";
export const FOOD_DOT_LAYER_ID = "food-dot";
export const FOOD_LABEL_LAYER_ID = "food-label";
/** Below this zoom the dots would crowd the campus. */
export const FOOD_MIN_ZOOM = 15;

/** Berry: clear of the red destination pin, the yellow main roads and the building fills. */
export const FOOD_COLORS = {
  light: { dot: "#b4407a", text: "#8a2c5c", halo: MAP_BG, ring: "#ffffff" },
  dark: { dot: "#e07aae", text: "#f0a8cb", halo: MAP_BG_DARK, ring: MAP_BG_DARK },
} as const;

/** A building with one of these names is labelled by the food layer. */
export const FOOD_NAMES = IITB_FOOD.features.map((f) => f.properties.name);

export function foodLayers(opts: { dark?: boolean } = {}): [CircleLayerSpecification, SymbolLayerSpecification] {
  const c = FOOD_COLORS[opts.dark ? "dark" : "light"];
  return [
    {
      id: FOOD_DOT_LAYER_ID,
      type: "circle",
      source: FOOD_SOURCE_ID,
      minzoom: FOOD_MIN_ZOOM,
      paint: {
        "circle-color": c.dot,
        "circle-radius": ["interpolate", ["linear"], ["zoom"], FOOD_MIN_ZOOM, 3.5, 18, 6.5],
        "circle-stroke-color": c.ring,
        "circle-stroke-width": 1.5,
      },
    },
    {
      id: FOOD_LABEL_LAYER_ID,
      type: "symbol",
      source: FOOD_SOURCE_ID,
      minzoom: FOOD_MIN_ZOOM + 1,
      layout: {
        // the floor, where known, as a smaller second line
        "text-field": [
          "case", ["has", "floor"],
          ["format", ["get", "name"], {}, "\n", {}, ["get", "floor"], { "font-scale": 0.82 }],
          ["get", "name"],
        ],
        "text-font": ["Inter Regular"],
        "text-size": ["interpolate", ["linear"], ["zoom"], FOOD_MIN_ZOOM + 1, 11, 18, 14],
        "text-max-width": 8,
        // beside the dot, on whichever side is clear
        "text-variable-anchor": ["left", "right", "top", "bottom"],
        "text-radial-offset": 0.7,
        "text-justify": "auto",
      },
      paint: {
        "text-color": c.text,
        "text-halo-color": c.halo,
        "text-halo-width": 1.4,
        "text-halo-blur": 0.2,
      },
    },
  ];
}

export function setFoodLabelsVisible(map: MaplibreMap, visible: boolean): void {
  for (const id of [FOOD_DOT_LAYER_ID, FOOD_LABEL_LAYER_ID]) {
    if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", visible ? "visible" : "none");
  }
}
