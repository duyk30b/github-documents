---
title: Git
publishedAt: 1779622120765
order: 0
---


## 1. Cài đặt Git
* Download and install Git-scm
<a href="https://git-scm.com/" rel="noopener" target="_blank">https://git-scm.com/</a>
<img src="https://git-scm.com/images/logo@2x.png" alt="" />

## 2. Git status lifecycle
```                                              
              (1)                       (3)                                                  
Untracked --------------► Staged --------------► first Commit (41ab78e) ====== Unmodified ---►┐ 
                                                                                              │
                                                                                              │ 
                                                            (4)                               │
                         Modified ◄-----------------------------------------------------------│
                            │                                                                 │  
                         (2)│                                                                 │  
                            │                                                                 │              
              (1)           ▼         (3)                                                     │   
Untracked --------------► Staged --------------► new Commit (2a64238) ===== Unmodified ------►│ 
                                                                                              │
                                                                                              │ 
                                                            (4)                               │
                         Modified ◄-----------------------------------------------------------│
                            │                                                                 │  
                         (2)│                                                                 │  
                            │                                                                 │              
              (1)           ▼         (3)                                                     │ 
Untracked --------------► Staged --------------► new Commit (2a64238) ===== Unmodified ------►│ 
                                                                                              │


// Có 4 trạng thái của File: Untracked, Modified và Staged, và Unmodified 
// Trạng thái Untracked, Modified và Staged: chỉ lưu 1 phiên bản của 1 file 
==> Nếu cùng 1 file đi vào trạng thái đó thì sẽ bị ghi đè
// Trạng thái Unmodified là trạng thái Commit --> có thể lưu nhiều phiên bản
```

```
// Kiểm tra trạng thái file
git status 
git log --oneline --graph --all -10

git add src/index.js                          (1) (2)
get commit -m "add function xyz"              (3)
git restore --stage src/index.js              (-1) (-2)
git restore src/index.js                      (-4) 

// Đưa về trạng thái commit "2a64238" trước đó
// Xóa tất cả các file làm việc, đưa hoàn toàn project về trạng thái đó
git reset --hard 2a64238                      (5)

// Đưa về trạng thái commit "2a64238" trước đó
// Các file đang làm việc được giữ và đưa về trạng thái "Staging" sau commit 2a64238 
git reset --soft 2a64238                      

// Đưa về trạng thái commit "2a64238" trước đó
// Các file đang làm việc được giữ và đưa về trạng thái "Working" sau commit 2a64238 
git reset --mixed 2a64238                      
```

##  3. Remote
```
//Xem các remote đang sử dụng
git remote
git remote -v

//Tạo một remote mới với kèm theo tên. VD: github với tên origin
git remote add <name> <url>
git remote add origin https://github.com/duycode/myproject.git
git remote add second https://github.com/paulboone/ticgit.git

//Xóa một remote. VD: xóa remote origin
git remote remove <name>
git remote remove origin 

//Push code lên git (sau khi add và commit)
git push <name> <branch>
git push origin master
```

## 4. Reflog
```
git reflog --format='%C(auto)%h %<|(10)%gd %C(blue)%cr%C(reset) %gs (%s)'
```

##  5. Mỗi project một tài khoản GIT riêng
- Kiểm tra tài khoản trên máy tính hiện tại:
```
git config --list
# user.email=duycode.com@gmail.com
# user.name=duycode-com
# ...
// Có thể xóa tài khoản Git trên window --> Run: "Credential Manager"
```

- Cài đặt account GIT riêng : Vào repository/.git/config --> Thêm vào cuối

```
[user]
    name = duycode-com
    email = duycode.com@gmail.com
[credential "https://github.com/duycode-com/mern-stack.git"]
    username = duycode-com  
```

## 6. Một số lỗi nhỏ hay gặp
### 6.1. Fix lỗi CRLF
```
git config core.autocrlf false
# git config --global core.autocrlf input

git rm --cached -r .

git reset --hard
```

### 6.2. Thêm file hoặc thư mục vào .gitignore không thành công
- Lý do là file đó đã được theo dõi bởi git
```
// Ví dụ xóa file .env
// 1. Xóa theo dõi file bởi git
git reset .env

// 2. Xóa trên git remote
git rm --cached .env
git add .
git commit -m "update iggnore"
git push github master
```

- Đơn giản hơn, xóa sạch cache rồi commit lại
```
git rm -r --cached .
// update .gitignore
git add .
git commit -m "Update .gitignore"
git push
```