import { useState, useEffect, useCallback } from "react";
import { getSilos, SiloFilterParams, SiloResponse } from "@/lib/silo";
import { SpringPage } from "@/lib/workers";

export function useSilos(params?: SiloFilterParams) {
  const [data, setData] = useState<SpringPage<SiloResponse>>({ content: [], totalPages: 0, totalElements: 0, number: 0, size: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const { culture, page, size, sort } = params ?? {};

  useEffect(() => {
    let cancelled = false;

    getSilos({ culture, page, size, sort })
      .then((p) => { if (!cancelled) { setData(p); setIsLoading(false); } })
      .catch(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [culture, page, size, sort, refetchTrigger]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setRefetchTrigger((t) => t + 1);
  }, []);

  return { data, isLoading, refetch };
}
