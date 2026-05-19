---
title: MySQL and MariaDB Backup and Restore
publishedAt: 1779622315664
order: 0
---

# MySQL and MariaDB Backup and Restore

```sh
docker run -d --name my-mariadb -e MARIADB_ROOT_PASSWORD=abc123 mariadb:10.10.2
docker exec -it my-mariadb bash

// Test connect
mysql --help
mysql -u root --password=abc123
mysql --host host.docker.internal --port 3306 -u root --password=password
mysql --host staging-v22.cxihrjsldwdw.ap-southeast-1.rds.amazonaws.com --port 3306 -u cplstaging --password=cplstagingdeptrai2022XX
> SHOW DATABASES;

// Backup
mysqldump --help
## Dump database adminv3 with table user
mysqldump --host staging-v22.cxihrjsldwdw.ap-southeast-1.rds.amazonaws.com --port 3306 -u cplstaging --password=cplstagingdeptrai2022XX adminv3 user > data-dump.sql
## Dump database adminv3 with table user and table migration
mysqldump --host staging-v22.cxihrjsldwdw.ap-southeast-1.rds.amazonaws.com --port 3306 -u cplstaging --password=cplstagingdeptrai2022XX adminv3 user migrations > data-dump.sql
## Dump database adminv3 with table admin_action_log and condition
mysqldump --host staging-v22.cxihrjsldwdw.ap-southeast-1.rds.amazonaws.com --port 3306 -u cplstaging --password=cplstagingdeptrai2022XX adminv3 admin_action_log --where="created_at > 1669707228000" > data-dump.sql

## Note: use ">> data-dump.sql". It will append the previous dump file.

// Restore to database db_admin_backend
mysql --host host.docker.internal --port 3306 -u root --password=password db_admin_backend < data-dump.sql
```