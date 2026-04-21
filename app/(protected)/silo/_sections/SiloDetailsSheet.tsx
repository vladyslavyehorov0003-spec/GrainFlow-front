"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Settings, Trash2 } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { SiloResponse, updateSilo, deleteSilo } from "@/lib/silo";
import { CULTURE_LABEL, CultureType } from "@/lib/batch";
import { AddGrainDialog } from "./AddGrainDialog";
import { RemoveGrainDialog } from "./RemoveGrainDialog";

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

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}

interface Props {
  silo:      SiloResponse;
  onUpdated: () => void;
}

export function SiloDetailsSheet({ silo, onUpdated }: Props) {
  const [open, setOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:      silo.name,
      maxAmount: String(silo.maxAmount),
      culture:   silo.culture ?? undefined,
      comment:   silo.comment ?? "",
    },
  });

  async function onSubmit(data: FormValues) {
    try {
      await updateSilo(silo.id, {
        name:      data.name,
        maxAmount: parseFloat(data.maxAmount),
        culture:   data.culture,
        comment:   data.comment,
      });
      toast.success("Silo updated");
      onUpdated();
    } catch {
      toast.error("Failed to update silo");
    }
  }

  async function handleDelete() {
    try {
      await deleteSilo(silo.id);
      toast.success(`${silo.name} deleted`);
      setOpen(false);
      onUpdated();
    } catch {
      toast.error("Failed to delete silo");
    }
  }

  const fillPct = silo.maxAmount > 0
    ? Math.min(100, Math.round((silo.currentAmount / silo.maxAmount) * 100))
    : 0;

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) reset(); setOpen(v); }}>
      <SheetTrigger render={
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" />
      }>
        <Settings size={15} />
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-2">
          <SheetTitle>{silo.name}</SheetTitle>
        </SheetHeader>

        <div className="px-4 space-y-5">
          <Separator />

          {/* Capacity */}
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Capacity</p>
            <Row label="Current"  value={`${silo.currentAmount} t`} />
            <Row label="Max"      value={`${silo.maxAmount} t`} />
            <Row label="Culture"  value={silo.culture ? CULTURE_LABEL[silo.culture] : "—"} />
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Fill level</span>
                <span>{fillPct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${fillPct}%` }}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Info</p>
            <Row label="Created" value={new Date(silo.createdAt).toLocaleDateString("en-GB")} />
            <Row label="Updated" value={new Date(silo.updatedAt).toLocaleDateString("en-GB")} />
            {silo.comment && <Row label="Comment" value={silo.comment} />}
          </div>

          <Separator />

          {/* Operations */}
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-3">Operations</p>
            <div className="flex gap-2">
              <AddGrainDialog silo={silo} onDone={onUpdated} />
              <RemoveGrainDialog silo={silo} onDone={onUpdated} />
            </div>
          </div>

          <Separator />

          {/* Edit form */}
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-3">Edit</p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="space-y-1">
                <Label>Name</Label>
                <Input {...register("name")} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Capacity (t)</Label>
                  <Input type="number" step="0.001" {...register("maxAmount")} />
                  {errors.maxAmount && <p className="text-xs text-destructive">{errors.maxAmount.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label>Culture</Label>
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
                </div>
              </div>
              <div className="space-y-1">
                <Label>Comment</Label>
                <Textarea rows={2} {...register("comment")} />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save changes"}
              </Button>
            </form>
          </div>

          <Separator />

          {/* Delete */}
          <AlertDialog>
            <AlertDialogTrigger render={
              <Button variant="destructive" size="sm" className="w-full" />
            }>
              <Trash2 size={14} />
              Delete silo
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {silo.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SheetContent>
    </Sheet>
  );
}
