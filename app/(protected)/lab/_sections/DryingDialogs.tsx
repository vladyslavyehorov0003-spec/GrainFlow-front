"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Flame } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LabAnalysisResponse, startDrying, finishDrying } from "@/lib/lab";
import { getErrorMessage } from "@/lib/errors";

// ── Start Drying ──────────────────────────────────────────────────────────────

const startSchema = z.object({
  volumeBeforeDrying:   z.string().min(1, "Required").refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, "Must be > 0"),
  estimatedDryingEndAt: z.string().optional(),
});

interface StartProps { analysis: LabAnalysisResponse; onDone: () => void; }

export function StartDryingDialog({ analysis, onDone }: StartProps) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm({ resolver: zodResolver(startSchema) });

  async function onSubmit(data: z.infer<typeof startSchema>) {
    try {
      await startDrying(analysis.id, {
        volumeBeforeDrying:   parseFloat(data.volumeBeforeDrying),
        estimatedDryingEndAt: data.estimatedDryingEndAt
          ? new Date(data.estimatedDryingEndAt).toISOString()
          : undefined,
      });
      toast.success("Drying started");
      reset();
      setOpen(false);
      onDone();
    } catch (e) {
      toast.error(getErrorMessage(e, "Failed to start drying"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); setOpen(v); }}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <Flame size={14} /> Start Drying
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Start Drying</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label>Volume before drying (t)</Label>
            <Input type="number" step="0.001" placeholder="0.000" {...register("volumeBeforeDrying")} />
            {errors.volumeBeforeDrying && <p className="text-xs text-destructive">{errors.volumeBeforeDrying.message as string}</p>}
          </div>
          <div className="space-y-1">
            <Label>Estimated end <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input type="datetime-local" {...register("estimatedDryingEndAt")} />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Starting..." : "Start Drying"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Finish Drying ─────────────────────────────────────────────────────────────

const finishSchema = z.object({
  volumeAfterDrying:   z.string().min(1, "Required").refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, "Must be > 0"),
  moistureAfterDrying: z.string().min(1, "Required").refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, "Must be ≥ 0"),
});

interface FinishProps { analysis: LabAnalysisResponse; onDone: () => void; }

export function FinishDryingDialog({ analysis, onDone }: FinishProps) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm({ resolver: zodResolver(finishSchema) });

  async function onSubmit(data: z.infer<typeof finishSchema>) {
    try {
      await finishDrying(analysis.id, {
        volumeAfterDrying:   parseFloat(data.volumeAfterDrying),
        moistureAfterDrying: parseFloat(data.moistureAfterDrying),
      });
      toast.success("Drying finished");
      reset();
      setOpen(false);
      onDone();
    } catch (e) {
      toast.error(getErrorMessage(e, "Failed to finish drying"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); setOpen(v); }}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>Finish Drying</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Finish Drying</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label>Volume after drying (t)</Label>
            <Input type="number" step="0.001" placeholder="0.000" {...register("volumeAfterDrying")} />
            {errors.volumeAfterDrying && <p className="text-xs text-destructive">{errors.volumeAfterDrying.message as string}</p>}
          </div>
          <div className="space-y-1">
            <Label>Moisture after drying (%)</Label>
            <Input type="number" step="0.01" placeholder="0.00" {...register("moistureAfterDrying")} />
            {errors.moistureAfterDrying && <p className="text-xs text-destructive">{errors.moistureAfterDrying.message as string}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Finish Drying"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
