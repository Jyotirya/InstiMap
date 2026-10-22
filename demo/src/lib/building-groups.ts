import { buildingKind, type BuildingKind } from "../../../src/style";

export type BuildingGroupId = BuildingKind;

export interface BuildingGroup {
  id: BuildingGroupId;
  label: string;
  names: string[];
}

const GROUPS: { id: BuildingGroupId; label: string }[] = [
  { id: "academic", label: "Academic" },
  { id: "hostel", label: "Hostels" },
  { id: "residence", label: "Residential" },
  { id: "building", label: "Other" },
];

// OSM tags many campus buildings plain "yes"; fall back to the name
const ACADEMIC_NAME = /academic|department|\blab\b|laborator|centre|center|library|lecture|main building|school|institute/i;
const HOSTEL_NAME = /^hostel\b/i;

export function groupOf(name: string, tag: unknown): BuildingGroupId {
  if (HOSTEL_NAME.test(name)) return "hostel";
  const kind = buildingKind(tag);
  return kind === "building" && ACADEMIC_NAME.test(name) ? "academic" : kind;
}

const byName = new Intl.Collator("en", { numeric: true, sensitivity: "base" }).compare;

/** Academic, Hostels, Residential, then Other, each alphabetical (Hostel 2 before Hostel 10). */
export function groupBuildings(buildings: { name: string; building?: unknown }[]): BuildingGroup[] {
  // a name can appear on several polygons; list it once, under its most specific group
  const groupByName = new Map<string, BuildingGroupId>();
  for (const b of buildings) {
    const group = groupOf(b.name, b.building);
    const prev = groupByName.get(b.name);
    if (!prev || prev === "building") groupByName.set(b.name, group);
  }
  return GROUPS.map((g) => ({
    ...g,
    names: [...groupByName].filter(([, id]) => id === g.id).map(([name]) => name).sort(byName),
  })).filter((g) => g.names.length > 0);
}
