import type { ExpressionSpecification, Map as MaplibreMap, SymbolLayerSpecification } from "maplibre-gl";
import type { Feature, FeatureCollection, Polygon } from "geojson";
import buildings from "./iitb-buildings.json";
import { MAP_BG, MAP_BG_DARK, MIN_ZOOM } from "./geo";
import { FOOD_NAMES } from "./food";

export const IITB_BUILDINGS = buildings as FeatureCollection;

/** From this zoom labels add the storey count as a smaller second line. */
export const STOREYS_MIN_ZOOM = 17;

/** Building name -> storeys wording; a name on several polygons gets its tallest. */
export function storeysByName(): Map<string, string> {
  return new Map(
    IITB_BUILDINGS.features
      .filter((f) => f.properties?.storeys)
      .sort((a, b) => a.properties!.levels - b.properties!.levels)
      .map((f) => [f.properties!.name as string, f.properties!.storeys as string]),
  );
}

export const BUILDINGS_SOURCE_ID = "buildings";
export const BUILDING_LABEL_LAYER_ID = "building-label";

// Ink on a land-colored halo, so labels read over buildings and lawns alike.
const LABEL_COLOR = { light: "#1d2620", dark: "#e3e9e0" } as const;
const LABEL_HALO = { light: MAP_BG, dark: MAP_BG_DARK } as const;

// a canteen or mess building is labelled by the food layer instead
export const BUILDING_LABEL_FILTER: ExpressionSpecification = ["!", ["in", ["get", "name"], ["literal", FOOD_NAMES]]];

/** Requires a configured glyph URL because the basemap supplies none. */
export function buildingLabelLayer(opts: { dark?: boolean } = {}): SymbolLayerSpecification {
  const theme = opts.dark ? "dark" : "light";
  return {
    id: BUILDING_LABEL_LAYER_ID,
    type: "symbol",
    source: BUILDINGS_SOURCE_ID,
    minzoom: MIN_ZOOM,
    filter: BUILDING_LABEL_FILTER,
    layout: {
      "text-field": [
        "step", ["zoom"], ["get", "name"],
        STOREYS_MIN_ZOOM, ["case", ["has", "storeys"],
          ["format", ["get", "name"], {}, "\n", {}, ["get", "storeys"], { "font-scale": 0.8 }],
          ["get", "name"]],
      ],
      "text-font": ["Inter Regular"],
      "text-size": ["interpolate", ["linear"], ["zoom"], MIN_ZOOM, 11, 18, 16],
      "text-max-width": 8,
      "symbol-avoid-edges": true,
    },
    paint: {
      "text-color": LABEL_COLOR[theme],
      "text-halo-color": LABEL_HALO[theme],
      "text-halo-width": 1.4,
      "text-halo-blur": 0.2,
    },
  };
}

export function setBuildingLabelsVisible(map: MaplibreMap, visible: boolean): void {
  if (map.getLayer(BUILDING_LABEL_LAYER_ID)) {
    map.setLayoutProperty(BUILDING_LABEL_LAYER_ID, "visibility", visible ? "visible" : "none");
  }
}

export function buildingCentroid(feature: Feature<Polygon>): [number, number] {
  const ring = feature.geometry.coordinates[0];
  // raw lng*lat products cancel to noise on small polygons
  const [ox, oy] = ring[0];
  let x = 0;
  let y = 0;
  let area = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const x0 = ring[i][0] - ox, y0 = ring[i][1] - oy;
    const x1 = ring[i + 1][0] - ox, y1 = ring[i + 1][1] - oy;
    const cross = x0 * y1 - x1 * y0;
    area += cross;
    x += (x0 + x1) * cross;
    y += (y0 + y1) * cross;
  }
  area /= 2;
  if (area === 0) return [ox, oy];
  return [ox + x / (6 * area), oy + y / (6 * area)];
}
