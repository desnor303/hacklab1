"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const { user, loading, login } = useAuth();

  const redirectTo =
    next && next.startsWith("/") ? next : "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace(redirectTo);
    }
  }, [loading, user, router, redirectTo]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Vui lòng nhập email và mật khẩu");
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setSubmitting(false);
    }
  }

  function fillDemo(kind: "student" | "admin") {
    if (kind === "admin") {
      setEmail("admin@hacklab.dev");
      setPassword("Admin123!");
    } else {
      setEmail("student@hacklab.dev");
      setPassword("Student123!");
    }
    setError("");
  }

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid-faint bg-[size:46px_46px] [mask-image:radial-gradient(ellipse_65%_60%_at_50%_40%,black,transparent)]" />
      <div className="container-page relative flex justify-center py-14 lg:py-20">
        <div className="w-full max-w-md">
          <div className="text-center">
            <p className="section-label">// tài khoản</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white">
              Chào mừng trở lại
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Đăng nhập để tiếp tục lộ trình và đồng bộ tiến độ học tập.
            </p>
          </div>

          <div className="card mt-8 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {error ? (
                <div className="flex items-start gap-2.5 rounded-lg border border-rose-500/25 bg-rose-500/[0.07] px-3.5 py-3 text-xs leading-relaxed text-rose-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {error}
                </div>
              ) : null}

              <div>
                <label htmlFor="email" className="label">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="ban@example.com"
                    className="input pl-10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="label">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="input pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 transition hover:text-slate-300"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>

            <div className="mt-6 border-t border-white/[0.06] pt-5">
              <p className="text-center font-mono text-[11px] uppercase tracking-widest text-slate-600">
                tài khoản demo
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemo("student")}
                  className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-left transition hover:border-acid/30"
                >
                  <span className="block text-xs font-semibold text-slate-300">
                    Học viên
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] text-slate-600">
                    student@hacklab.dev
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo("admin")}
                  className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-left transition hover:border-acid/30"
                >
                  <span className="block text-xs font-semibold text-slate-300">
                    Quản trị
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] text-slate-600">
                    admin@hacklab.dev
                  </span>
                </button>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="font-medium text-acid hover:underline"
            >
              Đăng ký miễn phí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
