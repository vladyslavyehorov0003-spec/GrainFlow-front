"use client";

import { VehicleResponse } from "@/lib/vehicle";
import { CULTURE_LABEL } from "@/lib/batch";
import { Badge } from "@/components/ui/badge";
import { Truck, Clock } from "lucide-react";

interface Props {
  vehicles: VehicleResponse[];
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function PendingReviewList({ vehicles }: Props) {
  const pending = vehicles.filter((v) => v.status === "PENDING_REVIEW");

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Pending review</p>
        {pending.length > 0 && (
          <Badge variant="destructive" className="text-xs">{pending.length} action{pending.length !== 1 ? "s" : ""} needed</Badge>
        )}
      </div>
      {pending.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">No vehicles pending review</p>
      ) : (
        <div className="space-y-2">
          {pending.map((v) => (
            <div key={v.id} className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
              <div className="rounded-md bg-muted p-1.5 shrink-0">
                <Truck size={14} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{v.licensePlate}</p>
                <p className="text-xs text-muted-foreground">
                  {CULTURE_LABEL[v.culture]} · {v.declaredVolume} t
                </p>
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                <Clock size={11} />
                {timeAgo(v.arrivedAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
