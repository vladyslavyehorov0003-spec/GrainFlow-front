import type { Metadata } from "next";
import HeaderSection from "./_sections/HeaderSection";
import NavbarSection from "./_sections/NavbarSection";

export const metadata: Metadata = {
  title: "GrainFlow — App",
};

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavbarSection />
      <HeaderSection />

      <main className="pt-16 pl-64 min-h-screen">
        <div className="p-6">{children}</div>
      </main>
    </>
  );
}
