"use client";

import { ArrowDown, ArrowUp } from "lucide-react";

type SortableHeaderProps = {
  label: string;
  direction: "asc" | "desc";
  onToggle: () => void;
};

export function SortableHeader({ label, direction, onToggle }: SortableHeaderProps) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1 hover:text-foreground transition-colors"
    >
      {label}
      {direction === "desc" ? <ArrowDown size={13} /> : <ArrowUp size={13} />}
    </button>
  );
}
