"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/lib/UserContext";
import { logout } from "@/lib/auth";

const ROLE_LABEL: Record<string, string> = {
  MANAGER: "Manager",
  WORKER:  "Worker",
};

const HeaderSection = () => {
  const user = useUser();
  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  return (
    <header className="fixed top-0 inset-x-0 h-16 border-b bg-background z-50">
      <div className="px-4 sm:px-6 h-full flex items-center justify-between gap-3 sm:gap-6">
        <Link
          href="/app"
          className="font-bold hidden lg:block text-lg shrink-0 truncate max-w-[200px]"
        >
          {user.companyName}
        </Link>

        <div className="flex items-center gap-2 sm:gap-3 min-w-0 ml-auto">
          {/* Avatar + name+email act as the link to the profile page.
              Wrapping both in a single Link gives a wide click target on mobile. */}
          <Link
            href="/profile"
            className="flex items-center gap-2 sm:gap-3 min-w-0 rounded-md hover:bg-muted px-1 -mx-1 transition-colors"
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {/* Name + email — hidden on tiny screens to prevent header overflow.
                Long emails were the main cause of Safari shrinking the page. */}
            <div className="hidden sm:flex flex-col leading-none min-w-0">
              <span className="text-sm font-semibold truncate">
                {user.firstName} {user.lastName}
              </span>
              <span className="text-xs text-muted-foreground truncate">{user.email}</span>
            </div>
          </Link>
          <Badge variant="secondary" className="text-xs shrink-0">
            {ROLE_LABEL[user.role] ?? user.role}
          </Badge>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={logout}
          >
            <LogOut size={16} />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default HeaderSection;
