"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useAnimate, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { resetPassword } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errors";

const schema = z
  .object({
    newPassword:     z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
type FormData = z.infer<typeof schema>;

const ResetPasswordSection = () => {
  const router = useRouter();
  const params = useSearchParams();
  const token  = params.get("token");
  const [scope, animate] = useAnimate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function navigateTo(href: string) {
    await animate(
      scope.current,
      { opacity: 0, x: -48 },
      { duration: 0.2, ease: "easeIn" },
    );
    router.push(href);
  }

  async function onSubmit(data: FormData) {
    if (!token) return; // guarded by the early return below
    try {
      await resetPassword(token, data.newPassword);
      toast.success("Password updated. Sign in with your new password.");
      navigateTo("/login");
    } catch (e) {
      toast.error(getErrorMessage(e, "Failed to reset password"));
    }
  }

  // No token = user opened this page directly (or copied the URL without it).
  // Show a friendly dead end with a way back to login.
  if (!token) {
    return (
      <motion.div
        ref={scope}
        className="w-full max-w-sm"
        initial={{ opacity: 0, x: 48 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Invalid link</CardTitle>
            <CardDescription>
              This page expects a reset link from your email. Request a new one if you
              don&apos;t have it anymore.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex-col gap-3">
            <Button
              type="button"
              className="w-full"
              onClick={() => navigateTo("/forgot-password")}
            >
              Request a new link
            </Button>
            <button
              type="button"
              onClick={() => navigateTo("/login")}
              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
            >
              Back to sign in
            </button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={scope}
      className="w-full max-w-sm"
      initial={{ opacity: 0, x: 48 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Set a new password</CardTitle>
          <CardDescription>
            After saving, you&apos;ll be signed out everywhere and can sign in with the new password.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 mb-4">
            <div className="space-y-1">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                {...register("newPassword")}
              />
              {errors.newPassword && (
                <p className="text-xs text-destructive">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save new password"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Changed your mind?{" "}
              <button
                type="button"
                onClick={() => navigateTo("/login")}
                className="underline underline-offset-4 hover:text-foreground transition-colors"
              >
                Sign in
              </button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
};

export default ResetPasswordSection;
