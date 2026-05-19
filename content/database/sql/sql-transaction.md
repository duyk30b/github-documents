---
title: SQL Transaction
publishedAt: 1779622407854
order: 1
---

# Transaction

<h3>A.Các chế  độ lock </h3>
<blockquote>UPDATE user SET username = 'Bob' WHERE id = '1';	</blockquote>
- Exclusive lock (lock độc quyền): Row user có id = 1 sẽ bị exclusive lock ==> Các transaction khác phải chờ câu lệnh trên thực hiện xong
- Share lock (lock chia sẻ): Bảng user sẽ bị share lock nên các transaction khác sẽ không thể cập nhật cấu trúc của nó (vì để thay đổi cấu trúc bảng thì cần phải tiến hành exclusive lock bảng). Tuy nhiên các transaction khác vẫn có thể thay đổi các dòng khác của bảng employees (khi đó bảng employees sẽ bị nhiều share lock).

<h3>B.Các loại lock </h3>
1. DDL lock (lock cấu trúc): có chức năng bảo vệ cấu trúc của các đối tượng trong schema, ví dụ như bảng, view,
2. DML lock (lock dữ liệu):
- Thường thì SELECT không phải đợi UPDATE
- UPDATE phải đợi nhau nếu cùng ghi trên 1 dòng

## A. Các loại Anomaly
### 1. Dirty Reads
Transaction 2 đọc dữ liệu chưa đươc commit ở transaction 1

| 1                                                | 2                                         | DATA                       |
| ------------------------------------------------ | ----------------------------------------- | -------------------------- |
| START TRANSACTION;                               |                                           | id = 1, username = 'Alice' |
| UPDATE user SET username = 'Bob' WHERE id = '1'; | START TRANSACTION;                        | id = 1, username = 'Bob'   |
|                                                  | SELECT username FROM user where id = '1'; | id = 1, username = 'Bob'   |
|                                                  | COMMIT;                                   |                            |
| ROLLBACK;                                        |                                           | id = 1, username = 'Alice' |


### 2. Nonrepeatable Reads
- Transaction 2 đọc dữ liệu 2 lần ra 2 kết quả khác nhau

| 1                                                | 2                                         | DATA                       |
| ------------------------------------------------ | ----------------------------------------- | -------------------------- |
|                                                  | START TRANSACTION;                        | id = 1, username = 'Alice' |
| START TRANSACTION;                               | SELECT username FROM user where id = '1'; | id = 1, username = 'Alice' |
| UPDATE user SET username = 'Bob' WHERE id = '1'; |                                           | id = 1, username = 'Bob'   |
| COMMIT;                                          | SELECT username FROM user where id = '1'; | id = 1, username = 'Bob'   |
|                                                  | COMMIT;                                   |                            |

<h3>3. Phantom Record: Bản ghi ma </h3>
- Bản ghi 'Bob' đã được thêm và làm cho kết quả đọc 2 lần sai lệch

| 1                                                             | 2                                               | DATA          |
| ------------------------------------------------------------- | ----------------------------------------------- | ------------- |
| START TRANSACTION;                                            | START TRANSACTION;                              |               |
|                                                               | SELECT username FROM user where group_id = '1'; | 'Alice'       |
| INSERT INTO user (id, group_id, username) VALUES (4,1,'Bob'); |                                                 |               |
|                                                               | SELECT username FROM user where group_id = '1'; | 'Alice','Bob' |
| COMMIT;                                                       | COMMIT;                                         |               |



<h2>B. Isolation level</h2>
|                                                             | Read Uncommitted | Read Committed | Repeatable Read | Serializable |
| ----------------------------------------------------------- | ---------------- | -------------- | --------------- | ------------ |
| UPDATE đợi transaction khác COMMIT UPDATE                   | Y                | Y              | Y               | Y            |
| SELECT đợi transaction khác COMMIT UPDATE                   | N                | Y              | Y               | Y            |
| LOCK khi SELECT (không cho transaction khác update)         | N                | N              | Y               | Y            |
| LOCK khi SELECT (không cho transaction khác delete, insert) | N                | N              | N               | Y            |
|                                                             |                  |                |                 |              |
| Dirt Read                                                   | Y                | N              | N               | N            |
| Nonerepeatable Read                                         | Y                | Y              | N               | N            |
| Fantom Read                                                 | Y                | Y              | Y               | N            |

