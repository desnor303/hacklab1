---
title: "SQL Injection: Từ khai thác đến phòng thủ"
slug: "sql-injection"
description: "Hiểu cơ chế SQL Injection qua các ví dụ thực tế, cách hoạt động của UNION-based và Blind SQLi, cùng checklist phòng thủ chuẩn."
category: "web-security"
difficulty: "intermediate"
tags: ["sql-injection", "database", "owasp", "security"]
readTime: 12
featured: true
publishedAt: "2026-10-18"
---

SQL Injection (SQLi) xảy ra khi dữ liệu người dùng được ghép trực tiếp vào câu truy vấn SQL, cho phép kẻ tấn công thay đổi cấu trúc truy vấn. Đây vẫn là một trong những lỗ hổng nguy hiểm nhất vì có thể dẫn đến đọc, sửa hoặc xoá toàn bộ dữ liệu.

## Cơ chế hoạt động

Xét đoạn code Node.js dùng thư viện `mysql2`:

```js
app.get("/user", async (req, res) => {
  const { username } = req.query;
  const sql = `SELECT id, name FROM users WHERE username = '${username}'`;
  const [rows] = await db.query(sql);
  res.json(rows);
});
```

Khi `username` là `admin' OR '1'='1`, câu truy vấn trở thành:

```sql
SELECT id, name FROM users WHERE username = 'admin' OR '1'='1'
```

Điều kiện luôn đúng, và API trả về toàn bộ người dùng. Tương tự, payload `' OR 1=1 -- ` có thể bỏ qua phần kiểm tra mật khẩu trong một câu lệnh đăng nhập ngây thơ.

## Các dạng khai thác phổ biến

### In-band (UNION-based)

Kẻ tấn công dùng `UNION SELECT` để nối thêm dữ liệu vào kết quả. Bước đầu thường là xác định số cột:

```sql
' ORDER BY 1 -- 
' ORDER BY 2 -- 
' UNION SELECT username, password FROM users -- 
```

### Error-based

Lợi dụng thông báo lỗi chi tiết để trích xuất dữ liệu hoặc xác nhận cấu trúc. Đây là lý do production **không nên trả stack trace cho người dùng**.

### Blind SQLi

Khi ứng dụng không hiển thị kết quả, kẻ tấn công đặt câu hỏi đúng/sai và suy luận từ hành vi:

```sql
' AND (SELECT SUBSTRING(password,1,1) FROM users WHERE username='admin')='a' -- 
```

Biến thể time-based dùng `SLEEP(5)` để quan sát thời gian phản hồi.

### Second-order SQLi

Payload được lưu an toàn ở lần nhập đầu tiên nhưng được dùng lại trong truy vấn không an toàn ở chức năng khác. Điều này chứng minh vì sao phải xử lý an toàn ở **mọi điểm truy vấn**, không chỉ form đăng ký.

## Phòng thủ đúng cách

### 1. Parameterized queries (bắt buộc)

Đây là biện pháp quan trọng nhất. Truy vấn có tham số tách biệt **cấu trúc SQL** khỏi **dữ liệu**:

```js
const [rows] = await db.query(
  "SELECT id, name FROM users WHERE username = ?",
  [username]
);
```

Với PostgreSQL (`pg`):

```js
const result = await pool.query(
  "SELECT id, name FROM users WHERE username = $1",
  [username]
);
```

Nếu dùng ORM như Mongoose, Prisma hay Sequelize, hãy dùng API truy vấn chuẩn. Vẫn có nguy cơ khi bạn dùng raw query với nối chuỗi.

### 2. Allow-list cho những phần không thể tham số hoá

Tên bảng, tên cột, hướng `ORDER BY` không thể truyền qua placeholder. Hãy ánh xạ từ danh sách cố định:

```js
const SORTABLE = { price: "price", name: "name", created: "created_at" };
const column = SORTABLE[req.query.sort] || "created_at";
```

### 3. Nguyên tắc đặc quyền tối thiểu

Tài khoản database của ứng dụng chỉ nên có quyền cần thiết. Ứng dụng đọc dữ liệu không cần quyền `DROP TABLE` hay tạo user mới.

### 4. Kiểm soát lỗi và log

Trả về thông báo lỗi chung cho người dùng, ghi chi tiết vào log nội bộ. Đừng để kẻ tấn công thấy tên bảng, phiên bản database hay câu truy vấn.

### 5. WAF chỉ là lớp bổ sung

Web Application Firewall có thể chặn payload phổ biến nhưng không sửa được lỗ hổng gốc. Kẻ tấn công có thể mã hoá, phân mảnh hoặc khai thác qua đường khác. Hãy sửa code trước.

## Checklist review code

- Tìm kiếm mọi chỗ nối chuỗi SQL: template literals, `+`, `String.format`.
- Kiểm tra raw query trong ORM và stored procedure.
- Đảm bảo mọi input được tham số hoá, kể cả filter, sort, limit.
- Xác nhận tài khoản DB chạy với quyền tối thiểu.
- Thêm test tự động cho các payload kinh điển.
- Bật cảnh báo khi có truy vấn bất thường hoặc lỗi DB tăng đột biến.

## Bài tập thực hành

1. Dựng một API Express + SQLite nhỏ có hai endpoint dễ bị lỗi.
2. Viết payload đăng nhập bỏ qua mật khẩu.
3. Sửa code bằng parameterized query và kiểm chứng payload không còn hoạt động.
4. Bật chế độ `EXPLAIN` để hiểu truy vấn đã thay đổi ra sao.

Khi đã thấy tận mắt cách một dấu nháy đơn thay đổi logic truy vấn, bạn sẽ không bao giờ quên parameterized query nữa.
