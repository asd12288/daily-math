# DailyMath Full Course Generation Prompt

> **Purpose**: This document provides complete instructions for generating a full course for the DailyMath platform. It can be used with any LLM, with or without direct database access.

---

## Table of Contents

1. [Overview](#overview)
2. [Course Hierarchy](#course-hierarchy)
3. [Schema Definitions](#schema-definitions)
4. [Generation Guidelines](#generation-guidelines)
5. [LaTeX & Math Formatting](#latex--math-formatting)
6. [Hebrew Translation Guidelines](#hebrew-translation-guidelines)
7. [Full Generation Prompt](#full-generation-prompt)
8. [Output Formats](#output-formats)
9. [Validation Checklist](#validation-checklist)
10. [Appwrite MCP Commands](#appwrite-mcp-commands)

---

## Overview

DailyMath is a bilingual (English/Hebrew) math practice platform for Israeli university students. Each course follows this structure:

```
COURSE
  └── BRANCHES (3-5 categories)
        └── TOPICS (3-5 per branch, 15 total recommended)
              ├── Theory Content (markdown with LaTeX)
              ├── Formulas (LaTeX cheat sheets)
              ├── Videos (YouTube links)
              └── EXERCISES (15 per topic: 5 easy + 5 medium + 5 hard)
                    └── SOLUTIONS (step-by-step for each exercise)
```

---

## Course Hierarchy

### Level 1: Course
The top-level container for all content.

### Level 2: Branches
Categories that group related topics (e.g., "Foundations", "Linear Algebra").

### Level 3: Topics
Individual learning units with prerequisites forming a skill tree.

### Level 4: Topic Resources
- **Theory**: Markdown content explaining the concept
- **Formulas**: LaTeX formulas for quick reference
- **Videos**: Curated YouTube tutorials

### Level 5: Exercises
Practice problems with 3 difficulty levels.

### Level 6: Solutions
Step-by-step solutions for each exercise.

---

## Schema Definitions

### 1. Course Schema

```typescript
interface Course {
  id: string;              // kebab-case, unique (e.g., "calculus-1")
  name: string;            // English name (max 100 chars)
  nameHe: string;          // Hebrew name
  description: string;     // English description (max 500 chars)
  descriptionHe: string;   // Hebrew description
  icon: string;            // Tabler icon (e.g., "tabler:math-function")
  color: string;           // Hex color (e.g., "#3B82F6")
  isActive: boolean;       // Whether course is available
  sortOrder: number;       // Display order (1, 2, 3...)
  branchIds: string[];     // Array of branch IDs in this course
}
```

**Example:**
```json
{
  "id": "calculus-1",
  "name": "Calculus 1",
  "nameHe": "חשבון אינפיניטסימלי 1",
  "description": "Limits, derivatives, and basic integration for first-year students",
  "descriptionHe": "גבולות, נגזרות ואינטגרציה בסיסית לסטודנטים בשנה א'",
  "icon": "tabler:math-integral",
  "color": "#8B5CF6",
  "isActive": true,
  "sortOrder": 1,
  "branchIds": ["limits", "derivatives", "applications", "integrals"]
}
```

---

### 2. Branch Schema

```typescript
interface Branch {
  id: string;              // kebab-case, unique within course
  name: string;            // English name
  nameHe: string;          // Hebrew name
  icon: string;            // Tabler icon name
  color: string;           // Tailwind color: "success" | "primary" | "secondary" | "warning" | "error"
  order: number;           // Display order within course (1-5)
}
```

**Available Colors:**
- `success` - Green (for foundational/easy topics)
- `primary` - Blue (main content)
- `secondary` - Purple (intermediate)
- `warning` - Amber/Orange (advanced)
- `error` - Red (most difficult)

**Example:**
```json
{
  "id": "limits",
  "name": "Limits",
  "nameHe": "גבולות",
  "icon": "tabler:arrow-right-to-arc",
  "color": "success",
  "order": 1
}
```

---

### 3. Topic Schema

```typescript
interface Topic {
  id: string;                    // kebab-case, globally unique
  courseId: string;              // Reference to parent course
  name: string;                  // English name (max 200 chars)
  nameHe: string;                // Hebrew name
  description: string;           // English description (max 2000 chars)
  descriptionHe: string;         // Hebrew description
  branchId: string;              // Reference to parent branch
  prerequisites: string[];       // Array of topic IDs (can be empty)
  order: number;                 // Order within branch (1, 2, 3...)
  difficultyLevels: string[];    // Always: ["easy", "medium", "hard"]
  questionTypes: string[];       // Types for AI generation hints
  keywords: string[];            // Search/AI keywords
  theoryContent: string;         // Markdown with LaTeX (max 20000 chars)
  theoryContentHe: string;       // Hebrew theory (max 20000 chars)
  videoIds: string[];            // YouTube video IDs (11 chars each)
  isActive: boolean;             // Default: true
  estimatedMinutes: number;      // Time to learn (5-120)
}
```

**Example:**
```json
{
  "id": "limit-definition",
  "courseId": "calculus-1",
  "name": "Limit Definition",
  "nameHe": "הגדרת גבול",
  "description": "Understanding the epsilon-delta definition of limits",
  "descriptionHe": "הבנת הגדרת אפסילון-דלתא של גבולות",
  "branchId": "limits",
  "prerequisites": [],
  "order": 1,
  "difficultyLevels": ["easy", "medium", "hard"],
  "questionTypes": ["evaluate", "prove", "find-delta", "graph-analysis"],
  "keywords": ["epsilon", "delta", "limit", "approach", "convergence"],
  "theoryContent": "## What is a Limit?\n\nA limit describes the value a function approaches...",
  "theoryContentHe": "## מהו גבול?\n\nגבול מתאר את הערך שאליו פונקציה מתקרבת...",
  "videoIds": ["dQw4w9WgXcQ"],
  "isActive": true,
  "estimatedMinutes": 45
}
```

---

### 4. Topic Formula Schema

```typescript
interface TopicFormula {
  id: string;                    // Auto-generated or custom ID
  topicId: string;               // Reference to parent topic
  courseId: string;              // Reference to course
  title: string;                 // Formula name (max 200 chars)
  titleHe: string;               // Hebrew title
  latex: string;                 // LaTeX formula (max 2000 chars)
  explanation: string;           // When/how to use (max 1000 chars)
  explanationHe: string;         // Hebrew explanation
  category: string;              // Category for grouping (optional)
  sortOrder: number;             // Display order (0, 1, 2...)
  tags: string[];                // JSON array for filtering
  isCore: boolean;               // Mark essential formulas
}
```

**Example:**
```json
{
  "topicId": "limit-definition",
  "courseId": "calculus-1",
  "title": "Epsilon-Delta Definition",
  "titleHe": "הגדרת אפסילון-דלתא",
  "latex": "\\lim_{x \\to a} f(x) = L \\iff \\forall \\varepsilon > 0, \\exists \\delta > 0 : 0 < |x - a| < \\delta \\Rightarrow |f(x) - L| < \\varepsilon",
  "explanation": "The formal definition of a limit. For every epsilon (error tolerance), there exists a delta (input range) such that the function stays within epsilon of L.",
  "explanationHe": "ההגדרה הפורמלית של גבול. לכל אפסילון (סבילות שגיאה), קיים דלתא (טווח קלט) כך שהפונקציה נשארת בתוך אפסילון מ-L.",
  "category": "definitions",
  "sortOrder": 1,
  "tags": ["definition", "epsilon", "delta"],
  "isCore": true
}
```

---

### 5. Topic Video Schema

```typescript
interface TopicVideo {
  id: string;                    // Auto-generated or custom ID
  videoId: string;               // YouTube video ID (11 chars)
  topicId: string;               // Reference to parent topic
  courseId: string;              // Reference to course
  title: string;                 // Video title (max 300 chars)
  titleHe: string;               // Hebrew title (optional)
  channelName: string;           // YouTube channel name
  thumbnailUrl: string;          // YouTube thumbnail URL
  duration: string;              // Human readable ("12:34")
  durationSeconds: number;       // Duration in seconds
  language: "en" | "he" | "other";
  sortOrder: number;             // Display order
  source: "curated" | "api";     // How video was added
  description: string;           // Video description (optional)
  isActive: boolean;             // Default: true
}
```

**Example:**
```json
{
  "videoId": "riXcZT2ICjA",
  "topicId": "limit-definition",
  "courseId": "calculus-1",
  "title": "Epsilon-Delta Definition of Limits",
  "titleHe": "הגדרת אפסילון-דלתא של גבולות",
  "channelName": "3Blue1Brown",
  "thumbnailUrl": "https://i.ytimg.com/vi/riXcZT2ICjA/hqdefault.jpg",
  "duration": "18:23",
  "durationSeconds": 1103,
  "language": "en",
  "sortOrder": 1,
  "source": "curated",
  "description": "A visual introduction to the epsilon-delta definition",
  "isActive": true
}
```

---

### 6. Exercise Schema

```typescript
interface Exercise {
  id: string;                    // Format: {topic-abbrev}-{e|m|h}-{###}
  courseId: string;              // Reference to course
  topicId: string;               // Reference to topic
  question: string;              // Question with LaTeX (max 5000 chars)
  questionHe: string;            // Hebrew question
  difficulty: "easy" | "medium" | "hard";
  xpReward: number;              // 10 (easy), 15 (medium), 20 (hard)
  answer: string;                // Correct answer (max 500 chars)
  answerType: "numeric" | "expression" | "proof" | "open";
  tip: string;                   // Hint (max 1000 chars)
  tipHe: string;                 // Hebrew hint
  estimatedMinutes: number;      // Time to solve (1-60)
  isActive: boolean;             // Default: true
  diagramUrl: string;            // URL to diagram (optional)
  generatedBy: string;           // AI model name (optional)
  generatedAt: string;           // ISO datetime (optional)
}
```

**Exercise ID Format:**
- `{topic-abbreviation}-{difficulty-letter}-{number}`
- Difficulty letters: `e` (easy), `m` (medium), `h` (hard)
- Examples: `lim-def-e-001`, `lim-def-m-003`, `lim-def-h-005`

**XP Rewards:**
| Difficulty | XP | Estimated Time |
|------------|-----|----------------|
| Easy | 10 | 1-3 minutes |
| Medium | 15 | 3-5 minutes |
| Hard | 20 | 5-10 minutes |

**Answer Types:**
- `numeric` - Single number (e.g., "42", "-3.5", "1/4")
- `expression` - Math expression (e.g., "3x + 2", "(x-1)(x+2)")
- `proof` - Logical proof or derivation
- `open` - Free-form answer with multiple valid responses

**Example:**
```json
{
  "id": "lim-def-e-001",
  "courseId": "calculus-1",
  "topicId": "limit-definition",
  "question": "Evaluate: $\\lim_{x \\to 2} (3x + 1)$",
  "questionHe": "חשב: $\\lim_{x \\to 2} (3x + 1)$",
  "difficulty": "easy",
  "xpReward": 10,
  "answer": "7",
  "answerType": "numeric",
  "tip": "For polynomial functions, you can directly substitute the value",
  "tipHe": "עבור פונקציות פולינומיות, ניתן להציב ישירות את הערך",
  "estimatedMinutes": 2,
  "isActive": true
}
```

---

### 7. Exercise Solution Schema

```typescript
interface ExerciseSolution {
  id: string;                    // Auto-generated
  exerciseId: string;            // Reference to exercise (unique)
  solution: string;              // Full solution text (max 15000 chars)
  steps: string[];               // Array of step-by-step solution
  stepsHe: string[];             // Array of Hebrew steps
}
```

**Example:**
```json
{
  "exerciseId": "lim-def-e-001",
  "solution": "The answer is 7",
  "steps": [
    "Given: $\\lim_{x \\to 2} (3x + 1)$",
    "Step 1: Since $3x + 1$ is a polynomial, it is continuous everywhere",
    "Step 2: For continuous functions, $\\lim_{x \\to a} f(x) = f(a)$",
    "Step 3: Substitute $x = 2$: $f(2) = 3(2) + 1 = 6 + 1 = 7$",
    "Answer: $\\boxed{7}$"
  ],
  "stepsHe": [
    "נתון: $\\lim_{x \\to 2} (3x + 1)$",
    "שלב 1: מכיוון ש-$3x + 1$ הוא פולינום, הוא רציף בכל מקום",
    "שלב 2: עבור פונקציות רציפות, $\\lim_{x \\to a} f(x) = f(a)$",
    "שלב 3: הצב $x = 2$: $f(2) = 3(2) + 1 = 6 + 1 = 7$",
    "תשובה: $\\boxed{7}$"
  ]
}
```

---

## Generation Guidelines

### Difficulty Progression

**Easy Questions:**
- Single concept application
- Direct substitution or simple calculation
- 1-2 steps to solve
- Clear, straightforward wording
- Estimated time: 1-3 minutes

**Medium Questions:**
- 2-3 concepts combined
- May require identifying which technique to use
- 3-4 steps to solve
- Some reasoning required
- Estimated time: 3-5 minutes

**Hard Questions:**
- Multiple concepts or techniques
- Complex expressions or word problems
- 5+ steps to solve
- Critical thinking required
- May have multiple solution paths
- Estimated time: 5-10 minutes

### Topic Prerequisites

Design prerequisites to form a logical learning path:

```
Topic A (no prerequisites)
    └── Topic B (requires A)
          └── Topic C (requires B)
                └── Topic D (requires B and C)
```

### Content Balance

For each topic, generate:
- **5 Easy exercises** - Build confidence, cover basics
- **5 Medium exercises** - Standard exam-level problems
- **5 Hard exercises** - Challenge problems, edge cases

### Theory Content Guidelines

1. Start with intuition before formal definitions
2. Include visual explanations where helpful
3. Use examples to illustrate concepts
4. Highlight common mistakes
5. Connect to real-world applications
6. Keep paragraphs short and scannable

---

## LaTeX & Math Formatting

### Inline Math
Use single dollar signs: `$x^2 + y^2 = r^2$`

### Display Math
Use double dollar signs:
```
$$
\int_0^1 x^2 \, dx = \frac{1}{3}
$$
```

### Common LaTeX Commands

```latex
% Fractions
\frac{a}{b}

% Exponents and subscripts
x^2, x_n, x^{10}, x_{n+1}

% Square roots
\sqrt{x}, \sqrt[3]{x}

% Greek letters
\alpha, \beta, \gamma, \delta, \epsilon, \varepsilon
\theta, \lambda, \mu, \pi, \sigma, \omega

% Operators
\times, \div, \pm, \mp, \cdot
\leq, \geq, \neq, \approx, \equiv

% Limits
\lim_{x \to a} f(x)
\lim_{n \to \infty} a_n

% Derivatives
f'(x), f''(x), \frac{d}{dx}, \frac{dy}{dx}
\frac{\partial f}{\partial x}

% Integrals
\int f(x) \, dx
\int_a^b f(x) \, dx
\iint, \iiint

% Summation and Product
\sum_{i=1}^{n} a_i
\prod_{i=1}^{n} a_i

% Matrices
\begin{pmatrix} a & b \\ c & d \end{pmatrix}
\begin{bmatrix} a & b \\ c & d \end{bmatrix}

% Logic
\forall, \exists, \in, \notin, \subset, \subseteq
\Rightarrow, \Leftarrow, \Leftrightarrow
\land, \lor, \neg

% Sets
\mathbb{R}, \mathbb{N}, \mathbb{Z}, \mathbb{Q}, \mathbb{C}
\emptyset, \cup, \cap, \setminus

% Trigonometry
\sin, \cos, \tan, \cot, \sec, \csc
\arcsin, \arccos, \arctan

% Special
\infty, \partial, \nabla
\boxed{answer}
```

---

## Hebrew Translation Guidelines

### Mathematical Terms

| English | Hebrew |
|---------|--------|
| Evaluate | חשב |
| Solve | פתור |
| Simplify | פשט |
| Factor | פרק לגורמים |
| Expand | פתח (סוגריים) |
| Find | מצא |
| Calculate | חשב |
| Prove | הוכח |
| Given | נתון |
| Answer | תשובה |
| Step | שלב |
| Therefore | לכן |
| Hence | מכאן |
| Let | יהי / נסמן |
| Assume | נניח |
| Show that | הראה ש |
| Determine | קבע |
| Express | בטא |

### Translation Rules

1. **LaTeX stays the same** - Math notation is universal
2. **Variables unchanged** - Keep x, y, n, etc.
3. **RTL consideration** - Hebrew reads right-to-left
4. **Natural phrasing** - Don't translate word-by-word
5. **Use standard terms** - Follow Israeli math curriculum conventions

### Example Translation

**English:**
```
Solve for x: $2x + 5 = 13$
```

**Hebrew:**
```
פתור את המשוואה עבור x: $2x + 5 = 13$
```

---

## Full Generation Prompt

Copy and use this prompt with any LLM:

---

```markdown
# Course Generation Request

You are a math education expert creating course content for DailyMath, a daily practice app for Israeli university students. Generate a complete course following these exact specifications.

## Course Details

**Course ID**: [e.g., "calculus-1"]
**Course Name (EN)**: [e.g., "Calculus 1"]
**Course Name (HE)**: [e.g., "חשבון אינפיניטסימלי 1"]
**Target Audience**: Israeli university students
**Primary Subject**: [e.g., "Limits, derivatives, and basic integration"]

## Requirements

1. **Branches**: Create 4-5 branches (categories)
2. **Topics**: Create 3-4 topics per branch (12-15 total)
3. **Prerequisites**: Define logical topic dependencies
4. **Theory**: Write markdown theory content for each topic
5. **Formulas**: Create 3-5 key formulas per topic
6. **Exercises**: Generate exactly 15 exercises per topic:
   - 5 Easy (10 XP, 1-3 min)
   - 5 Medium (15 XP, 3-5 min)
   - 5 Hard (20 XP, 5-10 min)
7. **Solutions**: Provide step-by-step solutions for all exercises
8. **Bilingual**: All content in English AND Hebrew

## Output Format

Generate valid JSON for each entity type. Use these exact schemas:

### Course JSON
{
  "id": "string (kebab-case)",
  "name": "string",
  "nameHe": "string",
  "description": "string (max 500 chars)",
  "descriptionHe": "string",
  "icon": "string (tabler:icon-name)",
  "color": "string (#RRGGBB)",
  "isActive": true,
  "sortOrder": 1,
  "branchIds": ["array", "of", "branch-ids"]
}

### Branch JSON (array)
[
  {
    "id": "string (kebab-case)",
    "name": "string",
    "nameHe": "string",
    "icon": "string (tabler:icon-name)",
    "color": "success | primary | secondary | warning | error",
    "order": 1
  }
]

### Topic JSON (array)
[
  {
    "id": "string (kebab-case, globally unique)",
    "courseId": "string",
    "name": "string",
    "nameHe": "string",
    "description": "string",
    "descriptionHe": "string",
    "branchId": "string",
    "prerequisites": ["array-of-topic-ids"],
    "order": 1,
    "difficultyLevels": ["easy", "medium", "hard"],
    "questionTypes": ["array", "of", "types"],
    "keywords": ["array", "of", "keywords"],
    "theoryContent": "markdown string with LaTeX",
    "theoryContentHe": "Hebrew markdown",
    "videoIds": [],
    "isActive": true,
    "estimatedMinutes": 30
  }
]

### Formulas JSON (array)
[
  {
    "topicId": "string",
    "courseId": "string",
    "title": "string",
    "titleHe": "string",
    "latex": "string (LaTeX)",
    "explanation": "string",
    "explanationHe": "string",
    "category": "string",
    "sortOrder": 0,
    "tags": ["array"],
    "isCore": true
  }
]

### Exercises JSON (array)
[
  {
    "id": "string ({topic-abbrev}-{e|m|h}-{###})",
    "courseId": "string",
    "topicId": "string",
    "question": "string (with $LaTeX$)",
    "questionHe": "string",
    "difficulty": "easy | medium | hard",
    "xpReward": 10,
    "answer": "string",
    "answerType": "numeric | expression | proof | open",
    "tip": "string",
    "tipHe": "string",
    "estimatedMinutes": 3,
    "isActive": true
  }
]

### Solutions JSON (array)
[
  {
    "exerciseId": "string",
    "solution": "string",
    "steps": ["Step 1...", "Step 2...", "Answer: ..."],
    "stepsHe": ["שלב 1...", "שלב 2...", "תשובה: ..."]
  }
]

## Quality Guidelines

1. **Accuracy**: All math must be correct
2. **Clarity**: Questions should be unambiguous
3. **Progression**: Easy to hard should be clear
4. **Variety**: Don't repeat similar problems
5. **Real-world**: Include application problems where appropriate
6. **Hebrew**: Use natural, standard mathematical Hebrew

## Exercise ID Convention

Use 2-4 letter abbreviations for topics:
- "limit-definition" → "lim-def"
- "derivative-rules" → "der-rul"
- "integration-by-parts" → "int-bp"

Format: `{abbrev}-{e|m|h}-{001-005}`

Example IDs for a topic:
- lim-def-e-001, lim-def-e-002, ..., lim-def-e-005
- lim-def-m-001, lim-def-m-002, ..., lim-def-m-005
- lim-def-h-001, lim-def-h-002, ..., lim-def-h-005

---

Now generate the complete course for: [COURSE NAME]
```

---

## Output Formats

### Option A: JSON Files (No Database Access)

When generating without database access, output as separate JSON files:

```
course-output/
├── course.json           # Single course object
├── branches.json         # Array of branches
├── topics.json           # Array of topics
├── formulas.json         # Array of all formulas
├── exercises.json        # Array of all exercises
└── solutions.json        # Array of all solutions
```

### Option B: Direct Database Insert (With Appwrite MCP)

When you have Appwrite MCP access, use these commands to insert data.

---

## Validation Checklist

Before finalizing the course, verify:

### Course Level
- [ ] Course ID is kebab-case and unique
- [ ] Both EN and HE names provided
- [ ] Description under 500 characters
- [ ] Valid hex color code
- [ ] Valid tabler icon name
- [ ] branchIds match actual branch IDs

### Branch Level
- [ ] All branch IDs are kebab-case
- [ ] Each branch has unique order number
- [ ] Colors are valid (success/primary/secondary/warning/error)
- [ ] Icons are valid tabler icons

### Topic Level
- [ ] All topic IDs are globally unique
- [ ] Prerequisites only reference existing topic IDs
- [ ] No circular dependencies in prerequisites
- [ ] Theory content includes LaTeX where appropriate
- [ ] Keywords are relevant for search
- [ ] Estimated minutes is realistic (5-120)

### Exercise Level
- [ ] Each topic has exactly 15 exercises (5+5+5)
- [ ] Exercise IDs follow format: `{abbrev}-{e|m|h}-{###}`
- [ ] XP rewards match difficulty (10/15/20)
- [ ] All LaTeX is valid and renders correctly
- [ ] Answers are correct and match answerType
- [ ] Tips are helpful without giving away answer

### Solution Level
- [ ] Every exercise has a corresponding solution
- [ ] Steps are clear and educational
- [ ] Both EN and HE steps provided
- [ ] Final answer is clearly marked
- [ ] LaTeX is consistent with exercise

### Translation Quality
- [ ] Hebrew reads naturally (not word-by-word translation)
- [ ] Mathematical terms use standard Israeli conventions
- [ ] LaTeX is identical in both languages
- [ ] RTL considerations are handled

---

## Appwrite MCP Commands

When you have access to Appwrite MCP, use these commands to insert data:

### Insert Course (Manual - courses are typically predefined)
The course itself is usually defined in code at `modules/courses/config/courses-data.ts`.

### Insert Topics

```
Use: mcp__appwrite-api__databases_create_document

Parameters:
- database_id: "dailymath"
- collection_id: "topics"
- document_id: [topic.id]  // Use topic ID as document ID
- data: {
    "courseId": "...",
    "name": "...",
    "nameHe": "...",
    "description": "...",
    "descriptionHe": "...",
    "branchId": "...",
    "prerequisites": "[\"topic-id-1\", \"topic-id-2\"]",  // JSON string
    "order": 1,
    "difficultyLevels": "[\"easy\", \"medium\", \"hard\"]",  // JSON string
    "questionTypes": "[\"evaluate\", \"solve\"]",  // JSON string
    "keywords": "[\"keyword1\", \"keyword2\"]",  // JSON string
    "theoryContent": "...",
    "theoryContentHe": "...",
    "videoIds": "[]",  // JSON string
    "isActive": true,
    "estimatedMinutes": 30
  }
```

### Insert Formulas

```
Use: mcp__appwrite-api__databases_create_document

Parameters:
- database_id: "dailymath"
- collection_id: "topic_formulas"
- document_id: ID.unique()
- data: {
    "topicId": "...",
    "courseId": "...",
    "title": "...",
    "titleHe": "...",
    "latex": "...",
    "explanation": "...",
    "explanationHe": "...",
    "category": "...",
    "sortOrder": 0,
    "tags": "[\"tag1\", \"tag2\"]",  // JSON string
    "isCore": true
  }
```

### Insert Exercises

```
Use: mcp__appwrite-api__databases_create_document

Parameters:
- database_id: "dailymath"
- collection_id: "exercises"
- document_id: [exercise.id]  // Use exercise ID (e.g., "lim-def-e-001")
- data: {
    "courseId": "...",
    "topicId": "...",
    "question": "...",
    "questionHe": "...",
    "difficulty": "easy",
    "xpReward": 10,
    "answer": "...",
    "answerType": "numeric",
    "tip": "...",
    "tipHe": "...",
    "estimatedMinutes": 3,
    "isActive": true
  }
```

### Insert Solutions

```
Use: mcp__appwrite-api__databases_create_document

Parameters:
- database_id: "dailymath"
- collection_id: "exercise_solutions"
- document_id: ID.unique()
- data: {
    "exerciseId": "...",
    "solution": "...",
    "steps": "[\"Step 1...\", \"Step 2...\"]",  // JSON string
    "stepsHe": "[\"שלב 1...\", \"שלב 2...\"]"  // JSON string
  }
```

### Insert Videos

```
Use: mcp__appwrite-api__databases_create_document

Parameters:
- database_id: "dailymath"
- collection_id: "topic_videos"
- document_id: ID.unique()
- data: {
    "videoId": "dQw4w9WgXcQ",  // YouTube ID
    "topicId": "...",
    "courseId": "...",
    "title": "...",
    "titleHe": "...",
    "channelName": "...",
    "thumbnailUrl": "https://i.ytimg.com/vi/VIDEO_ID/hqdefault.jpg",
    "duration": "12:34",
    "durationSeconds": 754,
    "language": "en",
    "sortOrder": 0,
    "source": "curated",
    "description": "...",
    "isActive": true
  }
```

### Bulk Insert (Multiple Documents)

For efficiency, use bulk insert when adding many items:

```
Use: mcp__appwrite-api__databases_create_documents

Parameters:
- database_id: "dailymath"
- collection_id: "exercises"
- documents: [
    { "$id": "lim-def-e-001", "courseId": "...", ... },
    { "$id": "lim-def-e-002", "courseId": "...", ... },
    ...
  ]
```

---

## Example: Complete Topic Generation

Here's an example of a fully generated topic with all components:

### Topic: Derivative Rules

```json
{
  "id": "derivative-rules",
  "courseId": "calculus-1",
  "name": "Derivative Rules",
  "nameHe": "כללי גזירה",
  "description": "Learn the fundamental rules for computing derivatives: power rule, product rule, quotient rule, and chain rule.",
  "descriptionHe": "למד את הכללים הבסיסיים לחישוב נגזרות: כלל החזקה, כלל המכפלה, כלל המנה וכלל השרשרת.",
  "branchId": "derivatives",
  "prerequisites": ["derivative-definition"],
  "order": 2,
  "difficultyLevels": ["easy", "medium", "hard"],
  "questionTypes": ["differentiate", "identify-rule", "apply-multiple-rules"],
  "keywords": ["derivative", "power rule", "product rule", "quotient rule", "chain rule"],
  "theoryContent": "## Derivative Rules\n\n### Power Rule\nFor any real number $n$:\n$$\\frac{d}{dx}[x^n] = nx^{n-1}$$\n\n### Product Rule\nFor two functions $f$ and $g$:\n$$\\frac{d}{dx}[f(x)g(x)] = f'(x)g(x) + f(x)g'(x)$$\n\n...",
  "theoryContentHe": "## כללי גזירה\n\n### כלל החזקה\nעבור כל מספר ממשי $n$:\n$$\\frac{d}{dx}[x^n] = nx^{n-1}$$\n\n...",
  "videoIds": [],
  "isActive": true,
  "estimatedMinutes": 60
}
```

### Formulas for this Topic

```json
[
  {
    "topicId": "derivative-rules",
    "courseId": "calculus-1",
    "title": "Power Rule",
    "titleHe": "כלל החזקה",
    "latex": "\\frac{d}{dx}[x^n] = nx^{n-1}",
    "explanation": "Multiply by the exponent and reduce the exponent by 1",
    "explanationHe": "הכפל במעריך והפחת 1 מהמעריך",
    "category": "basic-rules",
    "sortOrder": 1,
    "tags": ["power", "basic"],
    "isCore": true
  },
  {
    "topicId": "derivative-rules",
    "courseId": "calculus-1",
    "title": "Product Rule",
    "titleHe": "כלל המכפלה",
    "latex": "(fg)' = f'g + fg'",
    "explanation": "Derivative of first times second plus first times derivative of second",
    "explanationHe": "נגזרת הראשון כפול השני ועוד הראשון כפול נגזרת השני",
    "category": "basic-rules",
    "sortOrder": 2,
    "tags": ["product", "basic"],
    "isCore": true
  }
]
```

### Exercises (5 Easy Examples)

```json
[
  {
    "id": "der-rul-e-001",
    "courseId": "calculus-1",
    "topicId": "derivative-rules",
    "question": "Find the derivative: $f(x) = x^5$",
    "questionHe": "מצא את הנגזרת: $f(x) = x^5$",
    "difficulty": "easy",
    "xpReward": 10,
    "answer": "5x^4",
    "answerType": "expression",
    "tip": "Apply the power rule: bring down the exponent and subtract 1",
    "tipHe": "השתמש בכלל החזקה: הורד את המעריך והחסר 1",
    "estimatedMinutes": 1,
    "isActive": true
  },
  {
    "id": "der-rul-e-002",
    "courseId": "calculus-1",
    "topicId": "derivative-rules",
    "question": "Find the derivative: $f(x) = 3x^2$",
    "questionHe": "מצא את הנגזרת: $f(x) = 3x^2$",
    "difficulty": "easy",
    "xpReward": 10,
    "answer": "6x",
    "answerType": "expression",
    "tip": "Constants multiply through: (cf)' = c·f'",
    "tipHe": "קבועים עוברים כפל: (cf)' = c·f'",
    "estimatedMinutes": 1,
    "isActive": true
  }
]
```

### Solutions

```json
[
  {
    "exerciseId": "der-rul-e-001",
    "solution": "The answer is 5x^4",
    "steps": [
      "Given: $f(x) = x^5$",
      "Apply the power rule: $\\frac{d}{dx}[x^n] = nx^{n-1}$",
      "Here $n = 5$, so: $f'(x) = 5x^{5-1} = 5x^4$",
      "Answer: $\\boxed{5x^4}$"
    ],
    "stepsHe": [
      "נתון: $f(x) = x^5$",
      "נשתמש בכלל החזקה: $\\frac{d}{dx}[x^n] = nx^{n-1}$",
      "כאן $n = 5$, אז: $f'(x) = 5x^{5-1} = 5x^4$",
      "תשובה: $\\boxed{5x^4}$"
    ]
  }
]
```

---

## Tips for AI Assistants

1. **Generate in batches** - Create all topics first, then all exercises, then all solutions
2. **Validate prerequisites** - Ensure no circular dependencies
3. **Check math** - Double-check all calculations and LaTeX
4. **Maintain consistency** - Use same abbreviations throughout
5. **Balance difficulty** - Each level should be noticeably harder
6. **Quality over quantity** - Better to have fewer perfect exercises than many flawed ones

---

## Version History

- **v1.0** (2025-12-03): Initial comprehensive prompt
- Based on DailyMath codebase analysis

---

*This document is part of the DailyMath project. For questions or updates, refer to the main CLAUDE.md file.*
