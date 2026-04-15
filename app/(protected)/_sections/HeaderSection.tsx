"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { useMe } from "@/lib/hooks/useMe";
import { logout } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";

const ROLE_LABEL: Record<string, string> = {
  MANAGER: "Manager",
  WORKER: "Worker",
};

const HeaderSection = () => {
  const { user, isLoading } = useMe();

  const initials =
    user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : "??";

  return (
    <header className="fixed top-0 w-full inset-x-0 h-16 border-b bg-background z-50">
      <div className="px-6 h-full flex items-center justify-between gap-6">
        <Link href="/app" className="font-bold text-lg shrink-0">
          {isLoading ?
            <Skeleton className="h-5 w-32" />
          : (user?.companyName ?? "GrainFlow")}
        </Link>

        <div className="flex items-center gap-3">
          {isLoading ?
            <>
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-32 rounded-md" />
            </>
          : <>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-semibold">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user?.email}
                </span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {ROLE_LABEL[user?.role ?? ""] ?? user?.role}
              </Badge>
            </>
          }

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
