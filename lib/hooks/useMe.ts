import { useState, useEffect } from "react";
import { getMe, UserResponse } from "@/lib/auth";

export function useMe() {
  const [data, setData] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then(setData)
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading };
}
