"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

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

  // Pre-fill form with current worker data whenever dialog opens
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
    // Only send password/pin if the user actually typed something
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
    <Dialog open={open} onOpenChange={setOpen}>
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

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit worker</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>First name</Label>
              <Input placeholder="John" {...register("firstName")} />
              {errors.firstName && (
                <p className="text-xs text-destructive">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Last name</Label>
              <Input placeholder="Smith" {...register("lastName")} />
              {errors.lastName && (
                <p className="text-xs text-destructive">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="worker@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
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
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>
                New password{" "}
                <span className="text-muted-foreground text-xs">
                  (optional)
                </span>
              </Label>
              <Input
                type="password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label>
                New PIN{" "}
                <span className="text-muted-foreground text-xs">
                  (optional)
                </span>
              </Label>
              <Input placeholder="1234" {...register("pin")} />
              {errors.pin && (
                <p className="text-xs text-destructive">{errors.pin.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
