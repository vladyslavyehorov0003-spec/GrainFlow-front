import { useState, useEffect } from "react";
import { getVehicles, VehicleResponse, VehicleFilterParams } from "@/lib/vehicle";
import { SpringPage } from "@/lib/workers";

const EMPTY: SpringPage<VehicleResponse> = {
  content: [],
  totalPages: 0,
  totalElements: 0,
  number: 0,
  size: 0,
};

export function useVehicles(params: VehicleFilterParams) {
  const [data, setData] = useState<SpringPage<VehicleResponse>>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getVehicles(params)
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [JSON.stringify(params)]);

  return { data, isLoading };
}
