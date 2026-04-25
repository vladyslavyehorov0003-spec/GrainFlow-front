"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ChevronsUpDown, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { createVehicle, CreateVehicleRequest } from "@/lib/vehicle";
import { getErrorMessage } from "@/lib/errors";
import { getBatches, BatchResponse, CULTURE_LABEL, CultureType } from "@/lib/batch";
import { cn } from "@/lib/utils";

const CULTURES = Object.keys(CULTURE_LABEL) as CultureType[];

const schema = z.object({
  batchId:        z.string().min(1, "Select a batch"),
  licensePlate:   z.string().min(1, "Required"),
  driverName:     z.string().optional(),
  culture:        z.enum(["WHEAT", "BARLEY", "CORN", "SUNFLOWER", "SOYBEAN", "RYE", "OATS"]),
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

  // Load active batches when dialog opens
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Register vehicle</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">

          {/* Batch search */}
          <div className="space-y-1">
            <Label>Batch</Label>
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
            {errors.batchId && <p className="text-xs text-destructive">{errors.batchId.message}</p>}
          </div>

          {/* License plate + Driver */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>License plate</Label>
              <Input placeholder="AA 1234 BB" {...register("licensePlate")} />
              {errors.licensePlate && <p className="text-xs text-destructive">{errors.licensePlate.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Driver <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input placeholder="Ivan Petrov" {...register("driverName")} />
            </div>
          </div>

          {/* Culture + Volume */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Culture</Label>
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
              {errors.culture && <p className="text-xs text-destructive">{errors.culture.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Declared volume (t)</Label>
              <Input type="number" step="0.001" placeholder="0.000" {...register("declaredVolume")} />
              {errors.declaredVolume && <p className="text-xs text-destructive">{errors.declaredVolume.message}</p>}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-1">
            <Label>Comment <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Textarea placeholder="Notes..." rows={2} {...register("comment")} />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Registering..." : "Register vehicle"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
