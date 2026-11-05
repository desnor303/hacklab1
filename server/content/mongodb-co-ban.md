---
title: "MongoDB cơ bản: Document, Collection và CRUD"
slug: "mongodb-co-ban"
description: "Mô hình dữ liệu document, các thao tác CRUD với mongosh, query operator, index và cách thiết kế schema với Mongoose."
category: "databases"
difficulty: "beginner"
tags: ["mongodb", "database", "mongoose", "nosql"]
readTime: 10
publishedAt: "2026-08-22"
---

MongoDB là cơ sở dữ liệu NoSQL lưu dữ liệu dưới dạng **document** (tài liệu) thay vì bảng và hàng. Với ứng dụng Node.js, MongoDB thường được dùng cùng Mongoose để mô hình hoá dữ liệu. Bài này đi từ mô hình tư duy đến những thao tác thực tế.

## Mô hình dữ liệu

- **Document**: một đối tượng BSON, tương tự JSON.
- **Collection**: nhóm các document, tương tự bảng.
- **Database**: tập hợp các collection.

```json
{
  "_id": "66f1c2a9b4e2a1f0c8d9e001",
  "title": "MongoDB cơ bản",
  "tags": ["mongodb", "nosql"],
  "category": { "name": "Databases", "slug": "databases" },
  "views": 120,
  "publishedAt": "2026-08-22T00:00:00.000Z"
}
```

Khác biệt cốt lõi: MongoDB không bắt buộc mọi document có cùng cấu trúc. Điều này linh hoạt nhưng cũng đòi hỏi kỷ luật về schema ở tầng ứng dụng.

## Kết nối và thao tác với mongosh

```bash
mongosh "mongodb://127.0.0.1:27017/hacklab"

show dbs
use hacklab
show collections
```

### Create

```js
db.articles.insertOne({
  title: "XSS là gì?",
  slug: "xss-la-gi",
  tags: ["xss", "security"],
  views: 0
});

db.articles.insertMany([
  { title: "HTTP cơ bản", slug: "http-co-ban", views: 0 },
  { title: "DNS", slug: "dns", views: 0 }
]);
```

### Read

```js
// Tìm theo trường
db.articles.find({ slug: "xss-la-gi" });

// Điều kiện phức hợp
db.articles.find({ views: { $gte: 100 }, tags: "security" });

// Chiếu trường, sắp xếp, phân trang
db.articles
  .find({}, { title: 1, views: 1, _id: 0 })
  .sort({ views: -1 })
  .skip(0)
  .limit(10);
```

### Update

```js
// Cập nhật một document
db.articles.updateOne(
  { slug: "xss-la-gi" },
  { $inc: { views: 1 }, $set: { updatedAt: new Date() } }
);

// Upsert: tạo nếu chưa có
db.articles.updateOne(
  { slug: "jwt" },
  { $set: { title: "JWT" }, $setOnInsert: { views: 0 } },
  { upsert: true }
);
```

### Delete

```js
db.articles.deleteOne({ slug: "jwt" });
db.articles.deleteMany({ views: 0 });
```

## Query operator quan trọng

| Operator | Ý nghĩa |
| --- | --- |
| `$eq`, `$ne` | Bằng / không bằng |
| `$gt`, `$gte`, `$lt`, `$lte` | So sánh |
| `$in`, `$nin` | Thuộc / không thuộc danh sách |
| `$exists` | Trường tồn tại |
| `$regex` | Khớp biểu thức chính quy |
| `$and`, `$or`, `$not` | Logic |
| `$elemMatch` | Khớp phần tử trong mảng |
| `$inc`, `$set`, `$unset`, `$push`, `$pull` | Cập nhật |

Ví dụ tìm bài viết có tag bảo mật hoặc độ khó advanced:

```js
db.articles.find({
  $or: [
    { tags: "security" },
    { difficulty: "advanced" }
  ]
});
```

## Index: tăng tốc truy vấn

Không có index, MongoDB phải quét toàn bộ collection (COLLSCAN). Với dữ liệu lớn, đây là nguyên nhân phổ biến gây chậm.

```js
// Index đơn
db.articles.createIndex({ slug: 1 }, { unique: true });

// Index phức hợp: theo dõi truy vấn lọc category rồi sắp xếp publishedAt
db.articles.createIndex({ category: 1, publishedAt: -1 });

// Kiểm tra truy vấn dùng index
db.articles.find({ slug: "xss-la-gi" }).explain("executionStats");
```

Nguyên tắc: index phục vụ truy vấn đọc, nhưng làm chậm ghi và tốn dung lượng. Hãy tạo theo nhu cầu thực tế, không tạo tràn lan.

## Thiết kế schema: nhúng hay tham chiếu?

**Nhúng (embedding)** phù hợp khi:

- Dữ liệu con luôn được đọc cùng dữ liệu cha.
- Quan hệ 1-ít.
- Dữ liệu ít thay đổi độc lập.

```json
{
  "title": "Bài viết",
  "author": { "name": "An", "avatar": "/an.png" },
  "comments": [
    { "user": "Bình", "content": "Hay quá!" }
  ]
}
```

**Tham chiếu (referencing)** phù hợp khi:

- Dữ liệu được dùng ở nhiều nơi.
- Quan hệ nhiều-nhiều.
- Dữ liệu con thay đổi thường xuyên hoặc rất lớn.

```json
{
  "title": "Bài viết",
  "category": "66f1c2a9b4e2a1f0c8d9e001"
}
```

Đừng mang tư duy chuẩn hoá quan hệ sang MongoDB một cách máy móc. Hãy thiết kế theo **cách ứng dụng truy vấn dữ liệu**.

## Mongoose trong Node.js

```js
const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Article = mongoose.model("Article", articleSchema);
```

Mongoose thêm validation, middleware, populate và kiểu dữ liệu nhất quán. `unique: true` thực chất tạo index unique ở database — cần đảm bảo index đã được build trước khi dựa vào nó để chống trùng.

## Aggregation pipeline

Aggregation cho phép biến đổi dữ liệu nhiều bước:

```js
db.articles.aggregate([
  { $match: { isPublished: true } },
  { $group: { _id: "$category", count: { $sum: 1 }, totalViews: { $sum: "$views" } } },
  { $sort: { count: -1 } }
]);
```

Đây là công cụ mạnh để làm báo cáo, thống kê mà không cần kéo toàn bộ dữ liệu về ứng dụng.

## Thực hành

1. Tạo database `hacklab`, collection `articles` với 3 document.
2. Viết query tìm bài có `views > 50`, sắp xếp giảm dần.
3. Thêm index cho `slug`, kiểm tra bằng `explain`.
4. Viết aggregation đếm số bài theo `difficulty`.
5. Thử nhúng comment vào article và nhận xét khi nào nên tách collection.

MongoDB linh hoạt, nhưng sức mạnh đi kèm trách nhiệm: schema rõ ràng, index có chủ đích và truy vấn được kiểm soát sẽ giúp ứng dụng vừa nhanh vừa dễ bảo trì.
