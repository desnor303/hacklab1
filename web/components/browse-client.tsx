"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronDown,
  RotateCcw,
  Search,
} from "lucide-react";
import { api } from "@/lib/api";
import type { ArticlesResponse, Category } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArticleCard } from "./article-card";
import { CategoryIcon } from "./category-icon";

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "popular", label: "Xem nhiều" },
  { value: "shortest", label: "Đọc nhanh" },
  { value: "title", label: "Theo tên A-Z" },
];

function SkeletonCard() {
  return (
    <div className="card animate-pulse p-5">
      <div className="flex items-center justify-between">
        <div className="h-5 w-24 rounded bg-white/5" />
        <div className="h-5 w-16 rounded bg-white/5" />
      </div>
      <div className="mt-5 h-5 w-4/5 rounded bg-white/5" />
      <div className="mt-3 h-4 w-full rounded bg-white/5" />
      <div className="mt-2 h-4 w-2/3 rounded bg-white/5" />
      <div className="mt-6 flex justify-between">
        <div className="h-4 w-24 rounded bg-white/5" />
        <div className="h-4 w-4 rounded bg-white/5" />
      </div>
    </div>
  );
}

export function BrowseClient() {
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(
    () => searchParams.get("category") || ""
  );
  const [difficulty, setDifficulty] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [data, setData] = useState<ArticlesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    api.categories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    api
      .articles({ search, category, difficulty, sort, page, limit: 9 })
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(
          err instanceof Error
            ? err.message
            : "Không thể tải danh sách tài liệu"
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [search, category, difficulty, sort, page, reloadKey]);

  const allCount = categories.length
    ? categories.reduce((sum, item) => sum + (item.articleCount || 0), 0)
    : null;

  function resetFilters() {
    setSearchInput("");
    setSearch("");
    setCategory("");
    setDifficulty("");
    setSort("newest");
    setPage(1);
  }

  function selectCategory(slug: string) {
    setCategory(slug);
    setPage(1);
  }

  function goToPage(nextPage: number) {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const hasFilters = Boolean(search || category || difficulty || sort !== "newest");

  return (
    <div className="container-page py-10 lg:py-14">
      <div className="max-w-2xl">
        <p className="section-label">// thư viện</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
          Tài liệu học tập
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
          Tất cả bài học được viết dưới dạng Markdown, có mục lục, highlight code
          và bài tập thực hành. Tìm kiếm hoặc lọc theo lộ trình của bạn.
        </p>
      </div>

      <div className="mt-8">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Tìm theo tiêu đề, mô tả hoặc tag..."
            className="input h-12 rounded-xl pl-11 pr-4 text-[15px]"
            aria-label="Tìm kiếm tài liệu"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => selectCategory("")}
          className={cn("chip", !category && "border-acid bg-acid text-ink-950 hover:text-ink-950")}
        >
          Tất cả
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px]",
              !category ? "bg-ink-950/15" : "bg-white/5 text-slate-500"
            )}
          >
            {allCount ?? "…"}
          </span>
        </button>

        {categories.map((item) => {
          const active = category === item.slug;
          return (
            <button
              key={item.slug}
              type="button"
              onClick={() => selectCategory(item.slug)}
              className={cn("chip", active && "border-acid bg-acid text-ink-950 hover:text-ink-950")}
            >
              <CategoryIcon name={item.icon} className="h-3.5 w-3.5" />
              {item.name}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px]",
                  active ? "bg-ink-950/15" : "bg-white/5 text-slate-500"
                )}
              >
                {item.articleCount ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col gap-3 border-y border-white/[0.06] py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          {loading ? (
            "Đang tải tài liệu..."
          ) : (
            <>
              <span className="font-semibold text-slate-300">
                {data?.total ?? 0}
              </span>{" "}
              tài liệu
              {search ? ` cho "${search}"` : ""}
            </>
          )}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <select
              value={difficulty}
              onChange={(event) => {
                setDifficulty(event.target.value);
                setPage(1);
              }}
              className="h-9 appearance-none rounded-lg border border-white/10 bg-ink-900 pl-3 pr-8 text-xs font-medium text-slate-300 focus:border-acid/60 focus:outline-none"
              aria-label="Lọc theo độ khó"
            >
              <option value="">Mọi độ khó</option>
              <option value="beginner">Cơ bản</option>
              <option value="intermediate">Trung cấp</option>
              <option value="advanced">Nâng cao</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          </div>

          <div className="relative">
            <select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                setPage(1);
              }}
              className="h-9 appearance-none rounded-lg border border-white/10 bg-ink-900 pl-3 pr-8 text-xs font-medium text-slate-300 focus:border-acid/60 focus:outline-none"
              aria-label="Sắp xếp"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          </div>

          {hasFilters ? (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-xs text-slate-400 transition hover:border-white/20 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Đặt lại
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-8">
        {error ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/[0.06] px-6 py-12 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-rose-400" />
            <h2 className="mt-4 text-lg font-semibold text-white">
              Không thể tải tài liệu
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
              {error}. Hãy kiểm tra API Express đang chạy và thử lại.
            </p>
            <button
              type="button"
              onClick={() => setReloadKey((value) => value + 1)}
              className="btn-ghost mt-6"
            >
              Thử lại
            </button>
          </div>
        ) : loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : data && data.items.length > 0 ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.items.map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>

            {data.pages > 1 ? (
              <div className="mt-10 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => goToPage(data.page - 1)}
                  disabled={data.page <= 1}
                  className="btn-ghost h-9 px-3 py-0 text-xs"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Trước
                </button>
                <span className="font-mono text-xs text-slate-500">
                  Trang {data.page} / {data.pages}
                </span>
                <button
                  type="button"
                  onClick={() => goToPage(data.page + 1)}
                  disabled={data.page >= data.pages}
                  className="btn-ghost h-9 px-3 py-0 text-xs"
                >
                  Sau
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-slate-500">
              <BookOpen className="h-6 w-6" />
            </span>
            <h2 className="mt-5 text-lg font-semibold text-white">
              Không tìm thấy tài liệu phù hợp
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
              Thử từ khoá khác hoặc xoá bộ lọc để xem toàn bộ thư viện.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="btn-primary mt-6"
            >
              <RotateCcw className="h-4 w-4" />
              Xoá bộ lọc
            </button>
            <p className="mt-4 text-xs text-slate-600">
              Hoặc{" "}
              <Link href="/" className="text-acid hover:underline">
                quay về trang chủ
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
