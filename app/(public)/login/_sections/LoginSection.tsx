"use client";

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
import { login, getMe } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errors";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Enter password"),
});

type FormData = z.infer<typeof schema>;
const LoginSection = () => {
  const router = useRouter();
  const [scope, animate] = useAnimate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function navigateTo(href: string) {
    // Animate out to the left before navigating to register
    await animate(
      scope.current,
      { opacity: 0, x: -48 },
      { duration: 0.2, ease: "easeIn" },
    );
    router.push(href);
  }

  async function onSubmit(data: FormData) {
    try {
      await login(data);
      const user = await getMe();
      router.push(user.role === "MANAGER" ? "/app" : "/batch");
    } catch (e) {
      toast.error(getErrorMessage(e, "Invalid email or password"));
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
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Sign in to your GrainFlow account</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => navigateTo("/register")}
                className="underline underline-offset-4 hover:text-foreground transition-colors"
              >
                Register
              </button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
};

export default LoginSection;
