import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { serverApi } from "@/lib/server-api";
import type { ArticlesResponse, Category } from "@/lib/types";
import { ArticleCard } from "@/components/article-card";
import { CategoryIcon } from "@/components/category-icon";
import { categoryStyle, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featured] = await Promise.all([
    serverApi<Category[]>("/categories"),
    serverApi<ArticlesResponse>("/articles?featured=true&limit=3"),
  ]);

  const apiDown = categories === null;
  const totalArticles =
    categories?.reduce((sum, category) => sum + (category.articleCount || 0), 0) ||
    0;
  const featuredArticles = featured?.items ?? [];

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="pointer-events-none absolute inset-0 bg-grid-faint bg-[size:46px_46px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_0%,black,transparent)]" />
        <div className="pointer-events-none absolute -top-48 left-1/2 h-[28rem] w-[46rem] -translate-x-1/2 rounded-full bg-acid/[0.06] blur-3xl" />

        <div className="container-page relative grid gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16 lg:py-24">
          <div className="animate-fade-up">
            <span className="badge border border-acid/25 bg-acid/10 text-acid">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-acid" />
              Nền tảng học tập thực chiến
            </span>

            <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-[4.1rem]">
              Học như một
              <span className="block text-acid">
                hacker<span className="animate-blink">_</span>
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
              Tài liệu chuyên sâu về bảo mật, lập trình và hệ thống — viết bằng
              Markdown, thực hành được ngay. Đọc, theo dõi tiến độ và chinh phục
              từng lộ trình.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/articles" className="btn-primary">
                Khám phá thư viện
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="#paths" className="btn-ghost">
                <Target className="h-4 w-4 text-acid" />
                Xem lộ trình
              </Link>
            </div>

            <div className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/[0.06] pt-6">
              <div>
                <p className="font-mono text-2xl font-bold text-white">
                  {totalArticles || 12}
                  <span className="text-acid">+</span>
                </p>
                <p className="mt-1 text-xs text-slate-500">bài học</p>
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-white">
                  {categories?.length ?? 6}
                </p>
                <p className="mt-1 text-xs text-slate-500">lộ trình</p>
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-white">100%</p>
                <p className="mt-1 text-xs text-slate-500">miễn phí</p>
              </div>
            </div>
          </div>

          <div className="animate-fade-up lg:justify-self-end">
            <div className="card w-full max-w-md overflow-hidden">
              <div className="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                <span className="ml-auto font-mono text-[11px] text-slate-600">
                  bash — hacklab
                </span>
              </div>

              <div className="space-y-2 p-5 font-mono text-[13px] leading-relaxed">
                <p>
                  <span className="text-acid">hacker@hacklab</span>
                  <span className="text-slate-600">:~$</span>{" "}
                  <span className="text-slate-200">hacklab start</span>
                </p>
                <p className="text-slate-500">
                  [+] {totalArticles || 12} bài học đã tải
                </p>
                <p className="text-slate-500">
                  [+] {categories?.length ?? 6} lộ trình sẵn sàng
                </p>
                <p className="text-slate-500">
                  [+] tiến độ được đồng bộ
                </p>
                <p className="pt-2">
                  <span className="text-acid">hacker@hacklab</span>
                  <span className="text-slate-600">:~$</span>{" "}
                  <span className="animate-blink text-acid">_</span>
                </p>
              </div>

              <div className="grid grid-cols-3 divide-x divide-white/[0.06] border-t border-white/[0.06] bg-white/[0.01]">
                <div className="px-4 py-3">
                  <p className="font-mono text-sm font-bold text-white">
                    {formatNumber(totalArticles || 12)}
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wider text-slate-600">
                    bài giảng
                  </p>
                </div>
                <div className="px-4 py-3">
                  <p className="font-mono text-sm font-bold text-white">
                    {categories?.length ?? 6}
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wider text-slate-600">
                    lộ trình
                  </p>
                </div>
                <div className="px-4 py-3">
                  <p className="font-mono text-sm font-bold text-acid">0đ</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wider text-slate-600">
                    chi phí
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {apiDown ? (
        <div className="container-page mt-6">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] px-4 py-3 text-sm text-amber-200">
            Không kết nối được API. Hãy chắc chắn Express đang chạy tại{" "}
            <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-xs">
              http://localhost:5000
            </code>{" "}
            và đã chạy <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-xs">npm run seed</code>.
          </div>
        </div>
      ) : null}

      <section id="paths" className="container-page py-16 lg:py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-label">// lộ trình học</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Chọn con đường của bạn
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400">
              Sáu lộ trình từ nền tảng đến nâng cao. Mỗi bài học được viết để bạn
              đọc hiểu nhanh và áp dụng ngay.
            </p>
          </div>
          <Link
            href="/articles"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-acid"
          >
            Xem tất cả tài liệu
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories?.map((category, index) => (
            <Link
              key={category.slug}
              href={`/articles?category=${category.slug}`}
              className="card group relative overflow-hidden p-5 transition duration-200 hover:-translate-y-0.5 hover:border-white/20"
            >
              <div className="flex items-start justify-between">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-xl border"
                  style={categoryStyle(category.color)}
                >
                  <CategoryIcon name={category.icon} className="h-5 w-5" />
                </span>
                <span className="font-mono text-xs text-slate-700">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-5 font-semibold text-white transition group-hover:text-acid">
                {category.name}
              </h3>
              <p className="mt-1.5 line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-slate-500">
                {category.description}
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4 text-xs">
                <span className="text-slate-500">
                  {category.articleCount || 0} bài học
                </span>
                <span className="inline-flex items-center gap-1 text-slate-600 transition group-hover:text-acid">
                  Khám phá
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-white/[0.06] bg-ink-900/30">
        <div className="container-page py-16 lg:py-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-label">// nổi bật</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Bắt đầu với những bài hay nhất
              </h2>
            </div>
            <Link
              href="/articles?sort=popular"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-acid"
            >
              Xem thêm
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featuredArticles.length ? (
              featuredArticles.map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center text-sm text-slate-500">
                <Sparkles className="mx-auto mb-3 h-6 w-6 text-slate-600" />
                Chưa có bài viết nổi bật. Hãy chạy seed để nạp nội dung.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="container-page py-16 lg:py-20">
        <p className="section-label">// cách hoạt động</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
          Ba bước để tiến bộ mỗi ngày
        </h2>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Target,
              title: "Chọn lộ trình",
              text: "Bắt đầu từ chủ đề bạn quan tâm nhất: bảo mật web, Linux, mạng máy tính hay thuật toán.",
            },
            {
              icon: BookOpen,
              title: "Đọc và thực hành",
              text: "Mỗi bài viết có ví dụ, code và bài tập. Đọc trên web với mục lục, highlight cú pháp và copy code.",
            },
            {
              icon: Trophy,
              title: "Theo dõi tiến độ",
              text: "Đánh dấu hoàn thành từng bài, lưu bookmark và xem mức độ hoàn thành theo từng lộ trình.",
            },
          ].map((step, index) => (
            <div key={step.title} className="card relative overflow-hidden p-6">
              <span className="absolute right-5 top-4 font-mono text-4xl font-black text-white/[0.04]">
                /0{index + 1}
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-acid/10 text-acid">
                <step.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {step.text}
              </p>
              <div className="mt-5 flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle2 className="h-3.5 w-3.5 text-acid/70" />
                Miễn phí, không giới hạn
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pb-20">
        <div className="relative overflow-hidden rounded-3xl border border-acid/20 bg-gradient-to-br from-acid/[0.09] via-ink-850 to-ink-900 px-6 py-12 text-center sm:px-12">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[30rem] -translate-x-1/2 rounded-full bg-acid/10 blur-3xl" />
          <div className="relative">
            <p className="section-label">// sẵn sàng?</p>
            <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-black tracking-tight text-white sm:text-4xl">
              Bắt đầu hành trình học tập hôm nay.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
              Tạo tài khoản miễn phí để lưu tiến độ, bookmark bài viết và tiếp
              tục đúng nơi bạn dừng lại.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/register" className="btn-primary">
                Tạo tài khoản miễn phí
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/articles" className="btn-ghost">
                <Clock className="h-4 w-4 text-acid" />
                Đọc thử miễn phí
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
