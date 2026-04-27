"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Flame } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogTrigger } from "@/components/ui/dialog";
import { FormDialog } from "@/components/forms/FormDialog";
import { FormField } from "@/components/forms/FormField";
import { LabAnalysisResponse, startDrying, finishDrying } from "@/lib/lab";
import { getErrorMessage } from "@/lib/errors";

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
    <FormDialog
      open={open}
      onOpenChange={(v) => { if (!v) reset(); setOpen(v); }}
      trigger={
        <DialogTrigger render={<Button size="sm" variant="outline" />}>
          <Flame size={14} /> Start Drying
        </DialogTrigger>
      }
      title="Start Drying"
      maxWidth="sm"
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel="Start Drying"
      submittingLabel="Starting..."
    >
      <FormField label="Volume before drying (t)" error={errors.volumeBeforeDrying?.message as string | undefined}>
        <Input type="number" step="0.001" placeholder="0.000" {...register("volumeBeforeDrying")} />
      </FormField>
      <FormField label="Estimated end" optional>
        <Input type="datetime-local" {...register("estimatedDryingEndAt")} />
      </FormField>
    </FormDialog>
  );
}

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
    <FormDialog
      open={open}
      onOpenChange={(v) => { if (!v) reset(); setOpen(v); }}
      trigger={<DialogTrigger render={<Button size="sm" variant="outline" />}>Finish Drying</DialogTrigger>}
      title="Finish Drying"
      maxWidth="sm"
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel="Finish Drying"
      submittingLabel="Saving..."
    >
      <FormField label="Volume after drying (t)" error={errors.volumeAfterDrying?.message as string | undefined}>
        <Input type="number" step="0.001" placeholder="0.000" {...register("volumeAfterDrying")} />
      </FormField>
      <FormField label="Moisture after drying (%)" error={errors.moistureAfterDrying?.message as string | undefined}>
        <Input type="number" step="0.01" placeholder="0.00" {...register("moistureAfterDrying")} />
      </FormField>
    </FormDialog>
  );
}
