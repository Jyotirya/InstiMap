import { describe, expect, it } from "vitest";
import { groupBuildings, groupOf } from "../demo/src/lib/building-groups";
import { IITB_BUILDINGS } from "../src/buildings";

describe("groupBuildings", () => {
  it("orders groups Academic, Hostels, Residential, Other and sorts names naturally", () => {
    const groups = groupBuildings([
      { name: "Hostel 10", building: "dormitory" },
      { name: "Hostel 2", building: "yes" },
      { name: "B-2 (7-10)", building: "apartments" },
      { name: "Central Library", building: "university" },
      { name: "Aerospace Department", building: "university" },
      { name: "Main Power House", building: "service" },
    ]);
    expect(groups.map((g) => g.label)).toEqual(["Academic", "Hostels", "Residential", "Other"]);
    expect(groups[0].names).toEqual(["Aerospace Department", "Central Library"]);
    expect(groups[1].names).toEqual(["Hostel 2", "Hostel 10"]);
  });

  it("uses the name when OSM only says building=yes", () => {
    expect(groupOf("Nandan Nilekani Main Building", "yes")).toBe("academic");
    expect(groupOf("Hostel 12", "yes")).toBe("hostel");
    expect(groupOf("SAC", "yes")).toBe("building");
  });

  it("lists every bundled building exactly once", () => {
    const input = IITB_BUILDINGS.features.map((f) => ({ name: f.properties!.name, building: f.properties!.building }));
    const listed = groupBuildings(input).flatMap((g) => g.names);
    expect(listed.length).toBe(new Set(input.map((b) => b.name)).size);
  });
});
