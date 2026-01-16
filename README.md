# Propotive

Full-stack TypeScript monorepo with React frontend, Express backend, PostgreSQL database, and Prisma ORM. All containerized with Docker Compose supporting hot reloading.

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React + Vite + TypeScript |
| Backend | Express + TypeScript |
| Database | PostgreSQL 15 |
| ORM | Prisma |
| Auth | JWT with httpOnly cookies |

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- Node.js 20+ (for local development tools)

## Quick Start

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd propotive
   ```

2. Create environment file:
   ```bash
   cp .env.example .env
   ```

3. Start all services:
   ```bash
   ./start.sh
   ```

4. Access the application:
   - **Client**: http://localhost:5173
   - **Server**: http://localhost:3000
   - **Prisma Studio**: http://localhost:5555
   - **Database**: localhost:5432

## Services

| Service | Port | Description |
|---------|------|-------------|
| client | 5173 | React frontend with Vite HMR |
| server | 3000 | Express API server |
| studio | 5555 | Prisma Studio (database GUI) |
| db | 5432 | PostgreSQL database |

## Development

### Hot Reloading

Both frontend and backend support hot reloading:
- **Client**: Edit files in `client/src/` - Vite HMR updates instantly
- **Server**: Edit files in `server/src/` - Nodemon restarts automatically

### Stopping Services

```bash
./stop.sh
```

### Viewing Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f server
```

### Database Commands

```bash
# Open Prisma Studio
# Already running at http://localhost:5555

# Run migrations (from host)
cd server && npx prisma migrate dev --schema=../prisma/schema.prisma

# Generate Prisma client (from host)
cd server && npx prisma generate --schema=../prisma/schema.prisma
```

## Project Structure

```
propotive/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts (Auth)
│   │   ├── pages/          # Page components
│   │   └── lib/            # Utilities (API client)
│   └── Dockerfile
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # Route definitions
│   │   └── schemas/        # Zod validation schemas
│   └── Dockerfile
├── prisma/                 # Database schema
│   └── schema.prisma
├── shared/                 # Shared types
│   └── types/
├── docker-compose.yml
├── start.sh
└── stop.sh
```

## API Endpoints

### Auth
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Items
- `GET /api/items` - List all items
- `POST /api/items` - Create item
- `GET /api/items/:id` - Get item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

## Running Tests

```bash
cd server
npm run test:integration
```

Integration tests use an ephemeral PostgreSQL container on port 5433.

## Troubleshooting

### Containers won't start
```bash
# Remove all containers and volumes, then restart
docker compose down -v
./start.sh
```

### Database connection issues
```bash
# Check if database is healthy
docker compose ps
docker compose logs db
```

### Prisma client errors
```bash
# Regenerate Prisma client inside container
docker compose exec server npx prisma generate
```
