"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BatchStatusBadge } from "@/components/feedback/StatusBadge";
import { BatchResponse, CULTURE_LABEL } from "@/lib/batch";
import { Eye } from "lucide-react";

interface Props {
  batch: BatchResponse;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}

export function BatchDetailsSheet({ batch }: Props) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" />
        }
      >
        <Eye size={15} />
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-2">
          <SheetTitle>{batch.contractNumber}</SheetTitle>
          <div className="flex gap-2 pt-1">
            <BatchStatusBadge status={batch.status} />
            <Badge variant="outline">{CULTURE_LABEL[batch.culture]}</Badge>
          </div>
        </SheetHeader>

        <div className="px-4 space-y-5">
          <Separator />

          {/* Volumes */}
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Volumes</p>
            <Row label="Total"     value={`${batch.totalVolume} t`} />
            <Row label="Accepted"  value={`${batch.acceptedVolume} t`} />
            <Row label="Unloaded"  value={`${batch.unloadedVolume} t`} />

            {/* Progress bar — accepted vs total */}
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Acceptance progress</span>
                <span>{batch.totalVolume > 0 ? Math.round((batch.acceptedVolume / batch.totalVolume) * 100) : 0}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${batch.totalVolume > 0 ? (batch.acceptedVolume / batch.totalVolume) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Dates</p>
            <Row label="Loading from" value={new Date(batch.loadingFrom).toLocaleDateString("en-GB")} />
            <Row label="Loading to"   value={new Date(batch.loadingTo).toLocaleDateString("en-GB")} />
            <Row label="Created"      value={new Date(batch.createdAt).toLocaleDateString("en-GB")} />
            <Row label="Updated"      value={new Date(batch.updatedAt).toLocaleDateString("en-GB")} />
          </div>

          {batch.comment && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Comment</p>
                <p className="text-sm">{batch.comment}</p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
