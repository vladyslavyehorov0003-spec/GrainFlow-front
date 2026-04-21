"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LabAnalysisResponse, releaseLab } from "@/lib/lab";

const schema = z.object({
  isApproved: z.boolean(),
  comment:    z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props { analysis: LabAnalysisResponse; onDone: () => void; }

export function ReleaseDialog({ analysis, onDone }: Props) {
  const [open, setOpen] = useState(false);
  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormValues) {
    try {
      await releaseLab(analysis.id, { isApproved: data.isApproved, comment: data.comment });
      toast.success("Vehicle released for manager review");
      reset();
      setOpen(false);
      onDone();
    } catch {
      toast.error("Failed to release vehicle");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); setOpen(v); }}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>Release Vehicle</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Release vehicle for review</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label>Verdict</Label>
            <Controller
              name="isApproved"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value === undefined ? "" : String(field.value)}
                  onValueChange={(v) => field.onChange(v === "true")}
                >
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Approved — grain accepted</SelectItem>
                    <SelectItem value="false">Rejected — grain rejected</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.isApproved && <p className="text-xs text-destructive">{errors.isApproved.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Comment <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Textarea placeholder="Notes..." rows={2} {...register("comment")} />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Releasing..." : "Release for Manager Review"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
