# Zdravstvo

Zdravstvo is a web-based healthcare appointment management system for small healthcare institutions. It helps users manage appointments, doctors, patients, appointment types, organization users, reminders, audit/activity logs, and accessibility settings.

## Main features

- user login and role-based access
- organization-based data separation
- doctor and patient management
- appointment scheduling, updating, cancellation, and status changes
- appointment type management
- doctor working hours and time-off management
- reminders before appointments
- activity/audit logging
- accessibility settings
- responsive web application

## Repository structure

This repository is a pnpm monorepo with three packages:

- `backend`: Node.js, Express, and TypeScript API. Contains business logic, authentication/authorization, validation, database access, transactions, background jobs, and API routes.
- `frontend`: React, TypeScript, and Vite web application. Contains pages, components, services, state, hooks, and UI logic.
- `contracts`: shared API contract package used by both frontend and backend. It contains DTOs, enums, shared API types, pagination types, response shapes, and error shapes.

The `contracts` package is the shared API contract between the frontend and backend. It must not contain business logic, entities, database models, or frontend/backend helper code.

## Architecture overview

The frontend calls the backend through frontend service modules. Components should use those services instead of calling `axios` or `fetch` directly.

The backend follows a `routes -> controllers -> services -> repositories` structure. Routes define API entry points, controllers handle request/response flow, services contain business rules, and repositories access persistence.

Shared DTOs, enums, and API types live in `contracts` and are imported by both frontend and backend. The frontend and backend must not import from each other directly.

Backend entities are internal implementation details and must not be exposed directly through the API.

## Prerequisites

Install these locally:

- Node.js 20+
- pnpm 9+
- MySQL server
- Git

No exact Node.js or pnpm version is declared in `package.json`, `packageManager`, or `.nvmrc`. The repository uses pnpm lockfile version 9.

## Local setup

1. Clone the repository.
2. Install dependencies:

   `pnpm install`

3. Create local `.env` files from the committed examples:

   `cp backend/.env.example backend/.env`

   `cp frontend/.env.example frontend/.env`

4. Configure the backend database connection for a local MySQL database.
5. Start MySQL and create the local database.
6. Run backend migrations:

   `pnpm --filter @zdravstvo/backend migrate:latest`

7. Optionally run seed data:

   `pnpm --filter @zdravstvo/backend seed:run`

8. Start the backend:

   `pnpm --filter @zdravstvo/backend dev`

9. Start the frontend:

   `pnpm --filter @zdravstvo/frontend dev`

The full monorepo development command is also available:

`pnpm dev`

## Environment variables

Local `.env` files are required for development and deployment-specific configuration. They must not be committed.

Use `backend/.env.example` and `frontend/.env.example` as the canonical environment variable examples. Copy them to package-local `.env` files before running the backend or frontend, then adjust values for your local machine.

Configuration areas used by the application include:

- backend server port
- backend CORS origin
- backend JWT settings
- backend MySQL connection settings
- frontend API base URL

## Useful scripts

| Command | Package | Description |
| --- | --- | --- |
| `pnpm install` | root | Install workspace dependencies |
| `pnpm dev` | root | Run all package dev scripts in parallel |
| `pnpm build` | root | Build all packages |
| `pnpm typecheck` | root | Typecheck all packages |
| `pnpm format` | root | Format all packages |
| `pnpm --filter @zdravstvo/backend dev` | backend | Start the backend in watch mode |
| `pnpm --filter @zdravstvo/backend build` | backend | Build the backend |
| `pnpm --filter @zdravstvo/backend start` | backend | Start the built backend |
| `pnpm --filter @zdravstvo/backend test` | backend | Run backend tests |
| `pnpm --filter @zdravstvo/backend typecheck` | backend | Typecheck the backend |
| `pnpm --filter @zdravstvo/backend format` | backend | Format backend files |
| `pnpm --filter @zdravstvo/backend migrate:latest` | backend | Run database migrations |
| `pnpm --filter @zdravstvo/backend migrate:rollback` | backend | Roll back the latest database migration batch |
| `pnpm --filter @zdravstvo/backend seed:run` | backend | Run database seeds |
| `pnpm --filter @zdravstvo/frontend dev` | frontend | Start the Vite dev server |
| `pnpm --filter @zdravstvo/frontend build` | frontend | Build the frontend |
| `pnpm --filter @zdravstvo/frontend preview` | frontend | Preview the built frontend |
| `pnpm --filter @zdravstvo/frontend test` | frontend | Run frontend tests |
| `pnpm --filter @zdravstvo/frontend test:watch` | frontend | Run frontend tests in watch mode |
| `pnpm --filter @zdravstvo/frontend typecheck` | frontend | Typecheck the frontend |
| `pnpm --filter @zdravstvo/frontend format` | frontend | Format frontend files |
| `pnpm --filter @zdravstvo/contracts dev` | contracts | Watch and compile shared contracts |
| `pnpm --filter @zdravstvo/contracts build` | contracts | Build shared contracts |
| `pnpm --filter @zdravstvo/contracts typecheck` | contracts | Typecheck shared contracts |
| `pnpm --filter @zdravstvo/contracts format` | contracts | Format shared contracts |

## Database

The backend uses MySQL with Knex for database access, migrations, and seeds.

The database stores organizations, users, organization roles, doctors, patients, appointment types, appointments, appointment reminders, activity logs, and accessibility settings.

## Development rules

- `contracts` contains only shared API contract types, DTOs, enums, pagination types, response shapes, and error shapes.
- Backend and frontend code import DTOs and enums from `contracts`.
- Frontend code must not import backend code.
- Backend code follows `routes -> controllers -> services -> repositories`.
- Frontend components must not call `axios` or `fetch` directly.
- `.env` files must not be committed.

## Testing and checks

Available checks are based on the current package scripts:

- Root: `pnpm typecheck`, `pnpm build`, `pnpm format`
- Backend: `pnpm --filter @zdravstvo/backend test`, `pnpm --filter @zdravstvo/backend typecheck`, `pnpm --filter @zdravstvo/backend build`, `pnpm --filter @zdravstvo/backend format`
- Frontend: `pnpm --filter @zdravstvo/frontend test`, `pnpm --filter @zdravstvo/frontend typecheck`, `pnpm --filter @zdravstvo/frontend build`, `pnpm --filter @zdravstvo/frontend format`
- Contracts: `pnpm --filter @zdravstvo/contracts typecheck`, `pnpm --filter @zdravstvo/contracts build`, `pnpm --filter @zdravstvo/contracts format`

No lint script is currently defined in the root or package `package.json` files.

## Production and deployment

Production requires configured environment variables, a reachable MySQL database, built frontend/backend artifacts, CORS configured for the frontend domain, and HTTPS/SSL.
