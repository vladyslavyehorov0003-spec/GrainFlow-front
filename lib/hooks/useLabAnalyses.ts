import { useState, useEffect } from "react";
import { getLabAnalyses, LabAnalysisResponse, LabFilterParams } from "@/lib/lab";
import { SpringPage } from "@/lib/workers";

const EMPTY: SpringPage<LabAnalysisResponse> = {
  content: [],
  totalPages: 0,
  totalElements: 0,
  number: 0,
  size: 0,
};

export function useLabAnalyses(params: LabFilterParams) {
  const [data, setData] = useState<SpringPage<LabAnalysisResponse>>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getLabAnalyses(params)
      .then((d) => { if (!cancelled) setData(d); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [JSON.stringify(params)]);

  return { data, isLoading };
}
