import { useState } from "react";

export type SortDirection = "asc" | "desc";

export type TableSort<F extends string> = {
  field: F;
  direction: SortDirection;
  toggle: (field: F) => void;
  param: string;
};

export function useTableSort<F extends string>(
  initialField: F,
  initialDirection: SortDirection = "desc",
): TableSort<F> {
  const [field, setField] = useState<F>(initialField);
  const [direction, setDirection] = useState<SortDirection>(initialDirection);

  function toggle(next: F) {
    if (next === field) {
      setDirection((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setField(next);
      setDirection("desc");
    }
  }

  return { field, direction, toggle, param: `${field},${direction}` };
}
