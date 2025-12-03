# DailyMath - AI Agent Instructions

## Project Overview

DailyMath is a SaaS application for Israeli university students to practice math/physics with AI-powered solutions, gamification, and progress tracking.

### Core Features
- **Homework Analysis**: Upload PDFs/images of homework, AI extracts and solves questions with step-by-step solutions
- **Practice Sessions**: Topic-based practice with AI-generated hints and solutions
- **Courses & Topics**: Structured learning paths with theory, formulas, videos, and exercises
- **Gamification**: XP system, levels (1-10), streaks with hard reset
- **Bilingual**: Full Hebrew (RTL) and English support

### Target Audience
Israeli university students studying:
- Calculus 1 (חדו"א 1)
- Linear Algebra (אלגברה ליניארית)
- Physics 1 (פיסיקה 1)

---

## Tech Stack

### Core Framework
- **Next.js 16.0.5** with App Router
- **React 19.2.0**
- **TypeScript 5**
- **Tailwind CSS 4** (CSS-based configuration)

### Backend & Data
- **Appwrite SDK 21.4.0** - Auth, Database, Storage
- **node-appwrite 20.3.0** - Server-side operations
- **tRPC 11.7.2** - Type-safe API layer
- **@tanstack/react-query 5.90.11** - Server state management
- **Zod 4.1.13** - Schema validation

### AI & Content
- **ai 5.0.104** - Vercel AI SDK
- **@ai-sdk/google 2.0.44** - Gemini 2.0 Flash integration
- **katex 0.16.25** + **react-katex 3.1.0** - LaTeX rendering

### UI Components
- **flowbite-react 0.12.10** - UI component library
- **@tabler/icons-react 3.35.0** - Icon library
- **@iconify/react 6.0.2** - Additional icons
- **simplebar-react 3.3.2** - Custom scrollbars
- **@xyflow/react 12.9.3** - Skill tree visualization

### Forms & Validation
- **react-hook-form 7.66.1** - Form handling
- **@hookform/resolvers 5.2.2** - Zod integration

### Internationalization
- **next-intl 4.5.6** - i18n with RTL support
- Locales: `en` (default), `he` (Hebrew RTL)

### Email
- **resend 6.5.2** - Email delivery for notifications

---

## Architecture

### Modules (Feature-Based)

```
modules/
├── auth/           # Authentication (login, register, forgot password)
├── dashboard/      # Main dashboard home page
├── courses/        # Course catalog and enrollment
├── topics/         # Topic detail (learn, formulas, practice, videos, stats)
├── practice/       # Daily sets and topic practice
├── session/        # Practice sessions with progress tracking
├── homework/       # PDF upload, AI extraction, solutions
├── gamification/   # XP, levels, streaks, badges
├── ai/             # AI services (generation, analysis, tutoring)
├── admin/          # Question bank management
├── skill-tree/     # Visual skill progression
├── onboarding/     # First-time user setup
├── settings/       # User preferences
├── landing/        # Public landing page
└── notifications/  # Email reminders (infrastructure)
```

### Module Structure

```
modules/[name]/
├── index.ts                 # Public API (barrel export)
├── types/
│   └── [name].types.ts      # TypeScript interfaces
├── lib/
│   ├── validation.ts        # Zod schemas
│   └── utils.ts             # Helper functions
├── hooks/
│   └── use-[feature].ts     # tRPC query/mutation hooks
├── server/
│   ├── procedures.ts        # tRPC router
│   └── services/            # Business logic classes
└── ui/
    ├── components/          # Reusable components
    └── views/               # Full-page views
```

### Shared Code

```
shared/
├── context/
│   ├── DashboardContext.tsx  # Sidebar state
│   ├── UserContext.tsx       # Auth session
│   └── ThemeContext.tsx      # Dark/light mode
├── hooks/
│   └── use-is-mobile.ts      # Breakpoint detection
├── layout/
│   ├── Logo.tsx
│   ├── header/Header.tsx
│   └── sidebar/Sidebar.tsx
└── ui/
    ├── button.tsx
    ├── input.tsx
    ├── card.tsx
    ├── modal.tsx
    ├── math-display.tsx      # KaTeX wrapper
    ├── theory-renderer.tsx   # Markdown with syntax highlighting
    ├── youtube-embed.tsx
    └── session/              # Shared session components
```

---

## Database Schema (Appwrite)

### Collections

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| **users_profile** | User data, gamification | userId, displayName, email, totalXp, currentLevel, currentStreak, enrolledCourses |
| **courses** | Course catalog | name, nameHe, description, icon, color, topics[], isActive |
| **topics** | Learning topics | courseId, name, branchId, theoryContent, videoIds[], estimatedMinutes |
| **topic_formulas** | Formula cheat sheets | topicId, title, latex, explanation, category, isCore |
| **topic_videos** | YouTube tutorials | videoId, topicId, title, channelName, duration, language |
| **exercises** | Question bank | courseId, topicId, question, difficulty, solution, answerType, xpReward |
| **daily_sets** | Daily assignments | userId, date, exercises[], completedCount, isCompleted, xpEarned |
| **user_answers** | Submissions | userId, exerciseId, textAnswer, imageFileId, isCorrect, xpAwarded |
| **homework** | Uploaded documents | userId, title, fileId, pageCount, questionCount, status, detectedLanguage |
| **homework_questions** | Extracted questions | homeworkId, questionText, pageNumber, difficulty, isViewed, xpAwarded |
| **homework_solutions** | AI solutions | questionId, solutionSteps (JSON), tip |

### Storage Buckets
- **user_images** - Handwritten solutions (10MB max, jpg/png/heic/webp)
- Homework PDFs stored in default bucket

---

## tRPC API Layer

### Routers

All routers in `/trpc/routers/_app.ts`:

```typescript
appRouter = {
  auth,        // login, register, logout, getCurrentUser
  dashboard,   // stats, overview
  courses,     // list, getById, enroll, unenroll
  topics,      // getTopic, getFormulas, getVideos
  practice,    // getDailySet, getTopicQuestions, submitAnswer
  session,     // createSession, getSession, submitAnswer, completeSession
  homework,    // list, upload, getById, viewQuestion, delete
  gamification, // getUserProfile, getLeaderboard
  ai,          // generateQuestion, analyzeImage, getSocraticTip
  admin,       // question CRUD
  onboarding,  // setup flow
  settings,    // preferences
  skillTree    // skill data
}
```

### Usage Pattern

```typescript
// In server procedures
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";

export const moduleRouter = createTRPCRouter({
  getData: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // ctx.session.userId available
      return await ModuleService.getById(input.id);
    }),
});

// In client components
import { trpc } from "@/trpc/client";

function Component() {
  const { data } = trpc.module.getData.useQuery({ id: "123" });
  const mutation = trpc.module.create.useMutation();
}
```

---

## Key Modules

### Homework Module (Most Complex)

**Workflow:**
1. User uploads PDF/image
2. AI extracts questions from document
3. AI generates step-by-step solutions (bilingual EN/HE)
4. User views solutions, earns XP per question

**Services:**
- `HomeworkService` - CRUD operations
- `PdfProcessingService` - Question extraction
- `TitleGenerationService` - Auto title from content
- `AdaptiveSolvingService` - Optimized AI solving
- `BatchSolvingService` - Bulk processing
- `IllustrationService` - Diagram generation

**Types:**
```typescript
type HomeworkStatus = "uploading" | "processing" | "completed" | "failed";
type HomeworkFileType = "pdf" | "image";
```

### Session Module

**Flow:**
1. User starts session (topic or custom)
2. Questions displayed one at a time
3. User submits answer, views solution
4. Session ends with XP summary

**Components:**
- `SessionStartView` - Session configuration
- `SessionView` - Active question solving
- `SessionResultsView` - Completion summary

### Topics Module

**Tabs:**
- Learn - Theory content (markdown)
- Formulas - LaTeX formula cards
- Practice - Topic-specific exercises
- Videos - YouTube tutorials
- Stats - User progress

---

## App Routes

### Auth
- `/auth/login`
- `/auth/register`
- `/auth/forgot-password`

### Dashboard (with sidebar layout)
- `/dashboard` - Home with stats
- `/courses` - Course catalog
- `/courses/[courseId]` - Course detail
- `/courses/[courseId]/topics/[topicId]` - Topic tabs
- `/practice` - Daily set overview
- `/practice/topic/[topicId]` - Topic practice
- `/session/start` - Create session
- `/session/[sessionId]` - Active session
- `/session/[sessionId]/results` - Results
- `/homework` - Homework list
- `/homework/[id]` - Homework detail
- `/history` - Past exercises
- `/settings` - Preferences
- `/admin/questions` - Question bank

---

## Design System

### Color Tokens (in `globals.css`)

```css
--primary-50 to --primary-900   /* Blue - main brand */
--secondary-50 to --secondary-900 /* Purple - accents */
--success-50 to --success-900   /* Green - XP, correct */
--warning-50 to --warning-900   /* Amber - warnings */
--error-50 to --error-900       /* Red - errors */
--gray-50 to --gray-900         /* Neutral */
```

### Usage
```tsx
<Button variant="primary">Start</Button>
<span className="text-success-500">+10 XP</span>
<div className="bg-error-100 text-error-700">Error</div>
```

### Layout
- Sidebar: 270px desktop, 75px collapsed
- Header: ~60px height
- Mobile: Drawer sidebar

---

## Gamification System

### XP & Levels

```typescript
XP_LEVELS = [
  { level: 1, xpRequired: 0 },      // Beginner
  { level: 2, xpRequired: 100 },    // Student
  { level: 3, xpRequired: 300 },    // Learner
  // ... up to level 10 at 10000 XP (Sage)
]

XP_REWARDS = {
  easy: 10,
  medium: 15,
  hard: 20
}
```

### Streaks
- **Hard reset** on missed day (no forgiveness)
- Streak bonus: `streakDays * 5 XP`
- Warning email at 8 PM if incomplete

---

## Environment Variables

```bash
# Appwrite
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=...
APPWRITE_DATABASE_ID=...
APPWRITE_USERS_PROFILE_COLLECTION=...
APPWRITE_COURSES_COLLECTION=...
APPWRITE_TOPICS_COLLECTION=...
APPWRITE_EXERCISES_COLLECTION=...
APPWRITE_DAILY_SETS_COLLECTION=...
APPWRITE_USER_ANSWERS_COLLECTION=...
APPWRITE_HOMEWORK_COLLECTION=...
APPWRITE_HOMEWORK_QUESTIONS_COLLECTION=...
APPWRITE_HOMEWORK_SOLUTIONS_COLLECTION=...
APPWRITE_USERS_BUCKET=...

# AI
GOOGLE_GENERATIVE_AI_API_KEY=...

# Email
RESEND_API_KEY=...

# Cron
CRON_SECRET=...
```

---

## Development Commands

```bash
npm run dev          # Development server (port 3000)
npm run build        # Production build
npm run lint         # ESLint check
npm run seed         # Seed exercises
npm run seed:topic   # Seed specific topic
```

---

## AI Agent Rules

### Critical Rules

1. **Use modular architecture** - All code must go in the appropriate module
2. **Use tRPC for API calls** - Never call Appwrite directly from client
3. **All text must use translations** - `t("key")` from next-intl
4. **RTL awareness** - Use `start`/`end` not `left`/`right`
5. **Math in MathDisplay** - All LaTeX must use the MathDisplay component
6. **Barrel exports** - Export public API through `index.ts`

### Before Creating Components

1. Check `shared/ui/` for existing components
2. Check module's `ui/components/` for similar components
3. Only create new if nothing can be reused or extended
4. Add shared components to `shared/ui/` and export from index

### Component Pattern

```tsx
"use client"; // Only if needed

import { useTranslations } from "next-intl";
import { Button, Card } from "@/shared/ui";

interface Props {
  data: SomeType;
}

export function MyComponent({ data }: Props) {
  const t = useTranslations();

  return (
    <Card>
      <h2>{t("module.title")}</h2>
      <Button variant="primary">{t("common.submit")}</Button>
    </Card>
  );
}
```

### Service Pattern

```typescript
// modules/[name]/server/services/[name].service.ts
import { createAdminClient } from "@/lib/appwrite/server";

export class NameService {
  static async getById(id: string) {
    const { databases } = await createAdminClient();
    return databases.getDocument(DB_ID, COLLECTION_ID, id);
  }

  static async create(data: CreateInput) {
    const { databases } = await createAdminClient();
    return databases.createDocument(DB_ID, COLLECTION_ID, ID.unique(), data);
  }
}
```

### Validation Pattern

```typescript
// modules/[name]/lib/validation.ts
import { z } from "zod";

export const createSchema = z.object({
  title: z.string().min(1),
  content: z.string(),
});

export type CreateInput = z.infer<typeof createSchema>;
```

---

## Implementation Status

### Fully Implemented
- [x] Authentication (Appwrite)
- [x] Dashboard with stats
- [x] Course catalog & enrollment
- [x] Topics with Learn/Formulas/Practice/Videos/Stats tabs
- [x] Homework upload & AI processing
- [x] Step-by-step solutions (bilingual)
- [x] Practice sessions
- [x] Gamification (XP, levels, streaks)
- [x] Bilingual i18n with RTL
- [x] LaTeX rendering
- [x] Admin question bank
- [x] Settings & preferences

### In Progress
- [ ] Landing page polish
- [ ] Notification emails (infrastructure ready)
- [ ] Skill tree visualization

### Planned
- [ ] Notion integration
- [ ] Leaderboard
- [ ] Achievement badges
- [ ] Mobile app

---

## Key Files Reference

| Purpose | Location |
|---------|----------|
| Database schema | `lib/appwrite/schema.ts` |
| TypeScript types | `lib/appwrite/types.ts` |
| Design tokens | `app/globals.css` |
| tRPC setup | `trpc/init.ts` |
| Root router | `trpc/routers/_app.ts` |
| i18n config | `i18n/config.ts` |
| EN messages | `messages/en/index.json` |
| HE messages | `messages/he/index.json` |
| Shared UI | `shared/ui/index.ts` |
| Layout | `shared/layout/` |
