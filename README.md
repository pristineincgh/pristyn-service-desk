# Pristyn Service Desk

Pristyn Service Desk is a full-stack internal support platform for managing tickets, customers, users, supervision workflows, and operational audit history.

It includes:
- a `Next.js` frontend for moderators, supervisors, and agents
- a `NestJS` backend with Prisma and PostgreSQL
- Redis-backed session handling
- email verification and password recovery flows
- SLA-aware ticket tracking
- activity logging with field-level audit history

## Features

### Ticket Management
- Create, update, assign, reassign, and delete tickets
- Track ticket status and priority
- Add internal ticket notes
- View ticket details and ownership history
- SLA calculation with at-risk and breached states

### Role-Based Access
- `Moderator`: full platform access
- `Supervisor`: access to own tickets and assigned team scope
- `Agent`: access to personal and assigned ticket scope

### User Management
- Create users by role
- Assign agents to supervisors
- Activate or deactivate accounts
- Reset passwords with temporary password enforcement
- Resend email verification

### Authentication and Security
- Session-based authentication with signed cookies
- Redis-backed session storage
- Email verification flow
- Forgot-password and reset-password flows
- Forced password update for default or temporary passwords
- Session invalidation after password change/reset

### Audit and Activity Tracking
- Central activity log for:
  - user actions
  - ticket changes
  - status changes
  - assignment changes
  - customer updates
  - ticket category changes
- Field-level before/after audit metadata for major updates

### UI / Dashboard Experience
- Role-aware dashboards
- Supervisor dashboard, tickets workspace, and team view
- Theme switching with `next-themes`
- Modern login, forgot-password, reset-password, and verification screens

## Tech Stack

### Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- TanStack Query
- TanStack Table
- Zustand
- React Hook Form
- Zod
- `next-themes`
- Recharts
- shadcn/ui style components

### Backend
- NestJS 11
- Prisma
- PostgreSQL
- Redis
- JWT utilities
- Mailjet
- Joi validation
- bcrypt

## Project Structure

```text
.
├── backend
│   ├── prisma
│   └── src
├── frontend
│   └── src
└── README.md
```

## Backend Domain Overview

### Core Models
- `User`
- `Customer`
- `Ticket`
- `TicketNote`
- `TicketCategory`
- `ActivityLog`
- `EmailVerificationToken`
- `PasswordResetToken`

### Roles
- `AGENT`
- `SUPERVISOR`
- `MODERATOR`

## Prerequisites

Make sure you have installed:
- Node.js 20+
- npm
- PostgreSQL
- Redis

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd pristyn-service-desk
```

### 2. Install dependencies

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd ../frontend
npm install
```

### 3. Configure environment variables

Create environment files for the backend and frontend as needed.

#### Backend variables

The backend expects values such as:

```env
NODE_ENV=development
PORT=8000

DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE

JWT_ACCESS_SECRET=your-long-access-secret
JWT_REFRESH_SECRET=your-long-refresh-secret
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d

REDIS_URL=redis://localhost:6379
SESSION_PREFIX=sid:
SESSION_EXPIRY=604800

COOKIE_SECRET=your-long-cookie-secret
COOKIE_DOMAIN=
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax

CORS_ORIGIN=http://localhost:3000

MAILJET_API_KEY=your-mailjet-key
MAILJET_API_SECRET=your-mailjet-secret
MAILJET_FROM_EMAIL=no-reply@example.com
MAILJET_FROM_NAME=Pristyn Service Desk

SLA_HIGH_PRIORITY_HOURS=24
SLA_MEDIUM_PRIORITY_HOURS=48
SLA_LOW_PRIORITY_HOURS=72
SLA_AT_RISK_WINDOW_HOURS=6

PASSWORD_RESET_TTL_SECONDS=1800
PASSWORD_RESET_PATH=/reset-password
PASSWORD_RESET_FRONTEND_BASE_URL=http://localhost:3000

MODERATOR_EMAIL=moderator@example.com
MODERATOR_PASSWORD=change-me
MODERATOR_NAME=System Moderator
```

#### Frontend variables

Create `frontend/.env.local` with:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
API_URL=http://localhost:8000/api/v1
```

Notes:
- `NEXT_PUBLIC_API_URL` is available to client-side code
- `API_URL` is used by the Next.js server/API proxy layer
- In local development, both should usually point to the backend API base URL

### 4. Run Prisma migrations

From the `backend` folder:

```bash
npx prisma migrate dev
npx prisma generate
```

### 5. Start Redis and PostgreSQL

Make sure both services are running before starting the backend.

### 6. Start the backend

```bash
cd backend
npm run start:dev
```

The backend runs on:

```text
http://localhost:8000
```

### 7. Start the frontend

```bash
cd frontend
npm run dev
```

The frontend runs on:

```text
http://localhost:3000
```

## Useful Scripts

### Backend

```bash
npm run start:dev
npm run build
npm run test
npm run lint
```

### Frontend

```bash
npm run dev
npm run build
npm run lint
```

## Authentication Flows Implemented

- Login with session support
- Email verification
- Resend verification email
- Forced password change after temporary/default password use
- Forgot password
- Reset password
- Password change confirmation emails
- Moderator-triggered password reset emails

## Supervisor Capabilities

Supervisors can:
- access their dashboard
- view tickets in their scope
- manage tickets assigned directly to them
- manage tickets created by assigned agents
- review team workload and agent status
- reassign and update tickets in scope

## Audit Trail Coverage

The activity system captures:
- change history
- user actions log
- status changes
- assignment changes
- password and verification activity
- customer and ticket category updates

Where supported, the frontend surfaces field-level `Before` and `After` values.

## Notes

- The backend uses Prisma-generated client output inside `backend/src/generated/prisma`
- Redis is used for session persistence and validation
- Mailjet is used for outbound email delivery
- Password resets and email verification rely on token-based flows
- Ticket visibility is role-scoped on the backend

## Deployment Considerations

Before deploying:
- set production-safe JWT and cookie secrets
- configure `COOKIE_SECURE=true`
- set the correct `CORS_ORIGIN`
- configure Mailjet credentials
- apply Prisma migrations
- ensure PostgreSQL and Redis are available

## Future Improvements

Possible next enhancements:
- Docker and docker-compose setup
- seed scripts and sample data
- CI pipeline for lint/test/build
- API documentation with Swagger
- end-to-end tests
- richer supervisor team analytics

## License

This project is currently marked as `UNLICENSED`.
