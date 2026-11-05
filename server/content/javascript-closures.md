---
title: "Closures trong JavaScript: hiểu sâu qua ví dụ"
slug: "javascript-closures"
description: "Lexical scope, closure hoạt động thế nào, ứng dụng thực tế, lỗi kinh điển với vòng lặp và cách tránh rò rỉ bộ nhớ."
category: "javascript"
difficulty: "intermediate"
tags: ["javascript", "closure", "scope", "es6"]
readTime: 8
publishedAt: "2026-09-06"
---

Closure là một trong những khái niệm nền tảng nhất của JavaScript, và cũng là câu hỏi phỏng vấn xuất hiện ở hầu hết vị trí frontend/backend. Hiểu đúng closure giúp bạn viết code sạch hơn, debug dễ hơn và tránh những lỗi rất khó tìm.

## Closure là gì?

Closure là khả năng của một hàm **ghi nhớ và truy cập phạm vi (scope) nơi nó được tạo ra**, ngay cả khi hàm đó được gọi ở bên ngoài phạm vi đó.

```js
function createCounter() {
  let count = 0;

  return function increment() {
    count += 1;
    return count;
  };
}

const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3
```

Sau khi `createCounter()` trả về, lẽ ra biến `count` không còn cần thiết. Nhưng vì hàm `increment` tham chiếu tới nó, JavaScript giữ `count` trong bộ nhớ. Hàm `increment` chính là một closure.

## Lexical scope

JavaScript dùng **lexical scope**: phạm vi được xác định tại thời điểm code được viết, không phải lúc gọi.

```js
const language = "JavaScript";

function outer() {
  const version = "ES2024";

  function inner() {
    console.log(language, version);
  }

  inner();
}
```

`inner` có thể thấy `version` của `outer` và `language` toàn cục vì chúng nằm trong chuỗi scope bao quanh nó.

## Ứng dụng thực tế

### 1. Đóng gói trạng thái riêng tư

Closure cho phép tạo biến "private" mà không lộ ra ngoài:

```js
function createWallet(initialBalance) {
  let balance = initialBalance;

  return {
    deposit(amount) {
      if (amount <= 0) throw new Error("Số tiền không hợp lệ");
      balance += amount;
    },
    getBalance() {
      return balance;
    },
  };
}
```

Không ai có thể gán `wallet.balance = 9999` từ bên ngoài.

### 2. Factory function

```js
function createLogger(prefix) {
  return (message) => console.log(`[${prefix}] ${message}`);
}

const authLog = createLogger("auth");
authLog("Đăng nhập thành công");
```

### 3. Debounce và memoization

Đây là nơi closure xuất hiện trong công việc hằng ngày:

```js
function memoize(fn) {
  const cache = new Map();

  return function memoized(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);

    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}
```

`memoized` giữ `cache` sống giữa các lần gọi nhờ closure.

### 4. Callback và event handler

```js
function setupButton(button) {
  let clicks = 0;

  button.addEventListener("click", () => {
    clicks += 1;
    button.textContent = `Đã bấm ${clicks} lần`;
  });
}
```

## Lỗi kinh điển với vòng lặp

Trước ES6, đoạn code sau là nguồn gốc của vô số bug:

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// In ra: 3, 3, 3
```

`var` có phạm vi hàm, nên cả ba closure đều tham chiếu **cùng một biến `i`**, và lúc callback chạy thì `i` đã bằng 3.

Cách sửa hiện đại:

```js
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// In ra: 0, 1, 2
```

`let` tạo một binding mới cho mỗi vòng lặp. Nếu phải dùng `var`, có thể tạo scope trung gian bằng IIFE:

```js
for (var i = 0; i < 3; i++) {
  (function (j) {
    setTimeout(() => console.log(j), 100);
  })(i);
}
```

## Closure và bộ nhớ

Closure giữ dữ liệu trong bộ nhớ chừng nào hàm còn tồn tại. Đây vừa là tính năng, vừa là cạm bẫy:

- Giữ tham chiếu đến DOM node lớn trong closure có thể khiến node không được giải phóng.
- Cache trong closure không có giới hạn có thể phình to theo thời gian.
- Event listener không được remove vẫn giữ scope liên quan.

Khi làm việc với ứng dụng lớn, hãy chú ý vòng đời: gỡ listener, giới hạn cache, dùng `WeakMap` khi phù hợp.

## Câu hỏi phỏng vấn thường gặp

```js
function buildFunctions() {
  const result = [];

  for (var i = 0; i < 3; i++) {
    result.push(function () {
      return i;
    });
  }

  return result;
}

const fns = buildFunctions();
console.log(fns[0](), fns[1](), fns[2]()); // 3 3 3
```

Giải thích: cả ba hàm chia sẻ cùng binding `i` trong scope của `buildFunctions`. Muốn nhận `0 1 2`, dùng `let` hoặc tạo scope mới cho mỗi vòng lặp.

## Tóm lại

- Closure = hàm + môi trường lexical nơi hàm được tạo.
- Closure giúp đóng gói trạng thái, tạo factory, debounce, memoize.
- `let` giải quyết lỗi vòng lặp kinh điển.
- Closure giữ bộ nhớ — hãy quản lý vòng đời cẩn thận.

Hiểu closure không chỉ để trả lời phỏng vấn. Nó là nền tảng để hiểu React hooks, module pattern, middleware và rất nhiều API JavaScript hiện đại.
