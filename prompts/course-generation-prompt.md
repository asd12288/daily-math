# DailyMath Course Generation Prompt

Use this prompt with any AI LLM (GPT-4, Claude, Gemini, etc.) to generate a complete course with topics and exercises for the DailyMath platform.

---

## System Instructions

You are a math education expert creating course content for DailyMath, a daily practice app for university students. Generate structured, bilingual (English/Hebrew) content that follows the exact schema below.

---

## Course Generation Prompt

Generate a complete math course for DailyMath with the following specifications:

### Course Details
- **Course Name**: [e.g., "Pre-Calculus Algebra"]
- **Course ID**: [e.g., "pre-calculus-algebra"]
- **Target Audience**: Israeli university students
- **Languages**: English (primary) + Hebrew translations

### Requirements

1. **Structure**: Organize into 3-5 branches (categories), each with 3-5 topics
2. **Prerequisites**: Define topic dependencies (which topics must be understood before others)
3. **Exercises**: Generate 15 exercises per topic:
   - 5 Easy (10 XP each)
   - 5 Medium (15 XP each)
   - 5 Hard (20 XP each)

---

## Output Schema

### 1. Course Definition

```json
{
  "courseId": "string (kebab-case)",
  "name": "string (English)",
  "nameHe": "string (Hebrew)",
  "description": "string (English, max 200 chars)",
  "descriptionHe": "string (Hebrew, max 200 chars)",
  "icon": "string (emoji)",
  "color": "string (hex color, e.g., #6366f1)"
}
```

### 2. Branches (Categories)

```json
{
  "branches": [
    {
      "id": "string (kebab-case)",
      "name": "string (English)",
      "nameHe": "string (Hebrew)",
      "icon": "string (tabler icon name, e.g., 'tabler:plant-2')",
      "color": "string (success | primary | secondary | warning | error)",
      "order": "number (1-5)"
    }
  ]
}
```

### 3. Topics

```json
{
  "topics": [
    {
      "id": "string (kebab-case, unique)",
      "name": "string (English)",
      "nameHe": "string (Hebrew)",
      "description": "string (English, 1-2 sentences)",
      "descriptionHe": "string (Hebrew)",
      "branchId": "string (reference to branch.id)",
      "prerequisites": ["string[] (array of topic IDs that must be mastered first)"],
      "order": "number (order within branch)",
      "difficultyLevels": ["easy", "medium", "hard"],
      "questionTypes": ["string[] (e.g., 'evaluate', 'solve', 'simplify')"],
      "keywords": ["string[] (key concepts for AI generation)"]
    }
  ]
}
```

### 4. Exercises

```json
{
  "exercises": [
    {
      "id": "string (format: {topic-short}-{difficulty-letter}-{number}, e.g., 'oop-e-001')",
      "courseId": "string (reference to course)",
      "topicId": "string (reference to topic.id)",
      "question": "string (use LaTeX with $ delimiters for math, e.g., 'Evaluate: $3 + 4 \\times 2$')",
      "questionHe": "string (Hebrew translation with same LaTeX)",
      "difficulty": "easy | medium | hard",
      "xpReward": "number (easy=10, medium=15, hard=20)",
      "answer": "string (exact answer)",
      "answerType": "numeric | expression | proof | open",
      "tip": "string (helpful hint without revealing answer)",
      "tipHe": "string (Hebrew hint)",
      "estimatedMinutes": "number (1-10)",
      "solutionSteps": ["string[] (step-by-step solution)"],
      "solutionStepsHe": ["string[] (Hebrew steps)"]
    }
  ]
}
```

---

## Example: Pre-Calculus Algebra Course

### Course
```json
{
  "courseId": "pre-calculus-algebra",
  "name": "Pre-Calculus Algebra",
  "nameHe": "אלגברה לקראת חדו\"א",
  "description": "Essential algebra skills for Calculus 1, covering equations, polynomials, and functions",
  "descriptionHe": "מיומנויות אלגברה חיוניות לחדו\"א 1, כולל משוואות, פולינומים ופונקציות",
  "icon": "📐",
  "color": "#6366f1"
}
```

