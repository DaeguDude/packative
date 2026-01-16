# Propotive - Project Rules

## Overview
Full-stack TypeScript monorepo with React frontend, Express backend, PostgreSQL database, and Prisma ORM. All services run in Docker containers with hot reloading.

## Tech Stack
| Component | Technology |
|-----------|------------|
| Frontend | React 18 + Vite + TypeScript |
| Backend | Express + TypeScript + Nodemon |
| Database | PostgreSQL 15 |
| ORM | Prisma |
| Containerization | Docker Compose |

## Project Structure
```
propotive/
├── client/          # React frontend (port 5173)
│   └── src/
├── server/          # Express backend (port 3000)
│   └── src/
│       └── routes/  # API route handlers
├── prisma/          # Prisma schema (shared)
└── docker-compose.yml
```

## Commands
```bash
./start.sh           # Start all services (db, server, client, studio)
./stop.sh            # Stop all services
docker compose down -v  # Stop and wipe database
```

## URLs (Development)
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Prisma Studio: http://localhost:5555
- PostgreSQL: localhost:5432

## Code Style
- Prettier configured (format on save)
- Double quotes for strings
- Semicolons required
- 2-space indentation
- Trailing commas (ES5)

## Conventions

### TypeScript
- Avoid `any` type - use proper typing
- Use interfaces for object shapes
- Use async/await over .then() chains

### React (client)
- Use functional components with hooks
- Components go in `client/src/components/`
- Use `fetch` for API calls with `VITE_API_URL` env var

### Express (server)
- Route handlers go in `server/src/routes/`
- Use Prisma client for database operations
- Return proper HTTP status codes (200, 201, 204, 400, 404, 500)

### Prisma
- Schema lives in `prisma/schema.prisma`
- After schema changes, server container auto-runs `prisma db push`
- Use Prisma Studio at :5555 to inspect data

## API Pattern
```typescript
// GET    /api/items      - List all
// POST   /api/items      - Create
// GET    /api/items/:id  - Get one
// PUT    /api/items/:id  - Update
// DELETE /api/items/:id  - Delete
```

## Don'ts
- Don't commit `.env` files (use `.env.example` as template)
- Don't run `docker compose down -v` unless you want to wipe the database
- Don't install dependencies on host for Docker - only for IDE support
- Don't modify files in `node_modules/`
