import { useState } from "react";

export function usePagedState(
  filterDeps: readonly unknown[],
): [number, (page: number) => void] {
  const [page, setPage] = useState(0);
  const [prevDeps, setPrevDeps] = useState(filterDeps);
  if (
    filterDeps.length !== prevDeps.length ||
    filterDeps.some((d, i) => !Object.is(d, prevDeps[i]))
  ) {
    setPrevDeps(filterDeps);
    setPage(0);
  }
  return [page, setPage];
}
