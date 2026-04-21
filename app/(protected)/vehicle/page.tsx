"use client";

import { useState } from "react";
import { VehicleWorkerTab } from "./_sections/VehicleWorkerTab";
import { CreateVehicleDialog } from "./_sections/CreateVehicleDialog";

export default function VehiclePage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  function handleCreated() {
    setRefreshTrigger((t) => t + 1);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vehicles</h1>
        <p className="text-sm text-muted-foreground">Active deliveries</p>
      </div>

      <VehicleWorkerTab
        onAddVehicle={() => setDialogOpen(true)}
        refreshTrigger={refreshTrigger}
      />

      <CreateVehicleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={handleCreated}
      />
    </div>
  );
}
