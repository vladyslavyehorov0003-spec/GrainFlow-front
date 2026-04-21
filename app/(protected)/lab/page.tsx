"use client";

import LabWorkerTab from "./_sections/LabWorkerTab";

export default function LabPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Laboratory</h1>
        <p className="text-sm text-muted-foreground">Active grain analyses</p>
      </div>

      <LabWorkerTab />
    </div>
  );
}
