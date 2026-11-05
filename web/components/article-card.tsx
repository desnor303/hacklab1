import Link from "next/link";
import { ArrowUpRight, Clock, Eye } from "lucide-react";
import type { ArticleSummary } from "@/lib/types";
import {
  categoryStyle,
  formatNumber,
  getArticleCategory,
} from "@/lib/utils";
import { DifficultyBadge } from "./difficulty-badge";

export function ArticleCard({ article }: { article: ArticleSummary }) {
  const category = getArticleCategory(article);

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="card group relative flex h-full flex-col overflow-hidden p-5 transition duration-200 hover:-translate-y-0.5 hover:border-acid/25 hover:bg-ink-800/90"
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-acid/50 to-transparent opacity-0 transition group-hover:opacity-100" />

      <div className="flex items-center justify-between gap-3">
        {category ? (
          <span
            className="badge max-w-[60%] truncate border"
            style={categoryStyle(category.color)}
          >
            {category.name}
          </span>
        ) : (
          <span />
        )}
        <DifficultyBadge difficulty={article.difficulty} />
      </div>

      <h3 className="mt-4 text-[17px] font-bold leading-snug text-white transition group-hover:text-acid">
        {article.title}
      </h3>

      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-400">
        {article.description}
      </p>

      <div className="mt-auto flex items-center justify-between pt-5 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {article.readTime} phút
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            {formatNumber(article.views)}
          </span>
        </div>
        <ArrowUpRight className="h-4 w-4 text-slate-600 transition group-hover:text-acid" />
      </div>
    </Link>
  );
}
