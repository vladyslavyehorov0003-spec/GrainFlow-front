"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, FlaskConical, FileText, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { VehicleResponse, acceptVehicle, rejectVehicle } from "@/lib/vehicle";
import { getBatch, BatchResponse, CULTURE_LABEL } from "@/lib/batch";
import { getLabAnalyses, LabAnalysisResponse } from "@/lib/lab";

// ── helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Field({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number | null | undefined;
  highlight?: boolean;
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm font-medium ${highlight ? "text-primary" : ""}`}>
        {value ?? "—"}
      </p>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
      <Icon size={13} />
      {title}
    </div>
  );
}

// ── schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  comment: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// ── component ─────────────────────────────────────────────────────────────────

interface Props {
  vehicle: VehicleResponse;
  onDone: () => void;
}

export function DecisionDialog({ vehicle, onDone }: Props) {
  const [open, setOpen] = useState(false);
  const [batch, setBatch] = useState<BatchResponse | null>(null);
  const [lab, setLab] = useState<LabAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function fetchData() {
    setLoading(true);
    Promise.all([
      getBatch(vehicle.batchId),
      getLabAnalyses({ vehicleId: vehicle.id, size: 1 }),
    ])
      .then(([b, page]) => {
        setBatch(b);
        setLab(page.content[0] ?? null);
      })
      .finally(() => setLoading(false));
  }

  function handleClose() {
    reset();
    setOpen(false);
  }

  async function handleAccept() {
    try {
      await acceptVehicle(vehicle.id);
      toast.success(`${vehicle.licensePlate} accepted`);
      handleClose();
      onDone();
    } catch {
      toast.error("Failed to accept vehicle");
    }
  }

  async function handleReject(data: FormValues) {
    try {
      await rejectVehicle(vehicle.id, data.comment);
      toast.success(`${vehicle.licensePlate} rejected`);
      handleClose();
      onDone();
    } catch {
      toast.error("Failed to reject vehicle");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        else fetchData();
        setOpen(v);
      }}
    >
      <DialogTrigger render={<Button size="sm" />}>Make Decision</DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck size={16} />
            Decision — {vehicle.licensePlate}
          </DialogTitle>
        </DialogHeader>

        {loading ?
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        : <div className="space-y-5 pt-1">
            {/* Vehicle */}
            <div className="space-y-3">
              <SectionTitle icon={Truck} title="Vehicle" />
              <div className="grid grid-cols-4 gap-4">
                <Field label="License plate" value={vehicle.licensePlate} />
                <Field label="Driver" value={vehicle.driverName} />
                <Field label="Arrived" value={fmtDate(vehicle.arrivedAt)} />
                <Field
                  label="Finished"
                  value={fmtDate(vehicle.unloadingFinishedAt)}
                />
              </div>
            </div>

            <Separator />

            {/* Contract */}
            <div className="space-y-3">
              <SectionTitle icon={FileText} title="Contract" />
              {batch ?
                <div className="grid grid-cols-4 gap-4">
                  <Field label="Contract №" value={batch.contractNumber} />
                  <Field label="Culture" value={CULTURE_LABEL[batch.culture]} />
                  <Field
                    label="Total volume"
                    value={`${batch.totalVolume} t`}
                  />
                  <Field
                    label="Accepted so far"
                    value={`${batch.acceptedVolume} t`}
                  />
                </div>
              : <p className="text-sm text-muted-foreground">
                  No contract data
                </p>
              }
            </div>

            <Separator />

            {/* Lab */}
            <div className="space-y-3">
              <SectionTitle icon={FlaskConical} title="Lab Analysis" />
              {lab ?
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-4">
                    <Field
                      label="Declared vol."
                      value={`${vehicle.declaredVolume} t`}
                    />
                    <Field
                      label="Actual vol."
                      value={
                        lab.actualVolume != null ?
                          `${lab.actualVolume} t`
                        : null
                      }
                      highlight
                    />
                    <Field
                      label="Moisture"
                      value={lab.moisture != null ? `${lab.moisture}%` : null}
                    />
                    <Field
                      label="Impurity"
                      value={lab.impurity != null ? `${lab.impurity}%` : null}
                    />
                  </div>
                  {lab.protein != null && (
                    <div className="grid grid-cols-4 gap-4">
                      <Field label="Protein" value={`${lab.protein}%`} />
                      <Field
                        label="approval status"
                        value={`${lab.approvalStatus}`}
                      />
                    </div>
                  )}
                  {lab.dryingStartedAt && (
                    <>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                        Drying
                      </p>
                      <div className="grid grid-cols-4 gap-4">
                        <Field
                          label="Vol. before"
                          value={
                            lab.volumeBeforeDrying != null ?
                              `${lab.volumeBeforeDrying} t`
                            : null
                          }
                        />
                        <Field
                          label="Vol. after"
                          value={
                            lab.volumeAfterDrying != null ?
                              `${lab.volumeAfterDrying} t`
                            : null
                          }
                          highlight
                        />
                        <Field
                          label="Moisture after"
                          value={
                            lab.moistureAfterDrying != null ?
                              `${lab.moistureAfterDrying}%`
                            : null
                          }
                        />
                        <Field
                          label="Lab status"
                          value={lab.status.replace("_", " ")}
                        />
                      </div>
                    </>
                  )}
                  {lab.comment && (
                    <p className="text-xs text-muted-foreground border rounded-md px-3 py-2 bg-muted/40">
                      {lab.comment}
                    </p>
                  )}
                </div>
              : <p className="text-sm text-muted-foreground">No lab data</p>}
            </div>

            <Separator />

            {/* Decision */}
            <form onSubmit={handleSubmit(handleReject)} className="space-y-3">
              <div className="space-y-1">
                <Label>
                  Comment{" "}
                  <span className="text-muted-foreground text-xs">
                    (required for rejection)
                  </span>
                </Label>
                <Textarea
                  placeholder="Reason for rejection..."
                  rows={2}
                  {...register("comment")}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  className="flex-1"
                  disabled={isSubmitting}
                  onClick={handleAccept}
                >
                  Accept
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Reject
                </Button>
              </div>
            </form>
          </div>
        }
      </DialogContent>
    </Dialog>
  );
}
