"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useActiveLabAnalyses } from "@/lib/hooks/useActiveLabAnalyses";
import { FlaskConical } from "lucide-react";
import { LabCard } from "./LabCard";

function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-8 w-28 shrink-0" />
      </div>
    </div>
  );
}

type Props = {
  refreshTrigger?: number;
};

const LabWorkerTab = ({ refreshTrigger }: Props) => {
  const { data: analyses, isLoading, refetch } = useActiveLabAnalyses(refreshTrigger);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return analyses.length === 0 ? (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card py-16 text-muted-foreground">
      <div className="rounded-full bg-muted p-4">
        <FlaskConical size={24} />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">No active analyses</p>
        <p className="text-xs mt-0.5">Analyses appear here when a vehicle starts processing</p>
      </div>
    </div>
  ) : (
    <div className="space-y-3">
      {analyses.map((a) => (
        <LabCard key={a.id} analysis={a} onUpdated={refetch} />
      ))}
    </div>
  );
};

export default LabWorkerTab;
