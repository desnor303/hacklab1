import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard-client";

export const metadata: Metadata = {
  title: "Bảng điều khiển",
  description: "Theo dõi tiến độ học tập và bookmark của bạn trên HackLab.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
