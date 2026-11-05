---
title: "Big-O: Đo độ phức tạp thuật toán"
slug: "big-o"
description: "Hiểu ký hiệu Big-O qua ví dụ cụ thể, bảng tăng trưởng, độ phức tạp thời gian và không gian, cùng những sai lầm thường gặp."
category: "algorithms"
difficulty: "beginner"
tags: ["big-o", "complexity", "algorithms", "interview"]
readTime: 7
publishedAt: "2026-08-15"
---

Big-O mô tả **tốc độ tăng trưởng** của thời gian chạy (hoặc bộ nhớ) khi kích thước đầu vào tăng. Đây là ngôn ngữ chung để so sánh thuật toán mà không phụ thuộc vào phần cứng hay ngôn ngữ lập trình.

## Vì sao không đo bằng giây?

Cùng một thuật toán chạy trên máy mạnh và máy yếu sẽ mất thời gian khác nhau. Big-O bỏ qua hằng số và chỉ quan tâm **xu hướng tăng trưởng** khi `n` rất lớn.

```text
O(2n)  →  O(n)
O(n + 5) →  O(n)
O(3n² + 2n + 1) → O(n²)
```

Quy tắc: bỏ hằng số, giữ hạng tử lớn nhất.

## Các mức phổ biến

| Big-O | Tên | Ví dụ |
| --- | --- | --- |
| O(1) | Hằng số | Truy cập phần tử mảng theo chỉ số |
| O(log n) | Logarithm | Binary search |
| O(n) | Tuyến tính | Duyệt mảng |
| O(n log n) | Log-tuyến tính | Merge sort, sort hiệu quả |
| O(n²) | Bậc hai | Hai vòng lặp lồng nhau |
| O(2ⁿ) | Hàm mũ | Thử mọi tập con |
| O(n!) | Giai thừa | Thử mọi hoán vị |

Bảng tăng trưởng với n khác nhau:

| n | O(1) | O(log n) | O(n) | O(n log n) | O(n²) |
| --- | --- | --- | --- | --- | --- |
| 10 | 1 | ~3 | 10 | ~33 | 100 |
| 1.000 | 1 | ~10 | 1.000 | ~10.000 | 1.000.000 |
| 1.000.000 | 1 | ~20 | 1.000.000 | ~20.000.000 | 1.000.000.000.000 |

Sự khác biệt giữa O(n) và O(n²) trở nên khổng lồ khi dữ liệu lớn.

## Ví dụ từng mức

### O(1)

```js
function getFirst(arr) {
  return arr[0];
}
```

Thời gian không phụ thuộc số phần tử.

### O(n)

```js
function sum(arr) {
  let total = 0;
  for (const value of arr) {
    total += value;
  }
  return total;
}
```

Duyệt một lần, số bước tỉ lệ với `n`.

### O(n²)

```js
function hasDuplicateQuadratic(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) return true;
    }
  }
  return false;
}
```

Có thể tối ưu xuống O(n) bằng `Set`:

```js
function hasDuplicateLinear(arr) {
  const seen = new Set();
  for (const value of arr) {
    if (seen.has(value)) return true;
    seen.add(value);
  }
  return false;
}
```

### O(log n)

Mỗi bước giảm một nửa dữ liệu. Binary search là ví dụ chuẩn:

```js
function binarySearch(sorted, target) {
  let left = 0;
  let right = sorted.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (sorted[mid] === target) return mid;
    if (sorted[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}
```

Với 1 tỷ phần tử, chỉ cần khoảng 30 bước.

## Độ phức tạp không gian

Big-O cũng áp dụng cho bộ nhớ. Một thuật toán có thể nhanh nhưng tốn nhiều bộ nhớ.

```js
// O(n) không gian: tạo mảng mới
function double(arr) {
  return arr.map((value) => value * 2);
}

// O(1) không gian: sửa tại chỗ
function doubleInPlace(arr) {
  for (let i = 0; i < arr.length; i++) {
    arr[i] *= 2;
  }
  return arr;
}
```

Trong phỏng vấn, người ta thường hỏi cả time complexity và space complexity.

## Các cạm bẫy thường gặp

1. **Nhầm Big-O với thời gian thực tế.** Thuật toán O(n²) với n nhỏ có thể nhanh hơn O(n log n) do hằng số nhỏ. Big-O dành cho dữ liệu lớn.
2. **Bỏ qua chi phí ẩn.** `Array.prototype.includes` là O(n); gọi trong vòng lặp thành O(n²). `JSON.stringify` tốn thời gian theo kích thước dữ liệu.
3. **Chỉ nhìn số vòng lặp.** Hai vòng lặp tuần tự là O(n), không phải O(n²). Vòng lặp lồng nhau mới là O(n²).
4. **Quên cấu trúc dữ liệu.** Chọn `Set`/`Map` thay vì mảng có thể thay đổi độ phức tạp từ O(n) xuống O(1) cho thao tác tìm kiếm.
5. **Tối ưu quá sớm.** Với dữ liệu nhỏ, code dễ đọc quan trọng hơn micro-optimization.

## Cách phân tích nhanh

1. Xác định input `n` là gì.
2. Đếm các vòng lặp và xem chúng lồng nhau hay tuần tự.
3. Xem chi phí thao tác bên trong vòng lặp (tìm kiếm mảng? sort?).
4. Bỏ hằng số, giữ hạng tử lớn nhất.
5. Xét thêm bộ nhớ phụ cần dùng.

## Bài tập

1. Tính độ phức tạp của đoạn code duyệt chuỗi và đếm ký tự bằng `split().sort()`.
2. Tối ưu hàm tìm phần tử chung của hai mảng từ O(n²) xuống O(n).
3. Viết hai phiên bản đảo ngược chuỗi: một dùng mảng phụ O(n), một tại chỗ O(1).
4. Giải thích vì sao truy cập `Map.get` trung bình là O(1) còn tìm trong mảng là O(n).

Big-O không phải bộ công cụ để đo chính xác, mà là la bàn để chọn hướng đi đúng trước khi tối ưu.
