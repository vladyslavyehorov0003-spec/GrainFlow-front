"use client";

import { LucideProps } from "lucide-react";

interface Props {
  title: string;
  value: string | number;
  sub?:  string;
  icon:  React.ElementType<LucideProps>;
}

export function StatCard({ title, value, sub, icon: Icon }: Props) {
  return (
    <div className="rounded-xl border bg-card px-5 py-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className="rounded-md bg-muted p-1.5">
          <Icon size={15} className="text-muted-foreground" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
