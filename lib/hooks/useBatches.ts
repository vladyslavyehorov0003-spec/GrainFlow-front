import { useState, useEffect, useCallback } from "react";
import { getBatches, BatchFilterParams, BatchResponse } from "@/lib/batch";
import { SpringPage } from "@/lib/workers";

export function useBatches(params?: BatchFilterParams) {
  const [data, setData] = useState<SpringPage<BatchResponse>>({ content: [], totalPages: 0, totalElements: 0, number: 0, size: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const { contractNumber, culture, status, loadingFrom, loadingTo, page, size, sort } = params ?? {};

  useEffect(() => {
    let cancelled = false;

    getBatches({ contractNumber, culture, status, loadingFrom, loadingTo, page, size, sort })
      .then((p) => { if (!cancelled) { setData(p); setIsLoading(false); } })
      .catch(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [contractNumber, culture, status, loadingFrom, loadingTo, page, size, sort, refetchTrigger]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setRefetchTrigger((t) => t + 1);
  }, []);

  return { data, isLoading, refetch };
}
