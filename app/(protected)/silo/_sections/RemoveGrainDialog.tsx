"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PackageMinus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { SiloResponse, removeGrain } from "@/lib/silo";
import { getErrorMessage } from "@/lib/errors";

interface Props {
  silo:   SiloResponse;
  onDone: () => void;
}

export function RemoveGrainDialog({ silo, onDone }: Props) {
  const [open, setOpen] = useState(false);

  const schema = z.object({
    amount: z
      .string()
      .min(1, "Required")
      .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, "Must be > 0")
      .refine(
        (v) => parseFloat(v) <= silo.currentAmount,
        `Max available: ${silo.currentAmount} t`,
      ),
  });

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormValues) {
    try {
      await removeGrain(silo.id, parseFloat(data.amount));
      toast.success(`Grain removed from ${silo.name}`);
      reset();
      setOpen(false);
      onDone();
    } catch (e) {
      toast.error(getErrorMessage(e, "Failed to remove grain"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); setOpen(v); }}>
      <DialogTrigger render={<Button size="sm" variant="outline" className="flex-1" />}>
        <PackageMinus size={14} />
        Remove grain
      </DialogTrigger>

      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Remove grain — {silo.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm flex justify-between">
            <span className="text-muted-foreground">Current amount</span>
            <span className="font-medium">{silo.currentAmount} t</span>
          </div>

          <div className="space-y-1">
            <Label>Amount to remove (t)</Label>
            <Input
              type="number"
              step="0.001"
              placeholder="0.000"
              max={silo.currentAmount}
              {...register("amount")}
            />
            {errors.amount && (
              <p className="text-xs text-destructive">{errors.amount.message}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="destructive"
            className="w-full"
            disabled={isSubmitting || silo.currentAmount <= 0}
          >
            {isSubmitting ? "Removing..." : "Remove"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
