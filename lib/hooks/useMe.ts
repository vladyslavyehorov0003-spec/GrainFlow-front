"use client";

import { useUser } from "@/lib/UserContext";
import type { UserResponse } from "@/lib/auth";

export function useMe(): { data: UserResponse; isLoading: false } {
  return { data: useUser(), isLoading: false };
}
