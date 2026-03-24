#!/bin/bash

# ── CoachDash Setup Script ────────────────────────────────────────
# Double-click this file to set up and run CoachDash locally.
# It will install dependencies, set up .env files, and start both servers.

set -e

# Color helpers
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${GREEN}✓${NC} $1"; }
info() { echo -e "${BLUE}→${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
err()  { echo -e "${RED}✗${NC} $1"; exit 1; }

# Find the script's own directory (works from any location)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND="$SCRIPT_DIR/frontend"
BACKEND="$SCRIPT_DIR/backend"

echo ""
echo "  ⚡ CoachDash Setup"
echo "  ─────────────────────────────────────────"
echo ""
info "Project root: $SCRIPT_DIR"
echo ""

# ── 1. Check Node.js ─────────────────────────────────────────────
info "Checking Node.js..."
if ! command -v node &>/dev/null; then
  warn "Node.js not found. Opening download page..."
  open "https://nodejs.org/en/download"
  echo ""
  echo "  Please install Node.js (v18 or higher), then double-click this script again."
  read -p "  Press Enter to exit..."
  exit 1
fi
NODE_VERSION=$(node -v)
log "Node.js $NODE_VERSION found"

# ── 2. Check npm ─────────────────────────────────────────────────
if ! command -v npm &>/dev/null; then
  err "npm not found. Please reinstall Node.js from https://nodejs.org"
fi
log "npm $(npm -v) found"

# ── 3. Check / install PostgreSQL ────────────────────────────────
info "Checking PostgreSQL..."
if ! command -v psql &>/dev/null; then
  warn "PostgreSQL not found. Installing via Homebrew..."
  if ! command -v brew &>/dev/null; then
    warn "Homebrew not found. Installing Homebrew first..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    # Add brew to PATH for Apple Silicon
    eval "$(/opt/homebrew/bin/brew shellenv)" 2>/dev/null || true
    eval "$(/usr/local/bin/brew shellenv)" 2>/dev/null || true
  fi
  brew install postgresql@16
  brew services start postgresql@16
  # Add psql to PATH
  export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
  export PATH="/usr/local/opt/postgresql@16/bin:$PATH"
  sleep 3
fi
log "PostgreSQL found"

# ── 4. Create database ───────────────────────────────────────────
info "Setting up database..."
# Try to create the database (ignore error if it already exists)
createdb coachdash 2>/dev/null && log "Database 'coachdash' created" || log "Database 'coachdash' already exists"

# Run the schema
psql coachdash -f "$BACKEND/src/db/schema.sql" -q
log "Schema applied"

# ── 5. Backend .env ──────────────────────────────────────────────
info "Setting up backend .env..."
if [ ! -f "$BACKEND/.env" ]; then
  DB_USER=$(whoami)
  cat > "$BACKEND/.env" << EOF
PORT=4000
DATABASE_URL=postgresql://${DB_USER}@localhost:5432/coachdash
JWT_SECRET=$(openssl rand -hex 32)
ANTHROPIC_API_KEY=your_anthropic_api_key_here
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
EOF
  log "Backend .env created"
  echo ""
  warn "ACTION NEEDED: Open $BACKEND/.env and replace 'your_anthropic_api_key_here' with your real key."
  warn "Get one free at: https://console.anthropic.com"
  echo ""
  read -p "  Press Enter once you've added your Anthropic API key (or skip to add it later)..."
else
  log "Backend .env already exists"
fi

# ── 6. Frontend .env ─────────────────────────────────────────────
info "Setting up frontend .env..."
if [ ! -f "$FRONTEND/.env.local" ]; then
  cat > "$FRONTEND/.env.local" << EOF
NEXT_PUBLIC_API_URL=http://localhost:4000
EOF
  log "Frontend .env.local created"
else
  log "Frontend .env.local already exists"
fi

# ── 7. Install backend deps ──────────────────────────────────────
info "Installing backend dependencies (this takes ~30 seconds)..."
cd "$BACKEND"
npm install --silent
log "Backend dependencies installed"

# ── 8. Install frontend deps ─────────────────────────────────────
info "Installing frontend dependencies (this takes ~60 seconds)..."
cd "$FRONTEND"
npm install --silent
log "Frontend dependencies installed"

# ── 9. Start both servers ────────────────────────────────────────
echo ""
echo "  ─────────────────────────────────────────"
log "Everything is set up!"
echo ""
echo "  Starting CoachDash..."
echo ""
echo "  Backend → http://localhost:4000"
echo "  Frontend → http://localhost:3000"
echo ""
echo "  Press Ctrl+C to stop both servers."
echo "  ─────────────────────────────────────────"
echo ""

# Start backend in background
cd "$BACKEND"
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend (in foreground so Ctrl+C kills both)
cd "$FRONTEND"
npm run dev &
FRONTEND_PID=$!

# Open browser after a few seconds
sleep 5
open "http://localhost:3000"

# Wait and handle Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo ''; echo 'Servers stopped.'; exit 0" INT

wait $FRONTEND_PID
