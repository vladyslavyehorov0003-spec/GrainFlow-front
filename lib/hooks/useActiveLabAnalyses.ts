import { useState, useEffect, useCallback } from "react";
import { getLabAnalyses, LabAnalysisResponse } from "@/lib/lab";

export function useActiveLabAnalyses(externalTrigger?: number) {
  const [data, setData] = useState<LabAnalysisResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      getLabAnalyses({ status: "PENDING",       size: 50, sort: "createdAt,asc" }),
      getLabAnalyses({ status: "IN_PROGRESS",   size: 50, sort: "createdAt,asc" }),
      getLabAnalyses({ status: "ANALYSIS_DONE", size: 50, sort: "createdAt,asc" }),
      getLabAnalyses({ status: "DRYING",        size: 50, sort: "createdAt,asc" }),
      getLabAnalyses({ status: "DRYING_DONE",   size: 50, sort: "createdAt,asc" }),
    ]).then(([pending, inProgress, analysisDone, drying, dryingDone]) => {
      if (cancelled) return;
      setData([
        ...pending.content,
        ...inProgress.content,
        ...analysisDone.content,
        ...drying.content,
        ...dryingDone.content,
      ]);
      setIsLoading(false);
    }).catch(() => {
      if (!cancelled) setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, [refetchTrigger, externalTrigger]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setRefetchTrigger((t) => t + 1);
  }, []);

  return { data, isLoading, refetch };
}
