---
title: SSH
publishedAt: 0
order: 0
---

# SSH

## I. Tạo cặp SSH key

```
Giả sử ta sẽ tạo 1 cặp key là: version_schat và version_schat.pub
- Phía Client sẽ dùng private key: version_schat
- Phía Server sẽ dùng publickey: version_schat.pub
```

### 1. Tạo cặp SSH key mới

```
// Trên windown không dùng CMD, hãy dùng Gitbash nhé
// Xem danh sách key hiện có.
$ ls -al ~/.ssh
# id_rsa      --> private key
# id_rsa.pub  --> public key

// Tạo cặp key mới với mã hóa rsa
$ ssh-keygen -t rsa -b 4096 -C "email_cua_ban@example.com"
// ngắn gọn hơn
$ ssh-keygen -t rsa

// Lưu ý: rsa dần không được sử dụng nữa -> chuyển sang dùng ecdsa
ssh-keygen -t ecdsa -b 521 -C "your_email@example.com"

// Điền nơi lưu key: /home/duy.ngo/.ssh/id_ecdsa
# Enter file in which to save the key (/home/duy.ngo/.ssh/id_ecdsa): [Press enter]

// Điền mật khẩu cho key
# Enter passphrase (empty for no passphrase): [Type a passphrase]
# Enter same passphrase again: [Type passphrase again]

# Your identification has been saved in /home/duy.ngo/.ssh/id_ecdsa
# Your public key has been saved in /home/duy.ngo/.ssh/id_ecdsa.pub
# The key fingerprint is:
# SHA256:uOQVsO0QRG5jC/Lw0UReEfxAxiSIYf4Y4IkxO0ppBWc your_email@example.com

// Xem lại danh sách key
$ ls -al ~/.ssh
# id_rsa
# id_rsa.pub
# id_ecdsa       --> private key vừa tạo
# id_ecdsa.pub   --> public key vừa tạo
```

### 2. Thêm key vào ssh-agent

```
// Kiểm tra ssh-agent xem đã được kích hoạt chưa. Nếu trên window ko nhận lệnh eval thì chạy bằng Gitbash
$ eval "$(ssh-agent -s)"
# Agent pid 59566
// Nếu chưa kích hoạt ssh-agent. Trên window, dùng PowerShell với Administrator
Get-Service -Name ssh-agent | Set-Service -StartupType Manual

// Thêm key "version_schat" vào ssh
$ ssh-add ~/.ssh/id_ecdsa
// Điền password của key id_ecdsa
# Enter passphrase for /home/duy.ngo/.ssh/id_ecdsa:

# Identity added: /home/duy.ngo/.ssh/id_ecdsa(your_email@example.com)
```

### 3. Kết nối

```
// Lấy nội dung public key
$ cat ~/.ssh/id_ecdsa.pub
# ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDKuMvHV/urlcaC6hnCy++9AKVJkNAKWc+sPZ1/QMTeeSRkj8uXiVoxtua3TKsdA3ETYiKLnN7/Krdz14XI5tb7yTgOHBmSPpo/lOYcEn+sD8E1fsNdOy11Hi9OsRWUaSOHf+1ROG5gtgIN0rXiFbuCpxNYdiCCsClNpvBrn0A11hfp7za08mLB9C/xUl1a0oyLFyDd95S50rMI28hyeWFtNBhcIPItNf/fBDfKqIwetgl5xrVASxRIOkWaiMximeRK7SUtcRnFhcaVuqLR/QWxviMirXF0w9rz4ULX2UYXF7eGxnm4xokaHoNwEULOP6megiHXuqmRewzVoslnn4QntNJfijPcyv2n3wqL4nXg6ZYVKiPx73GC/2YRA7mC0oVPJKavPANshCPkafoVzCFz95wVEQ8AvehiixWo3FqZ3ehsXeooPJ07lHb5XW09xBEzBxs/UB33N9ETxPpeg1JpkKUlVN1j1U7+UqWp8q6fJJECB8rhqN/zkg2W8cIaX6M= your_email@example.com

// Nội dung private key
$ cat ~/.ssh/id_ecdsa
```

3.1. Với github

```
// Thêm publickey: Vào trang chủ -> Settings/SSH --> New SSH Key --> điền Public key vào --> là xong
// Kiểm tra đã kết nối được tới github chưa
ssh -T git@github.com
// kết quả
The authenticity of host gitlab.com (207.97.227.239) can't be established.
# RSA key fingerprint is 16:27:ac:a5:76:28:2d:36:63:1b:56:4d:eb:df:a6:48.
# Are you sure you want to continue connecting (yes/no)?

// Gõ "yes"
# Hi duyk30b! You've successfully authenticated, but GitHub does not provide shell access.
// Lưu ý với github: với key đã bị xóa thì không được phép dùng lại, buộc phải tại cặp key mới
```

