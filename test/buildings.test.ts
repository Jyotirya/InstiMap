import { describe, expect, it } from "vitest";
import type { Feature, Polygon } from "geojson";
import { buildingCentroid, buildingLabelLayer, BUILDINGS_SOURCE_ID, IITB_BUILDINGS, storeysByName } from "../src/buildings";

describe("IITB_BUILDINGS", () => {
  it("is a non-empty FeatureCollection", () => {
    expect(IITB_BUILDINGS.type).toBe("FeatureCollection");
    expect(IITB_BUILDINGS.features.length).toBeGreaterThan(0);
  });
});

describe("buildingCentroid", () => {
  it("stays exact for a few-metre polygon at campus coordinates", () => {
    const [x, y, d] = [72.9165831, 19.1253176, 2e-5];
    const square: Feature<Polygon> = {
      type: "Feature",
      properties: {},
      geometry: { type: "Polygon", coordinates: [[[x - d, y - d], [x + d, y - d], [x + d, y + d], [x - d, y + d], [x - d, y - d]]] },
    };
    const [cx, cy] = buildingCentroid(square);
    expect(Math.abs(cx - x)).toBeLessThan(1e-9);
    expect(Math.abs(cy - y)).toBeLessThan(1e-9);
  });
});

describe("buildingLabelLayer", () => {
  it("reads from the buildings source and labels by name", () => {
    const layer = buildingLabelLayer();
    expect(layer.source).toBe(BUILDINGS_SOURCE_ID);
    const field = layer.layout?.["text-field"] as unknown[];
    expect(field.slice(0, 3)).toEqual(["step", ["zoom"], ["get", "name"]]); // name alone until zoomed in
  });

  it("uses a different text color for dark mode", () => {
    const light = buildingLabelLayer({ dark: false });
    const dark = buildingLabelLayer({ dark: true });
    expect(light.paint?.["text-color"]).not.toBe(dark.paint?.["text-color"]);
  });
});

describe("storeysByName", () => {
  it("words known storeys, marking housing-listing minimums with a plus", () => {
    const storeys = storeysByName();
    expect(storeys.get("Hostel 17")).toBe("9 storeys");
    expect([...storeys.values()].every((s) => /^\d+\+? storeys?$/.test(s))).toBe(true);
    expect([...storeys.values()].some((s) => s.includes("+"))).toBe(true);
  });
});
