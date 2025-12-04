/**
 * Seed Calculus 1 Course - Phase 1
 * Creates the course document and all 15 topics with theory content
 */

import { Client, Databases } from "node-appwrite";

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("6929739f0023a7777f65")
  .setKey(process.env.APPWRITE_API_KEY || "standard_3e263bf7aa3910bdfc73e9c8989d51e3842c46df7401319705c3c043aa6aa1de846eeb6575b9d8b925d8370b4b6c69dee283308a4a0486c17dad29d560746cce8cc36ac221540dbd98b3d133f9118f400a8f9ab8c0cab5b442fe311bbb87e24b7915213d97e826c0a8a2d7b844bef4d28c022b08a4b208682e104c66dc16c9aa");

const databases = new Databases(client);
const DATABASE_ID = "dailymath";
const COURSE_ID = "calculus-1";

// ============================================
// COURSE DEFINITION
// ============================================

const COURSE = {
  name: "Calculus 1",
  nameHe: "חשבון אינפיניטסימלי 1",
  description: "Master limits, derivatives, and integrals with step-by-step practice. Essential foundations for engineering, physics, and advanced mathematics.",
  descriptionHe: "שליטה בגבולות, נגזרות ואינטגרלים עם תרגול צעד אחר צעד. יסודות חיוניים להנדסה, פיזיקה ומתמטיקה מתקדמת.",
  icon: "📐",
  color: "#3B82F6",
  isActive: true,
  sortOrder: 1,
};

// ============================================
// TOPICS DEFINITION (15 topics)
// ============================================

