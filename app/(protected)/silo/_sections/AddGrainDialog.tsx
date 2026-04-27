"use client";

import { useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PackagePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormDialog } from "@/components/forms/FormDialog";
import { FormField } from "@/components/forms/FormField";

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
    <FormDialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        else fetchAnalyses();
        setOpen(v);
      }}
      trigger={
        <DialogTrigger render={<Button size="sm" className="flex-1" />}>
          <PackagePlus size={14} />
          Add grain
        </DialogTrigger>
      }
      title={`Add grain — ${silo.name}`}
      maxWidth="sm"
      loading={loading}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel="Add to silo"
      submittingLabel="Adding..."
      submitDisabled={analyses.length === 0}
    >
      <FormField label="Lab analysis" error={errors.labAnalysisId?.message}>
        <Controller
          name="labAnalysisId"
          control={control}
          render={({ field }) => (
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
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
                      {a.volumeAfterDrying != null ? `${a.volumeAfterDrying} t` : "—"}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      {selectedAnalysis && (
        <div className="rounded-lg border bg-muted/40 px-3 py-2 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Actual volume</span>
            <span className="font-medium">{selectedAnalysis.volumeAfterDrying} t</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Available in silo</span>
            <span className="font-medium">{silo.maxAmount - silo.currentAmount} t</span>
          </div>
        </div>
      )}
    </FormDialog>
  );
}
