---
title: "Binary Search: Tìm kiếm nhị phân đúng cách"
slug: "binary-search"
description: "Điều kiện áp dụng, mẫu code chuẩn, các biến thể lower_bound/upper_bound và những lỗi off-by-one khiến bài thi trượt."
category: "algorithms"
difficulty: "intermediate"
tags: ["binary-search", "algorithms", "complexity", "interview"]
readTime: 8
publishedAt: "2026-08-08"
---

Binary search (tìm kiếm nhị phân) là thuật toán kinh điển chạy trong O(log n). Khái niệm rất đơn giản, nhưng viết đúng mà không bị off-by-one lại là một trong những bài toán "ám ảnh" nhất của lập trình viên.

## Điều kiện tiên quyết

Binary search chỉ hoạt động khi dữ liệu **đã được sắp xếp** (hoặc có tính chất đơn điệu). Với mảng chưa sắp xếp, phải sort trước — và chi phí sort là O(n log n), có thể không đáng nếu chỉ tìm một lần.

Tính chất cốt lõi: **sau mỗi lần kiểm tra, ta loại bỏ được một nửa không gian tìm kiếm.**

## Mẫu code chuẩn

Tìm chỉ số của `target` trong mảng tăng dần, trả về `-1` nếu không có:

```js
function binarySearch(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);

    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }

  return -1;
}
```

Ba điểm cần nhớ:

1. Dùng `<=` vì khoảng tìm kiếm là `[left, right]` đóng ở hai đầu.
2. Cập nhật `mid + 1` / `mid - 1`, không phải `mid`, tránh lặp vô hạn.
3. Tính `mid` bằng `left + (right - left) / 2` để tránh tràn số ở ngôn ngữ có kiểu số nguyên giới hạn. Với JavaScript, `Math.floor` đảm bảo chỉ số nguyên.

## Vì sao là O(log n)?

Mỗi vòng lặp giảm một nửa số phần tử cần xét:

```text
n → n/2 → n/4 → ... → 1
```

Số bước là `log₂(n)`. Với 1.000.000 phần tử, chỉ khoảng 20 vòng lặp. Tuy nhiên, mảng phải được sắp xếp từ trước.

## Biến thể 1: Tìm vị trí chèn (lower bound)

Bài toán: tìm vị trí đầu tiên mà `nums[i] >= target`.

```js
function lowerBound(nums, target) {
  let left = 0;
  let right = nums.length;

  while (left < right) {
    const mid = left + Math.floor((right - left) / 2);
    if (nums[mid] < target) left = mid + 1;
    else right = mid;
  }

  return left;
}
```

Lưu ý `right = nums.length` (không phải `length - 1`) và điều kiện `left < right`. Đây là mẫu nửa mở `[left, right)` rất phổ biến và ít lỗi hơn.

Ứng dụng:

```js
lowerBound([1, 3, 3, 5, 8], 3); // 1 (vị trí đầu tiên có 3)
lowerBound([1, 3, 3, 5, 8], 4); // 3 (vị trí có thể chèn 4)
lowerBound([1, 3, 3, 5, 8], 9); // 5 (chèn cuối mảng)
```

## Biến thể 2: Tìm vị trí đầu tiên lớn hơn (upper bound)

```js
function upperBound(nums, target) {
  let left = 0;
  let right = nums.length;

  while (left < right) {
    const mid = left + Math.floor((right - left) / 2);
    if (nums[mid] <= target) left = mid + 1;
    else right = mid;
  }

  return left;
}
```

Khác biệt duy nhất với `lowerBound` là điều kiện `<=` thay vì `<`.

## Đếm số lần xuất hiện

Với mảng đã sắp xếp, số lần xuất hiện của `target` là:

```js
const count = upperBound(nums, target) - lowerBound(nums, target);
```

Đây là ứng dụng rất hữu ích và tránh được việc duyệt toàn mảng.

## Tìm trong mảng xoay

Một bài toán phổng vấn nổi tiếng: mảng đã sắp xếp nhưng bị xoay (ví dụ `[4,5,6,7,0,1,2]`). Vẫn có thể binary search bằng cách xác định nửa nào còn sorted:

```js
function searchRotated(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;

    // Nửa trái đang sorted
    if (nums[left] <= nums[mid]) {
      if (nums[left] <= target && target < nums[mid]) right = mid - 1;
      else left = mid + 1;
    } else {
      // Nửa phải đang sorted
      if (nums[mid] < target && target <= nums[right]) left = mid + 1;
      else right = mid - 1;
    }
  }

  return -1;
}
```

## Những lỗi thường gặp

- **Dùng `<` thay vì `<=`** khi khoảng tìm kiếm đóng hai đầu, khiến bỏ sót phần tử cuối.
- **Không cộng/trừ 1** khi cập nhật `left`/`right`, gây vòng lặp vô hạn khi còn hai phần tử.
- **Tính `mid` sai** với `(left + right) / 2` không floor, dẫn tới chỉ số không nguyên.
- **Áp dụng cho mảng chưa sort**: kết quả không xác định.
- **Trộn lẫn hai mẫu** đóng `[left, right]` và nửa mở `[left, right)`, khiến điều kiện và cập nhật không khớp nhau.

Mẹo: chọn một mẫu duy nhất, viết ra giấy invariant (điều kiện luôn đúng), rồi kiểm tra với mảng 1 phần tử, 2 phần tử và target không tồn tại.

## Bài tập luyện tập

1. Cài đặt `lowerBound` và `upperBound`, kiểm thử với mảng rỗng, một phần tử, nhiều phần tử trùng.
2. Tìm căn bậc hai nguyên của một số bằng binary search.
3. Tìm phần tử nhỏ nhất trong mảng xoay.
4. Cho mảng `weights` và giới hạn `days`, tìm khả năng vận chuyển nhỏ nhất (Binary Search on Answer).
5. Viết binary search đệ quy và so sánh với phiên bản vòng lặp.

## Tóm lại

Binary search không khó vì ý tưởng, mà khó vì **ranh giới**. Hãy chọn một mẫu cố định (`left <= right` hoặc `left < right`), hiểu rõ invariant và kiểm thử với các trường hợp biên. Khi đã thành thạo, bạn có thêm một công cụ cực mạnh để giải nhiều bài toán tối ưu.
