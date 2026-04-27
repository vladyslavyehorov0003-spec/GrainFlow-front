"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VehicleWorkerTab } from "./VehicleWorkerTab";
import { VehicleTableSection } from "./VehicleTableSection";
import { CreateVehicleDialog } from "./CreateVehicleDialog";
import { useMe } from "@/lib/hooks/useMe";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function VehicleContent() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { data: user } = useMe();

  const isManager = user?.role === "MANAGER";

  function handleCreated() {
    setRefreshTrigger((t) => t + 1);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vehicles</h1>
          <p className="text-sm text-muted-foreground">Active deliveries</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus size={15} />
          Register vehicle
        </Button>
      </div>

      {isManager ? (
        <Tabs defaultValue="operations">
          <TabsList>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="table">All vehicles</TabsTrigger>
          </TabsList>

          <TabsContent value="operations" className="mt-4">
            <VehicleWorkerTab
              onAddVehicle={() => setDialogOpen(true)}
              refreshTrigger={refreshTrigger}
            />
          </TabsContent>

          <TabsContent value="table" className="mt-4">
            <VehicleTableSection />
          </TabsContent>
        </Tabs>
      ) : (
        <VehicleWorkerTab
          onAddVehicle={() => setDialogOpen(true)}
          refreshTrigger={refreshTrigger}
        />
      )}

      <CreateVehicleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={handleCreated}
      />
    </div>
  );
}
