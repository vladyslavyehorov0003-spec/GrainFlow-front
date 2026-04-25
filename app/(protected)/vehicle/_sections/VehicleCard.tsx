"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { VehicleResponse, VehicleStatus, startProcessing } from "@/lib/vehicle";
import { getErrorMessage } from "@/lib/errors";
import { CULTURE_LABEL } from "@/lib/batch";
import { toast } from "sonner";
import { Truck, User, Clock } from "lucide-react";
import { DecisionDialog } from "./DecisionDialog";

interface Props {
  vehicle: VehicleResponse;
  onUpdated: () => void;
}

function formatTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

const STATUS_BADGE: Record<VehicleStatus, { label: string; variant: "secondary" | "default" | "outline" | "destructive" }> = {
  ARRIVED:        { label: "Waiting",        variant: "secondary" },
  IN_PROCESS:     { label: "In Process",     variant: "default" },
  PENDING_REVIEW: { label: "Pending Review", variant: "outline" },
  ACCEPTED:       { label: "Accepted",       variant: "outline" },
  REJECTED:       { label: "Rejected",       variant: "destructive" },
};

export function VehicleCard({ vehicle, onUpdated }: Props) {
  const { licensePlate, driverName, culture, declaredVolume, status, arrivedAt, unloadingStartedAt } = vehicle;

  async function handleStartProcessing() {
    try {
      await startProcessing(vehicle.id);
      toast.success(`Processing started for ${licensePlate}`);
      onUpdated();
    } catch (e) {
      toast.error(getErrorMessage(e, "Failed to start processing"));
    }
  }

  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card px-5 py-4">
      <div className="shrink-0 rounded-lg bg-muted p-2.5">
        <Truck size={20} className="text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold tracking-wide">{licensePlate}</span>
          <Badge variant={STATUS_BADGE[status].variant} className="text-xs">
            {STATUS_BADGE[status].label}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <User size={12} />
            {driverName ?? "No driver"}
          </span>
          <span>
            {CULTURE_LABEL[culture]} · <strong className="text-foreground">{declaredVolume} t</strong>
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            Arrived {formatTime(arrivedAt)}
            {unloadingStartedAt && <> · Started {formatTime(unloadingStartedAt)}</>}
          </span>
        </div>
      </div>

      <div className="shrink-0">
        {status === "ARRIVED" && (
          <AlertDialog>
            <AlertDialogTrigger render={<Button size="sm" />}>Start Processing</AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Start processing for {licensePlate}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will begin unloading and create a lab analysis.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleStartProcessing}>Start</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        {status === "IN_PROCESS" && (
          <Badge variant="outline" className="text-xs">Lab in progress</Badge>
        )}
        {status === "PENDING_REVIEW" && (
          <DecisionDialog vehicle={vehicle} onDone={onUpdated} />
        )}
        {status === "ACCEPTED" && (
          <Badge variant="outline" className="text-xs">Accepted</Badge>
        )}
        {status === "REJECTED" && (
          <Badge variant="destructive" className="text-xs">Rejected</Badge>
        )}
      </div>
    </div>
  );
}
