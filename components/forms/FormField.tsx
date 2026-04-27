import { ReactNode } from "react";
import { Label } from "@/components/ui/label";

type FormFieldProps = {
  label: string;
  children: ReactNode;
  optional?: boolean;
  error?: string;
  className?: string;
};

export function FormField({ label, children, optional, error, className }: FormFieldProps) {
  return (
    <div className={`space-y-1 ${className ?? ""}`}>
      <Label>
        {label}
        {optional && <span className="text-muted-foreground text-xs"> (optional)</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
