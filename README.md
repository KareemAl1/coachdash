# CoachDash

AI-powered developer activity tracker. Log your daily work, track skill growth, get weekly AI coaching.

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env        # fill in DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY
npm install
# Run schema against your PostgreSQL database:
psql $DATABASE_URL -f src/db/schema.sql
npm run dev                  # starts on port 4000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev                  # starts on port 3000
```

## Deployment

- **Frontend → Vercel**: connect GitHub repo, set `NEXT_PUBLIC_API_URL` env var to your Railway URL
- **Backend → Railway**: connect GitHub repo, point at `/backend`, add env vars, add a PostgreSQL plugin, run the schema SQL

## Stack

| Layer     | Tech                          |
|-----------|-------------------------------|
| Frontend  | Next.js 14, TypeScript, Tailwind CSS, Chart.js |
| Backend   | Node.js, Express, TypeScript  |
| Database  | PostgreSQL                    |
| AI        | Anthropic API (claude-opus-4-5, streaming SSE) |
| Auth      | JWT + bcrypt                  |
