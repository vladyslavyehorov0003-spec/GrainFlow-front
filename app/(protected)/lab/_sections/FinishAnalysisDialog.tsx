"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LabAnalysisResponse, finishAnalysis } from "@/lib/lab";
import { getErrorMessage } from "@/lib/errors";

const schema = z.object({
  moisture:     z.string().min(1, "Required").refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, "Must be ≥ 0"),
  impurity:     z.string().min(1, "Required").refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, "Must be ≥ 0"),
  protein:      z.string().optional(),
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
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); setOpen(v); }}>
      <DialogTrigger render={<Button size="sm" />}>Finish Analysis</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Finish Analysis</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Moisture (%)</Label>
              <Input type="number" step="0.01" placeholder="0.00" {...register("moisture")} />
              {errors.moisture && <p className="text-xs text-destructive">{errors.moisture.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Impurity (%)</Label>
              <Input type="number" step="0.01" placeholder="0.00" {...register("impurity")} />
              {errors.impurity && <p className="text-xs text-destructive">{errors.impurity.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Protein <span className="text-muted-foreground text-xs">opt.</span></Label>
              <Input type="number" step="0.01" placeholder="0.00" {...register("protein")} />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Actual volume (t)</Label>
            <Input type="number" step="0.001" placeholder="0.000" {...register("actualVolume")} />
            {errors.actualVolume && <p className="text-xs text-destructive">{errors.actualVolume.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Comment <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Textarea placeholder="Notes..." rows={2} {...register("comment")} />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Results"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
