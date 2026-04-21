"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  PackageSearch,
  Truck,
  FlaskConical,
  Warehouse,
  Users,
  LucideIcon,
  ClipboardClock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Dashboard", href: "/app", icon: LayoutDashboard },
  { label: "Batches", href: "/batch", icon: PackageSearch },
  { label: "Vehicles", href: "/vehicle", icon: Truck },
  { label: "Lab", href: "/lab", icon: FlaskConical },
  { label: "Silos", href: "/silo", icon: Warehouse },
  { label: "Workers", href: "/users", icon: Users },
  { label: "Audit", href: "/audit", icon: ClipboardClock },
];

const NavbarSection = () => {
  const pathname = usePathname();

  return (
    <aside className="fixed top-16 left-0 bottom-0 w-64  border-r bg-muted/40 z-40">
      <nav className="flex flex-col gap-1 p-3">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150",
                isActive ?
                  "text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-primary rounded-lg"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <Icon size={18} className="relative z-10 shrink-0" />
              <span className="relative z-10">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default NavbarSection;
