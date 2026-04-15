import { useState, useEffect } from "react";
import { getMe, UserResponse } from "@/lib/auth";

export function useMe() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then(setUser)
      .finally(() => setIsLoading(false));
  }, []);

  return { user, isLoading };
}
