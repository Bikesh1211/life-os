# Life OS

A personal life management platform. Provides an extensible shell (auth, navigation, design system, app shell) that plugins fill with domain-specific features.

Built with **Next.js 16**, **Mantine v8**, **Drizzle ORM**, **PostgreSQL (Supabase)**, and **Supabase Auth**.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | Mantine v8, Tailwind CSS v4 |
| Database | PostgreSQL (Supabase) |
| ORM | Drizzle ORM |
| Auth | Supabase Auth |
| State | TanStack Query v5, Zustand |
| Forms | react-hook-form, Zod |
| Icons | Tabler Icons |
| Animations | Framer Motion |
| Charts | Recharts |
| Rich Text | Tiptap |
| Logging | Pino |

## Architecture

The platform follows a **plugin-based architecture**:

- **Core** (`src/core/`) — auth, design system, navigation, database client, logging, tags. Never depends on any plugin.
- **Plugins** (`src/modules/*/`) — Each plugin owns its own database schema, routes, and domain logic. Cross-plugin data access goes through service layers, never direct table reads.

All data is scoped to `userId` (Supabase Auth user ID).

## Plugins

| Plugin | Route | Purpose |
|--------|-------|---------|
| Timeline | `/timeline/*` | Daily activity tracker & life milestone manager |
| Expenses | `/finance/*` | Personal finance tracker |
| Music | `/music/*` | Music tracking & listening history |
| Notes | `/notes` | Quick capture notes |
| Knowledge Vault | `/knowledge/*` | Personal knowledge management |
| Routines | `/routines/*`, `/calendar` | Daily schedule & planner |
| Goals | `/goals/*` | Life goal tracking |
| Wellness | `/wellness` | Mood, sleep, hydration, self-care |
| Habits | `/habits/*` | Habit tracking & analytics |
| Tasks | `/tasks/*` | Task management |
| Journal | `/journal` | Journal entries |
| Travel | `/travel/*` | Trip planning & travel log |
| Reading | `/reading` | Reading list & tracking |
| Tech Gear | `/inventory/tech-gear` | Tech asset inventory |
| Wardrobe | `/wardrobe` | Clothing inventory |
| Gamification | (internal) | XP, levels, achievements |

## Getting Started

### Prerequisites

- Node.js 22 (see `.nvmrc`)
- pnpm 9.15+
- A Supabase project

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment template and fill in your values
cp .env.example .env
```

Required environment variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (Supabase) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `NEXT_PUBLIC_APP_URL` | App URL (`http://localhost:3000`) |

### Database

```bash
# Generate new migrations after schema changes
pnpm db:generate

# Apply pending migrations
pnpm db:migrate

# Push schema directly (dev only)
pnpm db:push

# Open Drizzle Studio GUI
pnpm db:studio

# Seed the database
pnpm db:seed
```

### Development

```bash
pnpm dev       # Start dev server at http://localhost:3000
pnpm lint      # Run ESLint
pnpm typecheck # Run TypeScript type checking
pnpm format    # Format all files with Prettier
```

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm format` | Format all files with Prettier |
| `pnpm format:check` | Check formatting |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:push` | Push schema directly to database |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm db:seed` | Seed database |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (app)/              # Authenticated app layout & pages
│   ├── (auth)/             # Auth pages (sign-in, sign-up, etc.)
│   └── api/                # API route handlers
├── components/             # Shared UI components
├── core/                   # Platform core
│   ├── auth/               # Supabase auth helpers
│   ├── database/           # DB client & seed
│   ├── design-system/      # Mantine theme & tokens
│   ├── supabase/           # Supabase client setup
│   ├── tags/               # Cross-plugin tagging
│   └── ...
├── hooks/                  # Shared React hooks
├── infrastructure/         # Providers, prefetching, etc.
├── modules/                # Plugins (one directory each)
│   ├── dashboard/
│   ├── expenses/
│   ├── habits/
│   ├── knowledge/
│   ├── music/
│   ├── notes/
│   ├── routines/
│   ├── tasks/
│   ├── timeline/
│   └── ...
└── stores/                 # Zustand stores
```

## Contributing

This project uses:

- **Conventional Commits** (enforced by commitlint + husky)
- **Prettier** for code formatting
- **ESLint** for linting
- **lint-staged** runs formatters on staged files

All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

## License

Private — all rights reserved.
