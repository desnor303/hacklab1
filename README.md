# HackLab

Nền tảng học bảo mật & lập trình kiểu Hack The Box / GeeksforGeeks, xây dựng bằng **MENN stack** (MongoDB, Express, Next.js, Node.js). Nội dung bài học được viết bằng **Markdown**, hiển thị với mục lục, highlight code và theo dõi tiến độ người học.

## Tính năng

- **Thư viện tài liệu Markdown**: 12 bài học mẫu thuộc 6 lộ trình (Web Security, Networking, Linux, JavaScript, Databases, Algorithms).
- **Trình đọc bài chuyên nghiệp**: mục lục tự động, scroll spy, highlight cú pháp, nút copy code, bảng biểu, breadcrumb.
- **Tìm kiếm & lọc**: theo từ khoá, danh mục, độ khó; sắp xếp và phân trang.
- **Xác thực JWT**: đăng ký, đăng nhập, phân quyền `user` / `admin`.
- **Theo dõi tiến độ**: đánh dấu hoàn thành, bookmark, thống kê tiến độ theo từng lộ trình.
- **Bảng điều khiển học viên**: tỉ lệ hoàn thành, hoạt động gần đây, bookmark.
- **Trang quản trị**: thống kê, danh sách bài viết, tạo/sửa/xoá bài viết với trình soạn Markdown + xem trước trực tiếp.
- **Giao diện dark/terminal** lấy cảm hứng từ các nền tảng lab bảo mật, responsive trên mobile.

## Công nghệ

| Thành phần | Công nghệ |
| --- | --- |
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS |
| Backend | Node.js, Express 4, JWT, bcryptjs, Helmet, rate limit |
| Database | MongoDB + Mongoose |
| Markdown | react-markdown, remark-gfm, rehype-highlight, rehype-slug |
| Nội dung | Markdown + gray-matter (frontmatter), seed tự động |

## Cấu trúc dự án

```text
hacklab/
├── package.json              # npm workspaces + script chạy cả hai app
├── server/                   # Express API
│   ├── content/              # 12 bài học Markdown (có frontmatter)
│   ├── src/
│   │   ├── config/db.js
│   │   ├── middleware/       # auth, error handler
│   │   ├── models/           # User, Category, Article, Progress, Bookmark
│   │   ├── routes/           # auth, articles, categories, progress, bookmarks, admin
│   │   ├── seed/             # seed.js + categories.js
│   │   ├── app.js
│   │   └── index.js
│   ├── .env.example
│   └── package.json
├── web/                      # Next.js App Router
│   ├── app/                  # pages: home, articles, login, dashboard, admin...
│   ├── components/           # UI, markdown renderer, editor, dashboard...
│   ├── lib/                  # API client, auth context, types, utils
│   ├── .env.example
│   └── package.json
└── README.md
```

## Yêu cầu

- Node.js **18.18+** (khuyến nghị 20+)
- MongoDB đang chạy (local hoặc Atlas)
- npm 9+

Dự án đã được kiểm thử với Node 24 và MongoDB 9.

## Cài đặt nhanh (Windows PowerShell)

```powershell
# 1. Cài dependencies (npm workspaces)
npm install

# 2. Tạo file môi trường
Copy-Item server\.env.example server\.env
Copy-Item web\.env.example web\.env.local

# 3. Nạp danh mục, bài học và tài khoản demo
npm run seed

# 4. Chạy đồng thời API + web
npm run dev
```

Mở:

- Web: <http://localhost:3000>
- API: <http://localhost:5000/api/health>

> Nếu MongoDB chạy ở địa chỉ khác, sửa `MONGODB_URI` trong `server/.env`.

### Chạy riêng từng phần

```powershell
npm run dev:server     # API tại :5000
npm run dev:web        # Next.js tại :3000
npm run seed           # nạp/cập nhật nội dung Markdown
npm run seed:fresh     # xoá bài viết + tiến độ rồi seed lại
npm run build          # build production cho web
npm run start          # chạy API + web production
npm run typecheck      # kiểm tra TypeScript
```

## Tài khoản demo

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Học viên | `student@hacklab.dev` | `Student123!` |
| Quản trị | `admin@hacklab.dev` | `Admin123!` |

Tài khoản được tạo tự động bởi `npm run seed`. Trang đăng nhập có nút điền nhanh tài khoản demo.

