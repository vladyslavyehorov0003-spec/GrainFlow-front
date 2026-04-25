import AuditSection from "./_sections/AuditSection";
import { ManagerGuard } from "../_components/ManagerGuard";

export default function AuditPage() {
  return (
    <ManagerGuard>
      <AuditSection />
    </ManagerGuard>
  );
}
