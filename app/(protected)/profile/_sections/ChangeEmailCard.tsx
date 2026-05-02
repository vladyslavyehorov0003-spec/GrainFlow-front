"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { requestEmailChange } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errors";
import { useUser } from "@/lib/UserContext";

const schema = z.object({
  newEmail: z.string().email("Invalid email"),
});
type FormData = z.infer<typeof schema>;

export function ChangeEmailCard() {
  const router = useRouter();
  const user   = useUser();
  // After CODE_SENT we hide the form and show instructions —
  // the actual confirm happens on /email-change-confirm when the user
  // clicks the link in their current inbox.
  const [pendingNewEmail, setPendingNewEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      const { status } = await requestEmailChange(data.newEmail);
      if (status === "CHANGED") {
        // UNVERIFIED path — already updated, tokens swapped by lib/auth.
        toast.success("Email changed.");
        reset();
        router.refresh(); // pull fresh user data into the layout
      } else {
        // VERIFIED path — link mailed to old, code mailed to new.
        // User completes the flow by clicking the link in /email-change-confirm.
        setPendingNewEmail(data.newEmail);
      }
    } catch (e) {
      toast.error(getErrorMessage(e, "Failed to request email change"));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change email</CardTitle>
        <CardDescription>
          Current email: <span className="font-medium">{user.email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pendingNewEmail ? (
          <div className="space-y-3">
            <div className="rounded-md border bg-muted/40 px-4 py-3 text-sm space-y-2">
              <p className="font-medium">Confirmation sent.</p>
              <p className="text-muted-foreground">
                We mailed a link to <span className="font-medium">{user.email}</span> and
                a 6-digit code to <span className="font-medium">{pendingNewEmail}</span>.
              </p>
              <p className="text-muted-foreground">
                Open the link in your <span className="font-medium">current</span> inbox
                — it will take you to a page where you enter the code from the new inbox.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPendingNewEmail(null);
                reset();
              }}
            >
              Request another
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="newEmail">New email</Label>
              <Input
                id="newEmail"
                type="email"
                placeholder="you@example.com"
                {...register("newEmail")}
              />
              {errors.newEmail && (
                <p className="text-xs text-destructive">{errors.newEmail.message}</p>
              )}
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Request change"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
