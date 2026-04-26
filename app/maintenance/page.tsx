import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MaintenancePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-6 text-center">
      <span className="text-8xl font-bold tracking-tight text-muted-foreground/30">
        503
      </span>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">
          Server temporarily unavailable
        </h1>
        <p className="text-muted-foreground">
          Maintenance in progress. Please check back in a few minutes.
        </p>
      </div>
      <Button variant="outline" nativeButton={false} render={<Link href="/" />}>
        Try again
      </Button>
    </div>
  );
}
