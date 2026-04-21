"use client";

import { BatchResponse } from "@/lib/batch";
import { CULTURE_LABEL } from "@/lib/batch";

interface Props {
  batches: BatchResponse[];
}

export function BatchProgressList({ batches }: Props) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <p className="text-sm font-semibold">Active batches</p>
      {batches.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">No active batches</p>
      ) : (
        <div className="space-y-4">
          {batches.map((b) => {
            const pct = b.totalVolume > 0
              ? Math.min(100, Math.round((b.acceptedVolume / b.totalVolume) * 100))
              : 0;
            return (
              <div key={b.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium font-mono">{b.contractNumber}</span>
                    <span className="text-xs text-muted-foreground">{CULTURE_LABEL[b.culture]}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {b.acceptedVolume} / {b.totalVolume} t
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">{pct}% accepted</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