### Branches
```json
{
  "branches": [
    {
      "id": "foundations",
      "name": "Foundations",
      "nameHe": "יסודות",
      "icon": "tabler:plant-2",
      "color": "success",
      "order": 1
    },
    {
      "id": "linear",
      "name": "Linear Algebra",
      "nameHe": "אלגברה ליניארית",
      "icon": "tabler:line",
      "color": "primary",
      "order": 2
    },
    {
      "id": "polynomials",
      "name": "Polynomials",
      "nameHe": "פולינומים",
      "icon": "tabler:math-function",
      "color": "secondary",
      "order": 3
    },
    {
      "id": "quadratics",
      "name": "Quadratics",
      "nameHe": "משוואות ריבועיות",
      "icon": "tabler:chart-arcs",
      "color": "warning",
      "order": 4
    },
    {
      "id": "functions",
      "name": "Functions",
      "nameHe": "פונקציות",
      "icon": "tabler:chart-line",
      "color": "error",
      "order": 5
    }
  ]
}
```

### Topics (Example - Foundations Branch)
```json
{
  "topics": [
    {
      "id": "order-of-operations",
      "name": "Order of Operations",
      "nameHe": "סדר פעולות חשבון",
      "description": "PEMDAS/BODMAS rules for evaluating expressions",
      "descriptionHe": "כללי סדר פעולות לחישוב ביטויים",
      "branchId": "foundations",
      "prerequisites": [],
      "order": 1,
      "difficultyLevels": ["easy", "medium", "hard"],
      "questionTypes": ["evaluate", "identify-error", "insert-parentheses"],
      "keywords": ["parentheses", "exponents", "multiplication", "division", "PEMDAS"]
    },
    {
      "id": "fractions-decimals",
      "name": "Fractions & Decimals",
      "nameHe": "שברים ועשרוניים",
      "description": "Operations with fractions and decimal conversions",
      "descriptionHe": "פעולות בשברים והמרות עשרוניות",
      "branchId": "foundations",
      "prerequisites": ["order-of-operations"],
      "order": 2,
      "difficultyLevels": ["easy", "medium", "hard"],
      "questionTypes": ["simplify", "convert", "add-subtract", "multiply-divide"],
      "keywords": ["fraction", "decimal", "numerator", "denominator", "simplify"]
    },
    {
      "id": "basic-equations",
      "name": "Basic Equations",
      "nameHe": "משוואות בסיסיות",
      "description": "Solving simple one-step and two-step equations",
      "descriptionHe": "פתרון משוואות פשוטות בשלב אחד או שניים",
      "branchId": "foundations",
      "prerequisites": ["fractions-decimals"],
      "order": 3,
      "difficultyLevels": ["easy", "medium", "hard"],
      "questionTypes": ["solve-for-x", "word-problem", "check-solution"],
      "keywords": ["equation", "solve", "variable", "isolate"]
    }
  ]
}
```

