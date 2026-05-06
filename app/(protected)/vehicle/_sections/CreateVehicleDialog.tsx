"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ChevronsUpDown, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FormDialog } from "@/components/forms/FormDialog";
import { FormField } from "@/components/forms/FormField";
import { createVehicle } from "@/lib/vehicle";
import { getErrorMessage } from "@/lib/errors";
import { getBatches, BatchResponse, CULTURE_LABEL, CultureType } from "@/lib/batch";
import { cn } from "@/lib/utils";

const CULTURES = Object.keys(CULTURE_LABEL) as CultureType[];

const schema = z.object({
  batchId:        z.string().min(1, "Select a batch"),
  licensePlate:   z.string().min(1, "Required"),
  driverName:     z.string().optional(),
  culture:        z.enum(["WHEAT", "BARLEY", "CORN", "SUNFLOWER", "SOYBEAN", "RYE", "OATS"], { message: "Select a culture" }),
  declaredVolume: z.string().min(1, "Required").refine(
    (v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0,
    "Must be greater than 0"
  ),
  comment:        z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}

export function CreateVehicleDialog({ open, onOpenChange, onCreated }: Props) {
  const [batchPopoverOpen, setBatchPopoverOpen] = useState(false);
  const [batches, setBatches] = useState<BatchResponse[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<BatchResponse | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!open) return;
    Promise.all([
      getBatches({ status: "PLANNED", size: 100, sort: "createdAt,desc" }),
      getBatches({ status: "ACTIVE",  size: 100, sort: "createdAt,desc" }),
    ]).then(([planned, active]) => {
      setBatches([...active.content, ...planned.content]);
    });
  }, [open]);

  function handleOpenChange(v: boolean) {
    if (!v) {
      reset();
      setSelectedBatch(null);
    }
    onOpenChange(v);
  }

  async function onSubmit(data: FormValues) {
    try {
      await createVehicle({
        ...data,
        declaredVolume: parseFloat(data.declaredVolume),
      });
      toast.success(`Vehicle ${data.licensePlate} registered`);
      handleOpenChange(false);
      onCreated();
    } catch (e) {
      toast.error(getErrorMessage(e, "Failed to register vehicle"));
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Register vehicle"
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel="Register vehicle"
      submittingLabel="Registering..."
    >
      <FormField label="Batch" error={errors.batchId?.message}>
        <Popover open={batchPopoverOpen} onOpenChange={setBatchPopoverOpen}>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-between font-normal",
                  !selectedBatch && "text-muted-foreground"
                )}
              />
            }
          >
            {selectedBatch
              ? <><span className="font-medium">{selectedBatch.contractNumber}</span><span className="text-muted-foreground ml-2">{CULTURE_LABEL[selectedBatch.culture]}</span></>
              : "Search by contract number..."}
            <ChevronsUpDown size={14} className="ml-auto shrink-0 opacity-50" />
          </PopoverTrigger>
          <PopoverContent className="w-[--anchor-width] p-0" align="start">
            <Command>
              <CommandInput placeholder="Contract number..." />
              <CommandList>
                <CommandEmpty>No active batches found.</CommandEmpty>
                <CommandGroup>
                  {batches.map((b) => (
                    <CommandItem
                      key={b.id}
                      value={b.contractNumber}
                      onSelect={() => {
                        setSelectedBatch(b);
                        setValue("batchId", b.id, { shouldValidate: true });
                        setBatchPopoverOpen(false);
                      }}
                    >
                      <Check
                        size={14}
                        className={cn("shrink-0", selectedBatch?.id === b.id ? "opacity-100" : "opacity-0")}
                      />
                      <span>{b.contractNumber}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {CULTURE_LABEL[b.culture]}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="License plate" error={errors.licensePlate?.message}>
          <Input placeholder="AA 1234 BB" {...register("licensePlate")} />
        </FormField>
        <FormField label="Driver" optional>
          <Input placeholder="Ivan Petrov" {...register("driverName")} />
        </FormField>
      </div>

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
                    <SelectItem key={c} value={c}>{CULTURE_LABEL[c]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
        <FormField label="Declared volume (t)" error={errors.declaredVolume?.message}>
          <Input type="number" step="0.001" placeholder="0.000" {...register("declaredVolume")} />
        </FormField>
      </div>

      <FormField label="Comment" optional>
        <Textarea placeholder="Notes..." rows={2} {...register("comment")} />
      </FormField>
    </FormDialog>
  );
}
