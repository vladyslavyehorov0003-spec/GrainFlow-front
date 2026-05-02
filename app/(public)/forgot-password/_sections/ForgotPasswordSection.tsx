"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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

import { forgotPassword } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errors";

const schema = z.object({
  email: z.string().email("Invalid email"),
});
type FormData = z.infer<typeof schema>;

const ForgotPasswordSection = () => {
  const router = useRouter();
  const [scope, animate] = useAnimate();
  // After a successful request we swap the form for a "check your inbox" message.
  // Backend always answers 200 (anti-enumeration) so we can't tell the user whether
  // the email actually existed — UI must look identical either way.
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

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
    try {
      await forgotPassword(data.email);
      setSubmittedEmail(data.email);
    } catch (e) {
      toast.error(getErrorMessage(e, "Could not send reset link"));
    }
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
          <CardTitle>Reset password</CardTitle>
          <CardDescription>
            {submittedEmail
              ? "We sent you a link if an account exists for that address."
              : "Enter your email — we'll send you a link to set a new password."}
          </CardDescription>
        </CardHeader>

        {submittedEmail ? (
          <>
            <CardContent>
              <div className="rounded-md bg-muted/40 border px-4 py-3 text-sm space-y-1.5">
                <p>
                  Sent to <span className="font-medium">{submittedEmail}</span>
                </p>
                <p className="text-muted-foreground text-xs">
                  The link expires in 1 hour and can be used once.
                  Check your spam folder if you don&apos;t see it.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigateTo("/login")}
              >
                Back to sign in
              </Button>
            </CardFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4 mb-4">
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send reset link"}
              </Button>
              <p className="text-sm text-muted-foreground">
                Remembered it?{" "}
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
        )}
      </Card>
    </motion.div>
  );
};

export default ForgotPasswordSection;
