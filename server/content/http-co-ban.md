---
title: "HTTP từ A đến Z cho người mới"
slug: "http-co-ban"
description: "Cấu trúc request/response, phương thức, mã trạng thái, header, cookie và sự khác biệt giữa HTTP/1.1, HTTP/2, HTTP/3."
category: "networking"
difficulty: "beginner"
tags: ["http", "networking", "web", "https"]
readTime: 10
featured: true
publishedAt: "2026-10-06"
---

HTTP (HyperText Transfer Protocol) là giao thức nền tảng của web. Mỗi lần bạn mở trang, gọi API hay tải ảnh, phía sau là một hoặc nhiều cặp request–response HTTP.

## Mô hình request–response

HTTP hoạt động theo mô hình client gửi **request**, server trả **response**. Giao thức có thể coi là "phi trạng thái": mỗi request độc lập, server không tự nhớ request trước đó trừ khi ta dùng cookie, session hoặc token.

Một request thô trông như sau:

```http
GET /articles/xss-la-gi HTTP/1.1
Host: hacklab.local
Accept: text/html
User-Agent: Mozilla/5.0
Cookie: session=abc123
```

Response tương ứng:

```http
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 1240
Cache-Control: max-age=60

<!doctype html>
<html>...</html>
```

## Phương thức phổ biến

| Phương thức | Mục đích | Có body? | An toàn lặp lại? |
| --- | --- | --- | --- |
| GET | Đọc dữ liệu | Không | Có |
| POST | Tạo mới / hành động | Có | Không |
| PUT | Thay thế toàn bộ tài nguyên | Có | Có |
| PATCH | Cập nhật một phần | Có | Không đảm bảo |
| DELETE | Xoá tài nguyên | Thường không | Có |
| OPTIONS | Xem khả năng/CORS | Không | Có |

"An toàn lặp lại" (idempotent) nghĩa là gọi nhiều lần cho cùng kết quả như gọi một lần. Đây là lý do trình duyệt và proxy có thể retry GET, PUT, DELETE một cách an toàn hơn POST.

## Mã trạng thái cần nhớ

- **2xx thành công**: `200 OK`, `201 Created`, `204 No Content`.
- **3xx chuyển hướng**: `301` vĩnh viễn, `302` tạm thời, `304` không thay đổi (dùng cache).
- **4xx lỗi phía client**: `400` request sai, `401` chưa xác thực, `403` không có quyền, `404` không tìm thấy, `429` quá nhiều request.
- **5xx lỗi phía server**: `500` lỗi chung, `502` upstream lỗi, `503` tạm thời không sẵn sàng.

Phân biệt `401` và `403` rất quan trọng: `401` là "bạn chưa chứng minh danh tính", `403` là "đã biết bạn là ai nhưng bạn không được phép".

## Header quan trọng

### Nội dung

- `Content-Type`: loại dữ liệu (`application/json`, `text/html`).
- `Content-Length` / `Transfer-Encoding`: cách xác định kích thước body.
- `Accept`: loại dữ liệu client chấp nhận.

### Cache

- `Cache-Control`: `no-store`, `no-cache`, `max-age=3600`, `public/private`.
- `ETag` và `If-None-Match`: kiểm tra phiên bản để tránh tải lại dữ liệu không đổi.

### Bảo mật

- `Strict-Transport-Security`: buộc dùng HTTPS.
- `Content-Security-Policy`: giới hạn nguồn tài nguyên được tải.
- `X-Content-Type-Options: nosniff`: chặn đoán sai MIME.
- `Set-Cookie` với `HttpOnly`, `Secure`, `SameSite`.

## Cookie, session và token

HTTP không có trạng thái, nên ứng dụng cần cơ chế gắn các request với cùng một người dùng:

- **Cookie + session**: server lưu session, trình duyệt giữ cookie ID.
- **JWT**: server ký token, client gửi trong header `Authorization: Bearer ...`.

JWT không tự động an toàn hơn session. Mỗi lựa chọn có đánh đổi về thu hồi token, lưu trữ phía client, kích thước và khả năng bị XSS/CSRF.

## HTTPS khác HTTP ở đâu?

HTTPS là HTTP chạy trên TLS. TLS mã hoá dữ liệu trên đường truyền, xác thực server bằng chứng chỉ, đảm bảo toàn vẹn. Nhờ vậy kẻ nghe lén trên Wi-Fi công cộng không đọc được mật khẩu hay token.

HTTPS **không** bảo vệ ứng dụng khỏi XSS, SQL injection hay lỗi logic. Nó bảo vệ kênh truyền, không bảo vệ nội dung.

## HTTP/1.1, HTTP/2 và HTTP/3

- **HTTP/1.1**: mỗi kết nối xử lý tuần tự (có pipelining hạn chế). Trình duyệt mở nhiều kết nối để tải song song. Vẫn rất phổ biến.
- **HTTP/2**: ghép nhiều request trên một kết nối (multiplexing), nén header HPACK, ưu tiên tài nguyên. Thường chạy qua TLS.
- **HTTP/3**: chạy trên QUIC (UDP), giảm độ trễ khi mất gói, cải thiện di động mạng chập chờn.

## Công cụ thực hành

```bash
# Xem header của một trang
curl -I https://example.com

# Gửi JSON
curl -X POST https://api.example.com/login \
  -H "Content-Type: application/json" \
  -d '{"email":"a@b.c","password":"secret"}'

# Kiểm tra thời gian kết nối và TLS
curl -w "\nDNS: %{time_namelookup}s TLS: %{time_appconnect}s\n" -o /dev/null -s https://example.com
```

## Bài tập

1. Dùng DevTools mở tab Network, xem toàn bộ request khi tải một trang.
2. Gửi một request GET bằng `curl` không kèm header `Host` và quan sát lỗi.
3. Thử `Cache-Control: no-store` cho API và quan sát hành vi với tab Network.
4. Tạo endpoint Express trả về `401` và `403`, dùng `curl -i` để so sánh header.

Hiểu HTTP sâu sẽ giúp bạn debug nhanh hơn, viết API đúng chuẩn hơn và nhận diện lỗ hổng bảo mật dễ hơn.
