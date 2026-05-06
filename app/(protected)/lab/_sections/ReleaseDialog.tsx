"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogTrigger } from "@/components/ui/dialog";
import { FormDialog } from "@/components/forms/FormDialog";
import { FormField } from "@/components/forms/FormField";
import { LabAnalysisResponse, releaseLab } from "@/lib/lab";
import { getErrorMessage } from "@/lib/errors";

const schema = z.object({
  isApproved: z.boolean({ message: "Please select a verdict" }),
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
    } catch (e) {
      toast.error(getErrorMessage(e, "Failed to release vehicle"));
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={(v) => { if (!v) reset(); setOpen(v); }}
      trigger={<DialogTrigger render={<Button size="sm" variant="outline" />}>Release Vehicle</DialogTrigger>}
      title="Release vehicle for review"
      maxWidth="sm"
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel="Release for Manager Review"
      submittingLabel="Releasing..."
    >
      <FormField label="Verdict" error={errors.isApproved?.message}>
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
      </FormField>
      <FormField label="Comment" optional>
        <Textarea placeholder="Notes..." rows={2} {...register("comment")} />
      </FormField>
    </FormDialog>
  );
}
