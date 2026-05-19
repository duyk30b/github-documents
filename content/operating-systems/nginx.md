---
title: Nginx
publishedAt: 1779622881772
order: 3
---

# Nginx và SSL

## I. Tổng quan
```
nginx-project
├── nginx
│   ├── conf.d
│   │   ├── default.conf
│   │   └── other-domain.conf
│   └── ssl
│       ├── letsencrypt
│       └── openssl
│
├── docker-compose.yml
├── index.html
```

## II. OpenSSL
- Windows không cài đặt openssl --> Cần cài đặt git-scm: **[https://git-scm.com/download/win](https://git-scm.com/download/win)**
- Trên Windows dùng CMD cd vào thư mục của git để run được openssl
- Phiên bản OpenSSL 1.1.1 có hỗ trợ TLS 1.3

- Generate cert.pem and key.pem
```bash title="Windows"
cd C:\Program Files\Git\usr\bin 
openssl version -a
openssl req -days 3650 -x509 -newkey rsa:2048 -sha256 -nodes -keyout %UserProfile%\Desktop\key.pem -out %UserProfile%\Desktop\cert.pem -subj "/C=/ST=/L=/O=/OU=web/CN=example.com"
```

```bash title="Linux"
sudo chmod -R 777 nginx
mkdir -p ./nginx/ssl/openssl
openssl req -days 3650 -x509 -newkey rsa:2048 -sha256 -nodes -keyout ./nginx/ssl/openssl/key.pem -out ./nginx/ssl/openssl/cert.pem -subj "/C=/ST=/L=/O=/OU=web/CN=example.com"
```

```
# -nodes : no DES - no passphrase
# -days 365
# -x509: this option outputs a self signed certificate instead of a certificate request. This is typically used to generate a test certificate or a self signed root CA.
# -sha256: use SHA-2 instead SHA-1
# -subj "/C=/ST=/L=/O=/OU=web/CN=medihome.vn" : Country/State/Locality(city)/Organization/Organization Unit/CommonName(required)
# -keyout key.pem -out cert.pem: file định dạng PEM có extension: .pem, .crt, .cer, .key
```

## III. Let's Encrypt - Certbot
```
rm -rf /etc/letsencrypt/archive/*
rm -rf ~/mea-nestjs/nginx/ssl/letsencrypt/*
sudo docker run -it --rm --name certbot -v "/etc/letsencrypt:/etc/letsencrypt" -v "/var/lib/letsencrypt:/var/lib/letsencrypt" -p 80:80 certbot/certbot certonly
ls -la /etc/letsencrypt/archive/*
cp -R /etc/letsencrypt/archive/* ~/mea-nestjs/nginx/ssl/letsencrypt/
cd ~/mea-nestjs/nginx/ssl/letsencrypt/
ls -la
mv mea.ga-0003 mea.ga
cd ~/mea-nestjs/
docker compose -f docker.nginx.yml up -d
```

## IV. File cấu hình conf.d
- Tạo file default.conf
```bash title="Linux"
mkdir -p ./nginx/conf.d
touch ./nginx/conf.d/default.conf
```

- Sửa nội dung như sau
```conf title="./nginx/conf.d/default.conf"
server {
    listen       443 ssl;
    server_name  localhost;

    ssl_certificate           /etc/nginx/ssl/openssl/cert.pem;
    ssl_certificate_key       /etc/nginx/ssl/openssl/key.pem;
    ssl_protocols             TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers               'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';

    location / {
        proxy_pass http://10.0.13.80:4000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forward-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forward-Proto http;
        proxy_set_header X-Nginx-Proxy true;
        proxy_redirect off;
    }

    location /test {
        root   /etc/nginx/dist;
        index  test.html test.htm;
    }

    location /about {
        add_header Content-Type text/html;
        return 200 '<h2>This is About Page</body></h2>';
    }

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}

server {
    listen        80;
    server_name   localhost;
    return        301 https://$host$request_uri;
}
```

## V. Docker
```yml title="./docker-compose.yml"
version: "3.8"

networks:
  mn_network:
    driver: bridge

services:
  nginx:
    container_name: mc_nginx
    image: nginx:1.23.3-alpine
    restart: unless-stopped
    networks:
      - mn_network
    volumes:
      - ./nginx/conf.d/:/etc/nginx/conf.d/
      - ./nginx/adminer.d/:/etc/nginx/adminer.d/
      - ./nginx/ssl/:/etc/nginx/ssl/
    ports:
      - "80:80"
      - "443:443"
      # - "23080:23080"
```

## VI. Run and test

```bash
# Run container
docker compose up -d

# Check syntax
docker exec mc_nginx nginx -t

# Reload nginx
docker exec mc_nginx nginx -s reload
```

Test: 
- **[https://localhost](https://localhost)** 
- **[https://localhost/about](https://localhost/about)** 
- **[https://localhost/test](https://localhost/test)** 

## VII. VSCode Live server
- Tại settings.json của VScode
```json
{
    "liveServer.settings.port": 5501,
    "liveServer.settings.root": "/",
    "liveServer.settings.CustomBrowser": "chrome",
    "liveServer.settings.https": {
      "enable": true,
      "cert": "/Users/duyk3/.vscode/https/cert.pem",
      "key": "/Users/duyk3/.vscode/https/key.pem",
      "passphrase": ""
    }
}
```