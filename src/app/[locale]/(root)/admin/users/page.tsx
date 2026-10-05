import React from "react";
import { UserDirectoryView } from "@/domains/admin/user-directory-view";

export const metadata = {
  title: "User Management · Fanaye Enterprise",
  description: "Corporate directory, roles, and cryptographic device sessions.",
};

export default function AdminUsersPage() {
  return (
    <main className="min-h-svh bg-canvas-cream">
      <UserDirectoryView />
    </main>
  );
}
