"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifyEmail, getMe } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errors";

type State = "loading" | "success" | "error";

export default function VerifySection() {
  const params   = useSearchParams();
  const router   = useRouter();
  const token    = params.get("token") ?? "";
  const [state, setState]   = useState<State>("loading");
  const [error, setError]   = useState("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setError("No verification token found in the link.");
      return;
    }

    verifyEmail(token)
      .then(async () => {
        setState("success");
        const user = await getMe();
        setTimeout(() => {
          router.replace(user.role === "MANAGER" ? "/app" : "/batch");
        }, 2000);
      })
      .catch((e) => {
        setState("error");
        setError(getErrorMessage(e, "Verification failed. The link may be expired or already used."));
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state === "loading") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 size={36} className="animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Verifying your email…</p>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <CheckCircle size={48} className="text-green-500" />
        <h1 className="text-2xl font-bold">Company verified!</h1>
        <p className="text-muted-foreground text-sm">Redirecting you to the app…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center max-w-sm">
      <XCircle size={48} className="text-destructive" />
      <h1 className="text-2xl font-bold">Verification failed</h1>
      <p className="text-muted-foreground text-sm">{error}</p>
      <Button variant="outline" onClick={() => router.push("/login")}>
        Back to sign in
      </Button>
    </div>
  );
}
