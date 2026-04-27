import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

type TableSkeletonProps = {
  rows: number;
  columns: number;
  trailingEmpty?: boolean;
};

export function TableSkeleton({ rows, columns, trailingEmpty = false }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: columns }).map((_, j) => (
            <TableCell key={j}>
              <Skeleton className="h-4 w-24" />
            </TableCell>
          ))}
          {trailingEmpty && <TableCell />}
        </TableRow>
      ))}
    </>
  );
}
