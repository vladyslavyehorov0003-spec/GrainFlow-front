"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/lib/UserContext";

const ROLE_LABEL: Record<string, string> = {
  MANAGER: "Manager",
  WORKER:  "Worker",
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

export function ProfileInfoCard() {
  const user = useUser();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Name" value={`${user.firstName} ${user.lastName}`} />
        <Field label="Email" value={user.email} />
        <Field label="Company" value={user.companyName} />
        <Field
          label="Role"
          value={
            <Badge variant="secondary" className="text-xs">
              {ROLE_LABEL[user.role] ?? user.role}
            </Badge>
          }
        />
        {user.employeeId && <Field label="Employee ID" value={user.employeeId} />}
        <Field
          label="Email verified"
          value={user.companyVerified ? "Yes" : "No"}
        />
      </CardContent>
    </Card>
  );
}
