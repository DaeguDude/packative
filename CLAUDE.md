# Propotive - Project Rules

## Overview
Full-stack TypeScript monorepo with React frontend, Express backend (MVC pattern), PostgreSQL database, and Prisma ORM. All services run in Docker containers with hot reloading.

## Tech Stack
| Component | Technology |
|-----------|------------|
| Frontend | React 18 + Vite + TypeScript |
| UI Components | shadcn/ui + Tailwind CSS |
| Data Fetching | TanStack Query (React Query) |
| Backend | Express + TypeScript + Nodemon (MVC) |
| Validation | Zod |
| Database | PostgreSQL 15 |
| ORM | Prisma |
| Containerization | Docker Compose |

## Project Structure
```
propotive/
├── client/                # React frontend (port 5173)
│   └── src/
│       ├── components/ui/ # shadcn/ui components
│       ├── lib/           # Utilities (api.ts, utils.ts)
│       └── hooks/         # Custom hooks
├── server/                # Express backend (port 3000)
│   └── src/
│       ├── controllers/   # Business logic (MVC)
│       ├── routes/        # Route definitions (MVC)
│       ├── schemas/       # Zod validation schemas
│       ├── types/         # TypeScript types (api.ts)
│       ├── utils/         # Utilities (api-response.ts)
│       └── index.ts       # App entry point
├── prisma/                # Prisma schema (shared)
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
- UI components from shadcn/ui go in `client/src/components/ui/`
- Use path alias `@/` for imports (e.g., `@/components/ui/button`)

### TanStack Query (Data Fetching)
- Use `useQuery` for GET requests (fetching data)
- Use `useMutation` for POST/PUT/DELETE requests (modifying data)
- Define query keys as arrays: `["items"]`, `["items", id]`
- Invalidate queries after mutations: `queryClient.invalidateQueries({ queryKey: ["items"] })`
- API functions live in `client/src/lib/api.ts`
- QueryClient is configured in `main.tsx` with sensible defaults

**Query pattern:**
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ["items"],
  queryFn: api.items.getAll,
});
```

**Mutation pattern:**
```typescript
const mutation = useMutation({
  mutationFn: api.items.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["items"] });
  },
});
```

### shadcn/ui Components
- Import from `@/components/ui/` (e.g., `@/components/ui/button`)
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Add new components: `npx shadcn@latest add <component-name>`
- Components are customizable - edit files directly in `components/ui/`

### Express (server) - MVC Pattern
Server follows MVC (Model-View-Controller) pattern:

- **Routes** (`server/src/routes/`) - Define endpoints, delegate to controllers
- **Controllers** (`server/src/controllers/`) - Handle business logic
- **Models** - Prisma handles data layer via `schema.prisma`

**Route file pattern:**
```typescript
// server/src/routes/items.ts
import { Router } from "express";
import * as itemsController from "../controllers/items.controller";

const router = Router();
router.get("/", itemsController.getAll);
router.post("/", itemsController.create);
export default router;
```

**Controller file pattern:**
```typescript
// server/src/controllers/items.controller.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { createItemSchema } from "../schemas/items.schema";
import { ApiResponse } from "../utils/api-response";

const prisma = new PrismaClient();

export async function getAll(req: Request, res: Response) {
  const items = await prisma.item.findMany();
  ApiResponse.success(res, StatusCodes.OK, items);
}

export async function create(req: Request, res: Response) {
  const body = createItemSchema.safeParse(req.body);
  if (!body.success) {
    return ApiResponse.validationError(res, body.error);
  }
  const item = await prisma.item.create({ data: body.data });
  ApiResponse.success(res, StatusCodes.CREATED, item, "Item created successfully");
}
```

**Naming conventions:**
- Route files: `server/src/routes/<resource>.ts`
- Controller files: `server/src/controllers/<resource>.controller.ts`
- Schema files: `server/src/schemas/<resource>.schema.ts`
- Return proper HTTP status codes (200, 201, 204, 400, 404, 500)

### Zod Validation
- Schemas live in `server/src/schemas/`
- Use `safeParse()` for validation (returns success/error object)
- Return first error message on validation failure

**Schema file pattern:**
```typescript
// server/src/schemas/items.schema.ts
import { z } from "zod";

export const createItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
});

export const itemIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid ID").transform(Number),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
```

**Validation pattern in controllers:**
```typescript
const body = createItemSchema.safeParse(req.body);
if (!body.success) {
  return ApiResponse.validationError(res, body.error);
}
// Use validated data: body.data
```

### API Response Pattern
All API responses use standardized format via `ApiResponse` class.

**Success response:**
```typescript
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

**Error response:**
```typescript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [{ "field": "name", "message": "Name is required" }]
  }
}
```

**Error codes:** `VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, `CONFLICT`, `INTERNAL_ERROR`

**ApiResponse methods:**
```typescript
ApiResponse.success(res, StatusCodes.OK, data, message?)
ApiResponse.validationError(res, zodError)
ApiResponse.notFound(res, message?)
ApiResponse.unauthorized(res, message?)
ApiResponse.forbidden(res, message?)
ApiResponse.conflict(res, message)
ApiResponse.internalError(res, message?)
```

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
- Don't use raw `fetch` in components - use TanStack Query hooks
- Don't manage server state with `useState` - use `useQuery` instead
- Don't put business logic in route files - use controllers
- Don't validate request data manually - use Zod schemas
- Don't use raw `res.json()` or `res.status()` - use `ApiResponse` class
