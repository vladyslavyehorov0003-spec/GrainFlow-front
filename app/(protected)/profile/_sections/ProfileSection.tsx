"use client";

import { ProfileInfoCard } from "./ProfileInfoCard";
import { ChangePasswordCard } from "./ChangePasswordCard";
import { ChangeEmailCard } from "./ChangeEmailCard";

export function ProfileSection() {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Account info and security settings
        </p>
      </div>

      <ProfileInfoCard />
      <ChangePasswordCard />
      <ChangeEmailCard />
    </div>
  );
}
