"use client";

import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getSubscription,
  createCheckout,
  createPortal,
  SubscriptionResponse,
  SubscriptionStatus,
} from "@/lib/payment";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";

const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  ACTIVE:   "Active",
  PAST_DUE: "Past due",
  CANCELED: "Canceled",
  INACTIVE: "Inactive",
};

const STATUS_COLOR: Record<SubscriptionStatus, string> = {
  ACTIVE:   "text-green-500",
  PAST_DUE: "text-yellow-500",
  CANCELED: "text-red-500",
  INACTIVE: "text-muted-foreground",
};

export function SubscriptionCard() {
  const [sub, setSub]         = useState<SubscriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy]       = useState(false);

  useEffect(() => {
    getSubscription()
      .then(setSub)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleAction() {
    setBusy(true);
    try {
      const url = sub?.status === "ACTIVE" ? await createPortal() : await createCheckout();
      window.location.href = url;
    } catch (e) {
      toast.error(getErrorMessage(e, "Failed to open payment page"));
    } finally {
      setBusy(false);
    }
  }

  const status: SubscriptionStatus = sub?.status ?? "INACTIVE";
  const periodEnd = sub?.currentPeriodEnd
    ? new Date(sub.currentPeriodEnd).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <div className="rounded-xl border bg-card px-5 py-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Subscription</p>
        <div className="rounded-md bg-muted p-1.5">
          <CreditCard size={15} className="text-muted-foreground" />
        </div>
      </div>

      <div>
        {loading ? (
          <p className="text-2xl font-bold text-muted-foreground">—</p>
        ) : (
          <>
            <p className={`text-2xl font-bold ${STATUS_COLOR[status]}`}>
              {STATUS_LABEL[status]}
            </p>
            {periodEnd && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {status === "ACTIVE" ? `Renews ${periodEnd}` : `Expired ${periodEnd}`}
              </p>
            )}
            {!sub && (
              <p className="text-xs text-muted-foreground mt-0.5">No subscription yet</p>
            )}
          </>
        )}
      </div>

      <Button
        size="sm"
        variant={status === "ACTIVE" ? "outline" : "default"}
        className="w-full"
        disabled={loading || busy}
        onClick={handleAction}
      >
        {status === "ACTIVE" ? "Manage subscription" : "Subscribe — €20/mo"}
      </Button>
    </div>
  );
}