### Exercises (Example - Order of Operations)
```json
{
  "exercises": [
    {
      "id": "oop-e-001",
      "courseId": "pre-calculus-algebra",
      "topicId": "order-of-operations",
      "question": "Evaluate: $3 + 4 \\times 2$",
      "questionHe": "חשב: $3 + 4 \\times 2$",
      "difficulty": "easy",
      "xpReward": 10,
      "answer": "11",
      "answerType": "numeric",
      "tip": "Remember PEMDAS: Multiplication before Addition",
      "tipHe": "זכור סדר פעולות: כפל לפני חיבור",
      "estimatedMinutes": 2,
      "solutionSteps": [
        "Given: 3 + 4 × 2",
        "Step 1: Apply multiplication first (PEMDAS)",
        "4 × 2 = 8",
        "Step 2: Add the remaining terms",
        "3 + 8 = 11",
        "Answer: 11"
      ],
      "solutionStepsHe": [
        "נתון: 3 + 4 × 2",
        "שלב 1: בצע כפל קודם (סדר פעולות)",
        "4 × 2 = 8",
        "שלב 2: חבר את השאר",
        "3 + 8 = 11",
        "תשובה: 11"
      ]
    },
    {
      "id": "oop-e-002",
      "courseId": "pre-calculus-algebra",
      "topicId": "order-of-operations",
      "question": "Evaluate: $(5 + 3) \\times 2$",
      "questionHe": "חשב: $(5 + 3) \\times 2$",
      "difficulty": "easy",
      "xpReward": 10,
      "answer": "16",
      "answerType": "numeric",
      "tip": "Parentheses first",
      "tipHe": "סוגריים קודם",
      "estimatedMinutes": 2,
      "solutionSteps": [
        "Given: (5 + 3) × 2",
        "Step 1: Solve parentheses first",
        "5 + 3 = 8",
        "Step 2: Multiply",
        "8 × 2 = 16",
        "Answer: 16"
      ],
      "solutionStepsHe": [
        "נתון: (5 + 3) × 2",
        "שלב 1: פתור סוגריים קודם",
        "5 + 3 = 8",
        "שלב 2: כפל",
        "8 × 2 = 16",
        "תשובה: 16"
      ]
    },
    {
      "id": "oop-m-001",
      "courseId": "pre-calculus-algebra",
      "topicId": "order-of-operations",
      "question": "Evaluate: $2 + 3 \\times 4 - 6 \\div 2$",
      "questionHe": "חשב: $2 + 3 \\times 4 - 6 \\div 2$",
      "difficulty": "medium",
      "xpReward": 15,
      "answer": "11",
      "answerType": "numeric",
      "tip": "Do multiplication and division first (left to right)",
      "tipHe": "בצע כפל וחילוק קודם (משמאל לימין)",
      "estimatedMinutes": 3,
      "solutionSteps": [
        "Given: 2 + 3 × 4 - 6 ÷ 2",
        "Step 1: Multiplication: 3 × 4 = 12",
        "Step 2: Division: 6 ÷ 2 = 3",
        "Step 3: Rewrite: 2 + 12 - 3",
        "Step 4: Left to right: 2 + 12 = 14, then 14 - 3 = 11",
        "Answer: 11"
      ],
      "solutionStepsHe": [
        "נתון: 2 + 3 × 4 - 6 ÷ 2",
        "שלב 1: כפל: 3 × 4 = 12",
        "שלב 2: חילוק: 6 ÷ 2 = 3",
        "שלב 3: רשום מחדש: 2 + 12 - 3",
        "שלב 4: משמאל לימין: 2 + 12 = 14, אז 14 - 3 = 11",
        "תשובה: 11"
      ]
    },
    {
      "id": "oop-h-001",
      "courseId": "pre-calculus-algebra",
      "topicId": "order-of-operations",
      "question": "Evaluate: $((2 + 3)^2 - 5) \\div 4 + 2^3$",
      "questionHe": "חשב: $((2 + 3)^2 - 5) \\div 4 + 2^3$",
      "difficulty": "hard",
      "xpReward": 20,
      "answer": "13",
      "answerType": "numeric",
      "tip": "Work from innermost parentheses outward",
      "tipHe": "עבוד מהסוגריים הפנימיים החוצה",
      "estimatedMinutes": 5,
      "solutionSteps": [
        "Given: ((2 + 3)² - 5) ÷ 4 + 2³",
        "Step 1: Innermost parentheses: 2 + 3 = 5",
        "Step 2: Exponent: 5² = 25",
        "Step 3: Subtraction in parentheses: 25 - 5 = 20",
        "Step 4: Division: 20 ÷ 4 = 5",
        "Step 5: Calculate 2³ = 8",
        "Step 6: Add: 5 + 8 = 13",
        "Answer: 13"
      ],
      "solutionStepsHe": [
        "נתון: ((2 + 3)² - 5) ÷ 4 + 2³",
        "שלב 1: סוגריים פנימיים: 2 + 3 = 5",
        "שלב 2: חזקה: 5² = 25",
        "שלב 3: חיסור בסוגריים: 25 - 5 = 20",
        "שלב 4: חילוק: 20 ÷ 4 = 5",
        "שלב 5: חשב 2³ = 8",
        "שלב 6: חבר: 5 + 8 = 13",
        "תשובה: 13"
      ]
    }
  ]
}
```

---

## Exercise Design Guidelines

### Difficulty Progression

**Easy (10 XP)**
- Single operation or simple combination
- Clear, direct application of concept
- 1-2 steps to solve
- Estimated time: 1-2 minutes

**Medium (15 XP)**
- 2-3 operations combined
- May require identifying which rule applies
- 3-4 steps to solve
- Estimated time: 3-4 minutes

**Hard (20 XP)**
- Multiple nested operations
- Complex expressions or word problems
- 5+ steps to solve
- May combine multiple concepts
- Estimated time: 5-8 minutes

### LaTeX Formatting

Use `$...$` for inline math:
- Fractions: `$\\frac{a}{b}$`
- Exponents: `$x^2$` or `$2^{10}$`
- Square roots: `$\\sqrt{x}$`
- Greek letters: `$\\alpha$`, `$\\beta$`
- Multiplication: `$\\times$` (avoid *)
- Division: `$\\div$`
- Comparison: `$\\leq$`, `$\\geq$`, `$\\neq$`

