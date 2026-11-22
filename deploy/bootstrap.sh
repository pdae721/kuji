#!/bin/bash
set -euo pipefail

# Run on Amazon Linux 2023 after checkout, as root.
APP_DIR=/opt/kuji/app
dnf install -y python3.11 python3.11-pip nginx
id kuji >/dev/null 2>&1 || useradd --system --home-dir /var/lib/kuji --shell /sbin/nologin kuji
python3.11 -m venv /opt/kuji/venv
/opt/kuji/venv/bin/pip install --disable-pip-version-check -r "$APP_DIR/backend/requirements.txt"
install -d -o kuji -g kuji -m 750 /var/lib/kuji
if [ ! -f /var/lib/kuji/stock.json ]; then
    install -o kuji -g kuji -m 640 "$APP_DIR/backend/stock.json" /var/lib/kuji/stock.json
fi

cat > /etc/systemd/system/kuji.service <<'SERVICE'
[Unit]
Description=KUJI POP FastAPI
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=kuji
Group=kuji
WorkingDirectory=/opt/kuji/app/backend
Environment=KUJI_STOCK_FILE=/var/lib/kuji/stock.json
Environment=PYTHONDONTWRITEBYTECODE=1
ExecStart=/opt/kuji/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --workers 1
Restart=on-failure
RestartSec=3
NoNewPrivileges=true
PrivateTmp=true
ProtectHome=true
ProtectSystem=strict
ReadWritePaths=/var/lib/kuji

[Install]
WantedBy=multi-user.target
SERVICE

cat > /etc/nginx/conf.d/kuji.conf <<'NGINX'
server {
    listen 80 default_server;
    server_name _;
    client_max_body_size 16k;
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX
# The Amazon Linux default server is in nginx.conf. Replace it with a minimal config.
cat > /etc/nginx/nginx.conf <<'NGINX'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;
include /usr/share/nginx/modules/*.conf;
events { worker_connections 1024; }
http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    access_log /var/log/nginx/access.log;
    sendfile on;
    include /etc/nginx/conf.d/*.conf;
}
NGINX
if command -v setsebool >/dev/null; then
    setsebool -P httpd_can_network_connect 1 || true
fi
nginx -t
systemctl daemon-reload
systemctl enable --now kuji nginx
curl --fail --retry 20 --retry-connrefused --retry-delay 3 http://127.0.0.1/api/health
echo "KUJI_BOOTSTRAP_COMPLETE"