const TOPICS = [
  // ========== BRANCH 1: LIMITS (3 topics) ==========
  {
    id: "limit-definition",
    name: "Limit Definition & Intuition",
    nameHe: "הגדרת גבול ואינטואיציה",
    description: "Understanding what limits mean, evaluating limits graphically and numerically, one-sided limits",
    descriptionHe: "הבנת משמעות הגבולות, חישוב גבולות בדרך גרפית ומספרית, גבולות חד-צדדיים",
    branchId: "limits",
    prerequisites: [],
    order: 1,
    questionTypes: ["evaluate-graphically", "one-sided-limits", "limit-existence", "limit-from-table"],
    keywords: ["limit", "approach", "one-sided", "left-limit", "right-limit"],
    estimatedMinutes: 45,
    theoryContent: `## What is a Limit?

A **limit** describes the value that a function approaches as the input approaches some value.

### Notation

$$\\lim_{x \\to a} f(x) = L$$

This reads: "The limit of $f(x)$ as $x$ approaches $a$ equals $L$."

### Intuitive Understanding

Think of a limit as answering: **"What value is the function getting closer and closer to?"**

The key insight is that we care about what happens **near** the point, not necessarily **at** the point.

### Example

Consider $f(x) = \\frac{x^2 - 1}{x - 1}$ as $x \\to 1$:

- We can't plug in $x = 1$ (division by zero!)
- But as $x$ gets closer to 1, what does $f(x)$ approach?
- Factor: $\\frac{(x-1)(x+1)}{x-1} = x + 1$ (for $x \\neq 1$)
- So $\\lim_{x \\to 1} f(x) = 2$

### One-Sided Limits

**Left-hand limit:** $\\lim_{x \\to a^-} f(x)$ — approaching from values less than $a$

**Right-hand limit:** $\\lim_{x \\to a^+} f(x)$ — approaching from values greater than $a$

> **Important:** The two-sided limit exists if and only if both one-sided limits exist and are equal.

### Common Mistakes

1. ❌ Assuming $\\lim_{x \\to a} f(x) = f(a)$ always (only true for continuous functions)
2. ❌ Ignoring one-sided limits when they differ
3. ❌ Giving up when direct substitution gives $\\frac{0}{0}$`,
    theoryContentHe: `## מהו גבול?

**גבול** מתאר את הערך שאליו פונקציה מתקרבת כאשר הקלט מתקרב לערך מסוים.

### סימון

$$\\lim_{x \\to a} f(x) = L$$

קוראים זאת: "הגבול של $f(x)$ כאשר $x$ שואף ל-$a$ שווה $L$."

### הבנה אינטואיטיבית

חשבו על גבול כתשובה לשאלה: **"לאיזה ערך הפונקציה מתקרבת יותר ויותר?"**

התובנה המרכזית היא שאנו מתעניינים במה שקורה **ליד** הנקודה, לא בהכרח **בנקודה** עצמה.

### גבולות חד-צדדיים

**גבול שמאלי:** $\\lim_{x \\to a^-} f(x)$ — התקרבות מערכים קטנים מ-$a$

**גבול ימני:** $\\lim_{x \\to a^+} f(x)$ — התקרבות מערכים גדולים מ-$a$

> **חשוב:** הגבול הדו-צדדי קיים אם ורק אם שני הגבולות החד-צדדיים קיימים ושווים.`,
  },
  {
    id: "limit-laws",
    name: "Limit Laws & Techniques",
    nameHe: "חוקי גבולות וטכניקות",
    description: "Sum, product, quotient rules for limits. Algebraic techniques: factoring, rationalizing, conjugates",
    descriptionHe: "חוקי חיבור, כפל וחילוק לגבולות. טכניקות אלגבריות: פירוק לגורמים, רציונליזציה, צמודים",
    branchId: "limits",
    prerequisites: ["limit-definition"],
    order: 2,
    questionTypes: ["apply-limit-laws", "factor-and-cancel", "rationalize", "squeeze-theorem"],
    keywords: ["sum-rule", "product-rule", "quotient-rule", "factoring", "rationalize"],
    estimatedMinutes: 50,
    theoryContent: `## Limit Laws

If $\\lim_{x \\to a} f(x) = L$ and $\\lim_{x \\to a} g(x) = M$, then:

### Basic Laws

1. **Sum Rule:** $\\lim_{x \\to a} [f(x) + g(x)] = L + M$

2. **Difference Rule:** $\\lim_{x \\to a} [f(x) - g(x)] = L - M$

3. **Product Rule:** $\\lim_{x \\to a} [f(x) \\cdot g(x)] = L \\cdot M$

4. **Quotient Rule:** $\\lim_{x \\to a} \\frac{f(x)}{g(x)} = \\frac{L}{M}$ (if $M \\neq 0$)

5. **Power Rule:** $\\lim_{x \\to a} [f(x)]^n = L^n$

6. **Constant Multiple:** $\\lim_{x \\to a} [c \\cdot f(x)] = c \\cdot L$

### Special Limits

$$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$$

$$\\lim_{x \\to 0} \\frac{1 - \\cos x}{x} = 0$$

### Techniques for Indeterminate Forms

When you get $\\frac{0}{0}$, try:

1. **Factoring:** Factor numerator and denominator, cancel common terms
2. **Rationalizing:** Multiply by conjugate (useful with square roots)
3. **Common denominator:** Combine fractions first

### Example: Factoring

$$\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2} = \\lim_{x \\to 2} \\frac{(x-2)(x+2)}{x-2} = \\lim_{x \\to 2} (x+2) = 4$$

### Example: Rationalizing

$$\\lim_{x \\to 0} \\frac{\\sqrt{x+1} - 1}{x} = \\lim_{x \\to 0} \\frac{(\\sqrt{x+1} - 1)(\\sqrt{x+1} + 1)}{x(\\sqrt{x+1} + 1)} = \\lim_{x \\to 0} \\frac{x}{x(\\sqrt{x+1} + 1)} = \\frac{1}{2}$$`,
    theoryContentHe: `## חוקי גבולות

אם $\\lim_{x \\to a} f(x) = L$ ו-$\\lim_{x \\to a} g(x) = M$, אז:

### חוקים בסיסיים

1. **כלל הסכום:** $\\lim_{x \\to a} [f(x) + g(x)] = L + M$

2. **כלל ההפרש:** $\\lim_{x \\to a} [f(x) - g(x)] = L - M$

3. **כלל המכפלה:** $\\lim_{x \\to a} [f(x) \\cdot g(x)] = L \\cdot M$

4. **כלל המנה:** $\\lim_{x \\to a} \\frac{f(x)}{g(x)} = \\frac{L}{M}$ (אם $M \\neq 0$)

5. **כלל החזקה:** $\\lim_{x \\to a} [f(x)]^n = L^n$

### גבולות מיוחדים

$$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$$

$$\\lim_{x \\to 0} \\frac{1 - \\cos x}{x} = 0$$

### טכניקות לצורות לא מוגדרות

כאשר מקבלים $\\frac{0}{0}$, נסו:

1. **פירוק לגורמים:** פרקו מונה ומכנה, צמצמו גורמים משותפים
2. **רציונליזציה:** הכפילו בצמוד (שימושי עם שורשים)
3. **מכנה משותף:** אחדו שברים תחילה`,
  },
  {
    id: "continuity",
    name: "Continuity",
    nameHe: "רציפות",
    description: "Definition of continuity, types of discontinuities, Intermediate Value Theorem",
    descriptionHe: "הגדרת רציפות, סוגי אי-רציפות, משפט ערך הביניים",
    branchId: "limits",
    prerequisites: ["limit-laws"],
    order: 3,
    questionTypes: ["check-continuity", "find-discontinuities", "removable-discontinuity", "IVT-application"],
    keywords: ["continuous", "discontinuity", "removable", "jump", "infinite", "IVT"],
    estimatedMinutes: 45,
    theoryContent: `## Continuity

A function $f$ is **continuous at** $x = a$ if three conditions hold:

1. $f(a)$ is defined
2. $\\lim_{x \\to a} f(x)$ exists
3. $\\lim_{x \\to a} f(x) = f(a)$

### Types of Discontinuities

**Removable Discontinuity:** The limit exists but doesn't equal $f(a)$ (or $f(a)$ is undefined). Can be "fixed" by redefining one point.

**Jump Discontinuity:** Left and right limits exist but are not equal.
$$\\lim_{x \\to a^-} f(x) \\neq \\lim_{x \\to a^+} f(x)$$

**Infinite Discontinuity:** The function approaches $\\pm\\infty$ (vertical asymptote).

### Continuous Functions

These are continuous everywhere in their domain:
- Polynomials
- Rational functions (where denominator ≠ 0)
- $\\sin x$, $\\cos x$, $e^x$, $\\ln x$ (where defined)

### Intermediate Value Theorem (IVT)

If $f$ is continuous on $[a, b]$ and $k$ is any value between $f(a)$ and $f(b)$, then there exists at least one $c$ in $(a, b)$ such that $f(c) = k$.

**Application:** Proving roots exist! If $f$ is continuous and $f(a) < 0 < f(b)$, then $f$ has a root in $(a, b)$.

### Limits at Infinity

$$\\lim_{x \\to \\infty} \\frac{1}{x^n} = 0 \\quad (n > 0)$$

**Horizontal Asymptote:** If $\\lim_{x \\to \\pm\\infty} f(x) = L$, then $y = L$ is a horizontal asymptote.`,
    theoryContentHe: `## רציפות

פונקציה $f$ **רציפה ב-**$x = a$ אם שלושה תנאים מתקיימים:

1. $f(a)$ מוגדר
2. $\\lim_{x \\to a} f(x)$ קיים
3. $\\lim_{x \\to a} f(x) = f(a)$

### סוגי אי-רציפות

**אי-רציפות סליקה:** הגבול קיים אך לא שווה ל-$f(a)$ (או $f(a)$ לא מוגדר). ניתן "לתקן" על ידי הגדרה מחדש של נקודה אחת.

**אי-רציפות קפיצה:** גבולות שמאלי וימני קיימים אך לא שווים.

**אי-רציפות אינסופית:** הפונקציה שואפת ל-$\\pm\\infty$ (אסימפטוטה אנכית).

### משפט ערך הביניים (IVT)

אם $f$ רציפה על $[a, b]$ ו-$k$ הוא ערך כלשהו בין $f(a)$ ל-$f(b)$, אז קיים לפחות $c$ אחד ב-$(a, b)$ כך ש-$f(c) = k$.

**יישום:** הוכחת קיום שורשים! אם $f$ רציפה ו-$f(a) < 0 < f(b)$, אז ל-$f$ יש שורש ב-$(a, b)$.`,
  },

  // ========== BRANCH 2: BASIC DERIVATIVES (4 topics) ==========
  {
    id: "derivative-definition",
    name: "Derivative Definition",
    nameHe: "הגדרת הנגזרת",
    description: "The derivative as a limit, difference quotient, tangent line slope, rate of change",
    descriptionHe: "הנגזרת כגבול, מנת ההפרשים, שיפוע המשיק, קצב שינוי",
    branchId: "derivatives-basic",
    prerequisites: ["continuity"],
    order: 4,
    questionTypes: ["limit-definition", "difference-quotient", "tangent-slope", "rate-of-change"],
    keywords: ["derivative", "difference-quotient", "tangent", "slope", "instantaneous"],
    estimatedMinutes: 50,
    theoryContent: `## The Derivative

The **derivative** of $f$ at $x$ is defined as:

$$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$

This is also written as $\\frac{df}{dx}$ or $\\frac{dy}{dx}$.

### Alternative Definition

$$f'(a) = \\lim_{x \\to a} \\frac{f(x) - f(a)}{x - a}$$

### What Does the Derivative Mean?

1. **Geometrically:** The slope of the tangent line to the graph at that point
2. **Physically:** The instantaneous rate of change
3. **Algebraically:** The limit of the difference quotient

### Tangent Line Equation

The tangent line to $y = f(x)$ at $x = a$ is:

$$y - f(a) = f'(a)(x - a)$$

Or equivalently: $y = f(a) + f'(a)(x - a)$

### Example: Finding Derivative from Definition

Find $f'(x)$ for $f(x) = x^2$:

$$f'(x) = \\lim_{h \\to 0} \\frac{(x+h)^2 - x^2}{h} = \\lim_{h \\to 0} \\frac{x^2 + 2xh + h^2 - x^2}{h}$$

$$= \\lim_{h \\to 0} \\frac{2xh + h^2}{h} = \\lim_{h \\to 0} (2x + h) = 2x$$

### Differentiability

A function is **differentiable** at $a$ if $f'(a)$ exists.

If $f$ is differentiable at $a$, then $f$ is continuous at $a$. (But continuous doesn't imply differentiable!)`,
    theoryContentHe: `## הנגזרת

**הנגזרת** של $f$ ב-$x$ מוגדרת כ:

$$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$

### משמעות הנגזרת

1. **גאומטרית:** שיפוע המשיק לגרף באותה נקודה
2. **פיזיקלית:** קצב שינוי רגעי
3. **אלגברית:** גבול מנת ההפרשים

### משוואת המשיק

המשיק ל-$y = f(x)$ ב-$x = a$ הוא:

$$y - f(a) = f'(a)(x - a)$$

### גזירות

פונקציה **גזירה** ב-$a$ אם $f'(a)$ קיים.

אם $f$ גזירה ב-$a$, אז $f$ רציפה ב-$a$. (אבל רציפות לא גוררת גזירות!)`,
  },
  {
    id: "basic-rules",
    name: "Basic Differentiation Rules",
    nameHe: "כללי גזירה בסיסיים",
    description: "Power rule, constant rule, sum/difference rules, constant multiple rule",
    descriptionHe: "כלל החזקה, כלל הקבוע, כללי חיבור/חיסור, כפל בקבוע",
    branchId: "derivatives-basic",
    prerequisites: ["derivative-definition"],
    order: 5,
    questionTypes: ["power-rule", "sum-difference", "constant-multiple", "polynomial-derivative"],
    keywords: ["power-rule", "constant", "sum", "polynomial"],
    estimatedMinutes: 40,
    theoryContent: `## Basic Differentiation Rules

### Constant Rule
$$\\frac{d}{dx}[c] = 0$$

### Power Rule
$$\\frac{d}{dx}[x^n] = nx^{n-1}$$

This works for any real number $n$ (including negative and fractional).

### Constant Multiple Rule
$$\\frac{d}{dx}[c \\cdot f(x)] = c \\cdot f'(x)$$

### Sum Rule
$$\\frac{d}{dx}[f(x) + g(x)] = f'(x) + g'(x)$$

### Difference Rule
$$\\frac{d}{dx}[f(x) - g(x)] = f'(x) - g'(x)$$

### Examples

**Example 1:** $f(x) = 5x^3$
$$f'(x) = 5 \\cdot 3x^2 = 15x^2$$

**Example 2:** $f(x) = x^4 - 3x^2 + 7x - 2$
$$f'(x) = 4x^3 - 6x + 7$$

**Example 3:** $f(x) = \\frac{1}{x^2} = x^{-2}$
$$f'(x) = -2x^{-3} = -\\frac{2}{x^3}$$

**Example 4:** $f(x) = \\sqrt{x} = x^{1/2}$
$$f'(x) = \\frac{1}{2}x^{-1/2} = \\frac{1}{2\\sqrt{x}}$$`,
    theoryContentHe: `## כללי גזירה בסיסיים

### כלל הקבוע
$$\\frac{d}{dx}[c] = 0$$

### כלל החזקה
$$\\frac{d}{dx}[x^n] = nx^{n-1}$$

עובד לכל מספר ממשי $n$ (כולל שלילי ושברי).

### כלל הכפל בקבוע
$$\\frac{d}{dx}[c \\cdot f(x)] = c \\cdot f'(x)$$

### כלל הסכום
$$\\frac{d}{dx}[f(x) + g(x)] = f'(x) + g'(x)$$

### כלל ההפרש
$$\\frac{d}{dx}[f(x) - g(x)] = f'(x) - g'(x)$$`,
  },
  {
    id: "product-quotient",
    name: "Product & Quotient Rules",
    nameHe: "כללי מכפלה ומנה",
    description: "Derivatives of products and quotients of functions",
    descriptionHe: "נגזרות של מכפלות ומנות של פונקציות",
    branchId: "derivatives-basic",
    prerequisites: ["basic-rules"],
    order: 6,
    questionTypes: ["product-rule", "quotient-rule", "combined-rules"],
    keywords: ["product", "quotient", "rational-function"],
    estimatedMinutes: 50,
    theoryContent: `## Product Rule

For two functions $f$ and $g$:

$$\\frac{d}{dx}[f(x) \\cdot g(x)] = f'(x) \\cdot g(x) + f(x) \\cdot g'(x)$$

**Memory aid:** "First times derivative of second, plus second times derivative of first"

### Example
$h(x) = x^2 \\sin x$

$h'(x) = 2x \\cdot \\sin x + x^2 \\cdot \\cos x$

## Quotient Rule

$$\\frac{d}{dx}\\left[\\frac{f(x)}{g(x)}\\right] = \\frac{f'(x) \\cdot g(x) - f(x) \\cdot g'(x)}{[g(x)]^2}$$

**Memory aid:** "Low d-high minus high d-low, over low squared"

### Example
$h(x) = \\frac{x^2}{x + 1}$

$$h'(x) = \\frac{2x(x+1) - x^2 \\cdot 1}{(x+1)^2} = \\frac{2x^2 + 2x - x^2}{(x+1)^2} = \\frac{x^2 + 2x}{(x+1)^2}$$

### Special Case
$$\\frac{d}{dx}\\left[\\frac{1}{g(x)}\\right] = -\\frac{g'(x)}{[g(x)]^2}$$

### When to Use Which?

- **Product Rule:** When multiplying two "complicated" functions
- **Quotient Rule:** When dividing by something more complex than $x^n$
- Sometimes it's easier to rewrite first (e.g., $\\frac{x^3}{x^2} = x$)`,
    theoryContentHe: `## כלל המכפלה

עבור שתי פונקציות $f$ ו-$g$:

$$\\frac{d}{dx}[f(x) \\cdot g(x)] = f'(x) \\cdot g(x) + f(x) \\cdot g'(x)$$

## כלל המנה

$$\\frac{d}{dx}\\left[\\frac{f(x)}{g(x)}\\right] = \\frac{f'(x) \\cdot g(x) - f(x) \\cdot g'(x)}{[g(x)]^2}$$

### מקרה מיוחד
$$\\frac{d}{dx}\\left[\\frac{1}{g(x)}\\right] = -\\frac{g'(x)}{[g(x)]^2}$$`,
  },
  {
    id: "trig-derivatives",
    name: "Trigonometric Derivatives",
    nameHe: "נגזרות טריגונומטריות",
    description: "Derivatives of sin, cos, tan, sec, csc, cot",
    descriptionHe: "נגזרות של sin, cos, tan, sec, csc, cot",
    branchId: "derivatives-basic",
    prerequisites: ["product-quotient"],
    order: 7,
    questionTypes: ["basic-trig", "trig-with-rules", "trig-compositions"],
    keywords: ["sin", "cos", "tan", "sec", "csc", "cot", "trigonometric"],
    estimatedMinutes: 45,
    theoryContent: `## Trigonometric Derivatives

### The Six Basic Trig Derivatives

$$\\frac{d}{dx}[\\sin x] = \\cos x$$

$$\\frac{d}{dx}[\\cos x] = -\\sin x$$

$$\\frac{d}{dx}[\\tan x] = \\sec^2 x$$

$$\\frac{d}{dx}[\\cot x] = -\\csc^2 x$$

$$\\frac{d}{dx}[\\sec x] = \\sec x \\tan x$$

$$\\frac{d}{dx}[\\csc x] = -\\csc x \\cot x$$

### Memory Tips

- **sin → cos:** Positive, no sign change
- **cos → sin:** Negative sign appears
- **tan → sec²:** Think of $\\tan x = \\frac{\\sin x}{\\cos x}$
- **sec, csc:** Each has the same trig function in its derivative

### Why These Work

$\\frac{d}{dx}[\\tan x] = \\frac{d}{dx}\\left[\\frac{\\sin x}{\\cos x}\\right]$

Using quotient rule:
$= \\frac{\\cos x \\cdot \\cos x - \\sin x \\cdot (-\\sin x)}{\\cos^2 x} = \\frac{\\cos^2 x + \\sin^2 x}{\\cos^2 x} = \\frac{1}{\\cos^2 x} = \\sec^2 x$

### Examples

**Example 1:** $f(x) = x^2 \\cos x$

$f'(x) = 2x \\cos x + x^2(-\\sin x) = 2x \\cos x - x^2 \\sin x$

**Example 2:** $f(x) = \\frac{\\sin x}{x}$

$f'(x) = \\frac{x \\cos x - \\sin x}{x^2}$`,
    theoryContentHe: `## נגזרות טריגונומטריות

### שש הנגזרות הבסיסיות

$$\\frac{d}{dx}[\\sin x] = \\cos x$$

$$\\frac{d}{dx}[\\cos x] = -\\sin x$$

$$\\frac{d}{dx}[\\tan x] = \\sec^2 x$$

$$\\frac{d}{dx}[\\cot x] = -\\csc^2 x$$

$$\\frac{d}{dx}[\\sec x] = \\sec x \\tan x$$

$$\\frac{d}{dx}[\\csc x] = -\\csc x \\cot x$$`,
  },

  // ========== BRANCH 3: ADVANCED DERIVATIVES (3 topics) ==========
  {
    id: "chain-rule",
    name: "Chain Rule",
    nameHe: "כלל השרשרת",
    description: "Derivatives of composite functions, nested functions",
    descriptionHe: "נגזרות של פונקציות מורכבות, פונקציות מקוננות",
    branchId: "derivatives-advanced",
    prerequisites: ["trig-derivatives"],
    order: 8,
    questionTypes: ["basic-chain", "nested-chain", "chain-with-trig", "multiple-chain"],
    keywords: ["chain-rule", "composite", "inner", "outer", "nested"],
    estimatedMinutes: 55,
    theoryContent: `## The Chain Rule

For a composite function $f(g(x))$:

$$\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)$$

**In words:** "Derivative of the outer function (evaluated at the inner) times derivative of the inner function"

### Leibniz Notation

If $y = f(u)$ and $u = g(x)$:

$$\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}$$

### Generalized Power Rule

$$\\frac{d}{dx}[u^n] = n \\cdot u^{n-1} \\cdot \\frac{du}{dx}$$

### Examples

**Example 1:** $f(x) = (3x + 1)^5$

Let $u = 3x + 1$, then $f = u^5$

$f'(x) = 5u^4 \\cdot 3 = 5(3x+1)^4 \\cdot 3 = 15(3x+1)^4$

**Example 2:** $f(x) = \\sin(x^2)$

$f'(x) = \\cos(x^2) \\cdot 2x = 2x\\cos(x^2)$

**Example 3:** $f(x) = \\sqrt{1 + x^2}$

$f'(x) = \\frac{1}{2}(1+x^2)^{-1/2} \\cdot 2x = \\frac{x}{\\sqrt{1+x^2}}$

**Example 4 (Multiple Chain):** $f(x) = \\sin^3(2x) = [\\sin(2x)]^3$

$f'(x) = 3[\\sin(2x)]^2 \\cdot \\cos(2x) \\cdot 2 = 6\\sin^2(2x)\\cos(2x)$

### Common Pattern
$$\\frac{d}{dx}[\\sin(u)] = \\cos(u) \\cdot u'$$
$$\\frac{d}{dx}[e^u] = e^u \\cdot u'$$
$$\\frac{d}{dx}[\\ln(u)] = \\frac{1}{u} \\cdot u'$$`,
    theoryContentHe: `## כלל השרשרת

עבור פונקציה מורכבת $f(g(x))$:

$$\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)$$

**במילים:** "נגזרת הפונקציה החיצונית (מוצבת בפנימית) כפול נגזרת הפונקציה הפנימית"

### סימון לייבניץ

אם $y = f(u)$ ו-$u = g(x)$:

$$\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}$$

### כלל החזקה המוכלל

$$\\frac{d}{dx}[u^n] = n \\cdot u^{n-1} \\cdot \\frac{du}{dx}$$`,
  },
  {
    id: "exp-log-derivatives",
    name: "Exponential & Logarithmic Derivatives",
    nameHe: "נגזרות אקספוננציאליות ולוגריתמיות",
    description: "Derivatives of e^x, ln(x), a^x, log_a(x), logarithmic differentiation",
    descriptionHe: "נגזרות של e^x, ln(x), a^x, log_a(x), גזירה לוגריתמית",
    branchId: "derivatives-advanced",
    prerequisites: ["chain-rule"],
    order: 9,
    questionTypes: ["exp-derivative", "log-derivative", "logarithmic-differentiation", "general-exponential"],
    keywords: ["exponential", "logarithm", "ln", "e", "natural-log"],
    estimatedMinutes: 50,
    theoryContent: `## Exponential Derivatives

### Natural Exponential
$$\\frac{d}{dx}[e^x] = e^x$$

This is the only function equal to its own derivative!

### General Exponential
$$\\frac{d}{dx}[a^x] = a^x \\ln a$$

### With Chain Rule
$$\\frac{d}{dx}[e^{u}] = e^{u} \\cdot u'$$

## Logarithmic Derivatives

### Natural Logarithm
$$\\frac{d}{dx}[\\ln x] = \\frac{1}{x}$$

### General Logarithm
$$\\frac{d}{dx}[\\log_a x] = \\frac{1}{x \\ln a}$$

### With Chain Rule
$$\\frac{d}{dx}[\\ln u] = \\frac{1}{u} \\cdot u' = \\frac{u'}{u}$$

### Useful Property
$$\\frac{d}{dx}[\\ln|u|] = \\frac{u'}{u}$$

## Logarithmic Differentiation

For functions like $y = x^x$ or $y = (\\sin x)^x$:

1. Take $\\ln$ of both sides
2. Differentiate implicitly
3. Solve for $y'$

**Example:** $y = x^x$

$\\ln y = x \\ln x$

$\\frac{y'}{y} = \\ln x + x \\cdot \\frac{1}{x} = \\ln x + 1$

$y' = y(\\ln x + 1) = x^x(\\ln x + 1)$`,
    theoryContentHe: `## נגזרות אקספוננציאליות

### אקספוננט טבעי
$$\\frac{d}{dx}[e^x] = e^x$$

### אקספוננט כללי
$$\\frac{d}{dx}[a^x] = a^x \\ln a$$

## נגזרות לוגריתמיות

### לוגריתם טבעי
$$\\frac{d}{dx}[\\ln x] = \\frac{1}{x}$$

### לוגריתם כללי
$$\\frac{d}{dx}[\\log_a x] = \\frac{1}{x \\ln a}$$

## גזירה לוגריתמית

לפונקציות כמו $y = x^x$:

1. קחו $\\ln$ משני הצדדים
2. גזרו באופן סמוי
3. פתרו עבור $y'$`,
  },
  {
    id: "implicit-differentiation",
    name: "Implicit Differentiation",
    nameHe: "גזירה סמויה",
    description: "Finding derivatives when y is defined implicitly, related variables",
    descriptionHe: "מציאת נגזרות כאשר y מוגדר באופן סמוי, משתנים קשורים",
    branchId: "derivatives-advanced",
    prerequisites: ["exp-log-derivatives"],
    order: 10,
    questionTypes: ["basic-implicit", "implicit-tangent", "second-derivative-implicit"],
    keywords: ["implicit", "dy/dx", "relation", "curve"],
    estimatedMinutes: 50,
    theoryContent: `## Implicit Differentiation

When $y$ is not explicitly solved as a function of $x$ (like $x^2 + y^2 = 25$), we use **implicit differentiation**.

### The Method

1. Differentiate both sides with respect to $x$
2. Treat $y$ as a function of $x$, so use chain rule: $\\frac{d}{dx}[y^n] = ny^{n-1}\\frac{dy}{dx}$
3. Solve for $\\frac{dy}{dx}$

### Example 1: Circle
Find $\\frac{dy}{dx}$ for $x^2 + y^2 = 25$

**Step 1:** Differentiate both sides
$2x + 2y\\frac{dy}{dx} = 0$

**Step 2:** Solve for $\\frac{dy}{dx}$
$\\frac{dy}{dx} = -\\frac{x}{y}$

### Example 2: Product with y
Find $\\frac{dy}{dx}$ for $xy = 1$

Using product rule on $xy$:
$1 \\cdot y + x \\cdot \\frac{dy}{dx} = 0$

$\\frac{dy}{dx} = -\\frac{y}{x}$

### Example 3: More Complex
Find $\\frac{dy}{dx}$ for $x^3 + y^3 = 6xy$

$3x^2 + 3y^2\\frac{dy}{dx} = 6y + 6x\\frac{dy}{dx}$

$3y^2\\frac{dy}{dx} - 6x\\frac{dy}{dx} = 6y - 3x^2$

$\\frac{dy}{dx}(3y^2 - 6x) = 6y - 3x^2$

$\\frac{dy}{dx} = \\frac{6y - 3x^2}{3y^2 - 6x} = \\frac{2y - x^2}{y^2 - 2x}$

### Finding Tangent Lines
Use the derivative value at a specific point to write tangent line equation.`,
    theoryContentHe: `## גזירה סמויה

כאשר $y$ לא פתור במפורש כפונקציה של $x$, נשתמש ב**גזירה סמויה**.

### השיטה

1. גזרו את שני הצדדים לפי $x$
2. התייחסו ל-$y$ כפונקציה של $x$, אז השתמשו בכלל השרשרת
3. פתרו עבור $\\frac{dy}{dx}$

### דוגמה: מעגל
מצאו $\\frac{dy}{dx}$ עבור $x^2 + y^2 = 25$

$2x + 2y\\frac{dy}{dx} = 0$

$\\frac{dy}{dx} = -\\frac{x}{y}$`,
  },

  // ========== BRANCH 4: APPLICATIONS (3 topics) ==========
  {
    id: "related-rates",
    name: "Related Rates",
    nameHe: "קצבים קשורים",
    description: "Solving problems with changing quantities related by an equation",
    descriptionHe: "פתרון בעיות עם גדלים משתנים הקשורים על ידי משוואה",
    branchId: "applications",
    prerequisites: ["implicit-differentiation"],
    order: 11,
    questionTypes: ["ladder-problem", "expanding-shapes", "distance-velocity", "volume-rate"],
    keywords: ["related-rates", "dt", "change", "velocity", "rate"],
    estimatedMinutes: 60,
    theoryContent: `## Related Rates

Related rates problems involve finding how fast one quantity changes given how fast another quantity changes.

### General Strategy

1. **Draw a picture** and label variables
2. **Identify** what you're given and what you need
3. **Write an equation** relating the variables
4. **Differentiate** both sides with respect to time $t$
5. **Substitute** known values and solve

### Example: Expanding Circle
A circle's radius increases at 2 cm/s. How fast is the area increasing when $r = 5$ cm?

**Given:** $\\frac{dr}{dt} = 2$ cm/s, $r = 5$ cm
**Find:** $\\frac{dA}{dt}$

**Equation:** $A = \\pi r^2$

**Differentiate:** $\\frac{dA}{dt} = 2\\pi r \\frac{dr}{dt}$

**Substitute:** $\\frac{dA}{dt} = 2\\pi(5)(2) = 20\\pi$ cm²/s

### Classic Ladder Problem
A 10-ft ladder slides down a wall. When the base is 6 ft from the wall and moving at 2 ft/s, how fast is the top sliding down?

**Equation:** $x^2 + y^2 = 100$

**Differentiate:** $2x\\frac{dx}{dt} + 2y\\frac{dy}{dt} = 0$

When $x = 6$: $y = \\sqrt{100 - 36} = 8$

$2(6)(2) + 2(8)\\frac{dy}{dt} = 0$

$\\frac{dy}{dt} = -\\frac{24}{16} = -1.5$ ft/s (negative = sliding down)

### Common Formulas to Know
- Circle: $A = \\pi r^2$, $C = 2\\pi r$
- Sphere: $V = \\frac{4}{3}\\pi r^3$, $S = 4\\pi r^2$
- Cone: $V = \\frac{1}{3}\\pi r^2 h$
- Pythagorean: $a^2 + b^2 = c^2$`,
    theoryContentHe: `## קצבים קשורים

בעיות קצבים קשורים עוסקות במציאת מהירות שינוי של גודל אחד בהינתן מהירות שינוי של גודל אחר.

### אסטרטגיה כללית

1. **צייר תמונה** וסמן משתנים
2. **זהה** מה נתון ומה צריך למצוא
3. **כתוב משוואה** שמקשרת את המשתנים
4. **גזור** את שני הצדדים לפי הזמן $t$
5. **הצב** ערכים ידועים ופתור

### נוסחאות נפוצות
- מעגל: $A = \\pi r^2$
- כדור: $V = \\frac{4}{3}\\pi r^3$
- חרוט: $V = \\frac{1}{3}\\pi r^2 h$
- פיתגורס: $a^2 + b^2 = c^2$`,
  },
  {
    id: "extrema-optimization",
    name: "Extrema & Optimization",
    nameHe: "קיצוניות ואופטימיזציה",
    description: "Finding maximum and minimum values, first/second derivative tests, optimization problems",
    descriptionHe: "מציאת ערכי מקסימום ומינימום, מבחני נגזרת ראשונה/שנייה, בעיות אופטימיזציה",
    branchId: "applications",
    prerequisites: ["related-rates"],
    order: 12,
    questionTypes: ["find-critical-points", "first-derivative-test", "second-derivative-test", "optimization-word-problem"],
    keywords: ["maximum", "minimum", "critical-point", "extrema", "optimize"],
    estimatedMinutes: 60,
    theoryContent: `## Finding Extrema

### Critical Points
$x = c$ is a **critical point** of $f$ if:
- $f'(c) = 0$, OR
- $f'(c)$ does not exist (but $f(c)$ exists)

### First Derivative Test

At a critical point $c$:
- If $f'$ changes from + to −, then $f(c)$ is a **local maximum**
- If $f'$ changes from − to +, then $f(c)$ is a **local minimum**
- If $f'$ doesn't change sign, no local extremum

### Second Derivative Test

If $f'(c) = 0$:
- If $f''(c) > 0$, then $f(c)$ is a **local minimum** (concave up)
- If $f''(c) < 0$, then $f(c)$ is a **local maximum** (concave down)
- If $f''(c) = 0$, test is inconclusive

### Closed Interval Method (for absolute extrema on $[a,b]$)

1. Find all critical points in $(a, b)$
2. Evaluate $f$ at critical points AND endpoints
3. Largest value is absolute max, smallest is absolute min

## Optimization Problems

### Strategy
1. Draw a picture, identify variables
2. Write equation for quantity to optimize
3. Use constraints to get equation in one variable
4. Find critical points
5. Verify it's a max or min (using context or tests)
6. Answer the question asked!

### Example
Find dimensions of rectangle with perimeter 100 that maximizes area.

**Variables:** length $l$, width $w$
**Constraint:** $2l + 2w = 100 \\Rightarrow w = 50 - l$
**Optimize:** $A = lw = l(50-l) = 50l - l^2$

$A'(l) = 50 - 2l = 0 \\Rightarrow l = 25$

$A''(l) = -2 < 0$ → maximum

**Answer:** $l = w = 25$ (a square!)`,
    theoryContentHe: `## מציאת קיצוניות

### נקודות קריטיות
$x = c$ היא **נקודה קריטית** של $f$ אם:
- $f'(c) = 0$, או
- $f'(c)$ לא קיים (אבל $f(c)$ קיים)

### מבחן הנגזרת הראשונה

בנקודה קריטית $c$:
- אם $f'$ משתנה מ-+ ל-−, אז $f(c)$ הוא **מקסימום מקומי**
- אם $f'$ משתנה מ-− ל-+, אז $f(c)$ הוא **מינימום מקומי**

### מבחן הנגזרת השנייה

אם $f'(c) = 0$:
- אם $f''(c) > 0$, אז **מינימום מקומי**
- אם $f''(c) < 0$, אז **מקסימום מקומי**

### שיטת הקטע הסגור
1. מצא את כל הנקודות הקריטיות
2. חשב את $f$ בנקודות הקריטיות ובקצוות
3. הערך הגדול ביותר הוא מקסימום, הקטן ביותר מינימום`,
  },
  {
    id: "curve-sketching",
    name: "Curve Sketching & L'Hôpital's Rule",
    nameHe: "שרטוט גרפים וכלל לופיטל",
    description: "Concavity, inflection points, asymptotes, curve sketching, indeterminate forms",
    descriptionHe: "קעירות, נקודות פיתול, אסימפטוטות, שרטוט עקומים, צורות לא מוגדרות",
    branchId: "applications",
    prerequisites: ["extrema-optimization"],
    order: 13,
    questionTypes: ["concavity", "inflection-points", "asymptotes", "full-sketch", "lhopital"],
    keywords: ["concave", "inflection", "asymptote", "lhopital", "indeterminate"],
    estimatedMinutes: 55,
    theoryContent: `## Concavity

A function is:
- **Concave up** on interval where $f''(x) > 0$ (holds water, smile shape)
- **Concave down** on interval where $f''(x) < 0$ (spills water, frown shape)

### Inflection Points

A point where concavity changes. At inflection point $c$:
- $f''(c) = 0$ or $f''(c)$ undefined
- AND $f''$ changes sign at $c$

## Asymptotes

**Vertical Asymptote:** $x = a$ where $\\lim_{x \\to a} f(x) = \\pm\\infty$

**Horizontal Asymptote:** $y = L$ where $\\lim_{x \\to \\pm\\infty} f(x) = L$

### For Rational Functions $\\frac{p(x)}{q(x)}$:
- If degree(p) < degree(q): HA at $y = 0$
- If degree(p) = degree(q): HA at $y = \\frac{\\text{leading coef of } p}{\\text{leading coef of } q}$
- If degree(p) > degree(q): No HA (may have oblique asymptote)

## L'Hôpital's Rule

If $\\lim_{x \\to a} \\frac{f(x)}{g(x)}$ gives $\\frac{0}{0}$ or $\\frac{\\pm\\infty}{\\pm\\infty}$:

$$\\lim_{x \\to a} \\frac{f(x)}{g(x)} = \\lim_{x \\to a} \\frac{f'(x)}{g'(x)}$$

(provided the right side exists)

### Example
$$\\lim_{x \\to 0} \\frac{\\sin x}{x} = \\lim_{x \\to 0} \\frac{\\cos x}{1} = 1$$

### Other Indeterminate Forms
$0 \\cdot \\infty$, $\\infty - \\infty$, $0^0$, $1^\\infty$, $\\infty^0$

Convert to $\\frac{0}{0}$ or $\\frac{\\infty}{\\infty}$ form first.

## Curve Sketching Checklist
1. Domain
2. Intercepts (x and y)
3. Symmetry (even, odd, periodic)
4. Asymptotes
5. First derivative (increasing/decreasing, extrema)
6. Second derivative (concavity, inflection)
7. Plot key points and sketch`,
    theoryContentHe: `## קעירות

פונקציה היא:
- **קעורה כלפי מעלה** בקטע שבו $f''(x) > 0$
- **קעורה כלפי מטה** בקטע שבו $f''(x) < 0$

### נקודות פיתול

נקודה שבה הקעירות משתנה. בנקודת פיתול $c$:
- $f''(c) = 0$ או לא מוגדר
- וגם $f''$ משנה סימן ב-$c$

## כלל לופיטל

אם $\\lim_{x \\to a} \\frac{f(x)}{g(x)}$ נותן $\\frac{0}{0}$ או $\\frac{\\pm\\infty}{\\pm\\infty}$:

$$\\lim_{x \\to a} \\frac{f(x)}{g(x)} = \\lim_{x \\to a} \\frac{f'(x)}{g'(x)}$$

## רשימת בדיקה לשרטוט גרף
1. תחום
2. נקודות חיתוך
3. סימטריה
4. אסימפטוטות
5. נגזרת ראשונה (עלייה/ירידה)
6. נגזרת שנייה (קעירות)
7. סרטט`,
  },

  // ========== BRANCH 5: INTEGRATION (2 topics) ==========
  {
    id: "antiderivatives",
    name: "Antiderivatives & Definite Integrals",
    nameHe: "אנטי-נגזרות ואינטגרלים מסוימים",
    description: "Finding antiderivatives, indefinite integrals, definite integrals, area under curve",
    descriptionHe: "מציאת אנטי-נגזרות, אינטגרלים לא מסוימים, אינטגרלים מסוימים, שטח מתחת לעקום",
    branchId: "integration",
    prerequisites: ["curve-sketching"],
    order: 14,
    questionTypes: ["basic-antiderivative", "indefinite-integral", "definite-integral", "area-interpretation"],
    keywords: ["antiderivative", "integral", "area", "indefinite", "definite"],
    estimatedMinutes: 55,
    theoryContent: `## Antiderivatives

An **antiderivative** of $f(x)$ is a function $F(x)$ such that $F'(x) = f(x)$.

### Basic Antiderivatives

$$\\int x^n \\, dx = \\frac{x^{n+1}}{n+1} + C \\quad (n \\neq -1)$$

$$\\int \\frac{1}{x} \\, dx = \\ln|x| + C$$

$$\\int e^x \\, dx = e^x + C$$

$$\\int \\sin x \\, dx = -\\cos x + C$$

$$\\int \\cos x \\, dx = \\sin x + C$$

$$\\int \\sec^2 x \\, dx = \\tan x + C$$

$$\\int \\sec x \\tan x \\, dx = \\sec x + C$$

### The Constant of Integration

Every antiderivative includes $+ C$ because derivatives of constants are 0.

If $F'(x) = f(x)$, then $(F(x) + C)' = f(x)$ for any constant $C$.

## The Definite Integral

$$\\int_a^b f(x) \\, dx$$

This represents:
- The **signed area** between $f(x)$ and the x-axis from $x = a$ to $x = b$
- Area above x-axis is positive, below is negative

### Properties

$$\\int_a^b f(x) \\, dx = -\\int_b^a f(x) \\, dx$$

$$\\int_a^a f(x) \\, dx = 0$$

$$\\int_a^b [f(x) + g(x)] \\, dx = \\int_a^b f(x) \\, dx + \\int_a^b g(x) \\, dx$$

$$\\int_a^b cf(x) \\, dx = c\\int_a^b f(x) \\, dx$$

$$\\int_a^c f(x) \\, dx = \\int_a^b f(x) \\, dx + \\int_b^c f(x) \\, dx$$`,
    theoryContentHe: `## אנטי-נגזרות

**אנטי-נגזרת** של $f(x)$ היא פונקציה $F(x)$ כך ש-$F'(x) = f(x)$.

### אנטי-נגזרות בסיסיות

$$\\int x^n \\, dx = \\frac{x^{n+1}}{n+1} + C \\quad (n \\neq -1)$$

$$\\int \\frac{1}{x} \\, dx = \\ln|x| + C$$

$$\\int e^x \\, dx = e^x + C$$

$$\\int \\sin x \\, dx = -\\cos x + C$$

$$\\int \\cos x \\, dx = \\sin x + C$$

### קבוע האינטגרציה

כל אנטי-נגזרת כוללת $+ C$ כי נגזרות של קבועים הן 0.

## האינטגרל המסוים

$$\\int_a^b f(x) \\, dx$$

מייצג את **השטח המסומן** בין $f(x)$ לציר ה-x מ-$x = a$ עד $x = b$.`,
  },
  {
    id: "ftc-substitution",
    name: "Fundamental Theorem & Substitution",
    nameHe: "המשפט היסודי והצבה",
    description: "FTC Parts 1 & 2, u-substitution for integration",
    descriptionHe: "המשפט היסודי חלקים 1 ו-2, הצבה באינטגרציה",
    branchId: "integration",
    prerequisites: ["antiderivatives"],
    order: 15,
    questionTypes: ["ftc-part1", "ftc-part2-evaluate", "u-substitution", "definite-u-sub"],
    keywords: ["FTC", "fundamental-theorem", "substitution", "u-sub"],
    estimatedMinutes: 60,
    theoryContent: `## Fundamental Theorem of Calculus

### Part 1 (FTC1)

If $f$ is continuous on $[a, b]$, then:

$$\\frac{d}{dx}\\left[\\int_a^x f(t) \\, dt\\right] = f(x)$$

**In words:** The derivative of the integral is the original function.

### Part 2 (FTC2)

If $f$ is continuous on $[a, b]$ and $F$ is any antiderivative of $f$:

$$\\int_a^b f(x) \\, dx = F(b) - F(a) = [F(x)]_a^b$$

### Example

$$\\int_1^3 x^2 \\, dx = \\left[\\frac{x^3}{3}\\right]_1^3 = \\frac{27}{3} - \\frac{1}{3} = \\frac{26}{3}$$

## Integration by Substitution (U-Sub)

The reverse of the chain rule!

$$\\int f(g(x)) \\cdot g'(x) \\, dx = \\int f(u) \\, du$$

where $u = g(x)$ and $du = g'(x) \\, dx$

### Steps

1. Choose $u = g(x)$ (usually the "inside" function)
2. Compute $du = g'(x) \\, dx$
3. Substitute everything to get integral in $u$ only
4. Integrate with respect to $u$
5. Substitute back $u = g(x)$

### Example: Indefinite
$$\\int 2x\\cos(x^2) \\, dx$$

Let $u = x^2$, then $du = 2x \\, dx$

$$= \\int \\cos(u) \\, du = \\sin(u) + C = \\sin(x^2) + C$$

### Example: Definite
$$\\int_0^1 2x(x^2 + 1)^3 \\, dx$$

Let $u = x^2 + 1$, $du = 2x \\, dx$

When $x = 0$: $u = 1$. When $x = 1$: $u = 2$

$$= \\int_1^2 u^3 \\, du = \\left[\\frac{u^4}{4}\\right]_1^2 = \\frac{16}{4} - \\frac{1}{4} = \\frac{15}{4}$$

### Tips for Choosing u

- Look for a function and its derivative
- The "inside" of a composition is often a good choice
- Try to make $du$ match what's left over`,
    theoryContentHe: `## המשפט היסודי של החשבון

### חלק 1

$$\\frac{d}{dx}\\left[\\int_a^x f(t) \\, dt\\right] = f(x)$$

### חלק 2

$$\\int_a^b f(x) \\, dx = F(b) - F(a)$$

כאשר $F$ היא אנטי-נגזרת של $f$.

## אינטגרציה בהצבה

ההפך של כלל השרשרת!

$$\\int f(g(x)) \\cdot g'(x) \\, dx = \\int f(u) \\, du$$

### שלבים

1. בחר $u = g(x)$
2. חשב $du = g'(x) \\, dx$
3. הצב והמר לאינטגרל ב-$u$ בלבד
4. חשב אינטגרל
5. החזר $u = g(x)$

### דוגמה
$$\\int 2x\\cos(x^2) \\, dx$$

נגדיר $u = x^2$, אז $du = 2x \\, dx$

$$= \\int \\cos(u) \\, du = \\sin(u) + C = \\sin(x^2) + C$$`,
  },
];

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function seedCourse() {
  console.log("=== Seeding Calculus 1 Course ===\n");

  // 1. Create the course
  console.log("1. Creating course...");
  try {
    const topicsJson = TOPICS.map(t => ({
      id: t.id,
      name: t.name,
      nameHe: t.nameHe,
    }));

    await databases.createDocument(DATABASE_ID, "courses", COURSE_ID, {
      ...COURSE,
      topics: JSON.stringify(topicsJson),
    });
    console.log(`   Created course: ${COURSE_ID}`);
  } catch (error: unknown) {
    const err = error as { code?: number };
    if (err.code === 409) {
      console.log(`   Course ${COURSE_ID} already exists, skipping...`);
    } else {
      throw error;
    }
  }

  // 2. Create all topics
  console.log("\n2. Creating topics...");
  for (const topic of TOPICS) {
    try {
      await databases.createDocument(DATABASE_ID, "topics", topic.id, {
        courseId: COURSE_ID,
        name: topic.name,
        nameHe: topic.nameHe,
        description: topic.description,
        descriptionHe: topic.descriptionHe,
        branchId: topic.branchId,
        prerequisites: JSON.stringify(topic.prerequisites),
        order: topic.order,
        difficultyLevels: JSON.stringify(["easy", "medium", "hard"]),
        questionTypes: JSON.stringify(topic.questionTypes),
        keywords: JSON.stringify(topic.keywords),
        theoryContent: topic.theoryContent,
        theoryContentHe: topic.theoryContentHe,
        videoIds: JSON.stringify([]),
        isActive: true,
        estimatedMinutes: topic.estimatedMinutes,
      });
      console.log(`   Created topic: ${topic.name}`);
    } catch (error: unknown) {
      const err = error as { code?: number; message?: string };
      if (err.code === 409) {
        console.log(`   Topic ${topic.id} already exists, skipping...`);
      } else {
        console.log(`   Error creating ${topic.id}:`, err.message);
      }
    }
  }

  console.log("\n=== Calculus 1 Course Seeded! ===");
  console.log(`Total topics: ${TOPICS.length}`);
  console.log("\nBranches:");
  console.log("  - limits (3 topics)");
  console.log("  - derivatives-basic (4 topics)");
  console.log("  - derivatives-advanced (3 topics)");
  console.log("  - applications (3 topics)");
  console.log("  - integration (2 topics)");
}

seedCourse().catch(console.error);
