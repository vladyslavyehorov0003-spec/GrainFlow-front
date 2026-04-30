"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resendVerification } from "@/lib/auth";
import { toast } from "sonner";
import Link from "next/link";

export default function CheckEmailSection() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const [resending, setResending] = useState(false);

  async function handleResend() {
    if (!email) return;
    setResending(true);
    try {
      await resendVerification(email);
      toast.success("Verification email sent. Check your inbox.");
    } catch {
      toast.error("Failed to resend. Try again later.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="flex flex-col items-center text-center gap-6 max-w-sm">
      <div className="rounded-full bg-muted p-4">
        <Mail size={32} className="text-muted-foreground" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Verify your company</h1>
        <p className="text-muted-foreground text-sm">
          We sent a company verification link to{" "}
          {email && <span className="font-mono font-medium text-foreground">{email}</span>}.
          Click it to activate your account and unlock full access.
        </p>
      </div>

      <div className="w-full space-y-3">
        {email && (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleResend}
            disabled={resending}
          >
            {resending ? "Sending..." : "Resend verification email"}
          </Button>
        )}
        <Link href="/login" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
