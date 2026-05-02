import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";

// Anchors are prefixed with "/" so they work from non-home pages too
// (e.g. /register → click "Pricing" → navigates home, then scrolls to #pricing).
const NAV_LINKS = [
  { label: "Features",     href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing",      href: "/#pricing" },
  { label: "Contacts",     href: "/#contacts" },
];
const Header = () => {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto max-w-full lg:max-w-7xl px-6 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg shrink-0"
        >
          <span className="text-primary">🌾</span>
          GrainFlow
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href={link.href} />}
            >
              {link.label}
            </Button>
          ))}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            Login
          </Button>
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href="/register" />}
          >
            Registration
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
