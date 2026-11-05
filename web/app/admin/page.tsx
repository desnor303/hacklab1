import type { Metadata } from "next";
import { AdminGuard } from "@/components/admin-guard";
import { AdminDashboard } from "@/components/admin-dashboard";

export const metadata: Metadata = {
  title: "Quản trị nội dung",
};

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminDashboard />
    </AdminGuard>
  );
}
