import type { Metadata, Viewport } from "next";
import "highlight.js/styles/github-dark.css";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "HackLab — Học bảo mật & lập trình thực chiến",
    template: "%s · HackLab",
  },
  description:
    "Nền tảng học bảo mật, lập trình và hệ thống qua các bài viết Markdown chuyên sâu. Đọc, thực hành và theo dõi tiến độ của bạn.",
  keywords: ["học bảo mật", "học lập trình", "markdown", "hackthebox", "geeksforgeeks"],
};

export const viewport: Viewport = {
  themeColor: "#05080c",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className="flex min-h-screen flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
