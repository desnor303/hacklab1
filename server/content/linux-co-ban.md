---
title: "Linux command line: bộ lệnh sinh tồn"
slug: "linux-co-ban"
description: "Những lệnh Linux thiết yếu nhất: di chuyển, tìm kiếm, quyền truy cập, tiến trình và pipeline cho người mới bắt đầu."
category: "linux"
difficulty: "beginner"
tags: ["linux", "cli", "bash", "sysadmin"]
readTime: 9
featured: true
publishedAt: "2026-09-20"
---

Terminal Linux không chỉ dành cho quản trị viên hệ thống. Với người làm bảo mật, lập trình viên backend hay kỹ sư DevOps, dòng lệnh là công cụ làm việc hằng ngày. Bài này là bộ lệnh tối thiểu bạn cần thành thạo trước khi học sâu hơn.

## Cấu trúc hệ thống tệp

Linux tổ chức mọi thứ dưới một gốc `/`:

```text
/           gốc
├── bin/    lệnh cơ bản
├── etc/    cấu hình hệ thống
├── home/   thư mục người dùng
├── var/    dữ liệu thay đổi (log, cache)
├── tmp/    tệp tạm
├── usr/    chương trình và thư viện
└── opt/    phần mềm tuỳ chọn
```

Ba lệnh đầu tiên cần nhớ:

```bash
pwd                 # đang ở đâu
ls -lah             # liệt kê kèm quyền, kích thước, tệp ẩn
cd /var/log         # di chuyển
cd ~                # về home
cd -                # quay lại thư mục trước
```

## Xem và tìm nội dung

```bash
cat file.txt              # in toàn bộ tệp
less file.txt             # đọc từng trang (q để thoát)
head -n 20 file.txt       # 20 dòng đầu
tail -f /var/log/syslog   # theo dõi log realtime

grep -rn "password" .     # tìm đệ quy kèm số dòng
grep -i -C 2 "error" app.log

find /var/www -name "*.php" -type f
find . -type f -mtime -1  # tệp sửa trong 24h
```

Đối với tên tệp có ký tự đặc biệt, luôn đặt trong dấu nháy đơn.

## Pipeline và chuyển hướng

Đây là sức mạnh thực sự của Unix: ghép các lệnh nhỏ.

```bash
# Đếm số dòng chứa "404" trong log
grep "404" access.log | wc -l

# 10 IP truy cập nhiều nhất
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -10

# Ghi output ra tệp (ghi đè / nối thêm)
ls -la > danh-sach.txt
echo "ghi chú" >> danh-sach.txt

# Chuyển lỗi sang stdout
command 2>&1 | less
```

## Quyền truy cập

Mỗi tệp có quyền cho **owner**, **group**, **others**:

```bash
ls -l
# -rw-r--r--  1 user group  1024 Oct 1 file.txt
#  ^^        owner: rw-, group: r--, others: r--

chmod 644 file.txt      # rw-r--r--
chmod +x script.sh      # thêm quyền thực thi
chmod 755 script.sh     # rwxr-xr-x
chown user:group file   # đổi chủ sở hữu
```

Các con số tương ứng: `r=4`, `w=2`, `x=1`. Với thư mục, `x` nghĩa là quyền đi vào, còn `r` là quyền liệt kê.

## Tiến trình

```bash
ps aux                 # tất cả tiến trình
top / htop             # theo dõi tài nguyên
pgrep -af node         # tìm tiến trình theo tên
kill 1234              # gửi SIGTERM
kill -9 1234           # buộc dừng (SIGKILL)

# Chạy nền và theo dõi
npm run dev &
jobs
fg %1
```

Luôn thử `kill` thường trước `kill -9`. SIGTERM cho phép tiến trình dọn dẹp tài nguyên.

## Quản lý gói

```bash
# Debian/Ubuntu
sudo apt update && sudo apt install -y curl git
apt search nginx

# RHEL/Fedora
sudo dnf install nginx

# Arch
sudo pacman -S nginx
```

Không chạy lệnh cài đặt từ nguồn không tin cậy với quyền root. Hãy đọc script trước khi chạy `curl ... | bash`.

## SSH và truyền tệp

```bash
ssh user@server
ssh -i ~/.ssh/id_ed25519 user@server

scp file.txt user@server:/tmp/
scp user@server:/var/log/app.log ./

ssh-keygen -t ed25519 -C "email@example.com"
```

Sao lưu khóa riêng tư, không chia sẻ và đặt quyền `600`.

## Tổ hợp lệnh hữu ích

```bash
# Kích thước thư mục, sắp xếp giảm dần
du -sh * | sort -h

# Dung lượng ổ đĩa
df -h

# Mở cổng đang lắng nghe
ss -tulpn

# Xem biến môi trường
env | sort
```

## Ghi nhớ

Không cần học thuộc tất cả. Hãy nắm vững 3 nhóm: **di chuyển/tìm kiếm**, **quyền truy cập** và **pipeline**. Khi gặp lệnh mới, dùng `man <lệnh>` hoặc `tldr <lệnh>` để tra cứu nhanh. Kỹ năng đọc output và kết hợp lệnh quan trọng hơn việc nhớ từng flag.
