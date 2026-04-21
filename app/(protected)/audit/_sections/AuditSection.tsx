"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AUDIT_LABLE, AuditResponce, AuditType } from "@/lib/audit";
import { useAudit } from "@/lib/hooks/useAudit";
import { FileText } from "lucide-react";
import ChangesDialog from "./ChangesDialog";

// ── helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function actionVariant(
  action: string,
): "default" | "secondary" | "destructive" | "outline" {
  const key = Object.keys(ACTION_KEYWORDS).find((k) => action.includes(k));
  return key ? ACTION_KEYWORDS[key] : "outline";
}
const ACTION_KEYWORDS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  CREATED: "default",
  UPDATED: "secondary",
  DELETED: "destructive",
  STARTED: "secondary",
  FINISHED: "outline",
  RELEASED: "outline",
  ACCEPTED: "default",
  REJECTED: "destructive",
  ADDED: "default",
  REMOVED: "destructive",
};

// ── Section ───────────────────────────────────────────────────────────────────

type AuditFilter = "ALL" | AuditType;
const AUDIT_OPTIONS: AuditFilter[] = [
  "ALL",
  "SILO",
  "LAB_ANALYSIS",
  "VEHICLE",
  "BATCH",
];
const PAGE_SIZE = 15;

const AuditSection = () => {
  const [page, setPage] = useState(0);
  const [auditFilter, setAuditFilter] = useState<AuditFilter>("ALL");

  const { data, isLoading } = useAudit({
    entityType: auditFilter === "ALL" ? undefined : auditFilter,
    page,
    size: PAGE_SIZE,
    sort: "createdAt,desc",
  });

  function handleFilter(f: AuditFilter) {
    setAuditFilter(f);
    setPage(0);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Audit</h1>
        <p className="text-sm text-muted-foreground">
          {isLoading ?
            "Loading..."
          : `${data.totalElements} record${data.totalElements !== 1 ? "s" : ""}`
          }
        </p>
      </div>

      <div className="flex items-center gap-1 rounded-lg border p-1 w-fit">
        {AUDIT_OPTIONS.map((f) => (
          <Button
            key={f}
            variant={auditFilter === f ? "default" : "ghost"}
            size="sm"
            className="h-7 px-3"
            onClick={() => handleFilter(f)}
          >
            {f === "ALL" ? "All" : AUDIT_LABLE[f]}
          </Button>
        ))}
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Entity type</TableHead>
              <TableHead>Entity ID</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ?
              Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  ))}
                  <TableCell />
                </TableRow>
              ))
            : data.content.length === 0 ?
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-12"
                >
                  {auditFilter !== "ALL" ?
                    "No records match the filter."
                  : "No audit records yet."}
                </TableCell>
              </TableRow>
            : data.content.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Badge
                      variant={actionVariant(item.action)}
                      className="text-xs"
                    >
                      {item.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {AUDIT_LABLE[item.entityType] ?? item.entityType}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {item.entityId?.slice(0, 8).toUpperCase() ?? "—"}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {item.userId?.slice(0, 8).toUpperCase() ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {fmtDate(item.createdAt)}
                  </TableCell>
                  <TableCell>
                    <ChangesDialog item={item} />
                  </TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>

        {data.totalPages > 1 && (
          <div className="border-t px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Page {page + 1} of {data.totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditSection;
