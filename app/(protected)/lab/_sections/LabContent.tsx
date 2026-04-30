"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LabWorkerTab from "./LabWorkerTab";
import { LabTableSection } from "./LabTableSection";
import { useUser } from "@/lib/UserContext";

export function LabContent() {
  const user = useUser();
  const isManager = user.role === "MANAGER";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Laboratory</h1>
        <p className="text-sm text-muted-foreground">Active grain analyses</p>
      </div>

      {isManager ? (
        <Tabs defaultValue="operations">
          <TabsList>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="table">All analyses</TabsTrigger>
          </TabsList>

          <TabsContent value="operations" className="mt-4">
            <LabWorkerTab />
          </TabsContent>

          <TabsContent value="table" className="mt-4">
            <LabTableSection />
          </TabsContent>
        </Tabs>
      ) : (
        <LabWorkerTab />
      )}
    </div>
  );
}
