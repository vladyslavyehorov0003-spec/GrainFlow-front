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
    <header className="fixed top-0 w-full inset-x-0 h-16 border-b bg-background z-50">
      <div className="px-6 h-full flex items-center justify-between gap-6">
        <Link
          href="/app"
          className="font-bold hidden lg:block text-lg shrink-0"
        >
          {user.companyName}
        </Link>

        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold">
              {user.firstName} {user.lastName}
            </span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {ROLE_LABEL[user.role] ?? user.role}
          </Badge>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
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
