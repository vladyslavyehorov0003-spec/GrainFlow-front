import type { Metadata } from "next";
import { redirect } from "next/navigation";
import HeaderSection from "./_sections/HeaderSection";
import NavbarSection from "./_sections/NavbarSection";
import { VerificationBanner } from "./_components/VerificationBanner";
import { getMeServer } from "@/lib/auth.server";
import { UserProvider } from "@/lib/UserContext";

export const metadata: Metadata = {
  title: "GrainFlow — App",
};

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getMeServer();
  if (!user) redirect("/api/logout");

  return (
    <UserProvider initial={user}>
      <NavbarSection />
      <HeaderSection />

      <div className="pt-16 pb-20 md:pb-0 md:pl-64 min-h-screen flex flex-col">
        <VerificationBanner />
        <main className="flex-1">
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    </UserProvider>
  );
}
