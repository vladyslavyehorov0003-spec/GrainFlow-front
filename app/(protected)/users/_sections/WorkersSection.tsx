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
import { useWorkers } from "@/lib/hooks/useWorkers";
import { deleteWorker } from "@/lib/workers";
import { toast } from "sonner";
import { Search, ArrowUp, ArrowDown } from "lucide-react";
import { CreateWorkerDialog } from "./CreateWorkerDialog";
import { DeleteDialog } from "./DeleteDialog";
import { UpdateWorkerDialog } from "./UpdateWorkerDialog";
import { cn } from "@/lib/utils";

type EnabledFilter = "all" | "active" | "inactive";

export function WorkersSection() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [enabledFilter, setEnabledFilter] = useState<EnabledFilter>("all");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

  // Debounce search — wait 400ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { workers, totalElements, isLoading, refetch } = useWorkers({
    search:  search || undefined,
    enabled: enabledFilter === "all" ? undefined : enabledFilter === "active",
    sort:    `createdAt,${sortDir}`,
  });

  async function handleDelete(id: string, name: string) {
    try {
      await deleteWorker(id);
      toast.success(`${name} deactivated`);
      refetch();
    } catch {
      toast.error("Failed to deactivate worker");
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workers</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : `${totalElements} employee${totalElements !== 1 ? "s" : ""}`}
          </p>
        </div>
        <CreateWorkerDialog onCreated={refetch} />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by name, email, ID..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex items-center gap-1 rounded-lg border p-1">
          {(["all", "active", "inactive"] as EnabledFilter[]).map((f) => (
            <Button
              key={f}
              variant={enabledFilter === f ? "default" : "ghost"}
              size="sm"
              className="capitalize h-7 px-3"
              onClick={() => setEnabledFilter(f)}
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Employee ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <button
                  onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Created
                  {sortDir === "desc" ? <ArrowDown size={13} /> : <ArrowUp size={13} />}
                </button>
              </TableHead>
              <TableHead className="w-20 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ?
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  ))}
                  <TableCell />
                </TableRow>
              ))
            : workers.length === 0 ?
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                  {search || enabledFilter !== "all"
                    ? "No workers match your search."
                    : "No workers yet. Add your first employee."}
                </TableCell>
              </TableRow>
            : workers.map((w) => (
                <TableRow key={w.id} className={cn(!w.enabled && "opacity-60")}>
                  <TableCell className="font-medium">
                    {w.firstName} {w.lastName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {w.email}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    {w.employeeId ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={w.enabled ? "default" : "secondary"}>
                      {w.enabled ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(w.createdAt).toLocaleDateString("en-GB")}
                  </TableCell>
                  <TableCell className="text-right">
                    <UpdateWorkerDialog worker={w} onUpdated={refetch} />
                    <DeleteDialog
                      deleteHandler={() => handleDelete(w.id, `${w.firstName} ${w.lastName}`)}
                      message="After deletion, the user will lose access to all company actions."
                    />
                  </TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
