import Link from "next/link";
import { Compass, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center py-16">
      <div className="text-center">
        <p className="font-mono text-7xl font-black text-acid">404</p>
        <h1 className="mt-4 text-2xl font-bold text-white">
          Không tìm thấy trang
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400">
          Đường dẫn không tồn tại, hoặc bài viết đã bị xoá. Hãy quay lại thư
          viện để tiếp tục học.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="btn-ghost">
            <Home className="h-4 w-4" />
            Trang chủ
          </Link>
          <Link href="/articles" className="btn-primary">
            <Compass className="h-4 w-4" />
            Khám phá thư viện
          </Link>
        </div>
      </div>
    </div>
  );
}
