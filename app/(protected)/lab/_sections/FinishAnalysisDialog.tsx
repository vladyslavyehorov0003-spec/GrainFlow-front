"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DialogTrigger } from "@/components/ui/dialog";
import { FormDialog } from "@/components/forms/FormDialog";
import { FormField } from "@/components/forms/FormField";
import { LabAnalysisResponse, finishAnalysis } from "@/lib/lab";
import { getErrorMessage } from "@/lib/errors";

// Percent fields share the same 0–100 range — keep the rule in one place
// so we don't drift from the backend's @DecimalMax("100.00").
const percent = (label: string) =>
  z.string().min(1, "Required").refine((v) => {
    const n = parseFloat(v);
    return !isNaN(n) && n >= 0 && n <= 100;
  }, `${label} must be between 0 and 100`);

const schema = z.object({
  moisture: percent("Moisture"),
  impurity: percent("Impurity"),
  // Protein is optional, but if filled, still capped at 100%
  protein:  z.string().optional().refine((v) => {
    if (!v) return true;
    const n = parseFloat(v);
    return !isNaN(n) && n >= 0 && n <= 100;
  }, "Protein must be between 0 and 100"),
  actualVolume: z.string().min(1, "Required").refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, "Must be > 0"),
  comment:      z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props { analysis: LabAnalysisResponse; onDone: () => void; }

export function FinishAnalysisDialog({ analysis, onDone }: Props) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormValues) {
    try {
      await finishAnalysis(analysis.id, {
        moisture:     parseFloat(data.moisture),
        impurity:     parseFloat(data.impurity),
        protein:      data.protein ? parseFloat(data.protein) : undefined,
        actualVolume: parseFloat(data.actualVolume),
        comment:      data.comment,
      });
      toast.success("Analysis recorded");
      reset();
      setOpen(false);
      onDone();
    } catch (e) {
      toast.error(getErrorMessage(e, "Failed to record analysis"));
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={(v) => { if (!v) reset(); setOpen(v); }}
      trigger={<DialogTrigger render={<Button size="sm" />}>Finish Analysis</DialogTrigger>}
      title="Finish Analysis"
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel="Save Results"
      submittingLabel="Saving..."
    >
      <div className="grid grid-cols-3 gap-3">
        <FormField label="Moisture (%)" error={errors.moisture?.message}>
          <Input type="number" step="0.01" min="0" max="100" placeholder="0.00" {...register("moisture")} />
        </FormField>
        <FormField label="Impurity (%)" error={errors.impurity?.message}>
          <Input type="number" step="0.01" min="0" max="100" placeholder="0.00" {...register("impurity")} />
        </FormField>
        <FormField label="Protein (%)" optional error={errors.protein?.message}>
          <Input type="number" step="0.01" min="0" max="100" placeholder="0.00" {...register("protein")} />
        </FormField>
      </div>
      <FormField label="Actual volume (t)" error={errors.actualVolume?.message}>
        <Input type="number" step="0.001" placeholder="0.000" {...register("actualVolume")} />
      </FormField>
      <FormField label="Comment" optional>
        <Textarea placeholder="Notes..." rows={2} {...register("comment")} />
      </FormField>
    </FormDialog>
  );
}
