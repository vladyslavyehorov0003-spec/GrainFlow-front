"use client";

import { Button } from "@/components/ui/button";

type FilterOption<T extends string> = {
  value: T;
  label: string;
};

type FilterTabsProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: FilterOption<T>[];
};

export function FilterTabs<T extends string>({
  value,
  onChange,
  options,
}: FilterTabsProps<T>) {
  return (
    <div className="flex items-center gap-1 rounded-lg border p-1 flex-wrap w-fit">
      {options.map((opt) => (
        <Button
          key={opt.value}
          variant={value === opt.value ? "default" : "ghost"}
          size="sm"
          className="h-7 px-3 text-xs"
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}
