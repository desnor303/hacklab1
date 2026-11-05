import Link from "next/link";
import { Terminal } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/[0.06] bg-ink-900/40">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-acid text-ink-950">
              <Terminal className="h-5 w-5" strokeWidth={2.6} />
            </span>
            <span className="font-mono text-[17px] font-bold tracking-tight text-white">
              hack<span className="text-acid">lab</span>
              <span className="text-acid">_</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
            Nền tảng học bảo mật và lập trình thực chiến. Tài liệu Markdown
            chuyên sâu, lộ trình rõ ràng và tiến độ được lưu lại.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 font-mono text-[11px] text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-acid" />
            MENN stack · MongoDB · Express · Next.js · Node.js
          </div>
        </div>

        <div>
          <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-slate-400">
            Khám phá
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
            <li>
              <Link href="/articles" className="transition hover:text-acid">
                Thư viện tài liệu
              </Link>
            </li>
            <li>
              <Link href="/#paths" className="transition hover:text-acid">
                Lộ trình học
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="transition hover:text-acid">
                Tiến độ của tôi
              </Link>
            </li>
            <li>
              <Link href="/register" className="transition hover:text-acid">
                Tạo tài khoản
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-slate-400">
            Tài khoản demo
          </h3>
          <div className="mt-4 space-y-3 text-xs">
            <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5">
              <p className="font-semibold text-slate-300">Học viên</p>
              <p className="mt-1 font-mono text-slate-500">
                student@hacklab.dev
              </p>
              <p className="font-mono text-slate-500">Student123!</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5">
              <p className="font-semibold text-slate-300">Quản trị</p>
              <p className="mt-1 font-mono text-slate-500">
                admin@hacklab.dev
              </p>
              <p className="font-mono text-slate-500">Admin123!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.06]">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-slate-600 sm:flex-row">
          <p>© 2026 HackLab. Xây dựng để học tập và thực hành.</p>
          <p className="font-mono">made with curiosity &amp; caffeine</p>
        </div>
      </div>
    </footer>
  );
}
