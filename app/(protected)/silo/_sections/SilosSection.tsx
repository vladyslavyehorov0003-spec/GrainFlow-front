"use client";

import { useState } from "react";
import { DataTable, type Column } from "@/components/data/DataTable";
import { FilterTabs } from "@/components/data/FilterTabs";
import { useSilos } from "@/lib/hooks/useSilos";
import { usePagedState } from "@/lib/hooks/usePagedState";
import { CULTURE_LABEL, CultureType } from "@/lib/batch";
import { CreateSiloDialog } from "./CreateSiloDialog";
import { SiloDetailsSheet } from "./SiloDetailsSheet";

const PAGE_SIZE = 15;

type CultureFilter = "ALL" | CultureType;

const CULTURE_OPTIONS: { value: CultureFilter; label: string }[] = [
  { value: "ALL",       label: "All" },
  { value: "WHEAT",     label: CULTURE_LABEL.WHEAT },
  { value: "BARLEY",    label: CULTURE_LABEL.BARLEY },
  { value: "CORN",      label: CULTURE_LABEL.CORN },
  { value: "SUNFLOWER", label: CULTURE_LABEL.SUNFLOWER },
  { value: "SOYBEAN",   label: CULTURE_LABEL.SOYBEAN },
  { value: "RYE",       label: CULTURE_LABEL.RYE },
  { value: "OATS",      label: CULTURE_LABEL.OATS },
];

export function SilosSection() {
  const [cultureFilter, setCultureFilter] = useState<CultureFilter>("ALL");
  const [page, setPage] = usePagedState([cultureFilter]);

  const { data, isLoading, refetch } = useSilos({
    culture: cultureFilter === "ALL" ? undefined : cultureFilter,
    sort:    "name,asc",
    page,
    size:    PAGE_SIZE,
  });
  const { content: silos, totalPages, totalElements } = data;

  const columns: Column<typeof silos[number]>[] = [
    {
      header: "Name",
      cell:   (s) => <span className="font-medium">{s.name}</span>,
    },
    {
      header:    "Culture",
      className: "text-muted-foreground",
      cell:      (s) => (s.culture ? CULTURE_LABEL[s.culture] : "—"),
    },
    {
      header: "Fill level",
      cell:   (s) => {
        const fillPct = s.maxAmount > 0
          ? Math.min(100, Math.round((s.currentAmount / s.maxAmount) * 100))
          : 0;
        return (
          <div className="flex items-center gap-2 min-w-[80px]">
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${fillPct}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-8 text-right">{fillPct}%</span>
          </div>
        );
      },
    },
    {
      header:    "Current / Max (t)",
      className: "text-muted-foreground",
      cell:      (s) => `${s.currentAmount} / ${s.maxAmount}`,
    },
    {
      header:    "Created",
      className: "text-muted-foreground text-sm",
      cell:      (s) => new Date(s.createdAt).toLocaleDateString("en-GB"),
    },
    {
      headerClassName: "w-12",
      header:          "",
      cell:            (s) => <SiloDetailsSheet silo={s} onUpdated={refetch} />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Silos</h1>
        <CreateSiloDialog onCreated={refetch} />
      </div>

      <FilterTabs<CultureFilter>
        value={cultureFilter}
        onChange={setCultureFilter}
        options={CULTURE_OPTIONS}
      />

      <DataTable
        columns={columns}
        data={silos}
        isLoading={isLoading}
        emptyMessage={cultureFilter !== "ALL" ? "No silos match the filter." : "No silos yet."}
        rowKey={(s) => s.id}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        itemName={{ singular: "silo", plural: "silos" }}
      />
    </div>
  );
}
