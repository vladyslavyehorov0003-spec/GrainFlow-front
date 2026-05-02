"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

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

import { confirmEmailChange } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errors";

const schema = z.object({
  code: z.string().regex(/^\d{6}$/, "Code must be 6 digits"),
});
type FormData = z.infer<typeof schema>;

export function EmailChangeConfirmSection() {
  const router = useRouter();
  const params = useSearchParams();
  const token  = params.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  // Without a token in the URL the user shouldn't be on this page —
  // they probably opened it directly. Show a friendly message instead of an empty form.
  if (!token) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Invalid link</CardTitle>
            <CardDescription>
              This page expects a confirmation link from your email. Open the link
              in your current inbox to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/profile")}>Back to profile</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  async function onSubmit(data: FormData) {
    try {
      await confirmEmailChange(token!, data.code);
      toast.success("Email changed.");
      router.push("/profile");
      router.refresh();
    } catch (e) {
      toast.error(getErrorMessage(e, "Failed to confirm email change"));
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Confirm email change</CardTitle>
          <CardDescription>
            Enter the 6-digit code we sent to your <span className="font-medium">new</span> email
            to finish the change.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="code">6-digit code</Label>
              <Input
                id="code"
                inputMode="numeric"
                maxLength={6}
                autoFocus
                placeholder="123456"
                {...register("code")}
              />
              {errors.code && (
                <p className="text-xs text-destructive">{errors.code.message}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Confirming..." : "Confirm change"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push("/profile")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
