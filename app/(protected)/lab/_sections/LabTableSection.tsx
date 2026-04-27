"use client";

import { useState } from "react";
import { DataTable, type Column } from "@/components/data/DataTable";
import { SortableHeader } from "@/components/data/SortableHeader";
import { FilterTabs } from "@/components/data/FilterTabs";
import { LabStatusBadge } from "@/components/feedback/StatusBadge";
import { useLabAnalyses } from "@/lib/hooks/useLabAnalyses";
import { usePagedState } from "@/lib/hooks/usePagedState";
import { useTableSort } from "@/lib/hooks/useTableSort";
import { LabStatus, LAB_STATUS_LABEL } from "@/lib/lab";

const PAGE_SIZE = 15;

type StatusFilter = "ALL" | LabStatus;
const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "ALL",           label: "All" },
  { value: "PENDING",       label: LAB_STATUS_LABEL.PENDING },
  { value: "IN_PROGRESS",   label: LAB_STATUS_LABEL.IN_PROGRESS },
  { value: "ANALYSIS_DONE", label: LAB_STATUS_LABEL.ANALYSIS_DONE },
  { value: "DRYING",        label: LAB_STATUS_LABEL.DRYING },
  { value: "DRYING_DONE",   label: LAB_STATUS_LABEL.DRYING_DONE },
  { value: "STORED",        label: LAB_STATUS_LABEL.STORED },
  { value: "CANCELED",      label: LAB_STATUS_LABEL.CANCELED },
];

export function LabTableSection() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const sort = useTableSort("createdAt");
  const [page, setPage] = usePagedState([statusFilter, sort.param]);

  const { data, isLoading } = useLabAnalyses({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    sort:   sort.param,
    page,
    size:   PAGE_SIZE,
  });
  const { content: analyses, totalPages, totalElements } = data;

  const columns: Column<typeof analyses[number]>[] = [
    {
      header:    "Vehicle ID",
      className: "font-mono text-xs text-muted-foreground",
      cell:      (a) => a.vehicleId,
    },
    {
      header: "Status",
      cell:   (a) => <LabStatusBadge status={a.status} />,
    },
    {
      header:    "Moisture",
      className: "text-muted-foreground",
      cell:      (a) => a.moisture ?? "—",
    },
    {
      header:    "Impurity",
      className: "text-muted-foreground",
      cell:      (a) => a.impurity ?? "—",
    },
    {
      header:    "Protein",
      className: "text-muted-foreground",
      cell:      (a) => a.protein ?? "—",
    },
    {
      header:    "Actual Vol. (t)",
      className: "text-muted-foreground",
      cell:      (a) => a.actualVolume ?? "—",
    },
    {
      header: (
        <SortableHeader
          label="Created"
          direction={sort.direction}
          onToggle={() => sort.toggle("createdAt")}
        />
      ),
      className: "text-muted-foreground text-sm",
      cell:      (a) => new Date(a.createdAt).toLocaleDateString("en-GB"),
    },
  ];

  return (
    <div className="space-y-4">
      <FilterTabs<StatusFilter>
        value={statusFilter}
        onChange={setStatusFilter}
        options={STATUS_OPTIONS}
      />

      <DataTable
        columns={columns}
        data={analyses}
        isLoading={isLoading}
        emptyMessage={statusFilter !== "ALL" ? "No analyses match the filter." : "No lab analyses yet."}
        rowKey={(a) => a.id}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        itemName={{ singular: "analysis", plural: "analyses" }}
      />
    </div>
  );
}
