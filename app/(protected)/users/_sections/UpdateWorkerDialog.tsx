"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { updateWorker, UpdateWorkerRequest } from "@/lib/workers";
import { getErrorMessage } from "@/lib/errors";
import { UserResponse } from "@/lib/auth";

const schema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  password: z
    .union([z.string().min(8, "At least 8 characters"), z.literal("")])
    .optional(),
  pin: z
    .union([z.string().min(4, "At least 4 characters"), z.literal("")])
    .optional(),
  enabled: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  worker: UserResponse;
  onUpdated: () => void;
}

export function UpdateWorkerDialog({ worker, onUpdated }: Props) {
  const [open, setOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      reset({
        firstName: worker.firstName,
        lastName: worker.lastName,
        email: worker.email,
        password: "",
        pin: "",
        enabled: worker.enabled,
      });
    }
  }, [open, worker, reset]);

  async function onSubmit(data: FormValues) {
    const payload: UpdateWorkerRequest = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      enabled: data.enabled,
    };
    if (data.password) payload.password = data.password;
    if (data.pin) payload.pin = data.pin;

    try {
      await updateWorker(worker.id, payload);
      toast.success("Worker updated");
      setOpen(false);
      onUpdated();
    } catch (e) {
      toast.error(getErrorMessage(e, "Failed to update worker"));
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <DialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-editing"
            />
          }
        >
          <Pencil size={15} />
        </DialogTrigger>
      }
      title="Edit worker"
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel="Save changes"
      submittingLabel="Saving..."
    >
      <div className="grid grid-cols-2 gap-3">
        <FormField label="First name" error={errors.firstName?.message}>
          <Input placeholder="John" {...register("firstName")} />
        </FormField>
        <FormField label="Last name" error={errors.lastName?.message}>
          <Input placeholder="Smith" {...register("lastName")} />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Email" error={errors.email?.message}>
          <Input type="email" placeholder="worker@example.com" {...register("email")} />
        </FormField>
        <FormField label="Status">
          <Controller
            name="enabled"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ? "true" : "false"}
                onValueChange={(v) => field.onChange(v === "true")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="New password" optional error={errors.password?.message}>
          <Input type="password" placeholder="••••••••" {...register("password")} />
        </FormField>
        <FormField label="New PIN" optional error={errors.pin?.message}>
          <Input placeholder="1234" {...register("pin")} />
        </FormField>
      </div>
    </FormDialog>
  );
}
