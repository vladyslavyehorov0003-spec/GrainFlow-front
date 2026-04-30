"use client";

import { toast } from "sonner";
import { FlaskConical, Truck, Clock } from "lucide-react";

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
import { LabStatusBadge } from "@/components/feedback/StatusBadge";

import { LabAnalysisResponse, LabStatus, startAnalysis } from "@/lib/lab";
import { getErrorMessage } from "@/lib/errors";
import { FinishAnalysisDialog } from "./FinishAnalysisDialog";
import { StartDryingDialog, FinishDryingDialog } from "./DryingDialogs";
import { ReleaseDialog } from "./ReleaseDialog";

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value ?? "—"}</p>
    </div>
  );
}

const RELEASABLE: LabStatus[] = ["ANALYSIS_DONE", "DRYING", "DRYING_DONE"];

interface Props {
  analysis: LabAnalysisResponse;
  onUpdated: () => void;
}

export function LabCard({ analysis, onUpdated }: Props) {
  const { status, approvalStatus } = analysis;

  async function handleStart() {
    try {
      await startAnalysis(analysis.id);
      toast.success("Analysis started");
      onUpdated();
    } catch (e) {
      toast.error(getErrorMessage(e, "Failed to start analysis"));
    }
  }

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      {/* Header: stacks on mobile, side-by-side on sm+ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 rounded-lg bg-muted p-2.5">
            <FlaskConical size={18} className="text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold flex items-center gap-1.5">
                <Truck size={13} className="text-muted-foreground" />
                {analysis.vehicleId.slice(0, 8).toUpperCase()}
              </span>
              <LabStatusBadge status={status} className="text-xs" />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <Clock size={11} />
              Created {fmtDate(analysis.createdAt)}
              {analysis.analysisStartedAt && <> · Started {fmt(analysis.analysisStartedAt)}</>}
            </p>
          </div>
        </div>

        {/* Buttons: full width on mobile (under header), auto width on sm+ */}
        <div className="flex items-center gap-2 flex-wrap sm:shrink-0 sm:justify-end">
          {status === "PENDING" && (
            <AlertDialog>
              <AlertDialogTrigger render={<Button size="sm" />}>Start Analysis</AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Start analysis?</AlertDialogTitle>
                  <AlertDialogDescription>This will mark the lab analysis as in progress.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleStart}>Start</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {status === "IN_PROGRESS" && <FinishAnalysisDialog analysis={analysis} onDone={onUpdated} />}
          {status === "ANALYSIS_DONE" && <StartDryingDialog analysis={analysis} onDone={onUpdated} />}
          {status === "DRYING" && <FinishDryingDialog analysis={analysis} onDone={onUpdated} />}
          {RELEASABLE.includes(status) && approvalStatus === "PENDING" && (
            <ReleaseDialog analysis={analysis} onDone={onUpdated} />
          )}
        </div>
      </div>

      {(analysis.moisture != null || analysis.impurity != null || analysis.actualVolume != null) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t">
          <Field label="Moisture" value={analysis.moisture != null ? `${analysis.moisture}%` : null} />
          <Field label="Impurity" value={analysis.impurity != null ? `${analysis.impurity}%` : null} />
          <Field label="Protein" value={analysis.protein != null ? `${analysis.protein}%` : null} />
          <Field label="Actual volume" value={analysis.actualVolume != null ? `${analysis.actualVolume} t` : null} />
        </div>
      )}

      {analysis.dryingStartedAt && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t">
          <Field label="Vol. before" value={analysis.volumeBeforeDrying != null ? `${analysis.volumeBeforeDrying} t` : null} />
          <Field label="Vol. after" value={analysis.volumeAfterDrying != null ? `${analysis.volumeAfterDrying} t` : null} />
          <Field label="Moisture after" value={analysis.moistureAfterDrying != null ? `${analysis.moistureAfterDrying}%` : null} />
          <Field label="Est. end" value={analysis.estimatedDryingEndAt ? fmtDate(analysis.estimatedDryingEndAt) : null} />
        </div>
      )}

      {analysis.comment && (
        <p className="text-xs text-muted-foreground border-t pt-2">{analysis.comment}</p>
      )}
    </div>
  );
}
