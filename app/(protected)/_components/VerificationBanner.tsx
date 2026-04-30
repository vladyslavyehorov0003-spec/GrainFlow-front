"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useUser } from "@/lib/UserContext";
import { resendVerification } from "@/lib/auth";
import { toast } from "sonner";

export function VerificationBanner() {
  const user = useUser();
  const [dismissed, setDismissed] = useState(false);
  const [resending, setResending] = useState(false);

  if (user.companyVerified || dismissed) return null;

  async function handleResend() {
    setResending(true);
    try {
      await resendVerification(user.email);
      toast.success("Verification email sent. Check your inbox.");
    } catch {
      toast.error("Failed to resend. Try again later.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="sticky top-16 z-30 bg-yellow-50 dark:bg-yellow-950 border-b border-yellow-200 dark:border-yellow-800">
      <div className="flex items-center gap-3 px-4 py-2.5 text-sm">
        <AlertTriangle size={15} className="text-yellow-600 dark:text-yellow-400 shrink-0" />
        <p className="text-yellow-800 dark:text-yellow-200 flex-1">
          Your company is not verified yet. Check your inbox for the verification link.
        </p>
        <button
          onClick={handleResend}
          disabled={resending}
          className="underline underline-offset-4 text-yellow-800 dark:text-yellow-200 hover:opacity-70 disabled:opacity-50 shrink-0"
        >
          {resending ? "Sending..." : "Resend"}
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-yellow-600 dark:text-yellow-400 hover:opacity-70 shrink-0"
          aria-label="Dismiss"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
