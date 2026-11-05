"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?next=/admin");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="container-page flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-acid" />
          Đang kiểm tra quyền truy cập...
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (user.role !== "admin") {
    return (
      <div className="container-page flex min-h-[60vh] items-center justify-center">
        <div className="card max-w-md p-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-300">
            <ShieldAlert className="h-6 w-6" />
          </span>
          <h1 className="mt-5 text-xl font-bold text-white">
            Không đủ quyền truy cập
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Khu vực này chỉ dành cho quản trị viên. Đăng nhập bằng tài khoản admin
            để tiếp tục.
          </p>
          <Link href="/dashboard" className="btn-ghost mt-6 w-full">
            Về bảng điều khiển
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