### Answer Types

- **numeric**: Single number answer (e.g., "11", "-3", "0.5")
- **expression**: Mathematical expression (e.g., "3x + 2", "(x-1)(x+2)")
- **proof**: Logical proof or derivation required
- **open**: Free-form answer with multiple valid responses

### Hebrew Translation Guidelines

1. Mathematical notation stays the same (LaTeX is universal)
2. Translate instruction words ("Evaluate" → "חשב", "Solve" → "פתור")
3. Keep variable names (x, y, n) unchanged
4. Use Hebrew mathematical terms where standard

Common translations:
- Evaluate → חשב
- Solve → פתור
- Simplify → פשט
- Factor → פרק לגורמים
- Expand → פתח (סוגריים)
- Find → מצא
- Calculate → חשב
- Prove → הוכח
- Given → נתון
- Answer → תשובה
- Step → שלב

---

## Full Course Request Template

```
Generate a complete course for DailyMath:

**Course**: [Course Name]
**Focus**: [Main concepts to cover]
**Branches**: [Number of branches, e.g., 5]
**Topics per Branch**: [Number, e.g., 3]
**Exercises per Topic**: 15 (5 easy, 5 medium, 5 hard)

Please provide:
1. Course definition (JSON)
2. All branches (JSON array)
3. All topics with prerequisites (JSON array)
4. All exercises with solutions (JSON array)

Follow the schema exactly as shown in the examples above.
Ensure all Hebrew translations are accurate and natural for Israeli students.
```

---

## Quick Reference: ID Formats

| Type | Format | Example |
|------|--------|---------|
| Course | kebab-case | `pre-calculus-algebra` |
| Branch | kebab-case | `foundations` |
| Topic | kebab-case | `order-of-operations` |
| Exercise | `{topic-abbrev}-{e\|m\|h}-{###}` | `oop-e-001`, `oop-m-005`, `oop-h-003` |

---

## Validation Checklist

Before using the generated content:

- [ ] All IDs are unique and follow the format
- [ ] Prerequisites only reference existing topic IDs
- [ ] Each topic has exactly 15 exercises (5+5+5)
- [ ] XP rewards match difficulty (10/15/20)
- [ ] All Hebrew translations are provided
- [ ] LaTeX is properly formatted with `$...$`
- [ ] Solution steps are clear and educational
- [ ] Answer types match the expected answer format
- [ ] Each exercise has 2-6 solution steps

---

## Database Storage Notes

When importing generated content into Appwrite, note the following:

### Two-Table Structure for Exercises

**`exercises` collection** stores:
- `courseId`, `topicId`
- `question`, `questionHe`
- `difficulty`, `xpReward`
- `answer`, `answerType`
- `tip`, `tipHe`
- `estimatedMinutes`
- `isActive` (default: true)
- `generatedBy`, `generatedAt`, `timesUsed`, `averageRating`

**`exercise_solutions` collection** stores (separate table):
- `exerciseId` (reference to exercise)
- `solution` (full solution text)
- `steps` (JSON string array of solution steps)
- `stepsHe` (JSON string array of Hebrew steps)

### Field Mapping

| Prompt Field | DB Field | Notes |
|-------------|----------|-------|
| `question` | `question` | Max 5000 chars |
| `questionHe` | `questionHe` | Max 5000 chars |
| `answer` | `answer` | Max 500 chars |
| `answerType` | `answerType` | enum: numeric, expression, proof, open |
| `tip` | `tip` | Max 1000 chars |
| `tipHe` | `tipHe` | Max 1000 chars |
| `solutionSteps` | `steps` (in exercise_solutions) | Stored as JSON string |
| `solutionStepsHe` | `stepsHe` (in exercise_solutions) | Stored as JSON string |

### Import Script Example

```typescript
import { toExerciseCreateData, toSolutionCreateData } from "@/modules/ai/server/services";

// For each generated exercise:
const exerciseData = toExerciseCreateData(generatedExercise, courseId, topicId);
const exerciseDoc = await databases.createDocument("dailymath", "exercises", ID.unique(), exerciseData);

const solutionData = toSolutionCreateData(generatedExercise, exerciseDoc.$id);
await databases.createDocument("dailymath", "exercise_solutions", ID.unique(), solutionData);
```
