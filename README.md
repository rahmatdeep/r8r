# r8r

**r8r** is an open-source, extensible workflow automation platform inspired by [n8n](https://n8n.io/).  
It lets you visually create, connect, and automate workflows using triggers (like webhooks) and actions (like sending emails, Telegram messages, or calling Gemini AI).  
Built as a modern monorepo with TypeScript, Next.js, Prisma, and a modular backend architecture.



## Features

- **Visual Workflow Builder:** Drag-and-drop UI for creating and connecting triggers and actions.
- **Triggers:** Webhook.
- **Multiple Actions:** Email, Telegram, Gemini AI, and extensible support for more.
- **Dynamic Data Mapping:** Use outputs from triggers/actions as inputs for subsequent steps (with drag-and-drop sidebar).
- **Credential Management:** Securely store and manage credentials for each integration.
- **Modular Monorepo:** Clean separation of backend, frontend, types, and utilities.
- **TypeScript-first:** End-to-end type safety.
- **Prisma ORM:** Robust, type-safe database access.
- **TurboRepo:** Fast, scalable monorepo tooling.


## Monorepo Structure

```
apps/
  hooks/               # Webhook receiver & processor
  primary-backend/     # Main API backend (Express)
  processor/           # Workflow execution engine
  web/                 # Next.js frontend (React)
  worker/              # Action workers (email, telegram, gemini, etc.)

packages/
  db/                  # Prisma schema, migrations, and DB client
  eslint-config/       # Shared ESLint config
  kafka/               # Kafka integration (optional)
  types/               # Shared TypeScript types
  typescript-config/   # Shared tsconfig
```

## Quick Start

### 1. **Clone and Install**

```sh
git clone https://github.com/yourusername/r8r.git
cd r8r
pnpm install
```

### 2. **Setup Environment**

Copy `.env.example` files in each app/package to `.env` and fill in required secrets (DB, SMTP, Telegram, Gemini, etc).

### 3. **Database Setup**

```sh
cd packages/db
pnpm prisma migrate dev
pnpm run seed
```

### 4. **Run All Services**

From the root:

```sh
pnpm dev
```

Or run each service individually:

```sh
pnpm --filter web dev
pnpm --filter primary-backend dev
pnpm --filter hooks dev
pnpm --filter processor dev
pnpm --filter worker dev
```


## Usage

1. Visit `http://localhost:3000` to access the web UI.
2. Sign up and start building workflows visually.
3. Add triggers (webhook) and actions (email, telegram, gemini).
4. Configure credentials as needed.
5. Use the sidebar to drag output keys from triggers/actions into action inputs.


## Key Concepts

### Triggers

- **Webhook**: Receive HTTP requests to start workflows.

### Actions

- **Email**: Send emails using configured credentials.
- **Telegram**: Send Telegram messages.
- **Gemini**: Call Gemini AI APIs.

### Credentials

- Securely store API keys, tokens, etc. for each integration.
- Add/manage credentials in the UI.

### Dynamic Data Mapping

- Use outputs from any previous step as inputs for later steps.
- Drag-and-drop keys from the sidebar into action fields.


## Extending r8r

### Add new triggers/actions:

Implement a new backend route and UI modal, update types, and add to the workflow builder.

### Add new credential types:

Update the Prisma schema, backend, and credential modal.

### Add new sidebar key sources:

Pass new keys to the sidebar via the workflow context.


## Tech Stack

- **Frontend**: Next.js (React, TypeScript, Tailwind CSS)
- **Backend**: Express (TypeScript)
- **Database**: PostgreSQL (via Prisma ORM)
- **Monorepo**: TurboRepo, pnpm
- **Workers**: Node.js (for async action processing)
- **UI**: Lucide icons, custom React components


## Development

- All packages/apps use TypeScript and share types via `packages/types`.
- Linting and formatting via shared ESLint and Prettier configs.
- Use `pnpm dev` to run all apps in dev mode.