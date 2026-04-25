"use client";

import { useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PackagePlus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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

import { SiloResponse, addGrain } from "@/lib/silo";
import { getErrorMessage } from "@/lib/errors";
import { getLabAnalyses, LabAnalysisResponse } from "@/lib/lab";

const schema = z.object({
  labAnalysisId: z.string().min(1, "Select a lab analysis"),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  silo: SiloResponse;
  onDone: () => void;
}

export function AddGrainDialog({ silo, onDone }: Props) {
  const [open, setOpen] = useState(false);
  const [analyses, setAnalyses] = useState<LabAnalysisResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function fetchAnalyses() {
    setLoading(true);
    getLabAnalyses({ size: 100 })
      .then((page) => {
        const ready = page.content.filter(
          (a) =>
            a.approvalStatus === "APPROVED" &&
            a.status !== "STORED" &&
            a.status !== "CANCELED",
        );
        setAnalyses(ready);
      })
      .finally(() => setLoading(false));
  }

  const selectedId = useWatch({ control, name: "labAnalysisId" });
  const selectedAnalysis = analyses.find((a) => a.id === selectedId);

  async function onSubmit(data: FormValues) {
    try {
      await addGrain(silo.id, data.labAnalysisId);
      toast.success(`Grain added to ${silo.name}`);
      reset();
      setOpen(false);
      onDone();
    } catch (e) {
      toast.error(getErrorMessage(e, "Failed to add grain"));
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        else fetchAnalyses();
        setOpen(v);
      }}
    >
      <DialogTrigger render={<Button size="sm" className="flex-1" />}>
        <PackagePlus size={14} />
        Add grain
      </DialogTrigger>

      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add grain — {silo.name}</DialogTitle>
        </DialogHeader>

        {loading ?
          <div className="flex justify-center py-8">
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          </div>
        : <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label>Lab analysis</Label>
              <Controller
                name="labAnalysisId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          analyses.length === 0 ?
                            "No approved analyses available"
                          : "Select..."
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {analyses.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          <span className="font-mono">
                            {a.vehicleId.slice(0, 8).toUpperCase()}
                          </span>
                          <span className="ml-2 text-muted-foreground">
                            {a.volumeAfterDrying != null ?
                              `${a.volumeAfterDrying} t`
                            : "—"}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.labAnalysisId && (
                <p className="text-xs text-destructive">
                  {errors.labAnalysisId.message}
                </p>
              )}
            </div>

            {selectedAnalysis && (
              <div className="rounded-lg border bg-muted/40 px-3 py-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Actual volume</span>
                  <span className="font-medium">
                    {selectedAnalysis.volumeAfterDrying} t
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Available in silo
                  </span>
                  <span className="font-medium">
                    {silo.maxAmount - silo.currentAmount} t
                  </span>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || analyses.length === 0}
            >
              {isSubmitting ? "Adding..." : "Add to silo"}
            </Button>
          </form>
        }
      </DialogContent>
    </Dialog>
  );
}
