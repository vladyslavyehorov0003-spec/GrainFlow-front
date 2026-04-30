import { redirect } from "next/navigation";
import { getMeServer } from "@/lib/auth.server";

export async function ManagerGuard({ children }: { children: React.ReactNode }) {
  const user = await getMeServer();
  if (!user) redirect("/api/logout");
  if (user.role !== "MANAGER") redirect("/batch");
  return <>{children}</>;
}
