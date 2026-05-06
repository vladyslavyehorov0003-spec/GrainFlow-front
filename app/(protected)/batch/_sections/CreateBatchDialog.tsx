"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { createBatch, CULTURE_LABEL, CultureType } from "@/lib/batch";
import { getErrorMessage } from "@/lib/errors";

const CULTURES = Object.keys(CULTURE_LABEL) as CultureType[];

const schema = z
  .object({
    contractNumber: z.string().min(1, "Required"),
    culture: z.enum(
      ["WHEAT", "BARLEY", "CORN", "SUNFLOWER", "SOYBEAN", "RYE", "OATS"],
      { message: "Select a culture" },
    ),
    totalVolume: z
      .string()
      .min(1, "Required")
      .refine(
        (v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0,
        "Must be greater than 0",
      ),
    loadingFrom: z.string().min(1, "Required"),
    loadingTo: z.string().min(1, "Required"),
    comment: z.string().optional(),
  })
  .refine((d) => d.loadingTo >= d.loadingFrom, {
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
    } catch (e) {
      toast.error(getErrorMessage(e, "Failed to create batch"));
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <DialogTrigger render={<Button size="sm" />}>
          <Plus size={16} />
          Add batch
        </DialogTrigger>
      }
      title="New batch"
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel="Create batch"
      submittingLabel="Creating..."
    >
      <FormField label="Contract number" error={errors.contractNumber?.message}>
        <Input placeholder="CNT-2026-001" {...register("contractNumber")} />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Culture" error={errors.culture?.message}>
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
                    <SelectItem key={c} value={c}>
                      {CULTURE_LABEL[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <FormField label="Total volume (t)" error={errors.totalVolume?.message}>
          <Input
            type="number"
            step="0.001"
            placeholder="0.000"
            {...register("totalVolume")}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Loading from" error={errors.loadingFrom?.message}>
          <Input type="date" {...register("loadingFrom")} />
        </FormField>
        <FormField label="Loading to" error={errors.loadingTo?.message}>
          <Input type="date" {...register("loadingTo")} />
        </FormField>
      </div>

      <FormField label="Comment" optional>
        <Textarea
          placeholder="Notes about this batch..."
          rows={3}
          {...register("comment")}
        />
      </FormField>
    </FormDialog>
  );
}
