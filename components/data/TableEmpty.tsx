import { TableCell, TableRow } from "@/components/ui/table";

type TableEmptyProps = {
  colSpan: number;
  message: string;
};

export function TableEmpty({ colSpan, message }: TableEmptyProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="text-center text-muted-foreground py-12">
        {message}
      </TableCell>
    </TableRow>
  );
}
