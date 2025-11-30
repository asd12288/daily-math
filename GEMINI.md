# DailyMath - Gemini AI Agent Instructions

## Project Overview

DailyMath is a SaaS application for daily math/physics exercises with AI-powered question generation, gamification, and progress tracking.
- **Stack**: Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, Appwrite, tRPC.
- **AI**: Vercel AI SDK with Gemini 2.5 Flash.
- **Languages**: English & Hebrew (RTL).

---

## Critical Rules for AI Agents

### 1. Component Reuse (Highest Priority)
**BEFORE creating any new UI component, ALWAYS:**
1. **PRIMARY SOURCE**: Check the **Modernize Tailwind Template** at `C:\Users\ilanc\Downloads\modernize-tailwind-nextjs-pro_NjhmM2FiODQ4NTU4M2UwMDM4OWRmY2I4`.
   - Use components from this template as the *absolute standard* for design and implementation.
   - Copy and adapt code from this template rather than writing from scratch.
2. Check `shared/ui/` for components already ported from the template.
3. Check `modules/` for similar existing implementations.
4. **NEVER** create a custom design if a component exists in the Modernize template.

### 2. Architecture & Structure
- **Modular Architecture**: All feature logic goes into `modules/[feature-name]/`.
- **Shared Code**: Generic UI and layout go into `shared/`.
- **No Direct Appwrite Calls**: Use tRPC procedures for ALL data fetching/mutations in client components.
- **Strict Types**: All code must pass TypeScript strict mode.

### 3. Coding Standards
- **Functional Components**: Use `export function ComponentName({ props }: Props)`.
- **Hooks**: Place hooks at the top of components.
- **i18n**: Use `useTranslations()` for ALL user-facing text.
- **Styling**: Use Tailwind CSS utility classes. Use semantic colors (`bg-primary-600`, `text-error-500`) defined in `globals.css`.
- **Zod Validation**: Validate all inputs with Zod schemas.

---

## Tech Stack & Architecture

### Core
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **State/API**: tRPC + React Query

### Backend (Appwrite)
- **Auth**: Appwrite Auth
- **Database**: Appwrite Database
- **Storage**: Appwrite Storage

### Directory Structure
```
modules/
├── [module-name]/
│   ├── index.ts           # Public API
│   ├── config/            # Routes, messages
│   ├── types/             # TS interfaces
│   ├── lib/               # Utils, validation
│   ├── hooks/             # Custom hooks
│   ├── server/            # tRPC routers
│   └── ui/                # Components & Views
shared/
├── ui/                    # Generic UI (Button, Card, Input)
├── layout/                # Header, Sidebar
└── context/               # Global contexts
```

---

## Existing Shared Components (`shared/ui/`)

- **Button**: `variant` (primary, secondary, outline, ghost, destructive, success), `size` (sm, md, lg), `isLoading`.
- **Input**: `label`, `error`, `helperText`.
- **Card**: `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`.

---

## Key Workflows

### Authentication
- handled by Appwrite.
- Redirects to `/dashboard` on success.

### Data Fetching (tRPC)
- **Query**: `const { data } = trpc.module.procedure.useQuery();`
- **Mutation**: `const mutation = trpc.module.procedure.useMutation();`

### Internationalization
- **Locales**: `en` (default), `he` (RTL).
- **Usage**: `const t = useTranslations(); <h1>{t('key')}</h1>`

---

## Development Commands

- `npm run dev`: Start dev server
- `npx tsc --noEmit`: Type check
- `npm run lint`: Lint code

---

## Current Status (MVP)

### Completed
- [x] Project structure & tRPC setup
- [x] Auth module & UI
- [x] Dashboard layout & home
- [x] i18n setup

### In Progress / Next
- [ ] Appwrite integration
- [ ] Course selection
- [ ] Practice flow & AI generation
