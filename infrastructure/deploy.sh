#!/bin/bash
set -e

echo "=== NAVYK Deployment ==="

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "Docker required"; exit 1; }
command -v git >/dev/null 2>&1 || { echo "Git required"; exit 1; }

# Clone/pull
REPO_DIR="/opt/navyk"
if [ -d "$REPO_DIR" ]; then
  cd "$REPO_DIR"
  git pull origin main
else
  git clone https://github.com/ElazAzel/n-avyk.git "$REPO_DIR"
  cd "$REPO_DIR"
fi

# Create env file
if [ ! -f .env ]; then
  echo "Creating .env file..."
  cat > .env << 'EOF'
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://navyk:navyk_secret@postgres:5432/navyk
REDIS_URL=redis://redis:6379
JWT_SECRET=
JWT_REFRESH_SECRET=
CORS_ORIGINS=https://navyk.app
NEXT_PUBLIC_API_URL=https://navyk.app/api/v1
EOF
  echo "Edit .env with your secrets and re-run"
  exit 1
fi

# Create SSL directory
mkdir -p infrastructure/nginx/ssl
if [ ! -f infrastructure/nginx/ssl/cert.pem ]; then
  echo "Place SSL cert.pem and key.pem in infrastructure/nginx/ssl/"
  exit 1
fi

# Build and start
cd "$REPO_DIR"
docker compose -f infrastructure/docker-compose.yml down
docker compose -f infrastructure/docker-compose.yml build --no-cache
docker compose -f infrastructure/docker-compose.yml up -d

# Run migrations
echo "Running database migrations..."
docker compose -f infrastructure/docker-compose.yml exec -T api npx prisma migrate deploy

echo "=== Deploy complete ==="
