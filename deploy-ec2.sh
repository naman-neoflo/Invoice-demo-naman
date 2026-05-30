#!/bin/bash
# EC2 deployment script
# Usage: ./deploy-ec2.sh <ec2-ip> <path-to-pem-key>
# Example: ./deploy-ec2.sh 54.123.45.67 ~/.ssh/my-key.pem

set -e

EC2_IP="${1:?Usage: $0 <ec2-ip> <pem-key>}"
PEM_KEY="${2:?Usage: $0 <ec2-ip> <pem-key>}"
EC2_USER="${3:-ubuntu}"
APP_DIR="/home/$EC2_USER/invoice-demo"

echo "▶ Deploying to $EC2_USER@$EC2_IP"

# ── 1. Bootstrap EC2 if first time ───────────────────────────────────────────
ssh -i "$PEM_KEY" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_IP" bash <<'REMOTE'
set -e
# Install Docker + Compose if not present
if ! command -v docker &>/dev/null; then
  echo "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker $USER
  newgrp docker
fi
if ! docker compose version &>/dev/null; then
  echo "Installing Docker Compose plugin..."
  sudo apt-get install -y docker-compose-plugin
fi
echo "Docker: $(docker --version)"
echo "Compose: $(docker compose version)"
REMOTE

# ── 2. Sync code ──────────────────────────────────────────────────────────────
echo "▶ Syncing code..."
ssh -i "$PEM_KEY" "$EC2_USER@$EC2_IP" "mkdir -p $APP_DIR"
rsync -avz --progress \
  --exclude='.git' \
  --exclude='frontend/node_modules' \
  --exclude='frontend/.next' \
  --exclude='backend/.venv' \
  --exclude='backend/__pycache__' \
  --exclude='backend/uploads' \
  --exclude='*.pyc' \
  --exclude='.DS_Store' \
  -e "ssh -i $PEM_KEY" \
  ./ "$EC2_USER@$EC2_IP:$APP_DIR/"

# ── 3. Copy .env files ───────────────────────────────────────────────────────
echo "▶ Setting up .env files..."

# Root .env — docker-compose reads this for variable substitution (ANTHROPIC_API_KEY, AUTH_*)
if [ -f .env ]; then
  scp -i "$PEM_KEY" .env "$EC2_USER@$EC2_IP:$APP_DIR/.env"
  echo "  Copied root .env"
else
  ssh -i "$PEM_KEY" "$EC2_USER@$EC2_IP" \
    "[ -f $APP_DIR/.env ] || cp $APP_DIR/.env.example $APP_DIR/.env"
  echo "  ⚠ No root .env found — copied .env.example on server. Edit $APP_DIR/.env with your ANTHROPIC_API_KEY!"
fi

# Backend .env
if [ -f backend/.env ]; then
  scp -i "$PEM_KEY" backend/.env "$EC2_USER@$EC2_IP:$APP_DIR/backend/.env"
  echo "  Copied backend/.env"
else
  ssh -i "$PEM_KEY" "$EC2_USER@$EC2_IP" \
    "[ -f $APP_DIR/backend/.env ] || cp $APP_DIR/backend/.env.example $APP_DIR/backend/.env"
  echo "  ⚠ No backend/.env found — copied .env.example on server. Edit $APP_DIR/backend/.env with your CORS_ORIGIN and SECRET_KEY!"
fi

# ── 4. Build & restart containers ────────────────────────────────────────────
echo "▶ Building and starting containers..."
ssh -i "$PEM_KEY" "$EC2_USER@$EC2_IP" bash <<REMOTE
set -e
cd $APP_DIR
docker compose pull 2>/dev/null || true
docker compose build --no-cache
docker compose up -d
docker compose ps
REMOTE

echo ""
echo "✅ Deployed!"
echo "   Frontend: http://$EC2_IP:3001"
echo "   Backend:  http://$EC2_IP:8099"
echo ""
echo "   Tail logs: ssh -i $PEM_KEY $EC2_USER@$EC2_IP 'cd $APP_DIR && docker compose logs -f'"
