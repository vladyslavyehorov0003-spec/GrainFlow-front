"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/data/DataTable";
import { FilterTabs } from "@/components/data/FilterTabs";
import { AUDIT_LABLE, AuditType } from "@/lib/audit";
import { useAudit } from "@/lib/hooks/useAudit";
import { usePagedState } from "@/lib/hooks/usePagedState";
import ChangesDialog from "./ChangesDialog";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ACTION_KEYWORDS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  CREATED:  "default",
  UPDATED:  "secondary",
  DELETED:  "destructive",
  STARTED:  "secondary",
  FINISHED: "outline",
  RELEASED: "outline",
  ACCEPTED: "default",
  REJECTED: "destructive",
  ADDED:    "default",
  REMOVED:  "destructive",
};

export function actionVariant(
  action: string,
): "default" | "secondary" | "destructive" | "outline" {
  const key = Object.keys(ACTION_KEYWORDS).find((k) => action.includes(k));
  return key ? ACTION_KEYWORDS[key] : "outline";
}

type AuditFilter = "ALL" | AuditType;

const AUDIT_OPTIONS: { value: AuditFilter; label: string }[] = [
  { value: "ALL",          label: "All" },
  { value: "SILO",         label: AUDIT_LABLE.SILO },
  { value: "LAB_ANALYSIS", label: AUDIT_LABLE.LAB_ANALYSIS },
  { value: "VEHICLE",      label: AUDIT_LABLE.VEHICLE },
  { value: "BATCH",        label: AUDIT_LABLE.BATCH },
];

const PAGE_SIZE = 15;

const AuditSection = () => {
  const [auditFilter, setAuditFilter] = useState<AuditFilter>("ALL");
  const [page, setPage] = usePagedState([auditFilter]);

  const { data, isLoading } = useAudit({
    entityType: auditFilter === "ALL" ? undefined : auditFilter,
    page,
    size: PAGE_SIZE,
    sort: "createdAt,desc",
  });

  const columns: Column<typeof data.content[number]>[] = [
    {
      header: "Action",
      cell:   (item) => (
        <Badge variant={actionVariant(item.action)} className="text-xs">
          {item.action}
        </Badge>
      ),
    },
    {
      header:    "Entity type",
      className: "text-muted-foreground",
      cell:      (item) => AUDIT_LABLE[item.entityType] ?? item.entityType,
    },
    {
      header:    "Entity ID",
      className: "font-mono text-xs text-muted-foreground",
      cell:      (item) => item.entityId?.slice(0, 8).toUpperCase() ?? "—",
    },
    {
      header:    "User ID",
      className: "font-mono text-xs text-muted-foreground",
      cell:      (item) => item.userId?.slice(0, 8).toUpperCase() ?? "—",
    },
    {
      header:    "Date",
      className: "text-sm text-muted-foreground whitespace-nowrap",
      cell:      (item) => fmtDate(item.createdAt),
    },
    {
      headerClassName: "w-10",
      header:          "",
      cell:            (item) => <ChangesDialog item={item} />,
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Audit</h1>

      <FilterTabs<AuditFilter>
        value={auditFilter}
        onChange={setAuditFilter}
        options={AUDIT_OPTIONS}
      />

      <DataTable
        columns={columns}
        data={data.content}
        isLoading={isLoading}
        emptyMessage={auditFilter !== "ALL" ? "No records match the filter." : "No audit records yet."}
        rowKey={(item) => item.id}
        page={page}
        totalPages={data.totalPages}
        totalElements={data.totalElements}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        itemName={{ singular: "record", plural: "records" }}
      />
    </div>
  );
};

export default AuditSection;
