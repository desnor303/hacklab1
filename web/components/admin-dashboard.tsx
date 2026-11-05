"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Eye,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { api } from "@/lib/api";
import type { AdminStats, ArticleSummary } from "@/lib/types";
import {
  categoryStyle,
  formatDate,
  formatNumber,
  getArticleCategory,
} from "@/lib/utils";
import { CategoryIcon } from "./category-icon";
import { DifficultyBadge } from "./difficulty-badge";

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    Promise.all([
      api.admin.stats(),
      api.admin.articles({ limit: 100 }),
    ])
      .then(([statsData, articleData]) => {
        if (!active) return;
        setStats(statsData);
        setArticles(articleData.items);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(
          err instanceof Error
            ? err.message
            : "Không thể tải dữ liệu quản trị"
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return articles;
    return articles.filter((article) =>
      [
        article.title,
        article.slug,
        article.tags?.join(" ") || "",
        getArticleCategory(article)?.name || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [articles, search]);

  async function handleDelete(article: ArticleSummary) {
    const confirmed = window.confirm(
      `Xoá bài viết "${article.title}"?\nHành động này không thể hoàn tác.`
    );
    if (!confirmed) return;

    setDeletingId(article._id);
    setError("");
    try {
      await api.admin.deleteArticle(article._id);
      setArticles((previous) =>
        previous.filter((item) => item._id !== article._id)
      );
      setStats((previous) =>
        previous
          ? {
              ...previous,
              articles: Math.max(0, previous.articles - 1),
              published: Math.max(
                0,
                previous.published - (article.isPublished ? 1 : 0)
              ),
            }
          : previous
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể xoá bài viết"
      );
    } finally {
      setDeletingId(null);
    }
  }

  const statCards = stats
    ? [
        {
          label: "Tổng bài viết",
          value: stats.articles,
          hint: `${stats.published} đã xuất bản`,
          icon: FileText,
        },
        {
          label: "Người dùng",
          value: stats.users,
          hint: "Tài khoản đã đăng ký",
          icon: Users,
        },
        {
          label: "Lượt hoàn thành",
          value: stats.completions,
          hint: "Từ tất cả học viên",
          icon: CheckCircle2,
        },
        {
          label: "Bookmark",
          value: stats.bookmarks,
          hint: "Bài viết được lưu",
          icon: BookOpen,
        },
      ]
    : [];

  return (
    <div className="container-page py-10 lg:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">// quản trị</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Quản lý nội dung
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Tạo, chỉnh sửa và xuất bản bài học Markdown.
          </p>
        </div>
        <Link href="/admin/articles/new" className="btn-primary shrink-0">
          <Plus className="h-4 w-4" />
          Tạo bài viết
        </Link>
      </div>

      {error ? (
        <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-rose-500/25 bg-rose-500/[0.07] px-4 py-3 text-sm text-rose-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="card h-28 animate-pulse" />
            ))
          : statCards.map((stat) => (
              <div key={stat.label} className="card p-5">
                <div className="flex items-start justify-between">
                  <p className="text-xs text-slate-500">{stat.label}</p>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-slate-400">
                    <stat.icon className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-2 font-mono text-2xl font-bold text-white">
                  {formatNumber(stat.value)}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-600">
                  {stat.hint}
                </p>
              </div>
            ))}
      </div>

      <div className="card mt-4 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-white/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-semibold text-white">
              Danh sách bài viết
            </h2>
            <span className="rounded-full bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] text-slate-500">
              {articles.length}
            </span>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo tiêu đề, slug, tag..."
              className="input h-9 py-0 pl-9 text-xs"
              aria-label="Tìm bài viết"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-14 animate-pulse rounded-lg bg-white/[0.03]"
              />
            ))}
          </div>
        ) : filtered.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.01] text-[10px] uppercase tracking-widest text-slate-500">
                  <th className="px-4 py-3 font-semibold">Bài viết</th>
                  <th className="px-4 py-3 font-semibold">Danh mục</th>
                  <th className="px-4 py-3 font-semibold">Độ khó</th>
                  <th className="px-4 py-3 font-semibold">Lượt xem</th>
                  <th className="px-4 py-3 font-semibold">Ngày</th>
                  <th className="px-4 py-3 font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((article) => {
                  const category = getArticleCategory(article);
                  return (
                    <tr
                      key={article._id}
                      className="transition hover:bg-white/[0.02]"
                    >
                      <td className="max-w-[300px] px-4 py-3.5">
                        <Link
                          href={`/articles/${article.slug}`}
                          className="group block"
                        >
                          <p className="truncate font-medium text-slate-200 transition group-hover:text-acid">
                            {article.title}
                          </p>
                          <p className="mt-0.5 truncate font-mono text-[11px] text-slate-600">
                            /{article.slug}
                          </p>
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        {category ? (
                          <span
                            className="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium"
                            style={categoryStyle(category.color)}
                          >
                            <CategoryIcon
                              name={category.icon}
                              className="h-3 w-3"
                            />
                            {category.name}
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <DifficultyBadge difficulty={article.difficulty} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-400">
                          <Eye className="h-3.5 w-3.5 text-slate-600" />
                          {formatNumber(article.views)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-500">
                        {formatDate(article.publishedAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span
                          className={
                            article.isPublished === false
                              ? "badge border-slate-500/25 bg-slate-500/10 text-slate-400"
                              : "badge border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                          }
                        >
                          <span className="h-1 w-1 rounded-full bg-current" />
                          {article.isPublished === false
                            ? "Nháp"
                            : "Đã xuất bản"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/articles/${article._id}/edit`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:border-acid/30 hover:text-acid"
                            title="Chỉnh sửa"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(article)}
                            disabled={deletingId === article._id}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:border-rose-500/30 hover:text-rose-300 disabled:opacity-50"
                            title="Xoá"
                          >
                            {deletingId === article._id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-14 text-center">
            <FileText className="mx-auto h-8 w-8 text-slate-700" />
            <p className="mt-3 text-sm text-slate-500">
              {search
                ? `Không tìm thấy bài viết nào khớp "${search}".`
                : "Chưa có bài viết nào. Tạo bài viết đầu tiên của bạn."}
            </p>
            {!search ? (
              <Link href="/admin/articles/new" className="btn-primary mt-5">
                <Plus className="h-4 w-4" />
                Tạo bài viết
              </Link>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
