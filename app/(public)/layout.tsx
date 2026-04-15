import Link from "next/link";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">{children}</main>

      <footer className="border-t py-8">
        <div className="mx-auto max-w-full lg:max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">🌾 GrainFlow</span>
          <span>
            © {new Date().getFullYear()} GrainFlow. All rights reserved.
          </span>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="hover:text-foreground transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="hover:text-foreground transition-colors"
            >
              Registration
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
