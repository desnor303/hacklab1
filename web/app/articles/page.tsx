import { Suspense } from "react";
import type { Metadata } from "next";
import { BrowseClient } from "@/components/browse-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Thư viện tài liệu",
  description:
    "Khám phá tất cả bài học về bảo mật web, mạng, Linux, JavaScript, cơ sở dữ liệu và thuật toán.",
};

export default function ArticlesPage() {
  return (
    <Suspense
      fallback={
        <div className="container-page py-14">
          <div className="h-8 w-48 animate-pulse rounded bg-white/5" />
          <div className="mt-8 h-12 animate-pulse rounded-xl bg-white/5" />
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="card h-52 animate-pulse"
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      }
    >
      <BrowseClient />
    </Suspense>
  );
}
