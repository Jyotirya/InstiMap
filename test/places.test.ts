import { describe, expect, it } from "vitest";
import { findPlaceCentroid, PLACE_NAMES } from "../demo/src/lib/places";
import { IITB_FOOD } from "../src/food";

describe("food places", () => {
  it("resolve to their own point and are listed", () => {
    const quantum = IITB_FOOD.features.find((f) => f.properties.name === "Quantum Cafe")!;
    const [x, y] = findPlaceCentroid("quantum cafe")!;
    expect(x).toBeCloseTo(quantum.geometry.coordinates[0], 7);
    expect(y).toBeCloseTo(quantum.geometry.coordinates[1], 7);
    expect(PLACE_NAMES).toContain("Quantum Cafe");
  });
});
