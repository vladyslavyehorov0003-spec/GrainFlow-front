import { DashboardSection } from "./_sections/DashboardSection";
import { ManagerGuard } from "../_components/ManagerGuard";

export default function AppPage() {
  return (
    <ManagerGuard>
      <DashboardSection />
    </ManagerGuard>
  );
}
