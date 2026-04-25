"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { useVehicles } from "@/lib/hooks/useVehicles";
import { VehicleStatus } from "@/lib/vehicle";
import { CULTURE_LABEL } from "@/lib/batch";
import { Search, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 15;

const STATUS_LABEL: Record<VehicleStatus, string> = {
  ARRIVED:        "Waiting",
  IN_PROCESS:     "In Process",
  PENDING_REVIEW: "Pending Review",
  ACCEPTED:       "Accepted",
  REJECTED:       "Rejected",
};

const STATUS_VARIANT: Record<VehicleStatus, "default" | "secondary" | "outline" | "destructive"> = {
  ARRIVED:        "secondary",
  IN_PROCESS:     "default",
  PENDING_REVIEW: "secondary",
  ACCEPTED:       "outline",
  REJECTED:       "destructive",
};

type StatusFilter = "ALL" | VehicleStatus;
const STATUS_OPTIONS: StatusFilter[] = ["ALL", "ARRIVED", "IN_PROCESS", "PENDING_REVIEW", "ACCEPTED", "REJECTED"];

export function VehicleTableSection() {
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

  const { data, isLoading } = useVehicles({
    licensePlate:  search || undefined,
    status:        statusFilter === "ALL" ? undefined : statusFilter,
    sort:          `arrivedAt,${sortDir}`,
    page,
    size:          PAGE_SIZE,
  });
  const { content: vehicles, totalPages, totalElements } = data;

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
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by license plate..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex items-center gap-1 rounded-lg border p-1 flex-wrap">
          {STATUS_OPTIONS.map((f) => (
            <Button
              key={f}
              variant={statusFilter === f ? "default" : "ghost"}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => { setStatusFilter(f); setPage(0); }}
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
              <TableHead>License Plate</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Culture</TableHead>
              <TableHead>Volume (t)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <button
                  onClick={() => { setSortDir((d) => d === "desc" ? "asc" : "desc"); setPage(0); }}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Arrived
                  {sortDir === "desc" ? <ArrowDown size={13} /> : <ArrowUp size={13} />}
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ?
              Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>
                  ))}
                </TableRow>
              ))
            : vehicles.length === 0 ?
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                  {search || statusFilter !== "ALL" ? "No vehicles match your search." : "No vehicles yet."}
                </TableCell>
              </TableRow>
            : vehicles.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-mono font-medium">{v.licensePlate}</TableCell>
                  <TableCell className="text-muted-foreground">{v.driverName ?? "—"}</TableCell>
                  <TableCell>{CULTURE_LABEL[v.culture]}</TableCell>
                  <TableCell className="text-muted-foreground">{v.declaredVolume}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[v.status]}>{STATUS_LABEL[v.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(v.arrivedAt).toLocaleDateString("en-GB")}
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
        {isLoading ? "Loading..." : `${totalElements} vehicle${totalElements !== 1 ? "s" : ""} total`}
      </p>
    </div>
  );
}
