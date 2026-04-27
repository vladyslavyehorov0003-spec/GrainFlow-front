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
    <FormDialog
      open={open}
      onOpenChange={(v) => { if (!v) reset(); setOpen(v); }}
      trigger={
        <DialogTrigger render={<Button size="sm" />}>
          <Plus size={15} />
          Add silo
        </DialogTrigger>
      }
      title="New silo"
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel="Create silo"
      submittingLabel="Creating..."
    >
      <FormField label="Name" error={errors.name?.message}>
        <Input placeholder="Silo A1" {...register("name")} />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Capacity (t)" error={errors.maxAmount?.message}>
          <Input type="number" step="0.001" placeholder="0.000" {...register("maxAmount")} />
        </FormField>
        <FormField label="Culture" optional>
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
        </FormField>
      </div>

      <FormField label="Comment" optional>
        <Textarea placeholder="Notes..." rows={2} {...register("comment")} />
      </FormField>
    </FormDialog>
  );
}
