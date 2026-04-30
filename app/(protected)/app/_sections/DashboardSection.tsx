"use client";

import { useEffect, useState } from "react";
import { Layers, Truck, FlaskConical, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

import { getSilos, SiloResponse } from "@/lib/silo";
import { getVehicles, VehicleResponse } from "@/lib/vehicle";
import { getBatches, BatchResponse } from "@/lib/batch";
import { getLabAnalyses, LabAnalysisResponse } from "@/lib/lab";

import { StatCard } from "./StatCard";
import { SubscriptionCard } from "./SubscriptionCard";
import { SiloCapacityChart } from "./SiloCapacityChart";
import { VehicleStatusChart } from "./VehicleStatusChart";
import { LabStatusChart } from "./LabStatusChart";
import { BatchProgressList } from "./BatchProgressList";
import { PendingReviewList } from "./PendingReviewList";

function SkeletonCard({ h = "h-[260px]" }: { h?: string }) {
  return <Skeleton className={`rounded-xl ${h} w-full`} />;
}

export function DashboardSection() {
  const [silos, setSilos] = useState<SiloResponse[]>([]);
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([]);
  const [batches, setBatches] = useState<BatchResponse[]>([]);
  const [analyses, setAnalyses] = useState<LabAnalysisResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getSilos({ size: 100 }),
      getVehicles({ size: 100 }),
      getBatches({ status: "ACTIVE", size: 50 }),
      getLabAnalyses({ size: 100 }),
    ])
      .then(([s, v, b, l]) => {
        setSilos(s.content);
        setVehicles(v.content);
        setBatches(b.content);
        setAnalyses(l.content);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const inProcess = vehicles.filter((v) => v.status === "IN_PROCESS").length;
  const pendingCount = vehicles.filter((v) => v.status === "PENDING_REVIEW").length;
  const totalCap = silos.reduce((s, x) => s + Number(x.maxAmount), 0);
  const totalFill = silos.reduce((s, x) => s + Number(x.currentAmount), 0);
  const fillPct = totalCap > 0 ? Math.round((totalFill / totalCap) * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
        {/* Stat cards skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} h="h-[88px]" />
          ))}
        </div>
        {/* Silo + Subscription skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3"><SkeletonCard h="h-[260px]" /></div>
          <SkeletonCard h="h-[260px]" />
        </div>
        {/* Charts skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} h="h-[260px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Warehouse overview</p>
      </div>

      {/* ── Row 1: Stat cards ─────────────────────────────────────────────────
          2 cols on mobile → 4 cols on desktop                               */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active batches"
          value={batches.length}
          sub={`${batches.length} contract${batches.length !== 1 ? "s" : ""} in progress`}
          icon={Layers}
        />
        <StatCard
          title="Vehicles in process"
          value={inProcess}
          sub="Currently unloading"
          icon={Truck}
        />
        <StatCard
          title="Pending review"
          value={pendingCount}
          sub={pendingCount > 0 ? "Manager action needed" : "All clear"}
          icon={AlertTriangle}
        />
        <StatCard
          title="Storage fill"
          value={`${fillPct}%`}
          sub={`${totalFill.toFixed(1)} / ${totalCap.toFixed(1)} t`}
          icon={FlaskConical}
        />
      </div>

      {/* ── Row 2: Silo chart (wide) + Subscription card ─────────────────────
          Stacked on mobile → 3/4 + 1/4 on desktop                          */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <SiloCapacityChart silos={silos} />
        </div>
        <div className="self-start">
          <SubscriptionCard />
        </div>
      </div>

      {/* ── Row 3: Pie charts ─────────────────────────────────────────────────
          Stacked on mobile → side by side on md+                            */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VehicleStatusChart vehicles={vehicles} />
        <LabStatusChart analyses={analyses} />
      </div>

      {/* ── Row 4: Lists ──────────────────────────────────────────────────────
          Stacked on mobile → side by side on md+                            */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BatchProgressList batches={batches} />
        <PendingReviewList vehicles={vehicles} />
      </div>
    </div>
  );
}
