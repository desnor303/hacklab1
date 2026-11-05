---
title: "XSS là gì? Hiểu sâu và phòng chống Cross-Site Scripting"
slug: "xss-la-gi"
description: "Phân loại Stored, Reflected và DOM-based XSS, cách khai thác trong môi trường lab và bộ biện pháp phòng thủ thực tế cho ứng dụng web."
category: "web-security"
difficulty: "beginner"
tags: ["xss", "owasp", "javascript", "security"]
readTime: 9
featured: true
publishedAt: "2026-10-24"
---

Cross-Site Scripting (XSS) là một trong những lỗ hổng phổ biến nhất trên web. Nó xảy ra khi ứng dụng chèn dữ liệu do người dùng kiểm soát vào trang HTML mà không được mã hoá đúng cách, khiến trình duyệt hiểu dữ liệu đó là **mã JavaScript hợp lệ**.

Hậu quả không chỉ là "một alert hiện lên". XSS có thể đánh cắp phiên đăng nhập, thực hiện hành động thay người dùng, thay đổi nội dung trang, hoặc biến website thành bàn đạp tấn công người khác.

## Nguyên nhân gốc rễ

Nguyên nhân luôn giống nhau: **dữ liệu không đáng tin đi vào ngữ cảnh HTML/JS mà không được xử lý theo đúng ngữ cảnh đó**.

```text
Input người dùng  →  Ứng dụng lưu/phản hồi  →  Trình duyệt hiểu là CODE
```

Cần phân biệt hai việc rất khác nhau:

- **Validation** (kiểm tra dữ liệu đầu vào) giúp loại bỏ dữ liệu sai định dạng.
- **Encoding/Escaping** (mã hoá đầu ra) đảm bảo dữ liệu được hiển thị như *văn bản*, không phải mã.

Chỉ validate là **không đủ**. Bạn luôn phải encode ở đúng ngữ cảnh đầu ra.

## Ba loại XSS chính

### 1. Stored XSS

Payload được lưu vào database (bình luận, tên hiển thị, mô tả sản phẩm) và thực thi mỗi khi có người xem trang. Đây là loại nguy hiểm nhất vì ảnh hưởng đến nhiều người dùng và tồn tại lâu.

### 2. Reflected XSS

Payload nằm trong request (thường là query string) và được phản hồi ngay lập tức. Kẻ tấn công cần dụ nạn nhân nhấp vào liên kết độc hại.

```text
https://victim.site/search?q=<script>alert(document.cookie)</script>
```

### 3. DOM-based XSS

Lỗ hổng xảy ra hoàn toàn ở phía client. JavaScript đọc dữ liệu không an toàn từ URL (ví dụ `location.hash`) rồi ghi thẳng vào DOM bằng API nguy hiểm.

```js
// CÓ LỖ HỔNG
const name = new URLSearchParams(location.search).get("name");
document.getElementById("welcome").innerHTML = name;

// AN TOÀN HƠN
document.getElementById("welcome").textContent = name;
```

## Một ví dụ có lỗ hổng

Giả sử API Express trả về lời chào bằng cách nối chuỗi HTML:

```js
app.get("/hello", (req, res) => {
  const name = req.query.name || "";
  res.send(`<h1>Xin chào ${name}</h1>`);
});
```

Với `?name=<img src=x onerror=alert(1)>`, trình duyệt sẽ thực thi `alert(1)`. Cách sửa:

```js
const escapeHtml = (str) =>
  str.replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));

app.get("/hello", (req, res) => {
  res.send(`<h1>Xin chào ${escapeHtml(req.query.name || "")}</h1>`);
});
```

Trong thực tế, hãy dùng template engine có auto-escape (React JSX, Vue, EJS với `<%= %>`), thay vì tự nối chuỗi HTML.

## Phòng thủ nhiều lớp

1. **Encode đầu ra theo ngữ cảnh.** HTML, attribute, URL, JavaScript và CSS có quy tắc encode khác nhau. Dùng thư viện đã được kiểm chứng thay vì tự viết.
2. **Ưu tiên API an toàn ở client.** Dùng `textContent` thay cho `innerHTML`, tránh `eval`, `document.write` và `dangerouslySetInnerHTML` nếu không thật sự cần.
3. **Content Security Policy (CSP).** CSP hạn chế nguồn script được phép chạy, giảm thiệt hại ngay cả khi lỗi encoding xảy ra. Bắt đầu với chế độ report-only để đo lường trước khi chặn.
4. **Cookie an toàn.** Đặt `HttpOnly` để JavaScript không đọc được cookie phiên, `Secure` để chỉ gửi qua HTTPS, `SameSite=Lax` hoặc `Strict` để giảm CSRF.
5. **Sanitize HTML khi buộc phải cho phép HTML.** Nếu ứng dụng cần định dạng phong phú, dùng thư viện như DOMPurify với allow-list thay vì blacklist.
6. **Không tin dữ liệu từ bất kỳ nguồn nào.** Kể cả dữ liệu từ database, từ API nội bộ hay từ header HTTP.

> Một lỗi XSS nhỏ có thể trở thành lỗi leo thang đặc quyền lớn: đánh cắp token, thực hiện request thay admin, hoặc cài keylogger trong trình duyệt nạn nhân.

## Checklist kiểm thử nhanh

- Thử payload vào mọi trường nhập: `<script>alert(1)</script>`, `" onmouseover="alert(1)`, `javascript:alert(1)`.
- Kiểm tra cả URL, header `Referer`, tên file upload và dữ liệu từ API bên thứ ba.
- Xem response có reflect nguyên văn dữ liệu không.
- Kiểm tra CSP và các cookie bảo mật bằng DevTools.
- Chạy công cụ quét (Burp, ZAP) nhưng luôn xác minh thủ công.

## Ghi nhớ

XSS là bài học nền tảng của bảo mật web. Khi đã hiểu **ngữ cảnh đầu ra quyết định cách encode**, bạn sẽ thấy cùng một nguyên tắc xuất hiện ở mọi nơi: SQL injection, command injection, template injection. Đó là tư duy cốt lõi của người làm bảo mật.
