---
title: "IDOR và Broken Object Level Authorization trong API"
slug: "idor-bola"
description: "Lỗi phân quyền cấp đối tượng khiến người dùng đọc dữ liệu của nhau. Cách phát hiện, khai thác trong lab và xây dựng lớp kiểm soát truy cập đúng."
category: "web-security"
difficulty: "intermediate"
tags: ["idor", "bola", "api", "authorization"]
readTime: 8
publishedAt: "2026-10-12"
---

IDOR (Insecure Direct Object Reference) hay BOLA (Broken Object Level Authorization) là lỗi xảy ra khi API **xác thực người dùng nhưng không kiểm tra quyền sở hữu trên từng đối tượng**. Đây là nhóm lỗ hổng đứng đầu trong OWASP API Security Top 10.

## Ví dụ kinh điển

```js
// CÓ LỖ HỔNG: chỉ cần đăng nhập là đọc được mọi hoá đơn
app.get("/api/orders/:id", auth, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Not found" });
  res.json(order);
});
```

Người dùng A đăng nhập, đổi `id` trên URL từ `1001` thành `1002` và nhận hoá đơn của người dùng B. Ứng dụng đã kiểm tra "đã đăng nhập chưa" nhưng thiếu câu hỏi quan trọng hơn: **"Người này có quyền với đối tượng này không?"**

## Vì sao rất phổ biến?

- API thường được thiết kế nhanh với ID tuần tự, dễ đoán.
- Middleware xác thực được đặt đúng, nhưng kiểm tra phân quyền bị bỏ quên ở từng route.
- Frontend ẩn nút bấm khiến nhóm phát triển tưởng đã an toàn. Kẻ tấn công không dùng giao diện — họ gọi thẳng API.
- Các thao tác đọc, sửa, xoá, tải file, xem lịch sử đều có thể mắc lỗi.

> Ẩn chức năng trên UI không phải là kiểm soát truy cập. Mọi quyết định phân quyền phải nằm ở phía server.

## Cách sửa đúng

### Kiểm tra quyền ở tầng truy vấn

Cách an toàn nhất là đưa điều kiện sở hữu vào chính câu truy vấn:

```js
app.get("/api/orders/:id", auth, async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!order) return res.status(404).json({ message: "Not found" });
  res.json(order);
});
```

Trả về `404` thay vì `403` để tránh lộ việc đối tượng có tồn tại.

### Kiểm soát theo tenant

Trong ứng dụng nhiều tổ chức, mọi bản ghi phải gắn `organizationId` và mọi truy vấn phải lọc theo tenant hiện tại. Hãy áp dụng ở tầng repository/service để tránh quên ở route.

### Kiểm soát theo vai trò và hành động

Với thao tác quản trị, dùng middleware nhưng vẫn phải xác định phạm vi dữ liệu:

```js
function canManageOrder(user, order) {
  return user.role === "admin" || order.user.equals(user._id);
}
```

Với hệ thống phức tạp, cân nhắc mô hình ABAC hoặc policy engine (Casbin, OPA) thay vì rải điều kiện khắp nơi.

### Không tin ID từ client

ID tăng dần không phải vấn đề nếu phân quyền đúng. UUID khó đoán hơn nhưng **không thay thế** kiểm tra quyền. UUID chỉ làm giảm khả năng dò tìm, không ngăn được việc rò rỉ ID qua log, email, response khác.

## Quy trình kiểm thử

1. Tạo hai tài khoản A và B, mỗi tài khoản có ít nhất một tài nguyên riêng.
2. Bắt request của A bằng proxy (Burp/ZAP).
3. Thay ID tài nguyên của A bằng ID của B, gửi lại.
4. Thử đổi ID trong body, query, path và header.
5. Thử các hành động: đọc, cập nhật, xoá, export, upload, chia sẻ, xem lịch sử.
6. Thử thay `userId` trong request thành ID của B.
7. Kiểm tra cả endpoint hàng loạt (bulk) — thường bỏ sót kiểm tra.

## Danh sách kiểm tra cho developer

- Mỗi route có ID đều phải có kiểm tra quyền sở hữu/phạm vi.
- Truy vấn đọc và ghi đều lọc theo chủ thể.
- Không dựa vào ID khó đoán hay UI ẩn.
- Viết test tự động: user A không thể đọc/sửa/xoá tài nguyên của B.
- Log các lần truy cập bị từ chối để phát hiện dò quét.

## Kết luận

Xác thực trả lời câu hỏi **"bạn là ai?"**, phân quyền trả lời **"bạn được làm gì với đối tượng này?"**. Hai câu hỏi khác nhau, và bỏ qua câu thứ hai chính là IDOR.
