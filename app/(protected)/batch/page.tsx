"use client";

import { logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default function AppPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">Дашборд</h1>
      <p className="text-muted-foreground">Тут буде основний застосунок</p>
      <Button variant="outline" onClick={logout}>
        Вийти
      </Button>
    </div>
  );
}
