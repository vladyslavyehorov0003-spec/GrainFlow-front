"use client";

import { ReactNode, FormEventHandler } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type MaxWidth = "sm" | "md" | "lg";

const WIDTH_CLASS: Record<MaxWidth, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

type FormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: ReactNode;
  title: string;
  description?: string;
  maxWidth?: MaxWidth;
  isSubmitting: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  submitLabel: string;
  submittingLabel?: string;
  submitVariant?: "default" | "destructive";
  submitDisabled?: boolean;
  loading?: boolean;
  children: ReactNode;
};

export function FormDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  maxWidth = "md",
  isSubmitting,
  onSubmit,
  submitLabel,
  submittingLabel,
  submitVariant = "default",
  submitDisabled = false,
  loading = false,
  children,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger}
      <DialogContent className={WIDTH_CLASS[maxWidth]}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {loading ?
          <div className="flex justify-center py-8">
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          </div>
        : <form onSubmit={onSubmit} className="space-y-4 pt-2">
            {children}
            <Button
              type="submit"
              variant={submitVariant}
              className="w-full"
              disabled={isSubmitting || submitDisabled}
            >
              {isSubmitting ? (submittingLabel ?? `${submitLabel}...`) : submitLabel}
            </Button>
          </form>
        }
      </DialogContent>
    </Dialog>
  );
}
