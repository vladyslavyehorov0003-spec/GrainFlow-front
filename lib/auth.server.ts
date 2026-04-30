import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import type { UserResponse } from "./auth";

const API_URL =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const getMeServer = cache(async (): Promise<UserResponse | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache:   "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data: UserResponse };
    return json.data;
  } catch {
    return null;
  }
});
