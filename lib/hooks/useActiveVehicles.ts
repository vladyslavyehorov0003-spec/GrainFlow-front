import { useState, useEffect, useCallback } from "react";
import { getVehicles, VehicleResponse } from "@/lib/vehicle";

export interface ActiveVehiclesData {
  arrived:   VehicleResponse[];
  inProcess: VehicleResponse[];
  pending_review: VehicleResponse[];
}

export function useActiveVehicles(externalTrigger?: number) {
  const [data, setData] = useState<ActiveVehiclesData>({ arrived: [], inProcess: [], pending_review: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      getVehicles({ status: "ARRIVED",    size: 50, sort: "arrivedAt,asc" }),
      getVehicles({ status: "IN_PROCESS", size: 50, sort: "arrivedAt,asc" }),
      getVehicles({ status: "PENDING_REVIEW", size: 50, sort: "arrivedAt,asc" }),
    ]).then(([arrivedPage, inProcessPage, review]) => {
      if (cancelled) return;
      setData({ arrived: arrivedPage.content, inProcess: inProcessPage.content, pending_review: review.content});
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
