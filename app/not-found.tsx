import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-6 text-center">
      <span className="text-8xl font-bold tracking-tight text-muted-foreground/30">
        404
      </span>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground">
          The link may be outdated or the page has been deleted.
        </p>
      </div>
      <Button nativeButton={false} render={<Link href="/" />}>
        Back to Home
      </Button>
    </div>
  );
}
