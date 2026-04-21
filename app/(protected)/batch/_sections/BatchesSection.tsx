"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useBatches } from "@/lib/hooks/useBatches";
import { CULTURE_LABEL, STATUS_LABEL, BatchStatus } from "@/lib/batch";
import { Search, ArrowUp, ArrowDown } from "lucide-react";
import { BatchDetailsSheet } from "./BatchDetailsSheet";
import { CreateBatchDialog } from "./CreateBatchDialog";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 15;

const STATUS_VARIANT: Record<BatchStatus, "default" | "secondary" | "outline"> = {
  PLANNED: "secondary",
  ACTIVE:  "default",
  CLOSED:  "outline",
};

type StatusFilter = "ALL" | BatchStatus;

export function BatchesSection() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [page, setPage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, refetch } = useBatches({
    contractNumber: search || undefined,
    status:         statusFilter === "ALL" ? undefined : statusFilter,
    sort:           `createdAt,${sortDir}`,
    page,
    size:           PAGE_SIZE,
  });
  const { content: batches, totalPages, totalElements } = data;

  function handleStatusFilter(f: StatusFilter) {
    setStatusFilter(f);
    setPage(0);
  }

  function handleSortToggle() {
    setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    setPage(0);
  }

  function getPageNumbers(): (number | "ellipsis")[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i);
    const pages: (number | "ellipsis")[] = [0];
    if (page > 2) pages.push("ellipsis");
    for (let i = Math.max(1, page - 1); i <= Math.min(totalPages - 2, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 3) pages.push("ellipsis");
    pages.push(totalPages - 1);
    return pages;
  }

  const statusOptions: StatusFilter[] = ["ALL", "PLANNED", "ACTIVE", "CLOSED"];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Batches</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : `${totalElements} batch${totalElements !== 1 ? "es" : ""}`}
          </p>
        </div>
        <CreateBatchDialog onCreated={refetch} />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by contract number..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex items-center gap-1 rounded-lg border p-1">
          {statusOptions.map((f) => (
            <Button
              key={f}
              variant={statusFilter === f ? "default" : "ghost"}
              size="sm"
              className="capitalize h-7 px-3"
              onClick={() => handleStatusFilter(f)}
            >
              {f === "ALL" ? "All" : STATUS_LABEL[f]}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contract №</TableHead>
              <TableHead>Culture</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Volume (t / acc)</TableHead>
              <TableHead>Loading period</TableHead>
              <TableHead>
                <button
                  onClick={handleSortToggle}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Created
                  {sortDir === "desc" ? <ArrowDown size={13} /> : <ArrowUp size={13} />}
                </button>
              </TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ?
              Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>
                  ))}
                  <TableCell />
                </TableRow>
              ))
            : batches.length === 0 ?
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                  {search || statusFilter !== "ALL"
                    ? "No batches match your search."
                    : "No batches yet."}
                </TableCell>
              </TableRow>
            : batches.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono font-medium">{b.contractNumber}</TableCell>
                  <TableCell>{CULTURE_LABEL[b.culture]}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[b.status]}>{STATUS_LABEL[b.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {b.totalVolume} / {b.acceptedVolume}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                    {new Date(b.loadingFrom).toLocaleDateString("en-GB")} → {new Date(b.loadingTo).toLocaleDateString("en-GB")}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(b.createdAt).toLocaleDateString("en-GB")}
                  </TableCell>
                  <TableCell>
                    <BatchDetailsSheet batch={b} />
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
                    <PaginationItem key={`ellipsis-${i}`}><PaginationEllipsis /></PaginationItem>
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
    </div>
  );
}
