"use client";

import { createContext, useContext } from "react";
import type { UserResponse } from "./auth";

const UserContext = createContext<UserResponse | null>(null);

export function UserProvider({
  initial,
  children,
}: {
  initial: UserResponse;
  children: React.ReactNode;
}) {
  return <UserContext.Provider value={initial}>{children}</UserContext.Provider>;
}

export function useUser(): UserResponse {
  const user = useContext(UserContext);
  if (!user) {
    throw new Error("useUser must be used inside <UserProvider>");
  }
  return user;
}
