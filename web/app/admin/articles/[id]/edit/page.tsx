import type { Metadata } from "next";
import { AdminGuard } from "@/components/admin-guard";
import { EditArticleLoader } from "@/components/edit-article-loader";

export const metadata: Metadata = {
  title: "Chỉnh sửa bài viết",
};

export default function EditArticlePage() {
  return (
    <AdminGuard>
      <EditArticleLoader />
    </AdminGuard>
  );
}