## API chính

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Mô tả | Auth |
| --- | --- | --- | --- |
| GET | `/health` | Kiểm tra trạng thái API | — |
| POST | `/auth/register` | Đăng ký tài khoản | — |
| POST | `/auth/login` | Đăng nhập, trả JWT | — |
| GET | `/auth/me` | Thông tin người dùng hiện tại | Bearer |
| GET | `/categories` | Danh mục + số bài viết | — |
| GET | `/articles` | Danh sách bài viết (search, category, difficulty, sort, page) | — |
| GET | `/articles/:slug` | Chi tiết bài viết + bài liên quan | — |
| GET | `/progress` | Tiến độ của tôi | Bearer |
| POST | `/progress/:articleId` | Đánh dấu/bỏ hoàn thành (`{ "completed": true }`) | Bearer |
| GET | `/bookmarks` | Danh sách bookmark | Bearer |
| POST | `/bookmarks/:articleId` | Bật/tắt bookmark | Bearer |
| GET | `/admin/stats` | Thống kê hệ thống | Admin |
| GET | `/admin/articles` | Danh sách đầy đủ (kể cả nháp) | Admin |
| GET | `/admin/articles/:id` | Chi tiết để chỉnh sửa | Admin |
| POST | `/admin/articles` | Tạo bài viết | Admin |
| PUT | `/admin/articles/:id` | Cập nhật bài viết | Admin |
| DELETE | `/admin/articles/:id` | Xoá bài viết | Admin |

Response thống nhất dạng:

```json
{ "success": true, "data": { } }
```

Lỗi trả về `{ "success": false, "message": "..." }` cùng HTTP status phù hợp.

## Thêm bài viết

### Cách 1: Trang quản trị

1. Đăng nhập bằng tài khoản admin.
2. Vào **Quản trị** → **Tạo bài viết**.
3. Nhập tiêu đề, slug, mô tả, nội dung Markdown, chọn danh mục/độ khó/tag.
4. Có thể xem trước Markdown, lưu nháp hoặc xuất bản ngay.

### Cách 2: Thêm file Markdown + seed

Tạo file trong `server/content/`:

```markdown
---
title: "Tên bài học"
slug: "ten-bai-hoc"
description: "Mô tả ngắn hiển thị trên thẻ bài viết"
category: "web-security"
difficulty: "beginner"
tags: ["tag1", "tag2"]
readTime: 8
featured: true
publishedAt: "2026-11-01"
---

## Mục đầu tiên

Nội dung Markdown...
```

Các `category` hợp lệ: `web-security`, `networking`, `linux`, `javascript`, `databases`, `algorithms`.
`difficulty`: `beginner`, `intermediate`, `advanced`.

Sau đó chạy:

```powershell
npm run seed
```

Seed dùng `upsert` theo `slug`, nên chạy lại sẽ cập nhật nội dung mà không tạo bản trùng.

## Biến môi trường

`server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/hacklab
JWT_SECRET=thay_bang_chuoi_ngau_nhien_dai
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000,http://127.0.0.1:3000
```

`web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

> `NEXT_PUBLIC_API_URL` được nhúng vào bundle lúc build. Khi deploy production, hãy đặt biến này trước khi chạy `npm run build`.

## Ghi chú bảo mật & production

Đây là dự án học tập/demo, một số lựa chọn cần thay đổi trước khi dùng thật:

- JWT hiện lưu trong `localStorage` để đơn giản hoá demo. Production nên cân nhắc cookie `HttpOnly`, `Secure`, `SameSite` và cơ chế refresh/revoke token.
- Đổi `JWT_SECRET` mạnh và không commit `.env`.
- Thêm xác thực email, quên mật khẩu, giới hạn đăng nhập và audit log.
- Rà soát phân quyền ở mọi endpoint trước khi mở cho người dùng thật.
- Bật HTTPS, cấu hình CORS chính xác theo domain và thêm CSP.
- Nội dung bài viết được render từ Markdown qua `react-markdown` (không render HTML thô), nhưng vẫn nên kiểm duyệt nội dung do admin tạo.

## Xử lý sự cố

| Lỗi | Cách khắc phục |
| --- | --- |
| `MongoServerError: connect ECONNREFUSED` | Bật MongoDB: `Start-Service MongoDB` hoặc chạy Docker |
| Web báo "Không kết nối được API" | Kiểm tra API tại :5000 và `NEXT_PUBLIC_API_URL`, sau đó restart web |
| CORS bị chặn | Thêm origin của bạn vào `CLIENT_URL` trong `server/.env` |
| Đăng nhập báo email/mật khẩu sai | Chạy `npm run seed` để tạo tài khoản demo |
| Cổng 3000/5000 đã được dùng | Đổi `PORT` trong `server/.env` và script `dev` của web, đồng thời cập nhật URL API |
| Trang trắng sau khi build | Chạy lại `npm run build` và dùng `npm run start` |

## Định hướng mở rộng

- Lộ trình có thứ tự bài học và chứng chỉ hoàn thành.
- Quiz/bài tập tương tác, môi trường lab.
- Bình luận và ghi chú cá nhân trên từng bài.
- Upload ảnh cho bài viết, soạn thảo WYSIWYG.
- Tìm kiếm full-text bằng MongoDB Atlas Search.
- OAuth (Google/GitHub), xác thực email.

---

Dự án phục vụ mục đích học tập. Chỉ thực hành kỹ thuật bảo mật trên hệ thống bạn sở hữu hoặc được cấp phép.
