"use client";

import { useState } from "react";
import { DataTable, type Column } from "@/components/data/DataTable";
import { SortableHeader } from "@/components/data/SortableHeader";
import { FilterTabs } from "@/components/data/FilterTabs";
import { SearchInput } from "@/components/data/SearchInput";
import { VehicleStatusBadge } from "@/components/feedback/StatusBadge";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { usePagedState } from "@/lib/hooks/usePagedState";
import { useTableSort } from "@/lib/hooks/useTableSort";
import { useVehicles } from "@/lib/hooks/useVehicles";
import { VehicleStatus, STATUS_LABEL } from "@/lib/vehicle";
import { CULTURE_LABEL } from "@/lib/batch";

const PAGE_SIZE = 15;

type StatusFilter = "ALL" | VehicleStatus;
const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "ALL",            label: "All" },
  { value: "ARRIVED",        label: STATUS_LABEL.ARRIVED },
  { value: "IN_PROCESS",     label: STATUS_LABEL.IN_PROCESS },
  { value: "PENDING_REVIEW", label: STATUS_LABEL.PENDING_REVIEW },
  { value: "ACCEPTED",       label: STATUS_LABEL.ACCEPTED },
  { value: "REJECTED",       label: STATUS_LABEL.REJECTED },
];

export function VehicleTableSection() {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 400);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const sort = useTableSort("arrivedAt");
  const [page, setPage] = usePagedState([search, statusFilter, sort.param]);

  const { data, isLoading } = useVehicles({
    licensePlate:  search || undefined,
    status:        statusFilter === "ALL" ? undefined : statusFilter,
    sort:          sort.param,
    page,
    size:          PAGE_SIZE,
  });
  const { content: vehicles, totalPages, totalElements } = data;

  const columns: Column<typeof vehicles[number]>[] = [
    {
      header: "License Plate",
      cell:   (v) => <span className="font-mono font-medium">{v.licensePlate}</span>,
    },
    {
      header:    "Driver",
      className: "text-muted-foreground",
      cell:      (v) => v.driverName ?? "—",
    },
    {
      header: "Culture",
      cell:   (v) => CULTURE_LABEL[v.culture],
    },
    {
      header:    "Volume (t)",
      className: "text-muted-foreground",
      cell:      (v) => v.declaredVolume,
    },
    {
      header: "Status",
      cell:   (v) => <VehicleStatusBadge status={v.status} />,
    },
    {
      header: (
        <SortableHeader
          label="Arrived"
          direction={sort.direction}
          onToggle={() => sort.toggle("arrivedAt")}
        />
      ),
      className: "text-muted-foreground text-sm",
      cell:      (v) => new Date(v.arrivedAt).toLocaleDateString("en-GB"),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search by license plate..."
        />
        <FilterTabs<StatusFilter>
          value={statusFilter}
          onChange={setStatusFilter}
          options={STATUS_OPTIONS}
        />
      </div>

      <DataTable
        columns={columns}
        data={vehicles}
        isLoading={isLoading}
        emptyMessage={search || statusFilter !== "ALL" ? "No vehicles match your search." : "No vehicles yet."}
        rowKey={(v) => v.id}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        itemName={{ singular: "vehicle", plural: "vehicles" }}
      />
    </div>
  );
}
