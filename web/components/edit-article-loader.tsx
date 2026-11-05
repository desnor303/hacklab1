"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import type { Article } from "@/lib/types";
import { ArticleEditor } from "./article-editor";

export function EditArticleLoader() {
  const params = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    api.admin
      .article(params.id)
      .then((data) => {
        if (active) setArticle(data);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : "Không thể tải bài viết"
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [params.id]);

  if (loading) {
    return (
      <div className="container-page flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-acid" />
          Đang tải bài viết...
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container-page flex min-h-[60vh] items-center justify-center">
        <div className="card max-w-md p-8 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-rose-400" />
          <h1 className="mt-4 text-lg font-bold text-white">
            Không thể mở bài viết
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {error || "Bài viết không tồn tại hoặc đã bị xoá."}
          </p>
          <Link href="/admin" className="btn-ghost mt-6 w-full">
            <ArrowLeft className="h-4 w-4" />
            Về trang quản trị
          </Link>
        </div>
      </div>
    );
  }

  return <ArticleEditor initial={article} />;
}
