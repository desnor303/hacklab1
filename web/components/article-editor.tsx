"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  Loader2,
  Pencil,
  Save,
} from "lucide-react";
import { api } from "@/lib/api";
import type { Article, ArticleInput, Category, Difficulty } from "@/lib/types";
import { cn, slugify } from "@/lib/utils";
import { Markdown } from "./markdown";

interface FormState {
  title: string;
  slug: string;
  description: string;
  content: string;
  category: string;
  difficulty: Difficulty;
  tags: string;
  readTime: string;
  featured: boolean;
  isPublished: boolean;
}

export function ArticleEditor({ initial }: { initial?: Article }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    content: initial?.content ?? "",
    category:
      initial && initial.category && typeof initial.category === "object"
        ? initial.category._id
        : "",
    difficulty: initial?.difficulty ?? "beginner",
    tags: initial?.tags?.join(", ") ?? "",
    readTime: initial?.readTime ? String(initial.readTime) : "",
    featured: initial?.featured ?? false,
    isPublished: initial?.isPublished ?? true,
  });

  const [slugEdited, setSlugEdited] = useState(Boolean(initial));
  const [categories, setCategories] = useState<Category[]>([]);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.categories().then(setCategories).catch(() => setCategories([]));
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  function handleTitle(value: string) {
    setForm((previous) => ({
      ...previous,
      title: value,
      ...(slugEdited ? {} : { slug: slugify(value) }),
    }));
  }

  function handleSlug(value: string) {
    setSlugEdited(true);
    update("slug", value);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Tiêu đề là bắt buộc");
      return;
    }
    if (!form.content.trim()) {
      setError("Nội dung Markdown là bắt buộc");
      return;
    }
    if (!form.category) {
      setError("Vui lòng chọn danh mục");
      return;
    }

    const payload: ArticleInput = {
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      description: form.description.trim(),
      content: form.content,
      category: form.category,
      difficulty: form.difficulty,
      tags: form.tags,
      readTime: form.readTime ? Number(form.readTime) : undefined,
      featured: form.featured,
      isPublished: form.isPublished,
    };

    setSaving(true);
    try {
      if (initial) {
        await api.admin.updateArticle(initial._id, payload);
      } else {
        await api.admin.createArticle(payload);
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể lưu bài viết"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container-page py-8 lg:py-12">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 transition hover:text-acid"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Quản trị nội dung
      </Link>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">// editor</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white">
            {initial ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Nội dung Markdown, hỗ trợ GFM, bảng, checklist và highlight code.
          </p>
        </div>
        <button
          type="submit"
          form="article-editor-form"
          disabled={saving}
          className="btn-primary shrink-0"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Đang lưu..." : "Lưu bài viết"}
        </button>
      </div>

      <form
        id="article-editor-form"
        onSubmit={handleSubmit}
        className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]"
      >
        {error ? (
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/25 bg-rose-500/[0.07] px-4 py-3 text-sm text-rose-300 lg:col-span-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : null}

        <div className="space-y-4">
          <div className="card space-y-5 p-6">
            <div>
              <label htmlFor="title" className="label">
                Tiêu đề
              </label>
              <input
                id="title"
                value={form.title}
                onChange={(event) => handleTitle(event.target.value)}
                placeholder="VD: XSS là gì? Hiểu sâu và phòng chống"
                className="input text-base font-semibold"
              />
            </div>

            <div>
              <label htmlFor="slug" className="label">
                Slug
              </label>
              <div className="flex items-stretch overflow-hidden rounded-lg border border-white/10 bg-ink-900 focus-within:border-acid/60 focus-within:ring-2 focus-within:ring-acid/20">
                <span className="flex items-center border-r border-white/10 bg-white/[0.02] px-3 font-mono text-[11px] text-slate-600">
                  /articles/
                </span>
                <input
                  id="slug"
                  value={form.slug}
                  onChange={(event) => handleSlug(event.target.value)}
                  placeholder="slug-cua-bai-viet"
                  className="w-full bg-transparent px-3.5 py-2.5 font-mono text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-600">
                Tự động tạo từ tiêu đề nếu để trống. Chỉ dùng chữ thường, số và
                dấu gạch nối.
              </p>
            </div>

            <div>
              <label htmlFor="description" className="label">
                Mô tả ngắn
              </label>
              <textarea
                id="description"
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
                rows={3}
                maxLength={400}
                placeholder="Một đoạn mô tả hiển thị trên thẻ bài viết và kết quả tìm kiếm..."
                className="input resize-y leading-relaxed"
              />
              <p className="mt-1 text-right font-mono text-[10px] text-slate-600">
                {form.description.length}/400
              </p>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-3">
              <h2 className="text-sm font-semibold text-white">Nội dung</h2>
              <div className="flex rounded-lg border border-white/10 bg-ink-900 p-0.5">
                <button
                  type="button"
                  onClick={() => setTab("write")}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition",
                    tab === "write"
                      ? "bg-white/10 text-white"
                      : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Viết
                </button>
                <button
                  type="button"
                  onClick={() => setTab("preview")}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition",
                    tab === "preview"
                      ? "bg-white/10 text-white"
                      : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Xem trước
                </button>
              </div>
            </div>

            {tab === "write" ? (
              <textarea
                value={form.content}
                onChange={(event) => update("content", event.target.value)}
                placeholder={"## Tiêu đề mục\n\nNội dung bài học...\n\n```js\nconsole.log('hello');\n```"}
                className="min-h-[540px] w-full resize-y bg-transparent p-5 font-mono text-[13px] leading-relaxed text-slate-200 placeholder:text-slate-700 focus:outline-none"
              />
            ) : (
              <div className="min-h-[540px] bg-ink-900/40 p-5 sm:p-6">
                {form.content.trim() ? (
                  <Markdown content={form.content} />
                ) : (
                  <p className="text-sm italic text-slate-600">
                    Chưa có nội dung để xem trước.
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] bg-white/[0.01] px-5 py-2.5 text-[11px] text-slate-600">
              <span>Markdown + GFM · Hỗ trợ bảng, checklist, code fence</span>
              <span className="font-mono">
                {form.content.trim()
                  ? `${form.content.trim().split(/\s+/).length} từ`
                  : "0 từ"}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card space-y-4 p-5">
            <h2 className="text-sm font-semibold text-white">Thông tin</h2>

            <div>
              <label htmlFor="category" className="label">
                Danh mục
              </label>
              <select
                id="category"
                value={form.category}
                onChange={(event) => update("category", event.target.value)}
                className="input"
              >
                <option value="">Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="difficulty" className="label">
                Độ khó
              </label>
              <select
                id="difficulty"
                value={form.difficulty}
                onChange={(event) =>
                  update("difficulty", event.target.value as Difficulty)
                }
                className="input"
              >
                <option value="beginner">Cơ bản</option>
                <option value="intermediate">Trung cấp</option>
                <option value="advanced">Nâng cao</option>
              </select>
            </div>

            <div>
              <label htmlFor="readTime" className="label">
                Thời gian đọc (phút)
              </label>
              <input
                id="readTime"
                type="number"
                min={1}
                value={form.readTime}
                onChange={(event) => update("readTime", event.target.value)}
                placeholder="Tự động tính"
                className="input"
              />
            </div>

            <div>
              <label htmlFor="tags" className="label">
                Tags
              </label>
              <input
                id="tags"
                value={form.tags}
                onChange={(event) => update("tags", event.target.value)}
                placeholder="xss, owasp, security"
                className="input"
              />
              <p className="mt-1 text-[11px] text-slate-600">
                Phân tách bằng dấu phẩy, tối đa 8 tag.
              </p>
            </div>
          </div>

          <div className="card space-y-3 p-5">
            <h2 className="text-sm font-semibold text-white">Xuất bản</h2>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3 transition hover:border-white/20">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(event) =>
                  update("isPublished", event.target.checked)
                }
                className="mt-0.5 h-4 w-4 accent-acid"
              />
              <span>
                <span className="block text-xs font-medium text-slate-300">
                  Xuất bản ngay
                </span>
                <span className="mt-0.5 block text-[11px] text-slate-600">
                  Hiển thị công khai trong thư viện
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3 transition hover:border-white/20">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => update("featured", event.target.checked)}
                className="mt-0.5 h-4 w-4 accent-acid"
              />
              <span>
                <span className="block text-xs font-medium text-slate-300">
                  Bài viết nổi bật
                </span>
                <span className="mt-0.5 block text-[11px] text-slate-600">
                  Hiển thị ở trang chủ
                </span>
              </span>
            </label>
          </div>

          <div className="card space-y-2 p-5">
            <h2 className="text-sm font-semibold text-white">Hành động</h2>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Đang lưu..." : "Lưu bài viết"}
            </button>
            <Link href="/admin" className="btn-ghost w-full">
              Huỷ
            </Link>
            {initial ? (
              <p className="pt-1 text-center font-mono text-[10px] text-slate-600">
                {initial.views} lượt xem · {initial.slug}
              </p>
            ) : null}
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
              Mẹo markdown
            </p>
            <ul className="mt-2.5 space-y-1.5 font-mono text-[11px] leading-relaxed text-slate-600">
              <li>
                <span className="text-slate-400">##</span> Tiêu đề mục
              </li>
              <li>
                <span className="text-slate-400">**</span>in đậm
                <span className="text-slate-400">**</span>
              </li>
              <li>
                <span className="text-slate-400">-</span> danh sách
              </li>
              <li>
                <span className="text-slate-400">&gt;</span> ghi chú
              </li>
              <li>
                <span className="text-slate-400">```js</span> code fence
              </li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
}
