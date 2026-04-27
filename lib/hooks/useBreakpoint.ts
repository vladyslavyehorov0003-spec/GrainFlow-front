"use client";

import { useEffect, useState } from "react";

export type Breakpoint = "mobile" | "tablet" | "desktop";

const QUERIES = {
  tablet:  "(min-width: 768px)",
  desktop: "(min-width: 1024px)",
} as const;

function read(): Breakpoint {
  if (typeof window === "undefined") return "desktop";
  if (window.matchMedia(QUERIES.desktop).matches) return "desktop";
  if (window.matchMedia(QUERIES.tablet).matches) return "tablet";
  return "mobile";
}

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(read);

  useEffect(() => {
    const tablet  = window.matchMedia(QUERIES.tablet);
    const desktop = window.matchMedia(QUERIES.desktop);
    const update  = () => setBp(read());

    tablet.addEventListener("change", update);
    desktop.addEventListener("change", update);
    update();
    return () => {
      tablet.removeEventListener("change", update);
      desktop.removeEventListener("change", update);
    };
  }, []);

  return bp;
}
