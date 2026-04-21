"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
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
import { useSilos } from "@/lib/hooks/useSilos";
import { CULTURE_LABEL, CultureType } from "@/lib/batch";
import { CreateSiloDialog } from "./CreateSiloDialog";
import { SiloDetailsSheet } from "./SiloDetailsSheet";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 15;

type CultureFilter = "ALL" | CultureType;

const CULTURE_OPTIONS: CultureFilter[] = [
  "ALL", "WHEAT", "BARLEY", "CORN", "SUNFLOWER", "SOYBEAN", "RYE", "OATS",
];

export function SilosSection() {
  const [cultureFilter, setCultureFilter] = useState<CultureFilter>("ALL");
  const [page, setPage] = useState(0);

  const { data, isLoading, refetch } = useSilos({
    culture: cultureFilter === "ALL" ? undefined : cultureFilter,
    sort:    "name,asc",
    page,
    size:    PAGE_SIZE,
  });
  const { content: silos, totalPages, totalElements } = data;

  function handleCultureFilter(f: CultureFilter) {
    setCultureFilter(f);
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Silos</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : `${totalElements} silo${totalElements !== 1 ? "s" : ""}`}
          </p>
        </div>
        <CreateSiloDialog onCreated={refetch} />
      </div>

      {/* Culture filter */}
      <div className="flex items-center gap-1 rounded-lg border p-1 w-fit">
        {CULTURE_OPTIONS.map((f) => (
          <Button
            key={f}
            variant={cultureFilter === f ? "default" : "ghost"}
            size="sm"
            className="h-7 px-3"
            onClick={() => handleCultureFilter(f)}
          >
            {f === "ALL" ? "All" : CULTURE_LABEL[f]}
          </Button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Culture</TableHead>
              <TableHead>Fill level</TableHead>
              <TableHead>Current / Max (t)</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ?
              Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>
                  ))}
                  <TableCell />
                </TableRow>
              ))
            : silos.length === 0 ?
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                  {cultureFilter !== "ALL" ? "No silos match the filter." : "No silos yet."}
                </TableCell>
              </TableRow>
            : silos.map((s) => {
                const fillPct = s.maxAmount > 0
                  ? Math.min(100, Math.round((s.currentAmount / s.maxAmount) * 100))
                  : 0;
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.culture ? CULTURE_LABEL[s.culture] : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[80px]">
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${fillPct}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-right">{fillPct}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.currentAmount} / {s.maxAmount}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(s.createdAt).toLocaleDateString("en-GB")}
                    </TableCell>
                    <TableCell>
                      <SiloDetailsSheet silo={s} onUpdated={refetch} />
                    </TableCell>
                  </TableRow>
                );
              })
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
