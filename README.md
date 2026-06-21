# Golden Age

**A modern web application for monitoring child growth and development during the Golden Age (0–5 years).**

Track growth, milestones, vaccinations, and nutrition — all in one place. Share progress with family and healthcare providers. Give your child the healthiest start in life.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | [Bun](https://bun.sh) |
| **API Framework** | [Hono](https://hono.dev) |
| **Frontend** | [React 18](https://react.dev) + [Vite](https://vitejs.dev) + [TailwindCSS v4](https://tailwindcss.com) |
| **Database** | PostgreSQL 16 + [Drizzle ORM](https://orm.drizzle.team) |
| **Cache/Queue** | Redis 7 + [BullMQ](https://bullmq.io) |
| **Auth** | JWT (RS256) + bcrypt + RSA-OAEP credential encryption |
| **Storage** | S3-compatible (MinIO local, AWS S3/R2 production) |
| **Testing** | Bun test runner, React Testing Library |
| **Lint/Format** | [Biome](https://biomejs.dev) |
| **Dev Env** | [Nix](https://nixos.org) + Docker Compose |
| **CI/CD** | GitHub Actions |
| **Monorepo** | Bun Workspaces |

---

## Prerequisites

- [Bun](https://bun.sh) >= 1.3
- Docker + Docker Compose
- (Optional) [Nix](https://nixos.org) for reproducible dev environment

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/rickzal13/golden_age.git
cd golden_age

# 2. Start infrastructure
docker compose -f docker/docker-compose.yml up -d

# 3. Install dependencies
bun install

# 4. Generate JWT keys and create .env
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 | base64 | tr -d '\n' > /tmp/jwt_private
openssl rsa -pubout -in <(base64 -d < /tmp/jwt_private) | base64 | tr -d '\n' > /tmp/jwt_public

cat > .env << EOF
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/golden_age
REDIS_URL=redis://localhost:6379
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=golden-age-dev
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_REGION=us-east-1
JWT_PRIVATE_KEY=$(cat /tmp/jwt_private)
JWT_PUBLIC_KEY=$(cat /tmp/jwt_public)
SES_FROM_ADDRESS=noreply@goldenage.app
APP_URL=http://localhost:5173
API_URL=http://localhost:3000
EOF

# 5. Run migrations
bun run db:migrate

# 6. Start development
bun run dev
```

Open:
- **Web:** http://localhost:5173
- **API:** http://localhost:3000
- **MinIO Console:** http://localhost:9001 (minioadmin / minioadmin)
- **Mailpit:** http://localhost:8025

---

## Development with Nix (optional)

```bash
nix develop ./nix# --impure
docker compose -f docker/docker-compose.yml up -d
bun install
bun run dev
```

---

## Project Structure

```
golden-age/
├── packages/shared/       # @golden-age/shared — types, schemas, constants, utils
├── apps/
│   ├── api/               # Hono API server
│   │   ├── src/
│   │   │   ├── modules/   # auth, children, users, files
│   │   │   ├── middleware/ # auth, rbac, cors, logger, error-handler
│   │   │   ├── lib/       # db, redis, s3, jwt, hash, errors, encryption
│   │   │   └── workers/   # BullMQ background workers (placeholder)
│   │   └── test/
│   └── web/               # React PWA
│       ├── src/
│       │   ├── routes/    # _public (landing, login) / _auth (dashboard, profile, children)
│       │   ├── features/  # auth, children, landing
│       │   ├── components/ # AppShell, AuthGuard
│       │   └── lib/       # api-client, encryption, i18n, query-client
│       └── test/
├── docker/                # Dockerfiles + compose (dev + production)
├── nix/                   # Nix flake for reproducible dev environment
└── .github/workflows/     # CI pipeline
```

---

## Features

### Implemented
- **Authentication** — Email/password registration and login with RSA-OAEP credential encryption, JWT access + refresh tokens, role-based access control
- **Child Profiles** — Create, view, edit, archive child profiles with photo upload
- **Parent Dashboard** — Welcome screen with child cards, quick actions, empty state
- **Landing Page** — Public informational page with hero, features, FAQ, smooth-scroll navigation
- **AppShell Navigation** — Authenticated layout with mobile-responsive nav

### Upcoming
- Growth tracking with interactive WHO charts
- Developmental milestone checklists
- Vaccination schedule with reminders
- Nutrition and meal logging
- Family sharing
- Clinic/midwife dashboard

---

## Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start API + Web with hot reload |
| `bun run dev:api` | Start API server only |
| `bun run dev:web` | Start Vite dev server only |
| `bun run typecheck` | TypeScript type checking (all packages) |
| `bun run lint` | Biome lint check |
| `bun run lint:fix` | Auto-fix lint + format issues |
| `bun test` | Run all tests |
| `bun run db:generate` | Generate Drizzle migration |
| `bun run db:migrate` | Run pending migrations |
| `bun run build` | Build all packages for production |

---

## Docker Production Deployment

```bash
# Build all images
docker compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml build

# Start all services
docker compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml up -d
```

Production services: Nginx (reverse proxy + static), API (Bun + Hono), Worker (BullMQ), PostgreSQL, Redis.

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|:--------:|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `REDIS_URL` | Yes | — | Redis connection string |
| `S3_ENDPOINT` | Yes | — | S3-compatible endpoint |
| `S3_BUCKET` | Yes | — | Storage bucket name |
| `S3_ACCESS_KEY` | Yes | — | S3 access key |
| `S3_SECRET_KEY` | Yes | — | S3 secret key |
| `S3_REGION` | No | `us-east-1` | S3 region |
| `JWT_PRIVATE_KEY` | Yes | — | RS256 private key (base64-encoded PEM) |
| `JWT_PUBLIC_KEY` | Yes | — | RS256 public key (base64-encoded PEM) |
| `APP_URL` | No | `http://localhost:5173` | Frontend URL |
| `API_URL` | No | `http://localhost:3000` | API URL |
| `PORT` | No | `3000` | API port |
| `NODE_ENV` | No | `development` | Environment |

---

## License

MIT
