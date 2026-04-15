import { useState, useEffect, useCallback } from "react";
import { getWorkers, WorkerFilterParams } from "@/lib/workers";
import { UserResponse } from "@/lib/auth";

export function useWorkers(params?: WorkerFilterParams) {
  const [workers, setWorkers] = useState<UserResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(() => {
    setIsLoading(true);
    getWorkers(params)
      .then((page) => {
        setWorkers(page.content);
        setTotalPages(page.totalPages);
        setTotalElements(page.totalElements);
      })
      .finally(() => setIsLoading(false));
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { workers, totalPages, totalElements, isLoading, refetch: fetch };
}
