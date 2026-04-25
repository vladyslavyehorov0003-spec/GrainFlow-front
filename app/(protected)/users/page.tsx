import { WorkersSection } from "./_sections/WorkersSection";
import { ManagerGuard } from "../_components/ManagerGuard";

export default function WorkersPage() {
  return (
    <ManagerGuard>
      <WorkersSection />
    </ManagerGuard>
  );
}
