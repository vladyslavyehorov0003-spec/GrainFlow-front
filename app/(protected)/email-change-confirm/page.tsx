import { Suspense } from "react";
import { EmailChangeConfirmSection } from "./_sections/EmailChangeConfirmSection";

export default function EmailChangeConfirmPage() {
  return (
    <Suspense>
      <EmailChangeConfirmSection />
    </Suspense>
  );
}
