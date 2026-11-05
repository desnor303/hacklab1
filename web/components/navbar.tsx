"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn, initials } from "@/lib/utils";
import { Logo } from "./logo";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const links = [
    { href: "/articles", label: "Thư viện" },
    { href: "/#paths", label: "Lộ trình" },
    ...(user ? [{ href: "/dashboard", label: "Tiến độ" }] : []),
    ...(user?.role === "admin" ? [{ href: "/admin", label: "Quản trị" }] : []),
  ];

  function isActive(href: string) {
    if (href === "/#paths") return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function handleLogout() {
    logout();
    setOpen(false);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-ink-950/85 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white",
                  isActive(link.href) && "bg-white/[0.04] text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {loading ? (
            <span className="h-9 w-28 animate-pulse rounded-lg bg-white/5" />
          ) : user ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] py-1.5 pl-1.5 pr-3 transition hover:border-acid/30"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-acid/15 font-mono text-[11px] font-bold text-acid">
                  {initials(user.name)}
                </span>
                <span className="max-w-[130px] truncate text-sm text-slate-300">
                  {user.name}
                </span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                title="Đăng xuất"
                aria-label="Đăng xuất"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-500 transition hover:border-rose-500/30 hover:text-rose-300"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost px-3.5 py-2">
                Đăng nhập
              </Link>
              <Link href="/register" className="btn-primary px-3.5 py-2">
                Bắt đầu miễn phí
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label="Mở menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-300 md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/[0.06] bg-ink-950/95 py-4 md:hidden">
          <div className="container-page space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white",
                  isActive(link.href) && "bg-white/[0.04] text-acid"
                )}
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-4 border-t border-white/[0.06] pt-4">
              {user ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-acid/15 font-mono text-xs font-bold text-acid">
                      {initials(user.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:text-rose-300"
                    aria-label="Đăng xuất"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/login" className="btn-ghost">
                    Đăng nhập
                  </Link>
                  <Link href="/register" className="btn-primary">
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
