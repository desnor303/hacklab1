import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { serverApi } from "@/lib/server-api";
import type { Article } from "@/lib/types";
import { ArticleShell } from "@/components/article-shell";

export const dynamic = "force-dynamic";

const getArticle = cache(async (slug: string) => {
  return serverApi<Article>(`/articles/${encodeURIComponent(slug)}`);
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return { title: "Bài viết không tồn tại" };
  }

  return {
    title: article.title,
    description: article.description,
    keywords: article.tags,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  return <ArticleShell article={article} />;
}
