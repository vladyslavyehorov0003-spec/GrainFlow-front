"use client";

import { useMe } from "@/lib/hooks/useMe";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ManagerGuard({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useMe();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.role !== "MANAGER") {
      router.replace("/batch");
    }
  }, [user, isLoading, router]);

  if (isLoading || user?.role !== "MANAGER") return null;

  return <>{children}</>;
}
