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
import { Textarea } from "@/components/ui/textarea";
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
import { createSilo } from "@/lib/silo";
import { getErrorMessage } from "@/lib/errors";
import { CULTURE_LABEL, CultureType } from "@/lib/batch";

const CULTURES = Object.keys(CULTURE_LABEL) as CultureType[];

const schema = z.object({
  name:      z.string().min(1, "Required"),
  maxAmount: z.string().min(1, "Required").refine(
    (v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0,
    "Must be greater than 0"
  ),
  culture:   z.enum(["WHEAT", "BARLEY", "CORN", "SUNFLOWER", "SOYBEAN", "RYE", "OATS"]).optional(),
  comment:   z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  onCreated: () => void;
}

export function CreateSiloDialog({ onCreated }: Props) {
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
      await createSilo({
        name:      data.name,
        maxAmount: parseFloat(data.maxAmount),
        culture:   data.culture,
        comment:   data.comment,
      });
      toast.success("Silo created");
      reset();
      setOpen(false);
      onCreated();
    } catch (e) {
      toast.error(getErrorMessage(e, "Failed to create silo"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); setOpen(v); }}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus size={15} />
        Add silo
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New silo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input placeholder="Silo A1" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Capacity (t)</Label>
              <Input type="number" step="0.001" placeholder="0.000" {...register("maxAmount")} />
              {errors.maxAmount && <p className="text-xs text-destructive">{errors.maxAmount.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Culture <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Controller
                name="culture"
                control={control}
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v || undefined)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Any..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CULTURES.map((c) => (
                        <SelectItem key={c} value={c}>{CULTURE_LABEL[c]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Comment <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Textarea placeholder="Notes..." rows={2} {...register("comment")} />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create silo"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