3.2. Với server khác

```
// Tại Server: thêm public key
// Tại Client kết nối thử
ssh -i /home/duy.ngo/.ssh/id_ecdsa schatadmin@13.76.181.183
```

### 4. Xóa key cũ đã kết nối do server cập nhật hoặc thay đổi

```
ssh-keygen -f "/home/duy/.ssh/known_hosts" -R "123.172.129.229"

```

### 5. Một vài lưu ý

1. Xóa cặp key

```
// Kiểm tra các public key đang tồn tại trong ssh-add
$ ssh-add -L
// Kiểm tra các finger đang tồn tại trong ssh-add
$ ssh-add -l
```

- B1: Xóa thủ công trong folder /.ssh
- B2: Xóa trong ssh-add

```
ssh-add -D
```

2. Nếu có cả cặp public-key và private-key --> để trong thư mục gốc /.ssh --> khi ssh sẽ tự động tìm key kết nối được --> ảo chưa
3. Nếu chỉ có mỗi private-key --> đương nhiên cần phải có tham số "-i" trong lệnh ssh

## II. Config Server

### 1. Thêm public-key

#### 1.1. Thêm public key

```
$ nano ~/.ssh/authorized_keys // Chỉ cần thêm public key vào file này là được
```

#### 1.2. Cấu hình sshd

- Với Ubnuntu: `sudo vi /etc/ssh/sshd_config`
- Với Windows `C:\ProgramData\sshd_config`
- Bật xác thực bằng Key lên

```
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
```

- Một số setting khác

```
Port 22
ListenAddress 0.0.0.0 // cho phép kết nối: với mọi IP
PasswordAuthentication yes // nhập Password để kết nối SSH: cho phép, nếu không cho phép thì chỉ còn phương pháp kết nối bằng cặp key
PermitEmptyPasswords no // Cho phép password rỗng: không
MaxAuthTries 6 // Số lần nhập mật khẩu: 6
PermitRootLogin no // Cho phép Tài khoản Root login: không, Các tùy chọn: prohibit-password (phải dùng key SSH); no; yes
ClientAliveInterval 300 // Thời gian chờ nhàn rỗi: 300 giây, sau đó disconnect
PubkeyAuthentication yes // Cho phép xác thực bằng cặp key
AuthorizedKeysFile .ssh/authorized_keys .ssh/authorized_keys2 // Vị trí đặt file key, với tài khoản duycode thì thư mục là: duycode/.ssh/authorized_keys
```

3. Khởi động lại SSH daemon

```
sudo systemctl restart sshd
```

4. Thử trên 1 máy tính khác kết nối bằng SSH xem kết nối được chưa

```
ssh root@34.87.178.129 // port mặc định 22
ssh root@34.87.178.129 -p 2233 // nếu đổi cổng port sang 2233
```

5. Lưu ý

- Mỗi lần SSH vào 1 server, client sẽ lưu lại server đó (gọi là fingerprint)
- Giả sử server đó cài lại hệ điều hành, vẫn dùng user và password cũ thì client kết nối vào sẽ lỗi
- Lúc này cần xóa thông tin trong fingerprint mới kết nối lại được
- Thông tin các fingerprint được lưu ở: known_hosts

```
cat  ~/.ssh/known_hosts
```

## III. Connect đơn giản

```
$ cd ~/.ssh
// -i: điền path lưu key
$ sudo ssh -i version_schat schatadmin@13.76.181.183
```

2.2. Config Client
Để connect đơn giản cho những lần sau, có thể dùng file config schat

- Tạo file config

```
// Show các file hiện có trong .ssh
$ ls ~/.ssh
# id_rsa
# id_rsa.pub
# known_hosts
# version_schat
# version_schat.pub

// Nếu chưa có file config thì cần phải tạo
$ touch ~/.ssh/config

// File này chỉ có thể đọc được và có thể ghi bởi người dùng và không thể truy cập được bởi người khác:
chmod 600 ~/.ssh/config

// Show lại kiểm tra xem đã có file config chưa
$ ls ~/.ssh
```

- Sửa file config

```
Host schat
	HostName 13.76.181.183
	User schatadmin
	Port 22
	PreferredAuthentications publickey
	IdentityFile "/home/duy.ngo/.ssh/version_schat"

```

- Thử kết nối

```
// Trước đây, khi connect thì cần như sau
$ cd ~/.ssh
$ sudo ssh -i version_schat schatadmin@13.76.181.183

// Sau khi config
$ ssh schat
```