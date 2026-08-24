#!/bin/sh
# Entrypoint script for frontend in cloud environment
# This script sets up the nginx config with environment variables

# Get the backend URL from environment variable, with fallback
BACKEND_URL=${BACKEND_URL:-http://localhost:8000}

# Create nginx config with dynamic backend URL
cat > /etc/nginx/conf.d/default.conf <<EOF
server {
    listen 8080;
    server_name _;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Root directory for frontend app
    root /usr/share/nginx/html;
    index index.html;

    # Serve frontend assets
    location / {
        # Try to serve the file, or fallback to index.html for SPA routing
        try_files \$uri \$uri/ /index.html;
    }

    # API proxy to backend
    location /api/ {
        proxy_pass ${BACKEND_URL};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Static assets cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Start nginx
echo "Starting Nginx with backend URL: $BACKEND_URL"
exec nginx -g "daemon off;"
