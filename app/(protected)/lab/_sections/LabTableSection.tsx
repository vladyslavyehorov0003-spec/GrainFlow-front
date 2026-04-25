"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useLabAnalyses } from "@/lib/hooks/useLabAnalyses";
import { LabStatus, LAB_STATUS_LABEL } from "@/lib/lab";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 15;

const STATUS_VARIANT: Record<LabStatus, "default" | "secondary" | "outline" | "destructive"> = {
  PENDING:       "secondary",
  IN_PROGRESS:   "default",
  ANALYSIS_DONE: "secondary",
  DRYING:        "default",
  DRYING_DONE:   "secondary",
  STORED:        "outline",
  CANCELED:      "destructive",
};

type StatusFilter = "ALL" | LabStatus;
const STATUS_OPTIONS: StatusFilter[] = [
  "ALL", "PENDING", "IN_PROGRESS", "ANALYSIS_DONE", "DRYING", "DRYING_DONE", "STORED", "CANCELED",
];

export function LabTableSection() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [page, setPage] = useState(0);

  const { data, isLoading } = useLabAnalyses({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    sort:   `createdAt,${sortDir}`,
    page,
    size:   PAGE_SIZE,
  });
  const { content: analyses, totalPages, totalElements } = data;

  function getPageNumbers(): (number | "ellipsis")[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i);
    const pages: (number | "ellipsis")[] = [0];
    if (page > 2) pages.push("ellipsis");
    for (let i = Math.max(1, page - 1); i <= Math.min(totalPages - 2, page + 1); i++) pages.push(i);
    if (page < totalPages - 3) pages.push("ellipsis");
    pages.push(totalPages - 1);
    return pages;
  }

  return (
    <div className="space-y-4">
      {/* Status filter */}
      <div className="flex items-center gap-1 rounded-lg border p-1 flex-wrap w-fit">
        {STATUS_OPTIONS.map((f) => (
          <Button
            key={f}
            variant={statusFilter === f ? "default" : "ghost"}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => { setStatusFilter(f); setPage(0); }}
          >
            {f === "ALL" ? "All" : LAB_STATUS_LABEL[f]}
          </Button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Moisture</TableHead>
              <TableHead>Impurity</TableHead>
              <TableHead>Protein</TableHead>
              <TableHead>Actual Vol. (t)</TableHead>
              <TableHead>
                <button
                  onClick={() => { setSortDir((d) => d === "desc" ? "asc" : "desc"); setPage(0); }}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Created
                  {sortDir === "desc" ? <ArrowDown size={13} /> : <ArrowUp size={13} />}
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ?
              Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>
                  ))}
                </TableRow>
              ))
            : analyses.length === 0 ?
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                  {statusFilter !== "ALL" ? "No analyses match the filter." : "No lab analyses yet."}
                </TableCell>
              </TableRow>
            : analyses.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{a.vehicleId}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[a.status]}>{LAB_STATUS_LABEL[a.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{a.moisture ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{a.impurity ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{a.protein ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{a.actualVolume ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(a.createdAt).toLocaleDateString("en-GB")}
                  </TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="border-t px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>
            <Pagination className="w-auto mx-0">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    aria-disabled={page === 0}
                    className={cn(page === 0 && "pointer-events-none opacity-40")}
                  />
                </PaginationItem>
                {getPageNumbers().map((p, i) =>
                  p === "ellipsis" ? (
                    <PaginationItem key={`e-${i}`}><PaginationEllipsis /></PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink isActive={p === page} onClick={() => setPage(p)}>
                        {p + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    aria-disabled={page === totalPages - 1}
                    className={cn(page === totalPages - 1 && "pointer-events-none opacity-40")}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {isLoading ? "Loading..." : `${totalElements} analys${totalElements !== 1 ? "es" : "is"} total`}
      </p>
    </div>
  );
}
