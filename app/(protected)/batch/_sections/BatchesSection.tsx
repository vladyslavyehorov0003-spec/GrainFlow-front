"use client";

import { useState } from "react";
import { DataTable, type Column } from "@/components/data/DataTable";
import { SortableHeader } from "@/components/data/SortableHeader";
import { FilterTabs } from "@/components/data/FilterTabs";
import { SearchInput } from "@/components/data/SearchInput";
import { BatchStatusBadge } from "@/components/feedback/StatusBadge";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { usePagedState } from "@/lib/hooks/usePagedState";
import { useTableSort } from "@/lib/hooks/useTableSort";
import { useBatches } from "@/lib/hooks/useBatches";
import { CULTURE_LABEL, STATUS_LABEL, BatchStatus } from "@/lib/batch";
import { BatchDetailsSheet } from "./BatchDetailsSheet";
import { CreateBatchDialog } from "./CreateBatchDialog";

const PAGE_SIZE = 15;

type StatusFilter = "ALL" | BatchStatus;

const STATUS_OPTIONS = [
  { value: "ALL" as const, label: "All" },
  { value: "PLANNED" as const, label: STATUS_LABEL.PLANNED },
  { value: "ACTIVE" as const, label: STATUS_LABEL.ACTIVE },
  { value: "CLOSED" as const, label: STATUS_LABEL.CLOSED },
];

export function BatchesSection() {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 400);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const sort = useTableSort("createdAt");
  const [page, setPage] = usePagedState([search, statusFilter, sort.param]);

  const { data, isLoading, refetch } = useBatches({
    contractNumber: search || undefined,
    status:         statusFilter === "ALL" ? undefined : statusFilter,
    sort:           sort.param,
    page,
    size:           PAGE_SIZE,
  });
  const { content: batches, totalPages, totalElements } = data;

  const columns: Column<typeof batches[number]>[] = [
    {
      header: "Contract №",
      cell:   (b) => <span className="font-mono font-medium">{b.contractNumber}</span>,
    },
    {
      header: "Culture",
      cell:   (b) => CULTURE_LABEL[b.culture],
    },
    {
      header: "Status",
      cell:   (b) => <BatchStatusBadge status={b.status} />,
    },
    {
      header:    "Volume (t / acc)",
      className: "text-muted-foreground",
      cell:      (b) => `${b.totalVolume} / ${b.acceptedVolume}`,
    },
    {
      header:    "Loading period",
      className: "text-muted-foreground text-sm whitespace-nowrap",
      cell:      (b) =>
        `${new Date(b.loadingFrom).toLocaleDateString("en-GB")} → ${new Date(b.loadingTo).toLocaleDateString("en-GB")}`,
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
      cell:      (b) => new Date(b.createdAt).toLocaleDateString("en-GB"),
    },
    {
      headerClassName: "w-12",
      header:          "",
      cell:            (b) => <BatchDetailsSheet batch={b} />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Batches</h1>
        <CreateBatchDialog onCreated={refetch} />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search by contract number..."
        />
        <FilterTabs<StatusFilter>
          value={statusFilter}
          onChange={setStatusFilter}
          options={STATUS_OPTIONS}
        />
      </div>

      <DataTable
        columns={columns}
        data={batches}
        isLoading={isLoading}
        emptyMessage={search || statusFilter !== "ALL" ? "No batches match your search." : "No batches yet."}
        rowKey={(b) => b.id}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        itemName={{ singular: "batch", plural: "batches" }}
      />
    </div>
  );
}
