"use client";

import { ReactNode } from "react";
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
import { TableSkeleton } from "./TableSkeleton";
import { TableEmpty } from "./TableEmpty";
import { cn } from "@/lib/utils";

export type Column<T> = {
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  isLoading: boolean;
  emptyMessage: string;
  rowKey: (row: T) => string | number;
  rowClassName?: (row: T) => string | undefined;
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  itemName: { singular: string; plural: string };
};

function getPageNumbers(page: number, totalPages: number): (number | "ellipsis")[] {
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

export function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyMessage,
  rowKey,
  rowClassName,
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  itemName,
}: DataTableProps<T>) {
  return (
    <div className="space-y-2">
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c, i) => (
                <TableHead key={i} className={c.headerClassName}>
                  {c.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ?
              <TableSkeleton rows={pageSize} columns={columns.length} />
            : data.length === 0 ?
              <TableEmpty colSpan={columns.length} message={emptyMessage} />
            : data.map((row) => (
                <TableRow key={rowKey(row)} className={rowClassName?.(row)}>
                  {columns.map((c, i) => (
                    <TableCell key={i} className={c.className}>
                      {c.cell(row)}
                    </TableCell>
                  ))}
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
                    onClick={() => onPageChange(Math.max(0, page - 1))}
                    aria-disabled={page === 0}
                    className={cn(page === 0 && "pointer-events-none opacity-40")}
                  />
                </PaginationItem>
                {getPageNumbers(page, totalPages).map((p, i) =>
                  p === "ellipsis" ? (
                    <PaginationItem key={`e-${i}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink isActive={p === page} onClick={() => onPageChange(p)}>
                        {p + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
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
        {isLoading ?
          "Loading..."
        : `${totalElements} ${totalElements === 1 ? itemName.singular : itemName.plural} total`}
      </p>
    </div>
  );
}
