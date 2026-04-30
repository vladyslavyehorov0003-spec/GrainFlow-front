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
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { register as registerUser, RegisterRequest } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errors";

const schema = z.object({
  firstName: z.string().min(1, "Enter first name"),
  lastName: z.string().min(1, "Enter last name"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "At least 8 characters"),
  company: z.object({
    name: z.string().min(1, "Enter company name"),
    address: z.string().optional(),
    phone: z.string().optional(),
  }),
});

const RegistrationSection = () => {
  const router = useRouter();
  const [scope, animate] = useAnimate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterRequest>({ resolver: zodResolver(schema) });

  async function navigateTo(href: string) {
    // Animate out to the right before navigating to login
    await animate(
      scope.current,
      { opacity: 0, x: 48 },
      { duration: 0.2, ease: "easeIn" },
    );
    router.push(href);
  }

  async function onSubmit(data: RegisterRequest) {
    try {
      await registerUser(data);
      router.push("/app");
    } catch (e) {
      toast.error(getErrorMessage(e, "Registration failed. Please try again."));
    }
  }
  return (
    <motion.div
      ref={scope}
      className="w-full max-w-md"
      initial={{ opacity: 0, x: -48 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>Register your account and company</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  placeholder="Smith"
                  {...register("lastName")}
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

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
                placeholder="At least 8 characters"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Separator />

            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Company
            </p>

            <div className="space-y-1">
              <Label htmlFor="company.name">Company name</Label>
              <Input
                id="company.name"
                placeholder="Grain West LLC"
                {...register("company.name")}
              />
              {errors.company?.name && (
                <p className="text-xs text-destructive">
                  {errors.company.name.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="company.address">Address</Label>
              <Input
                id="company.address"
                placeholder="123 Main St, Kyiv"
                {...register("company.address")}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="company.phone">Phone</Label>
              <Input
                id="company.phone"
                placeholder="+380 67 000 00 00"
                {...register("company.phone")}
              />
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
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

export default RegistrationSection;
