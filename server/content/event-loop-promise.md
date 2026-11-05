---
title: "Event loop, Promise và async/await"
slug: "event-loop-promise"
description: "JavaScript chạy đơn luồng nhưng vẫn xử lý bất đồng bộ. Khám phá call stack, microtask, macrotask và cách viết async/await đúng."
category: "javascript"
difficulty: "advanced"
tags: ["javascript", "async", "promise", "event-loop"]
readTime: 11
publishedAt: "2026-08-29"
---

JavaScript là ngôn ngữ đơn luồng (single-threaded), vậy làm sao một trang web vẫn tải dữ liệu, xử lý click và render mượt cùng lúc? Câu trả lời nằm ở **event loop** — cơ chế phối hợp giữa call stack, Web APIs và các hàng đợi tác vụ.

## Kiến trúc tổng quan

Khi chạy trong trình duyệt hoặc Node.js, JavaScript có:

- **Call stack**: nơi thực thi code đồng bộ.
- **Web APIs / libuv**: xử lý timer, network, file I/O ở nền.
- **Macrotask queue**: `setTimeout`, `setInterval`, I/O callbacks, UI events.
- **Microtask queue**: callback của Promise, `queueMicrotask`, `MutationObserver`.

Event loop liên tục lặp: chạy hết call stack → chạy **toàn bộ microtask** → render (trình duyệt) → lấy **một macrotask** → lặp lại.

## Ví dụ kinh điển

```js
console.log("1");

setTimeout(() => console.log("2"), 0);

Promise.resolve().then(() => console.log("3"));

console.log("4");

// Kết quả: 1 4 3 2
```

Tại sao? Code đồng bộ chạy trước (`1`, `4`). Sau đó microtask queue được xử lý (`3`). Cuối cùng macrotask `setTimeout` mới chạy (`2`).

Thứ tự quan trọng:

```text
Đồng bộ → Microtask → Macrotask
```

Microtask có ưu tiên cao hơn. Nếu một microtask liên tục tạo microtask mới, event loop có thể bị "đói" và không bao giờ tới macrotask. Đây là lý do không nên viết đệ quy Promise vô hạn.

## Promise không "chạy sau"

Điểm dễ hiểu nhầm: thân của `new Promise(...)` chạy **ngay lập tức** và đồng bộ. Chỉ callback trong `.then` mới được xếp vào microtask.

```js
const p = new Promise((resolve) => {
  console.log("A"); // chạy ngay
  resolve("B");
});

p.then((value) => console.log(value)); // microtask
console.log("C");

// A C B
```

## async/await chỉ là cú pháp

`async/await` là "đường" viết dễ đọc hơn cho Promise. Một hàm `async` luôn trả về Promise, và `await` tạm dừng hàm đó (không chặn toàn bộ chương trình).

```js
async function loadUser(id) {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) throw new Error("Không tải được người dùng");
  return response.json();
}

async function main() {
  try {
    const user = await loadUser(42);
    console.log(user);
  } catch (error) {
    console.error(error.message);
  }
}
```

Bên dưới, `await` chia hàm thành các đoạn, phần sau `await` trở thành callback của microtask.

## Chạy song song đúng cách

Sai lầm phổ biến: `await` tuần tự những việc không phụ thuộc nhau.

```js
// Chậm: mất tổng thời gian của cả hai request
const user = await fetchUser();
const posts = await fetchPosts();
```

Dùng `Promise.all` để chạy song song:

```js
// Nhanh: mất thời gian của request chậm nhất
const [user, posts] = await Promise.all([fetchUser(), fetchPosts()]);
```

Các combinator khác:

| API | Hành vi |
| --- | --- |
| `Promise.all` | Lỗi nếu bất kỳ Promise nào reject |
| `Promise.allSettled` | Chờ tất cả, trả trạng thái từng Promise |
| `Promise.race` | Lấy kết quả đầu tiên (fulfilled hoặc rejected) |
| `Promise.any` | Lấy Promise fulfilled đầu tiên, bỏ qua lỗi |

## Lỗi thường gặp

### Quên await

```js
async function save() {
  db.save(); // Promise bị bỏ quên, lỗi không được bắt
}
```

Luôn `return` hoặc `await` khi cần đảm bảo hoàn tất.

### forEach với async

`Array.prototype.forEach` không chờ callback async:

```js
// Không đảm bảo thứ tự/hoàn tất
items.forEach(async (item) => {
  await process(item);
});

// Đúng: chạy song song
await Promise.all(items.map((item) => process(item)));

// Đúng: chạy tuần tự
for (const item of items) {
  await process(item);
}
```

### Chặn event loop

Một tác vụ đồng bộ nặng (vòng lặp lớn, JSON khổng lồ, thuật toán O(n²)) sẽ chặn toàn bộ event loop. Trong Node.js, hãy cân nhắc worker threads cho CPU-intensive; trong trình duyệt, dùng Web Worker.

## Kiểm tra hiểu bài

```js
setTimeout(() => console.log("timeout"), 0);

Promise.resolve()
  .then(() => console.log("promise 1"))
  .then(() => console.log("promise 2"));

queueMicrotask(() => console.log("microtask"));

console.log("sync");

// sync → promise 1 → microtask → promise 2 → timeout
```

Thứ tự trên đúng vì mọi microtask (kể cả microtask sinh ra trong microtask) được xử lý trước khi đến lượt macrotask.

## Tóm lại

- Event loop giúp JavaScript đơn luồng vẫn bất đồng bộ.
- Đồng bộ → microtask → macrotask là thứ tự vàng.
- `Promise` và `async/await` chỉ là cách biểu diễn tác vụ bất đồng bộ.
- Dùng `Promise.all` khi các tác vụ độc lập.
- Đừng chặn event loop bằng xử lý đồng bộ nặng.

Nắm vững event loop sẽ giúp bạn lý giải những bug "không thể tin nổi" về thứ tự thực thi và viết code bất đồng bộ tự tin hơn rất nhiều.
