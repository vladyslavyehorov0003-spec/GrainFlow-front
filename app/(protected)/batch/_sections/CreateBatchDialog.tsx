"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { createBatch, CreateBatchRequest, CULTURE_LABEL, CultureType } from "@/lib/batch";

const CULTURES = Object.keys(CULTURE_LABEL) as CultureType[];

const schema = z.object({
  contractNumber: z.string().min(1, "Required"),
  culture:        z.enum(["WHEAT", "BARLEY", "CORN", "SUNFLOWER", "SOYBEAN", "RYE", "OATS"]),
  totalVolume: z.string().min(1, "Required").refine(
    (v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0,
    "Must be greater than 0"
  ),
  loadingFrom:    z.string().min(1, "Required"),
  loadingTo:      z.string().min(1, "Required"),
  comment:        z.string().optional(),
}).refine((d) => d.loadingTo >= d.loadingFrom, {
  message: "Must be after loading from",
  path: ["loadingTo"],
});

type FormValues = z.infer<typeof schema>;

interface Props {
  onCreated: () => void;
}

export function CreateBatchDialog({ onCreated }: Props) {
  const [open, setOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormValues) {
    try {
      await createBatch({
        ...data,
        totalVolume: parseFloat(data.totalVolume),
      });
      toast.success("Batch created");
      reset();
      setOpen(false);
      onCreated();
    } catch {
      toast.error("Failed to create batch");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus size={16} />
        Add batch
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New batch</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label>Contract number</Label>
            <Input placeholder="CNT-2026-001" {...register("contractNumber")} />
            {errors.contractNumber && <p className="text-xs text-destructive">{errors.contractNumber.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Culture</Label>
              <Controller
                name="culture"
                control={control}
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CULTURES.map((c) => (
                        <SelectItem key={c} value={c}>{CULTURE_LABEL[c]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.culture && <p className="text-xs text-destructive">{errors.culture.message}</p>}
            </div>

            <div className="space-y-1">
              <Label>Total volume (t)</Label>
              <Input type="number" step="0.001" placeholder="0.000" {...register("totalVolume")} />
              {errors.totalVolume && <p className="text-xs text-destructive">{errors.totalVolume.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Loading from</Label>
              <Input type="date" {...register("loadingFrom")} />
              {errors.loadingFrom && <p className="text-xs text-destructive">{errors.loadingFrom.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Loading to</Label>
              <Input type="date" {...register("loadingTo")} />
              {errors.loadingTo && <p className="text-xs text-destructive">{errors.loadingTo.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <Label>Comment <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Textarea placeholder="Notes about this batch..." rows={3} {...register("comment")} />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create batch"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
