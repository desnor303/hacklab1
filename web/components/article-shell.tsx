"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  Eye,
  List,
  Loader2,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { extractHeadings } from "@/lib/headings";
import type { Article } from "@/lib/types";
import {
  categoryStyle,
  cn,
  formatDate,
  formatNumber,
  getArticleCategory,
  initials,
} from "@/lib/utils";
import { ArticleCard } from "./article-card";
import { CategoryIcon } from "./category-icon";
import { Markdown } from "./markdown";

export function ArticleShell({ article }: { article: Article }) {
  const { user } = useAuth();
  const router = useRouter();
  const category = getArticleCategory(article);
  const headings = useMemo(
    () => extractHeadings(article.content),
    [article.content]
  );

  const [activeId, setActiveId] = useState(headings[0]?.id ?? "");
  const [completed, setCompleted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [progressLoading, setProgressLoading] = useState(true);
  const [pending, setPending] = useState<"progress" | "bookmark" | null>(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let active = true;

    if (!user) {
      setCompleted(false);
      setBookmarked(false);
      setProgressLoading(false);
      return;
    }

    setProgressLoading(true);
    Promise.all([api.progress(), api.bookmarks()])
      .then(([progress, bookmarks]) => {
        if (!active) return;
        setCompleted(
          progress.some((entry) => entry.article._id === article._id)
        );
        setBookmarked(
          bookmarks.some((entry) => entry.article._id === article._id)
        );
      })
      .catch(() => {})
      .finally(() => {
        if (active) setProgressLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user, article._id]);

  useEffect(() => {
    if (!headings.length) return;

    const onScroll = () => {
      let current = headings[0]?.id ?? "";
      for (const heading of headings) {
        const element = document.getElementById(heading.id);
        if (!element) continue;
        if (element.getBoundingClientRect().top <= 140) {
          current = heading.id;
        } else {
          break;
        }
      }
      setActiveId(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [headings]);

  async function toggleProgress() {
    if (!user) {
      router.push(`/login?next=/articles/${article.slug}`);
      return;
    }
    setActionError("");
    setPending("progress");
    try {
      const result = await api.toggleProgress(article._id, !completed);
      setCompleted(result.completed);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Không thể cập nhật tiến độ"
      );
    } finally {
      setPending(null);
    }
  }

  async function toggleBookmark() {
    if (!user) {
      router.push(`/login?next=/articles/${article.slug}`);
      return;
    }
    setActionError("");
    setPending("bookmark");
    try {
      const result = await api.toggleBookmark(article._id);
      setBookmarked(result.bookmarked);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Không thể cập nhật bookmark"
      );
    } finally {
      setPending(null);
    }
  }

  const actions = (
    <div className="space-y-2">
      <button
        type="button"
        onClick={toggleProgress}
        disabled={pending !== null || (Boolean(user) && progressLoading)}
        className={cn(
          "w-full",
          completed
            ? "btn-ghost border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:border-emerald-500/40 hover:bg-emerald-500/15"
            : "btn-primary"
        )}
      >
        {pending === "progress" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : completed ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <Circle className="h-4 w-4" />
        )}
        {completed ? "Đã hoàn thành" : "Đánh dấu hoàn thành"}
      </button>

      <button
        type="button"
        onClick={toggleBookmark}
        disabled={pending !== null || (Boolean(user) && progressLoading)}
        className={cn(
          "btn-ghost w-full",
          bookmarked &&
            "border-acid/30 bg-acid/[0.06] text-acid hover:border-acid/40 hover:bg-acid/10"
        )}
      >
        {pending === "bookmark" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : bookmarked ? (
          <BookmarkCheck className="h-4 w-4" />
        ) : (
          <Bookmark className="h-4 w-4" />
        )}
        {bookmarked ? "Đã lưu bài viết" : "Lưu để đọc sau"}
      </button>

      {!user ? (
        <p className="pt-1 text-center text-[11px] leading-relaxed text-slate-600">
          <Link href="/login" className="text-acid hover:underline">
            Đăng nhập
          </Link>{" "}
          để lưu tiến độ và bookmark.
        </p>
      ) : null}

      {actionError ? (
        <p className="rounded-md border border-rose-500/20 bg-rose-500/[0.06] px-2 py-1.5 text-center text-[11px] text-rose-300">
          {actionError}
        </p>
      ) : null}
    </div>
  );

  return (
    <div className="container-page py-8 lg:py-12">
      <nav className="flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
        <Link
          href="/articles"
          className="inline-flex shrink-0 items-center gap-1 transition hover:text-acid"
        >
          <ArrowLeft className="h-3 w-3" />
          Thư viện
        </Link>
        {category ? (
          <>
            <ChevronRight className="h-3 w-3 shrink-0 text-slate-700" />
            <Link
              href={`/articles?category=${category.slug}`}
              className="shrink-0 transition hover:text-acid"
            >
              {category.name}
            </Link>
          </>
        ) : null}
        <ChevronRight className="h-3 w-3 shrink-0 text-slate-700" />
        <span className="truncate text-slate-600">{article.title}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <header>
            <div className="flex flex-wrap items-center gap-2">
              {category ? (
                <Link
                  href={`/articles?category=${category.slug}`}
                  className="badge border transition hover:brightness-125"
                  style={categoryStyle(category.color)}
                >
                  <CategoryIcon name={category.icon} className="h-3 w-3" />
                  {category.name}
                </Link>
              ) : null}
              {article.featured ? (
                <span className="badge border-acid/25 bg-acid/10 text-acid">
                  <Sparkles className="h-3 w-3" />
                  Nổi bật
                </span>
              ) : null}
            </div>

            <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
              {article.title}
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-400 sm:text-lg">
              {article.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-acid/15 font-mono text-[10px] font-bold text-acid">
                  {initials(article.author?.name || "HackLab")}
                </span>
                {article.author?.name || "HackLab"}
              </span>
              <span>{formatDate(article.publishedAt)}</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {article.readTime} phút đọc
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                {formatNumber(article.views)} lượt xem
              </span>
            </div>

            {article.tags?.length ? (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-white/[0.04] px-2 py-0.5 font-mono text-[11px] text-slate-500"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
          </header>

          <div className="my-8 border-t border-white/[0.06] lg:hidden">
            <div className="pt-6">{actions}</div>
          </div>

          <Markdown content={article.content} />

          <div className="mt-12 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-white">
                  Bạn đã đọc xong bài này?
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Đánh dấu hoàn thành để theo dõi tiến độ trên bảng điều khiển.
                </p>
              </div>
              <button
                type="button"
                onClick={toggleProgress}
                disabled={pending !== null || (Boolean(user) && progressLoading)}
                className={cn(
                  "shrink-0",
                  completed
                    ? "btn-ghost border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "btn-primary"
                )}
              >
                {completed ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
                {completed ? "Đã hoàn thành" : "Đánh dấu hoàn thành"}
              </button>
            </div>
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="card p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Tiến độ của bạn
                </h2>
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    completed ? "bg-emerald-400" : "bg-slate-600"
                  )}
                />
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                {completed
                  ? "Bạn đã hoàn thành bài học này."
                  : "Đánh dấu hoàn thành khi đã đọc xong."}
              </p>
              <div className="mt-4">{actions}</div>
            </div>

            {headings.length ? (
              <div className="card p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  <List className="h-3.5 w-3.5" />
                  Trong bài viết
                </div>
                <nav className="mt-4 max-h-[45vh] space-y-0.5 overflow-y-auto border-l border-white/10">
                  {headings.map((heading) => (
                    <a
                      key={heading.id}
                      href={`#${heading.id}`}
                      className={cn(
                        "-ml-px block border-l-2 py-1.5 pr-2 text-[13px] leading-snug transition",
                        heading.depth === 3 ? "pl-7" : "pl-4",
                        activeId === heading.id
                          ? "border-acid text-acid"
                          : "border-transparent text-slate-500 hover:text-slate-200"
                      )}
                    >
                      {heading.text}
                    </a>
                  ))}
                </nav>
              </div>
            ) : null}

            {category ? (
              <div className="card p-5">
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-lg border"
                    style={categoryStyle(category.color)}
                  >
                    <CategoryIcon name={category.icon} className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {category.name}
                    </p>
                    <p className="text-[11px] text-slate-500">Lộ trình học</p>
                  </div>
                </div>
                <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-slate-500">
                  {category.description}
                </p>
                <Link
                  href={`/articles?category=${category.slug}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-acid transition hover:gap-2.5"
                >
                  Xem tất cả bài viết
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : null}
          </div>
        </aside>
      </div>

      {article.related?.length ? (
        <section className="mt-16 border-t border-white/[0.06] pt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="section-label">// đọc tiếp</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
                Bài viết liên quan
              </h2>
            </div>
            {category ? (
              <Link
                href={`/articles?category=${category.slug}`}
                className="hidden items-center gap-1.5 text-sm text-slate-400 transition hover:text-acid sm:inline-flex"
              >
                Xem lộ trình
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {article.related.map((item) => (
              <ArticleCard key={item._id} article={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
