"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogTrigger } from "@/components/ui/dialog";
import { FormDialog } from "@/components/forms/FormDialog";
import { FormField } from "@/components/forms/FormField";
import { createWorker, CreateWorkerRequest } from "@/lib/workers";
import { getErrorMessage } from "@/lib/errors";
import { useState } from "react";

const schema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "At least 8 characters"),
  pin: z.string().min(4, "At least 4 characters"),
});

interface Props {
  onCreated: () => void;
}

export function CreateWorkerDialog({ onCreated }: Props) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateWorkerRequest>({ resolver: zodResolver(schema) });

  async function onSubmit(data: CreateWorkerRequest) {
    try {
      await createWorker(data);
      toast.success("Worker created");
      reset();
      setOpen(false);
      onCreated();
    } catch (e) {
      toast.error(getErrorMessage(e, "Failed to create worker"));
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <DialogTrigger render={<Button variant="default" />}>
          <Plus size={16} />
          Add worker
        </DialogTrigger>
      }
      title="New worker"
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel="Create worker"
      submittingLabel="Creating..."
    >
      <div className="grid grid-cols-2 gap-3">
        <FormField label="First name" error={errors.firstName?.message}>
          <Input placeholder="John" {...register("firstName")} />
        </FormField>
        <FormField label="Last name" error={errors.lastName?.message}>
          <Input placeholder="Smith" {...register("lastName")} />
        </FormField>
      </div>

      <FormField label="Email" error={errors.email?.message}>
        <Input type="email" placeholder="worker@example.com" {...register("email")} />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Password" error={errors.password?.message}>
          <Input type="password" placeholder="••••••••" {...register("password")} />
        </FormField>
        <FormField label="PIN" error={errors.pin?.message}>
          <Input placeholder="1234" {...register("pin")} />
        </FormField>
      </div>
    </FormDialog>
  );
}
