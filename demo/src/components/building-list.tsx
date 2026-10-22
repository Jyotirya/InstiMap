import * as React from "react";
import { Building2, ChevronRight, X } from "lucide-react";

import { PALETTE } from "../../../src/style";
import type { BuildingGroup } from "@/lib/building-groups";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BuildingListProps {
  groups: BuildingGroup[];
  /** Building name -> "7 storeys", where known. */
  storeys: Map<string, string>;
  selected: string;
  dark: boolean;
  /** Matches the app's breakpoint: side panel at or above it, bottom sheet below. */
  wideQuery: string;
  onPick: (name: string) => void;
}

const ROOMY = "(min-width: 1024px) and (min-height: 600px)";

/** Every named building, by group. */
export const BuildingList = React.memo(function BuildingList({ groups, storeys, selected, dark, wideQuery, onPick }: BuildingListProps) {
  const [wide, setWide] = React.useState(() => window.matchMedia(wideQuery).matches);
  // open by default only on desktop-sized screens
  const [open, setOpen] = React.useState(() => window.matchMedia(ROOMY).matches);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const openRef = React.useRef<HTMLButtonElement>(null);
  const wasOpen = React.useRef(open);
  const colors = dark ? PALETTE.dark : PALETTE.light;
  const total = groups.reduce((n, g) => n + g.names.length, 0);

  React.useEffect(() => {
    const mq = window.matchMedia(wideQuery);
    const onChange = (e: MediaQueryListEvent) => {
      setWide(e.matches);
      setOpen(e.matches && window.matchMedia(ROOMY).matches);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [wideQuery]);

  // return focus to the Buildings button after the list closes
  React.useEffect(() => {
    if (wasOpen.current && !open) openRef.current?.focus({ preventScroll: true });
    wasOpen.current = open;
  }, [open]);

  React.useEffect(() => {
    if (!open || wide) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, wide]);

  const pick = (name: string) => {
    onPick(name);
    // below desktop size, close after a pick so the map shows it
    if (!window.matchMedia(ROOMY).matches) setOpen(false);
  };

  if (!open) {
    return (
      <Button
        ref={openRef}
        variant="outline"
        className="absolute z-10 h-11 rounded-full bg-card px-4 shadow-lg sm:h-9 sm:rounded-md pointer-coarse:h-11"
        style={
          wide
            ? { top: "max(12px, env(safe-area-inset-top))", right: "max(12px, env(safe-area-inset-right))" }
            : { bottom: "calc(max(12px, env(safe-area-inset-bottom)) + 8px)", left: "max(12px, env(safe-area-inset-left))" }
        }
        aria-expanded={false}
        aria-controls="building-list"
        onClick={() => setOpen(true)}
      >
        <Building2 className="size-4" />
        Buildings
      </Button>
    );
  }

  return (
    <>
      {!wide && <div className="fixed inset-0 z-20 bg-black/30" aria-hidden onClick={() => setOpen(false)} />}
      <section
        id="building-list"
        aria-label="All buildings"
        className={cn(
          "z-20 flex flex-col overflow-hidden border bg-card text-card-foreground shadow-lg",
          wide ? "absolute w-[300px] rounded-xl" : "fixed inset-x-0 bottom-0 h-[72dvh] rounded-t-2xl border-b-0",
        )}
        style={
          wide
            ? {
                top: "max(12px, env(safe-area-inset-top))",
                right: "max(12px, env(safe-area-inset-right))",
                // leaves the bottom-right locate and attribution controls clear
                maxHeight: "calc(100dvh - max(12px, env(safe-area-inset-top)) - 120px)",
              }
            : undefined
        }
      >
        {!wide && <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border" aria-hidden />}
        <header className="flex shrink-0 items-center justify-between gap-2 border-b px-4 py-2">
          <div>
            <h2 className="font-display text-base font-semibold leading-tight">Buildings</h2>
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{total} on campus</p>
          </div>
          <Button
            ref={closeRef}
            variant="ghost"
            size="icon"
            className="sm:size-8 pointer-coarse:size-11"
            aria-label="Close building list"
            aria-expanded
            aria-controls="building-list"
            onClick={() => setOpen(false)}
          >
            <X className="size-4" />
          </Button>
        </header>
        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
          style={{ paddingBottom: wide ? 8 : "max(12px, env(safe-area-inset-bottom))" }}
        >
          {groups.map((g) => (
            <details key={g.id} open className="group">
              <summary className="sticky top-0 z-[1] flex min-h-11 cursor-pointer list-none items-center gap-2 bg-card px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground select-none sm:min-h-9 pointer-coarse:min-h-11 [&::-webkit-details-marker]:hidden">
                <ChevronRight className="size-3.5 transition-transform group-open:rotate-90 motion-reduce:transition-none" />
                <span className="size-2.5 rounded-[3px]" style={{ background: colors[g.id] }} aria-hidden />
                {g.label}
                <span className="ml-auto font-mono font-normal tabular-nums">{g.names.length}</span>
              </summary>
              <ul className="px-2 pb-2">
                {g.names.map((name) => {
                  const floors = storeys.get(name);
                  return (
                    <li key={name}>
                      <button
                        type="button"
                        onClick={() => pick(name)}
                        aria-current={name === selected ? "true" : undefined}
                        className={cn(
                          "flex min-h-11 w-full items-center rounded-md px-2 py-1.5 text-left text-sm outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:min-h-8 pointer-coarse:min-h-11",
                          name === selected && "bg-accent font-medium",
                        )}
                      >
                        {name}
                        {floors && (
                          <span className="ml-auto shrink-0 pl-3 font-mono text-[11px] tabular-nums text-muted-foreground">
                            {floors}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </details>
          ))}
        </div>
      </section>
    </>
  );
});
