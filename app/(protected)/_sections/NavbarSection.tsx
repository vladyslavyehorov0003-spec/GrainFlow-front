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
import { useUser } from "@/lib/UserContext";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  managerOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/app",    icon: LayoutDashboard, managerOnly: true },
  { label: "Batches",   href: "/batch",  icon: PackageSearch },
  { label: "Vehicles",  href: "/vehicle", icon: Truck },
  { label: "Lab",       href: "/lab",    icon: FlaskConical },
  { label: "Silos",     href: "/silo",   icon: Warehouse },
  { label: "Workers",   href: "/users",  icon: Users,           managerOnly: true },
  { label: "Audit",     href: "/audit",  icon: ClipboardClock,  managerOnly: true },
];

const NavbarSection = () => {
  const pathname = usePathname();
  const user = useUser();

  const isManager = user.role === "MANAGER";

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.managerOnly || isManager,
  );

  return (
    <aside
      className={cn(
        "fixed z-40 bg-muted/40",
        "bottom-0 inset-x-0 border-t",
        "md:top-16 md:left-0 md:right-auto md:w-64 md:border-r md:border-t-0",
      )}
    >
      <nav className="flex justify-around p-3 gap-1 md:flex-col md:justify-start">
        {visibleItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={cn(
                "relative flex items-center justify-center md:justify-start gap-3 p-2 md:px-3 md:py-2 rounded-lg text-sm font-medium transition-colors duration-150",
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
              <span className="relative z-10 hidden md:inline">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default NavbarSection;
