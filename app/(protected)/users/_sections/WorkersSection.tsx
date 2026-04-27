"use client";

import { useState } from "react";
import { usePagedState } from "@/lib/hooks/usePagedState";
import { useTableSort } from "@/lib/hooks/useTableSort";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/data/DataTable";
import { SortableHeader } from "@/components/data/SortableHeader";
import { FilterTabs } from "@/components/data/FilterTabs";
import { SearchInput } from "@/components/data/SearchInput";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { useWorkers } from "@/lib/hooks/useWorkers";
import { deleteWorker } from "@/lib/workers";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "sonner";
import { CreateWorkerDialog } from "./CreateWorkerDialog";
import { DeleteDialog } from "../../../../components/DeleteDialog";
import { UpdateWorkerDialog } from "./UpdateWorkerDialog";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 15;

type EnabledFilter = "all" | "active" | "inactive";

const ENABLED_OPTIONS: { value: EnabledFilter; label: string }[] = [
  { value: "all",      label: "All" },
  { value: "active",   label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export function WorkersSection() {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 400);
  const [enabledFilter, setEnabledFilter] = useState<EnabledFilter>("all");
  const sort = useTableSort("createdAt");
  const [page, setPage] = usePagedState([search, enabledFilter, sort.param]);

  const { data, isLoading, refetch } = useWorkers({
    search:  search || undefined,
    enabled: enabledFilter === "all" ? undefined : enabledFilter === "active",
    sort:    sort.param,
    page,
    size:    PAGE_SIZE,
  });
  const { content: workers, totalPages, totalElements } = data;

  async function handleDelete(id: string, name: string) {
    try {
      await deleteWorker(id);
      toast.success(`${name} deactivated`);
      refetch();
    } catch (e) {
      toast.error(getErrorMessage(e, "Failed to deactivate worker"));
    }
  }

  const columns: Column<typeof workers[number]>[] = [
    {
      header: "Name",
      cell:   (w) => <span className="font-medium">{w.firstName} {w.lastName}</span>,
    },
    {
      header:    "Email",
      className: "text-muted-foreground",
      cell:      (w) => w.email,
    },
    {
      header:    "Employee ID",
      className: "text-muted-foreground font-mono text-xs",
      cell:      (w) => w.employeeId ?? "—",
    },
    {
      header: "Status",
      cell:   (w) => (
        <Badge variant={w.enabled ? "default" : "secondary"}>
          {w.enabled ? "Active" : "Inactive"}
        </Badge>
      ),
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
      cell:      (w) => new Date(w.createdAt).toLocaleDateString("en-GB"),
    },
    {
      headerClassName: "w-20 text-right",
      header:          "Actions",
      className:       "text-right",
      cell:            (w) => (
        <>
          <UpdateWorkerDialog worker={w} onUpdated={refetch} />
          <DeleteDialog
            deleteHandler={() => handleDelete(w.id, `${w.firstName} ${w.lastName}`)}
            message="After deletion, the user will lose access to all company actions."
          />
        </>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Workers</h1>
        <CreateWorkerDialog onCreated={refetch} />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search by name, email, ID..."
        />
        <FilterTabs<EnabledFilter>
          value={enabledFilter}
          onChange={setEnabledFilter}
          options={ENABLED_OPTIONS}
        />
      </div>

      <DataTable
        columns={columns}
        data={workers}
        isLoading={isLoading}
        emptyMessage={search || enabledFilter !== "all" ? "No workers match your search." : "No workers yet. Add your first employee."}
        rowKey={(w) => w.id}
        rowClassName={(w) => (!w.enabled ? "opacity-60" : undefined)}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        itemName={{ singular: "employee", plural: "employees" }}
      />
    </div>
  );
}
