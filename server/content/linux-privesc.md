---
title: "Leo thang đặc quyền Linux: tư duy và kỹ thuật"
slug: "linux-privesc"
description: "Quy trình enumeration, các vector leo thang đặc quyền phổ biến như sudo, SUID, cron và capabilities, kèm cách phòng chống."
category: "linux"
difficulty: "advanced"
tags: ["linux", "privilege-escalation", "security", "ctf"]
readTime: 14
publishedAt: "2026-09-14"
---

Leo thang đặc quyền (privilege escalation) là kỹ năng biến quyền truy cập hạn chế thành quyền cao hơn — thường là `root`. Trong môi trường lab/CTF, đây là bước cuối của một chuỗi khai thác. Bài viết này trình bày quy trình tư duy và các vector phổ biến để bạn **hiểu và phòng chống**, không phải để tấn công hệ thống không được phép.

> Chỉ thực hành trên máy của bạn, phòng lab, hoặc hệ thống có uỷ quyền bằng văn bản. Truy cập trái phép là vi phạm pháp luật.

## Tư duy trước khi gõ lệnh

Leo thang đặc quyền là bài toán **thu thập thông tin có hệ thống**, không phải thử ngẫu nhiên. Hãy tự hỏi:

1. Tôi đang là ai, thuộc nhóm nào, có quyền gì?
2. Hệ thống đang chạy phiên bản gì, kernel nào?
3. Có dịch vụ nào chạy dưới quyền cao hơn tôi không?
4. Có file/thư mục nào tôi ghi được mà root đọc/thực thi không?
5. Có thông tin xác thực nào bị lộ trong file cấu hình, lịch sử shell, biến môi trường?

## Enumeration cơ bản

```bash
# Danh tính và nhóm
id
whoami
sudo -l

# Hệ điều hành và kernel
uname -a
cat /etc/os-release
cat /etc/issue

# Người dùng và home
cat /etc/passwd
ls -la /home

# Mạng và dịch vụ
ip a
ss -tulpn
ps aux

# Cron
cat /etc/crontab
ls -la /etc/cron.*
crontab -l

# Tệp cấu hình có thông tin nhạy cảm
grep -rniE "password|passwd|secret|api_key|token" /var/www /opt /home 2>/dev/null
```

Ghi lại mọi phát hiện. Một chi tiết nhỏ như biến môi trường chứa mật khẩu hay script cron ghi được có thể là chìa khoá.

## Vector 1: Cấu hình sudo sai

Kiểm tra `sudo -l` là bước đầu tiên. Nếu người dùng được phép chạy một chương trình cụ thể với sudo, chương trình đó có thể mở shell hoặc đọc/ghi file tuỳ ý.

```bash
sudo -l
# (ALL) NOPASSWD: /usr/bin/find
```

Với `find`, có thể dùng `-exec`:

```bash
sudo find . -exec /bin/sh \; -quit
```

Các chương trình như `vim`, `less`, `awk`, `python3`, `tar`, `env` đều có cách thoát sang shell khi được chạy bằng sudo. Đây là lý do **không cấp sudo cho lệnh có thể thực thi lệnh khác**. GTFOBins là tài liệu tham khảo các trường hợp này.

Phòng chống: cấp quyền tối thiểu, dùng `NOEXEC` khi phù hợp, kiểm tra định kỳ `sudoers`.

## Vector 2: SUID/SGID

File có bit SUID chạy với quyền của chủ sở hữu (thường root).

```bash
find / -perm -4000 -type f 2>/dev/null
find / -perm -2000 -type f 2>/dev/null
```

Hầu hết là file hệ thống hợp lệ. Hãy đối chiếu với danh sách chuẩn của distribution, tìm file bất thường hoặc phiên bản cũ có lỗi. Công cụ như `linpeas` hỗ trợ phát hiện.

Phòng chống: loại bỏ SUID không cần thiết, mount `/tmp`, `/home` với `nosuid`, cập nhật phần mềm.

## Vector 3: Cron job

Cron chạy theo lịch, thường với quyền root. Nếu một script cron nằm trong thư mục mà người dùng thường ghi được, kẻ tấn công có thể sửa nội dung để chạy lệnh khi cron kích hoạt.

```bash
ls -la /etc/cron.d /etc/cron.daily
cat /etc/cron.d/backup-job
# kiểm tra quyền của script được gọi
```

Ngoài ra, kiểm tra `PATH` trong cron. Nếu cron dùng lệnh không phải đường dẫn tuyệt đối và thư mục hiện tại nằm đầu PATH, ta có thể chèn file cùng tên.

Phòng chống: dùng đường dẫn tuyệt đối, giới hạn quyền ghi, đặt `PATH` an toàn, không để script world-writable.

## Vector 4: Linux capabilities

Capabilities chia nhỏ quyền root. Một binary có capability nguy hiểm có thể bị lợi dụng.

```bash
getcap -r / 2>/dev/null
# /usr/bin/python3 = cap_setuid+ep
```

Ví dụ `cap_setuid` cho phép đổi UID; `cap_dac_read_search` cho phép đọc file bất kỳ. Hãy đánh giá từng capability và loại bỏ nếu không cần.

## Vector 5: Dịch vụ và file cấu hình

- Dịch vụ chạy root nhưng đọc file cấu hình từ thư mục ghi được.
- Socket Unix có quyền ghi rộng.
- File backup, `.env`, khóa SSH hoặc database để lộ mật khẩu.
- Ứng dụng web có lỗ hổng RCE chạy dưới quyền dịch vụ.

Kiểm tra các thư mục ghi được:

```bash
find / -writable -type d 2>/dev/null | head -50
```

## Vector 6: Kernel và phần mềm lỗi thời

Kernel cũ có thể có lỗ hổng leo thang cục bộ. Tuy nhiên, khai thác kernel có thể gây crash và mất ổn định. Trong môi trường thật, ưu tiên sửa cấu hình sai trước khi dùng exploit kernel.

## Công cụ hỗ trợ

- **LinPEAS**: script enumeration toàn diện, tô màu các phát hiện đáng ngờ.
- **LinEnum**: nhẹ hơn, tập trung thông tin hệ thống.
- **pspy**: theo dõi tiến trình không cần quyền root, phát hiện cron/script chạy định kỳ.
- **GTFOBins**: tra cứu cách dùng binary hợp lệ để vượt qua giới hạn.

Luôn đọc và hiểu script trước khi chạy, ngay cả trong lab.

## Phòng chống tổng thể

1. Cập nhật hệ điều hành và phần mềm thường xuyên.
2. Nguyên tắc đặc quyền tối thiểu cho user, service và sudo.
3. Rà soát SUID, capabilities và cron định kỳ.
4. Giới hạn quyền ghi ở thư mục nhạy cảm.
5. Giám sát tiến trình bất thường và cảnh báo khi file hệ thống thay đổi.
6. Cô lập dịch vụ bằng container, user riêng và sandbox.

## Tóm lại

Leo thang đặc quyền thành công thường đến từ **một cấu hình sai nhỏ**, không phải một lỗ hổng siêu phức tạp. Kỹ năng quan trọng nhất là enumeration có hệ thống, kiên nhẫn và ghi chép. Và khi đã hiểu các vector, bạn sẽ thiết kế hệ thống an toàn hơn ngay từ đầu.
