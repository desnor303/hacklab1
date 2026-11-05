import type { Metadata } from "next";
import { AdminGuard } from "@/components/admin-guard";
import { ArticleEditor } from "@/components/article-editor";

export const metadata: Metadata = {
  title: "Tạo bài viết",
};

export default function NewArticlePage() {
  return (
    <AdminGuard>
      <ArticleEditor />
    </AdminGuard>
  );
}
