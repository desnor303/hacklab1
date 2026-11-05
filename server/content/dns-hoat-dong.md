---
title: "DNS hoạt động như thế nào?"
slug: "dns-hoat-dong"
description: "Hành trình từ tên miền đến địa chỉ IP: resolver, root server, TTL, các loại bản ghi và những lỗi cấu hình thường gặp."
category: "networking"
difficulty: "beginner"
tags: ["dns", "networking", "infrastructure"]
readTime: 7
publishedAt: "2026-09-28"
---

DNS (Domain Name System) là "danh bạ" của internet: nó chuyển tên dễ nhớ như `example.com` thành địa chỉ IP mà máy tính hiểu được. Hầu hết sự cố mạng bí ẩn đều bắt đầu hoặc kết thúc ở DNS.

## Hành trình của một truy vấn

Khi bạn gõ `hacklab.dev` vào trình duyệt, một chuỗi sự kiện diễn ra:

1. **Kiểm tra cache cục bộ.** Hệ điều hành, trình duyệt hoặc DNS resolver gần nhất có thể đã có câu trả lời.
2. **Hỏi recursive resolver.** Thường là resolver của ISP hoặc dịch vụ như 1.1.1.1, 8.8.8.8. Resolver chịu trách nhiệm đi hỏi thay bạn.
3. **Root nameserver.** Resolver hỏi root server: "Ai quản lý tên miền `.dev`?" Root trả về địa chỉ server TLD.
4. **TLD nameserver.** Server của `.dev` trả về nameserver có thẩm quyền cho `hacklab.dev`.
5. **Authoritative nameserver.** Server này trả lời chính xác bản ghi `A`, `AAAA`, `CNAME`... của tên miền.
6. **Lưu cache** theo TTL và trả kết quả về trình duyệt.

Trình duyệt và resolver cache kết quả trong khoảng TTL (Time To Live). TTL ngắn giúp thay đổi nhanh nhưng tăng tải; TTL dài giúp nhanh nhưng thay đổi chậm lan toả.

## Các loại bản ghi quan trọng

| Loại | Ý nghĩa | Ví dụ |
| --- | --- | --- |
| A | Tên miền → IPv4 | `hacklab.dev → 203.0.113.10` |
| AAAA | Tên miền → IPv6 | `hacklab.dev → 2001:db8::1` |
| CNAME | Bí danh của tên miền khác | `www → hacklab.dev` |
| MX | Server nhận email | `mail.hacklab.dev` |
| TXT | Văn bản tuỳ ý (SPF, DKIM, xác minh) | `v=spf1 include:...` |
| NS | Nameserver có thẩm quyền | `ns1.example.com` |
| SRV | Vị trí dịch vụ | `_https._tcp` |
| CAA | CA nào được cấp chứng chỉ | `letsencrypt.org` |

Lưu ý: CNAME không được đặt ở apex domain (`hacklab.dev`) vì xung đột với các bản ghi bắt buộc như NS/SOA. Hãy dùng bản ghi A/AAAA hoặc dịch vụ hỗ trợ ALIAS/ANAME.

## TTL và quá trình lan truyền

Khi thay đổi bản ghi DNS, kết quả không cập nhật ngay lập tức vì resolver còn cache bản cũ. Chiến lược an toàn:

1. Giảm TTL xuống thấp (ví dụ 300 giây) **trước** khi thay đổi ít nhất một TTL cũ.
2. Thay đổi bản ghi.
3. Theo dõi và chờ hết TTL cũ.
4. Tăng TTL trở lại sau khi ổn định.

## Kiểm tra DNS như một người làm hệ thống

```bash
# Tra cứu cơ bản
dig hacklab.dev A
nslookup hacklab.dev

# Truy vấn nameserver có thẩm quyền (bỏ qua cache)
dig @1.1.1.1 hacklab.dev +short
dig hacklab.dev NS +short

# Xem toàn bộ quá trình phân giải
dig +trace hacklab.dev

# Kiểm tra bản ghi TXT (xác minh, email)
dig hacklab.dev TXT

# Đo thời gian truy vấn
dig hacklab.dev | grep "Query time"
```

Nếu kết quả khác nhau giữa các resolver, đó thường là dấu hiệu cache còn cũ hoặc cấu hình sai ở một nameserver.

## Những lỗi cấu hình phổ biến

- **Thiếu glue record** cho nameserver trong cùng zone.
- **NXDOMAIN** do gõ sai tên hoặc thiếu bản ghi.
- **TTL quá cao** khiến thay đổi không lan toả.
- **CNAME vòng lặp** hoặc CNAME trỏ tới tên không tồn tại.
- **Wildcard `*`** che giấu lỗi và vô tình trỏ lưu lượng sai chỗ.
- **Subdomain takeover**: bản ghi CNAME trỏ tới dịch vụ đã bị xoá, kẻ tấn công có thể chiếm tên miền con.

## Bảo mật DNS

DNS truyền thống không mã hoá, nên nhà mạng hoặc kẻ nghe lén có thể thấy bạn truy vấn gì. Các giải pháp:

- **DNS over HTTPS (DoH)** và **DNS over TLS (DoT)**: mã hoá truy vấn.
- **DNSSEC**: ký dữ liệu DNS để chống giả mạo, nhưng chưa được triển khai rộng khắp.
- **Hạn chế zone transfer** (`AXFR`) từ bên ngoài, tránh lộ toàn bộ bản ghi nội bộ.

## Bài tập thực hành

1. Dùng `dig +trace` để quan sát từng bước phân giải một tên miền.
2. So sánh kết quả `dig @8.8.8.8` và `dig @1.1.1.1`.
3. Tạo bản ghi A cho subdomain trong file hosts cục bộ và kiểm tra bằng `ping`.
4. Đọc bản ghi TXT của một tên miền lớn và thử đoán mục đích từng bản ghi.

DNS là lớp hạ tầng âm thầm nhưng ảnh hưởng đến mọi request. Hiểu DNS giúp bạn debug nhanh và nhìn ra nhiều bề mặt tấn công của internet.
