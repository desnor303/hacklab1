import type { ArticleSummary, Category, Difficulty } from "./types";

export const DIFFICULTY_META: Record<
  Difficulty,
  { label: string; className: string }
> = {
  beginner: {
    label: "Cơ bản",
    className: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  },
  intermediate: {
    label: "Trung cấp",
    className: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  },
  advanced: {
    label: "Nâng cao",
    className: "border-rose-500/25 bg-rose-500/10 text-rose-300",
  },
};

export function getDifficultyMeta(value: string) {
  return DIFFICULTY_META[value as Difficulty] ?? DIFFICULTY_META.beginner;
}

export function getArticleCategory(article: ArticleSummary): Category | null {
  return typeof article.category === "object" && article.category
    ? article.category
    : null;
}

export function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatNumber(value = 0) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

export function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 90);
}

export function categoryStyle(color?: string) {
  const safeColor = color || "#9fef00";
  return {
    color: safeColor,
    backgroundColor: `${safeColor}14`,
    borderColor: `${safeColor}33`,
  };
}
