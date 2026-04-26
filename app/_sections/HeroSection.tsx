import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

export const HeroSection = () => {
  return (
    <section className="flex flex-col items-center justify-center text-center gap-6 px-6 py-32">
      <h1 className="text-5xl font-bold tracking-tight max-w-2xl">
        Manage your grain warehouse without the paperwork.
      </h1>
      <p className="text-xl text-muted-foreground max-w-xl">
        GrainFlow — from contract and weighing to lab and silo. All in one
        place.
      </p>
      <div className="flex gap-3">
        <Button
          size="lg"
          nativeButton={false}
          render={<Link href="/register" />}
        >
          Try for free
        </Button>
        <Button
          size="lg"
          variant="outline"
          nativeButton={false}
          render={<Link href="/login" />}
        >
          Log in
        </Button>
      </div>
    </section>
  );
};
