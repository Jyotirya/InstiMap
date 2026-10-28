import type { Feature, Polygon } from "geojson";
import { IITB_BUILDINGS, IITB_FOOD, FOOD_NAMES, buildingCentroid, inCampusBbox, type Route, type RoutingProfile } from "../../../src/index";
import { decodeDigipin } from "./digipin";

export const MY_LOCATION_LABEL = "My current location";
export const SITE_TITLE = "InstiMap";
/** Start/destination markers and the selected route line, in the app and in link previews. */
export const MARKER_COLORS = { start: "#16a34a", end: "#dc2626", route: "#2563eb" } as const;

// ponytail: food places as ~4 m squares, so they share, route and preview like buildings
const FOOD_SQUARES: Feature<Polygon>[] = IITB_FOOD.features.map((f) => {
  const [x, y] = f.geometry.coordinates, d = 2e-5;
  const ring = [[x - d, y - d], [x + d, y - d], [x + d, y + d], [x - d, y + d], [x - d, y - d]];
  return { type: "Feature", properties: f.properties, geometry: { type: "Polygon", coordinates: [ring] } };
});

/** A building, else a food place, by name (any case). */
export function findPlace(name: string): Feature<Polygon> | undefined {
  const key = name.trim().toLowerCase();
  const named = (f: Feature) => f.properties?.name?.toLowerCase() === key;
  return (IITB_BUILDINGS.features.find(named) as Feature<Polygon> | undefined) ?? FOOD_SQUARES.find(named);
}

/** Buildings first, so a shared name resolves to the building. */
export const PLACE_NAMES = [...new Set([
  ...IITB_BUILDINGS.features.flatMap((f) => (f.properties?.name ? [f.properties.name as string] : [])),
  ...FOOD_NAMES,
])];

export function findPlaceCentroid(name: string): [number, number] | undefined {
  const feature = findPlace(name);
  return feature ? buildingCentroid(feature) : undefined;
}

/** A building or food place name, or an on-campus DIGIPIN, as [lng, lat]. */
export function resolvePlace(value: string): [number, number] | undefined {
  const place = findPlaceCentroid(value);
  if (place) return place;
  const pin = decodeDigipin(value);
  return pin && inCampusBbox(pin[1], pin[0]) ? pin : undefined;
}

export function formatRouteInfo(route: Route, profile: RoutingProfile, sep = ", "): string {
  const km = route.distanceMeters / 1000;
  const speedKmh = profile === "walk" ? 5 : 20;
  const minutes = Math.round((km / speedKmh) * 60);
  return `${km.toFixed(2)} km${sep}~${minutes} min ${profile === "walk" ? "walking" : "driving"}`;
}
