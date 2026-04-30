"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus, Truck } from "lucide-react";
import { useActiveVehicles } from "@/lib/hooks/useActiveVehicles";
import { VehicleCard } from "./VehicleCard";

interface Props {
  onAddVehicle: () => void;
  refreshTrigger?: number;
}

function SectionLabel({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
        {label}
      </span>
      <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5 font-medium">
        {count}
      </span>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card px-5 py-4">
      <Skeleton className="size-10 rounded-lg shrink-0" />
      {/* min-w-0 lets the flex item shrink below its content's intrinsic width.
          max-w-full on the inner bars keeps them inside the parent on tiny screens. */}
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-5 w-36 max-w-full" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>
      <Skeleton className="h-8 w-36 shrink-0" />
    </div>
  );
}

export function VehicleWorkerTab({ onAddVehicle, refreshTrigger }: Props) {
  const { data, isLoading, refetch } = useActiveVehicles(refreshTrigger);
  const { arrived, inProcess, pending_review } = data;
  const total = arrived.length + inProcess.length + pending_review.length;

  if (isLoading) {
    return (
      <div className="space-y-3">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Empty state */}
      {total === 0 && (
        <div
          className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card py-16 text-muted-foreground cursor-pointer hover:bg-muted/40 transition-colors"
          onClick={onAddVehicle}
        >
          <div className="rounded-full bg-muted p-4">
            <Truck size={24} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              No active vehicles
            </p>
            <p className="text-xs mt-0.5">
              Click to register a new vehicle arrival
            </p>
          </div>
        </div>
      )}

      {/* ARRIVED section */}
      {pending_review.length > 0 && (
        <div className="space-y-2">
          <SectionLabel label="Pending Review" count={pending_review.length} />
          <div className="space-y-2">
            {pending_review.map((v) => (
              <VehicleCard key={v.id} vehicle={v} onUpdated={refetch} />
            ))}
          </div>
        </div>
      )}
      {/* ARRIVED section */}
      {arrived.length > 0 && (
        <div className="space-y-2">
          <SectionLabel label="Waiting" count={arrived.length} />
          <div className="space-y-2">
            {arrived.map((v) => (
              <VehicleCard key={v.id} vehicle={v} onUpdated={refetch} />
            ))}
          </div>
        </div>
      )}

      {/* IN_PROCESS section */}
      {inProcess.length > 0 && (
        <div className="space-y-2">
          <SectionLabel label="In Process" count={inProcess.length} />
          <div className="space-y-2">
            {inProcess.map((v) => (
              <VehicleCard key={v.id} vehicle={v} onUpdated={refetch} />
            ))}
          </div>
        </div>
      )}

      {/* Add button — always visible when there are vehicles */}
      {total > 0 && (
        <Button variant="outline" className="w-full" onClick={onAddVehicle}>
          <Plus size={15} />
          Register new vehicle
        </Button>
      )}
    </div>
  );
}
