"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Bookmark,
  BookOpen,
  CheckCircle2,
  Clock,
  Loader2,
  Shield,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type {
  BookmarkEntry,
  Category,
  ProgressEntry,
} from "@/lib/types";
import {
  categoryStyle,
  cn,
  formatDate,
  getArticleCategory,
  initials,
} from "@/lib/utils";
import { CategoryIcon } from "./category-icon";
import { DifficultyBadge } from "./difficulty-badge";

export function DashboardClient() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?next=/dashboard");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    let active = true;

    setLoading(true);
    setError("");

    Promise.all([api.progress(), api.bookmarks(), api.categories()])
      .then(([progressData, bookmarkData, categoryData]) => {
        if (!active) return;
        setProgress(progressData);
        setBookmarks(bookmarkData);
        setCategories(categoryData);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(
          err instanceof Error
            ? err.message
            : "Không thể tải dữ liệu bảng điều khiển"
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const totalArticles = useMemo(
    () =>
      categories.reduce(
        (sum, category) => sum + (category.articleCount || 0),
        0
      ),
    [categories]
  );

  const categoryProgress = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        completed: progress.filter(
          (entry) =>
            getArticleCategory(entry.article)?.slug === category.slug
        ).length,
      })),
    [categories, progress]
  );

  const completedCount = progress.length;
  const percent = totalArticles
    ? Math.round((completedCount / totalArticles) * 100)
    : 0;

  if (authLoading || (user && loading)) {
    return (
      <div className="container-page flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-acid" />
          Đang tải bảng điều khiển...
        </div>
      </div>
    );
  }

  if (!user) return null;

  const stats = [
    {
      label: "Bài đã hoàn thành",
      value: completedCount,
      suffix: `/ ${totalArticles}`,
      icon: CheckCircle2,
    },
    {
      label: "Tỉ lệ hoàn thành",
      value: `${percent}%`,
      icon: BarChart3,
    },
    {
      label: "Bài đã lưu",
      value: bookmarks.length,
      icon: Bookmark,
    },
    {
      label: "Lộ trình đang học",
      value: categoryProgress.filter((category) => category.completed > 0)
        .length,
      suffix: `/ ${categories.length}`,
      icon: BookOpen,
    },
  ];

  return (
    <div className="container-page py-10 lg:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">// bảng điều khiển</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Chào, {user.name.split(" ")[0]}.
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Theo dõi tiến độ và tiếp tục hành trình học tập của bạn.
          </p>
        </div>
        <Link href="/articles" className="btn-ghost">
          Tiếp tục học
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {error ? (
        <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-rose-500/25 bg-rose-500/[0.07] px-4 py-3 text-sm text-rose-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            {error}.{" "}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="font-semibold underline"
            >
              Thử lại
            </button>
          </div>
        </div>
      ) : null}

      <div className="card mt-8 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-acid/15 font-mono text-lg font-bold text-acid">
            {initials(user.name)}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-bold text-white">
                {user.name}
              </h2>
              <span
                className={cn(
                  "badge border",
                  user.role === "admin"
                    ? "border-acid/25 bg-acid/10 text-acid"
                    : "border-white/10 bg-white/[0.04] text-slate-400"
                )}
              >
                {user.role === "admin" ? (
                  <Shield className="h-3 w-3" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                {user.role === "admin" ? "Quản trị viên" : "Học viên"}
              </span>
            </div>
            <p className="mt-0.5 truncate text-sm text-slate-500">
              {user.email}
            </p>
            {user.createdAt ? (
              <p className="mt-1 text-[11px] text-slate-600">
                Tham gia {formatDate(user.createdAt)}
              </p>
            ) : null}
          </div>
        </div>

        {user.role === "admin" ? (
          <Link href="/admin" className="btn-ghost shrink-0">
            <Shield className="h-4 w-4 text-acid" />
            Quản trị nội dung
          </Link>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-start justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] text-slate-400">
                <stat.icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-4 flex items-baseline gap-1.5 font-mono text-2xl font-bold text-white">
              {stat.value}
              {stat.suffix ? (
                <span className="text-xs font-normal text-slate-600">
                  {stat.suffix}
                </span>
              ) : null}
            </p>
            <p className="mt-1 text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Tiến độ theo lộ trình</h2>
            <span className="font-mono text-xs text-slate-600">
              {completedCount}/{totalArticles}
            </span>
          </div>

          <div className="mt-6 space-y-5">
            {categoryProgress.map((category) => {
              const categoryPercent = category.articleCount
                ? Math.round(
                    (category.completed / category.articleCount) * 100
                  )
                : 0;

              return (
                <Link
                  key={category.slug}
                  href={`/articles?category=${category.slug}`}
                  className="group block"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border"
                      style={categoryStyle(category.color)}
                    >
                      <CategoryIcon
                        name={category.icon}
                        className="h-3.5 w-3.5"
                      />
                    </span>
                    <span className="flex-1 text-sm font-medium text-slate-300 transition group-hover:text-white">
                      {category.name}
                    </span>
                    <span className="font-mono text-xs text-slate-500">
                      {category.completed}/{category.articleCount || 0}
                    </span>
                  </div>
                  <div className="ml-11 mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${categoryPercent}%`,
                        backgroundColor: category.color,
                      }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Hoạt động gần đây</h2>
            <Clock className="h-4 w-4 text-slate-600" />
          </div>

          {progress.length ? (
            <ul className="mt-5 space-y-3">
              {progress.slice(0, 5).map((entry) => (
                <li key={entry._id}>
                  <Link
                    href={`/articles/${entry.article.slug}`}
                    className="group flex items-start gap-3 rounded-lg border border-transparent px-2 py-1.5 transition hover:border-white/[0.06] hover:bg-white/[0.02]"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-medium leading-snug text-slate-300 transition group-hover:text-acid">
                        {entry.article.title}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-600">
                        Hoàn thành {formatDate(entry.completedAt)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-8 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-slate-700" />
              <p className="mt-3 text-sm text-slate-500">
                Chưa có hoạt động nào.
              </p>
              <Link href="/articles" className="btn-primary mt-5">
                Bắt đầu bài học đầu tiên
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-label">// đã lưu</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
              Bookmark của bạn
            </h2>
          </div>
          <span className="font-mono text-xs text-slate-600">
            {bookmarks.length} bài
          </span>
        </div>

        {bookmarks.length ? (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {bookmarks.map((entry) => {
              const category = getArticleCategory(entry.article);
              return (
                <Link
                  key={entry._id}
                  href={`/articles/${entry.article.slug}`}
                  className="card group flex items-start gap-4 p-4 transition hover:border-acid/25 hover:bg-ink-800/90"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {category ? (
                        <span
                          className="badge border"
                          style={categoryStyle(category.color)}
                        >
                          {category.name}
                        </span>
                      ) : null}
                      <DifficultyBadge
                        difficulty={entry.article.difficulty}
                      />
                    </div>
                    <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-white transition group-hover:text-acid">
                      {entry.article.title}
                    </h3>
                    <p className="mt-1.5 text-[11px] text-slate-600">
                      {entry.article.readTime} phút đọc
                    </p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-700 transition group-hover:text-acid" />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
            <Bookmark className="mx-auto h-7 w-7 text-slate-700" />
            <p className="mt-3 text-sm text-slate-500">
              Bạn chưa lưu bài viết nào. Nhấn{" "}
              <span className="text-slate-300">Lưu để đọc sau</span> trong bài
              học để thêm vào đây.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
