// scripts/seed-calculus1-formulas.ts
// Seeds ~60 formulas for Calculus 1 course (3-5 per topic)

import { Client, Databases, ID, Query } from "node-appwrite";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || "dailymath";
const FORMULAS_COLLECTION = "topic_formulas";

interface Formula {
  topicId: string;
  courseId: string;
  title: string;
  titleHe: string;
  latex: string;
  explanation: string;
  explanationHe: string;
  category: string;
  sortOrder: number;
  isCore: boolean;
}

// Topic ID mapping (from seed script)
const TOPIC_IDS: Record<string, string> = {};
const COURSE_ID = "calculus-1";

// All formulas organized by topic
const FORMULAS_BY_TOPIC: Record<string, Omit<Formula, "topicId" | "courseId">[]> = {
  "limit-definition": [
    {
      title: "Epsilon-Delta Definition",
      titleHe: "הגדרת אפסילון-דלתא",
      latex: "\\lim_{x \\to a} f(x) = L \\iff \\forall \\varepsilon > 0, \\exists \\delta > 0: 0 < |x-a| < \\delta \\Rightarrow |f(x)-L| < \\varepsilon",
      explanation: "For every epsilon neighborhood around L, there exists a delta neighborhood around a such that f(x) stays within epsilon of L.",
      explanationHe: "לכל סביבת אפסילון סביב L, קיימת סביבת דלתא סביב a כך ש-f(x) נשאר בטווח אפסילון מ-L.",
      category: "limits",
      sortOrder: 1,
      isCore: true,
    },
    {
      title: "Limit at Infinity",
      titleHe: "גבול באינסוף",
      latex: "\\lim_{x \\to \\infty} f(x) = L \\iff \\forall \\varepsilon > 0, \\exists M > 0: x > M \\Rightarrow |f(x)-L| < \\varepsilon",
      explanation: "As x grows without bound, f(x) approaches L arbitrarily closely.",
      explanationHe: "כאשר x גדל ללא גבול, f(x) מתקרב ל-L.",
      category: "limits",
      sortOrder: 2,
      isCore: true,
    },
    {
      title: "One-Sided Limits",
      titleHe: "גבולות חד-צדדיים",
      latex: "\\lim_{x \\to a} f(x) = L \\iff \\lim_{x \\to a^-} f(x) = \\lim_{x \\to a^+} f(x) = L",
      explanation: "A limit exists if and only if both one-sided limits exist and are equal.",
      explanationHe: "גבול קיים אם ורק אם שני הגבולות החד-צדדיים קיימים ושווים.",
      category: "limits",
      sortOrder: 3,
      isCore: true,
    },
  ],
  "limit-laws": [
    {
      title: "Sum/Difference Rule",
      titleHe: "כלל סכום/הפרש",
      latex: "\\lim_{x \\to a} [f(x) \\pm g(x)] = \\lim_{x \\to a} f(x) \\pm \\lim_{x \\to a} g(x)",
      explanation: "The limit of a sum/difference equals the sum/difference of limits.",
      explanationHe: "גבול הסכום/הפרש שווה לסכום/הפרש הגבולות.",
      category: "limits",
      sortOrder: 1,
      isCore: true,
    },
    {
      title: "Product Rule for Limits",
      titleHe: "כלל המכפלה לגבולות",
      latex: "\\lim_{x \\to a} [f(x) \\cdot g(x)] = \\lim_{x \\to a} f(x) \\cdot \\lim_{x \\to a} g(x)",
      explanation: "The limit of a product equals the product of limits.",
      explanationHe: "גבול המכפלה שווה למכפלת הגבולות.",
      category: "limits",
      sortOrder: 2,
      isCore: true,
    },
    {
      title: "Quotient Rule for Limits",
      titleHe: "כלל המנה לגבולות",
      latex: "\\lim_{x \\to a} \\frac{f(x)}{g(x)} = \\frac{\\lim_{x \\to a} f(x)}{\\lim_{x \\to a} g(x)}, \\quad \\lim_{x \\to a} g(x) \\neq 0",
      explanation: "The limit of a quotient equals the quotient of limits (when denominator limit ≠ 0).",
      explanationHe: "גבול המנה שווה למנת הגבולות (כאשר גבול המכנה אינו 0).",
      category: "limits",
      sortOrder: 3,
      isCore: true,
    },
    {
      title: "Squeeze Theorem",
      titleHe: "משפט הסנדוויץ'",
      latex: "g(x) \\leq f(x) \\leq h(x), \\lim_{x \\to a} g(x) = \\lim_{x \\to a} h(x) = L \\Rightarrow \\lim_{x \\to a} f(x) = L",
      explanation: "If f is squeezed between g and h, and g,h have the same limit, so does f.",
      explanationHe: "אם f כלוא בין g ל-h, ולשתיהן אותו גבול, אז גם ל-f אותו גבול.",
      category: "limits",
      sortOrder: 4,
      isCore: true,
    },
    {
      title: "Important Limit: sin(x)/x",
      titleHe: "גבול חשוב: sin(x)/x",
      latex: "\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1",
      explanation: "Fundamental trigonometric limit used in derivative of sine.",
      explanationHe: "גבול טריגונומטרי יסודי המשמש בנגזרת הסינוס.",
      category: "limits",
      sortOrder: 5,
      isCore: true,
    },
  ],
  "continuity": [
    {
      title: "Continuity Definition",
      titleHe: "הגדרת רציפות",
      latex: "f \\text{ continuous at } a \\iff \\lim_{x \\to a} f(x) = f(a)",
      explanation: "A function is continuous at a point if the limit equals the function value.",
      explanationHe: "פונקציה רציפה בנקודה אם הגבול שווה לערך הפונקציה.",
      category: "continuity",
      sortOrder: 1,
      isCore: true,
    },
    {
      title: "Three Conditions for Continuity",
      titleHe: "שלושת תנאי הרציפות",
      latex: "1.\\, f(a) \\text{ exists} \\quad 2.\\, \\lim_{x \\to a} f(x) \\text{ exists} \\quad 3.\\, \\lim_{x \\to a} f(x) = f(a)",
      explanation: "All three conditions must hold for f to be continuous at a.",
      explanationHe: "שלושת התנאים חייבים להתקיים כדי ש-f תהיה רציפה ב-a.",
      category: "continuity",
      sortOrder: 2,
      isCore: true,
    },
    {
      title: "Intermediate Value Theorem",
      titleHe: "משפט ערך הביניים",
      latex: "f \\text{ continuous on } [a,b], f(a) < k < f(b) \\Rightarrow \\exists c \\in (a,b): f(c) = k",
      explanation: "A continuous function takes every value between f(a) and f(b).",
      explanationHe: "פונקציה רציפה מקבלת כל ערך בין f(a) ל-f(b).",
      category: "continuity",
      sortOrder: 3,
      isCore: true,
    },
    {
      title: "Types of Discontinuity",
      titleHe: "סוגי אי-רציפות",
      latex: "\\text{Removable: } \\lim \\text{ exists} \\quad \\text{Jump: } \\lim^+ \\neq \\lim^- \\quad \\text{Infinite: } \\lim = \\pm\\infty",
      explanation: "Three types: removable (hole), jump, and infinite (asymptote).",
      explanationHe: "שלושה סוגים: סליקה (חור), קפיצה, ואינסופית (אסימפטוטה).",
      category: "continuity",
      sortOrder: 4,
      isCore: false,
    },
  ],
  "derivative-definition": [
    {
      title: "Derivative Definition (Limit)",
      titleHe: "הגדרת הנגזרת (גבול)",
      latex: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}",
      explanation: "The derivative is the limit of the difference quotient as h approaches 0.",
      explanationHe: "הנגזרת היא גבול מנת ההפרשים כאשר h שואף ל-0.",
      category: "derivatives",
      sortOrder: 1,
      isCore: true,
    },
    {
      title: "Alternative Definition",
      titleHe: "הגדרה חלופית",
      latex: "f'(a) = \\lim_{x \\to a} \\frac{f(x) - f(a)}{x - a}",
      explanation: "Equivalent formulation with x approaching a directly.",
      explanationHe: "ניסוח שקול כאשר x מתקרב ישירות ל-a.",
      category: "derivatives",
      sortOrder: 2,
      isCore: true,
    },
    {
      title: "Differentiability Implies Continuity",
      titleHe: "גזירות גוררת רציפות",
      latex: "f \\text{ differentiable at } a \\Rightarrow f \\text{ continuous at } a",
      explanation: "If a function is differentiable, it must be continuous (but not vice versa).",
      explanationHe: "אם פונקציה גזירה, היא בהכרח רציפה (אך לא להיפך).",
      category: "derivatives",
      sortOrder: 3,
      isCore: true,
    },
    {
      title: "Tangent Line Equation",
      titleHe: "משוואת המשיק",
      latex: "y - f(a) = f'(a)(x - a)",
      explanation: "The tangent line at point (a, f(a)) using point-slope form.",
      explanationHe: "המשיק בנקודה (a, f(a)) בצורת נקודה-שיפוע.",
      category: "derivatives",
      sortOrder: 4,
      isCore: true,
    },
  ],
  "basic-rules": [
    {
      title: "Power Rule",
      titleHe: "כלל החזקה",
      latex: "\\frac{d}{dx}[x^n] = nx^{n-1}",
      explanation: "Bring the exponent down and reduce by 1. Works for any real n.",
      explanationHe: "הורד את החזקה והפחת 1. עובד לכל n ממשי.",
      category: "derivatives",
      sortOrder: 1,
      isCore: true,
    },
    {
      title: "Constant Rule",
      titleHe: "כלל הקבוע",
      latex: "\\frac{d}{dx}[c] = 0, \\quad \\frac{d}{dx}[cf(x)] = c \\cdot f'(x)",
      explanation: "Constants have zero derivative; constants factor out of derivatives.",
      explanationHe: "לקבועים נגזרת אפס; קבועים יוצאים מהנגזרת.",
      category: "derivatives",
      sortOrder: 2,
      isCore: true,
    },
    {
      title: "Sum/Difference Rule",
      titleHe: "כלל סכום/הפרש",
      latex: "\\frac{d}{dx}[f(x) \\pm g(x)] = f'(x) \\pm g'(x)",
      explanation: "Derivative of sum/difference equals sum/difference of derivatives.",
      explanationHe: "נגזרת הסכום/הפרש שווה לסכום/הפרש הנגזרות.",
      category: "derivatives",
      sortOrder: 3,
      isCore: true,
    },
    {
      title: "Polynomial Derivative",
      titleHe: "נגזרת פולינום",
      latex: "\\frac{d}{dx}[a_n x^n + \\cdots + a_1 x + a_0] = na_n x^{n-1} + \\cdots + a_1",
      explanation: "Apply power rule term by term; constant term vanishes.",
      explanationHe: "הפעל כלל החזקה איבר איבר; האיבר הקבוע מתאפס.",
      category: "derivatives",
      sortOrder: 4,
      isCore: false,
    },
  ],
  "product-quotient": [
    {
      title: "Product Rule",
      titleHe: "כלל המכפלה",
      latex: "\\frac{d}{dx}[f(x)g(x)] = f'(x)g(x) + f(x)g'(x)",
      explanation: "Derivative of first times second, plus first times derivative of second.",
      explanationHe: "נגזרת הראשון כפול השני, ועוד הראשון כפול נגזרת השני.",
      category: "derivatives",
      sortOrder: 1,
      isCore: true,
    },
    {
      title: "Quotient Rule",
      titleHe: "כלל המנה",
      latex: "\\frac{d}{dx}\\left[\\frac{f(x)}{g(x)}\\right] = \\frac{f'(x)g(x) - f(x)g'(x)}{[g(x)]^2}",
      explanation: "Low d-high minus high d-low, over low squared.",
      explanationHe: "מכנה כפול נגזרת מונה פחות מונה כפול נגזרת מכנה, הכל חלקי מכנה בריבוע.",
      category: "derivatives",
      sortOrder: 2,
      isCore: true,
    },
    {
      title: "Reciprocal Rule",
      titleHe: "כלל ההופכי",
      latex: "\\frac{d}{dx}\\left[\\frac{1}{g(x)}\\right] = -\\frac{g'(x)}{[g(x)]^2}",
      explanation: "Special case of quotient rule with f(x) = 1.",
      explanationHe: "מקרה פרטי של כלל המנה כאשר f(x) = 1.",
      category: "derivatives",
      sortOrder: 3,
      isCore: false,
    },
    {
      title: "Extended Product Rule",
      titleHe: "כלל המכפלה המורחב",
      latex: "\\frac{d}{dx}[fgh] = f'gh + fg'h + fgh'",
      explanation: "For three functions: differentiate each while keeping others constant.",
      explanationHe: "לשלוש פונקציות: גזור כל אחת בזמן ששאר קבועות.",
      category: "derivatives",
      sortOrder: 4,
      isCore: false,
    },
  ],
  "trig-derivatives": [
    {
      title: "Sine & Cosine Derivatives",
      titleHe: "נגזרות סינוס וקוסינוס",
      latex: "\\frac{d}{dx}[\\sin x] = \\cos x, \\quad \\frac{d}{dx}[\\cos x] = -\\sin x",
      explanation: "The derivative of sine is cosine; cosine differentiates to negative sine.",
      explanationHe: "נגזרת הסינוס היא קוסינוס; נגזרת הקוסינוס היא מינוס סינוס.",
      category: "trigonometry",
      sortOrder: 1,
      isCore: true,
    },
    {
      title: "Tangent & Cotangent Derivatives",
      titleHe: "נגזרות טנגנס וקוטנגנס",
      latex: "\\frac{d}{dx}[\\tan x] = \\sec^2 x, \\quad \\frac{d}{dx}[\\cot x] = -\\csc^2 x",
      explanation: "Derived using quotient rule on sin/cos and cos/sin.",
      explanationHe: "נגזרות באמצעות כלל המנה על sin/cos ו-cos/sin.",
      category: "trigonometry",
      sortOrder: 2,
      isCore: true,
    },
    {
      title: "Secant & Cosecant Derivatives",
      titleHe: "נגזרות סקנט וקוסקנט",
      latex: "\\frac{d}{dx}[\\sec x] = \\sec x \\tan x, \\quad \\frac{d}{dx}[\\csc x] = -\\csc x \\cot x",
      explanation: "Derived using quotient rule on 1/cos and 1/sin.",
      explanationHe: "נגזרות באמצעות כלל המנה על 1/cos ו-1/sin.",
      category: "trigonometry",
      sortOrder: 3,
      isCore: false,
    },
    {
      title: "Inverse Trig Derivatives",
      titleHe: "נגזרות פונקציות טריגונומטריות הפוכות",
      latex: "\\frac{d}{dx}[\\arcsin x] = \\frac{1}{\\sqrt{1-x^2}}, \\quad \\frac{d}{dx}[\\arctan x] = \\frac{1}{1+x^2}",
      explanation: "Derived using implicit differentiation on y = arcsin(x) → sin(y) = x.",
      explanationHe: "נגזרות באמצעות גזירה מרומזת.",
      category: "trigonometry",
      sortOrder: 4,
      isCore: true,
    },
  ],
  "chain-rule": [
    {
      title: "Chain Rule",
      titleHe: "כלל השרשרת",
      latex: "\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)",
      explanation: "Derivative of outer function (at inner) times derivative of inner function.",
      explanationHe: "נגזרת הפונקציה החיצונית (בפנימית) כפול נגזרת הפונקציה הפנימית.",
      category: "derivatives",
      sortOrder: 1,
      isCore: true,
    },
    {
      title: "Chain Rule (Leibniz Notation)",
      titleHe: "כלל השרשרת (סימון לייבניץ)",
      latex: "\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}",
      explanation: "The du terms 'cancel' symbolically, making chain rule intuitive.",
      explanationHe: "איברי ה-du 'מתקצרים' סמלית, מה שהופך את הכלל לאינטואיטיבי.",
      category: "derivatives",
      sortOrder: 2,
      isCore: true,
    },
    {
      title: "Power Chain Rule",
      titleHe: "כלל החזקה עם שרשרת",
      latex: "\\frac{d}{dx}[g(x)]^n = n[g(x)]^{n-1} \\cdot g'(x)",
      explanation: "Combine power rule with chain rule for composite powers.",
      explanationHe: "שילוב כלל החזקה עם כלל השרשרת לחזקות מורכבות.",
      category: "derivatives",
      sortOrder: 3,
      isCore: true,
    },
    {
      title: "Nested Chain Rule",
      titleHe: "כלל השרשרת המקונן",
      latex: "\\frac{d}{dx}[f(g(h(x)))] = f'(g(h(x))) \\cdot g'(h(x)) \\cdot h'(x)",
      explanation: "For triple composition, multiply three derivatives evaluated at appropriate points.",
      explanationHe: "להרכבה משולשת, כפול שלוש נגזרות מחושבות בנקודות המתאימות.",
      category: "derivatives",
      sortOrder: 4,
      isCore: false,
    },
  ],
  "exp-log-derivatives": [
    {
      title: "Natural Exponential",
      titleHe: "אקספוננט טבעי",
      latex: "\\frac{d}{dx}[e^x] = e^x, \\quad \\frac{d}{dx}[e^{g(x)}] = e^{g(x)} \\cdot g'(x)",
      explanation: "The exponential function is its own derivative; use chain rule for compositions.",
      explanationHe: "הפונקציה האקספוננציאלית היא הנגזרת של עצמה; השתמש בכלל השרשרת להרכבות.",
      category: "exponential",
      sortOrder: 1,
      isCore: true,
    },
    {
      title: "General Exponential",
      titleHe: "אקספוננט כללי",
      latex: "\\frac{d}{dx}[a^x] = a^x \\ln a, \\quad \\frac{d}{dx}[a^{g(x)}] = a^{g(x)} \\ln a \\cdot g'(x)",
      explanation: "For base a, multiply by ln(a); combine with chain rule as needed.",
      explanationHe: "לבסיס a, כפול ב-ln(a); שלב עם כלל השרשרת לפי הצורך.",
      category: "exponential",
      sortOrder: 2,
      isCore: true,
    },
    {
      title: "Natural Logarithm",
      titleHe: "לוגריתם טבעי",
      latex: "\\frac{d}{dx}[\\ln x] = \\frac{1}{x}, \\quad \\frac{d}{dx}[\\ln g(x)] = \\frac{g'(x)}{g(x)}",
      explanation: "Derivative is 1/x; with chain rule becomes g'/g (logarithmic derivative).",
      explanationHe: "הנגזרת היא 1/x; עם כלל השרשרת הופכת ל-g'/g (נגזרת לוגריתמית).",
      category: "logarithmic",
      sortOrder: 3,
      isCore: true,
    },
    {
      title: "General Logarithm",
      titleHe: "לוגריתם כללי",
      latex: "\\frac{d}{dx}[\\log_a x] = \\frac{1}{x \\ln a}",
      explanation: "Use change of base: log_a(x) = ln(x)/ln(a), then differentiate.",
      explanationHe: "השתמש בהחלפת בסיס: log_a(x) = ln(x)/ln(a), ואז גזור.",
      category: "logarithmic",
      sortOrder: 4,
      isCore: false,
    },
    {
      title: "Logarithmic Differentiation",
      titleHe: "גזירה לוגריתמית",
      latex: "y = f(x)^{g(x)} \\Rightarrow \\ln y = g(x) \\ln f(x) \\Rightarrow \\frac{y'}{y} = g'\\ln f + g\\frac{f'}{f}",
      explanation: "Take ln of both sides, differentiate implicitly, solve for y'.",
      explanationHe: "קח ln משני הצדדים, גזור מרומזת, פתור עבור y'.",
      category: "logarithmic",
      sortOrder: 5,
      isCore: true,
    },
  ],
  "implicit-differentiation": [
    {
      title: "Implicit Differentiation Formula",
      titleHe: "נוסחת גזירה מרומזת",
      latex: "F(x,y) = 0 \\Rightarrow \\frac{dy}{dx} = -\\frac{\\partial F/\\partial x}{\\partial F/\\partial y} = -\\frac{F_x}{F_y}",
      explanation: "Differentiate both sides with respect to x, treating y as a function of x.",
      explanationHe: "גזור את שני הצדדים לפי x, תוך התייחסות ל-y כפונקציה של x.",
      category: "derivatives",
      sortOrder: 1,
      isCore: true,
    },
    {
      title: "Chain Rule in Implicit",
      titleHe: "כלל השרשרת בגזירה מרומזת",
      latex: "\\frac{d}{dx}[y^n] = ny^{n-1} \\cdot \\frac{dy}{dx}",
      explanation: "When differentiating y terms, multiply by dy/dx due to chain rule.",
      explanationHe: "כאשר גוזרים איברי y, כפול ב-dy/dx בגלל כלל השרשרת.",
      category: "derivatives",
      sortOrder: 2,
      isCore: true,
    },
    {
      title: "Second Derivative (Implicit)",
      titleHe: "נגזרת שנייה (מרומזת)",
      latex: "\\frac{d^2y}{dx^2} = \\frac{d}{dx}\\left[\\frac{dy}{dx}\\right]",
      explanation: "Differentiate the first derivative expression again, substituting dy/dx as needed.",
      explanationHe: "גזור שוב את ביטוי הנגזרת הראשונה, והחלף dy/dx לפי הצורך.",
      category: "derivatives",
      sortOrder: 3,
      isCore: false,
    },
  ],
  "related-rates": [
    {
      title: "Related Rates Setup",
      titleHe: "הגדרת קצבי שינוי קשורים",
      latex: "\\text{Given: } \\frac{dx}{dt}, \\quad \\text{Find: } \\frac{dy}{dt} \\quad \\text{using } F(x,y) = c",
      explanation: "Identify variables, write equation relating them, differentiate with respect to t.",
      explanationHe: "זהה משתנים, כתוב משוואה המקשרת ביניהם, גזור לפי t.",
      category: "applications",
      sortOrder: 1,
      isCore: true,
    },
    {
      title: "Pythagorean Related Rates",
      titleHe: "קצבים קשורים פיתגוריים",
      latex: "x^2 + y^2 = z^2 \\Rightarrow 2x\\frac{dx}{dt} + 2y\\frac{dy}{dt} = 2z\\frac{dz}{dt}",
      explanation: "Common setup for right triangle problems (ladders, distance, etc.).",
      explanationHe: "מבנה נפוץ לבעיות משולש ישר זווית (סולמות, מרחק וכו').",
      category: "applications",
      sortOrder: 2,
      isCore: true,
    },
    {
      title: "Volume/Area Rate",
      titleHe: "קצב שינוי נפח/שטח",
      latex: "V = \\frac{4}{3}\\pi r^3 \\Rightarrow \\frac{dV}{dt} = 4\\pi r^2 \\frac{dr}{dt}",
      explanation: "Differentiate volume formulas to relate radius and volume rates.",
      explanationHe: "גזור נוסחאות נפח לקשר בין קצבי רדיוס ונפח.",
      category: "applications",
      sortOrder: 3,
      isCore: true,
    },
  ],
  "extrema-optimization": [
    {
      title: "Critical Points",
      titleHe: "נקודות קריטיות",
      latex: "f'(c) = 0 \\text{ or } f'(c) \\text{ DNE} \\Rightarrow c \\text{ is critical}",
      explanation: "Critical points occur where derivative is zero or undefined.",
      explanationHe: "נקודות קריטיות מתרחשות כאשר הנגזרת אפס או לא מוגדרת.",
      category: "applications",
      sortOrder: 1,
      isCore: true,
    },
    {
      title: "First Derivative Test",
      titleHe: "מבחן הנגזרת הראשונה",
      latex: "f' > 0 \\to f' < 0: \\text{max} \\quad f' < 0 \\to f' > 0: \\text{min}",
      explanation: "Sign change of f' determines type of extremum.",
      explanationHe: "החלפת סימן של f' קובעת את סוג הקיצון.",
      category: "applications",
      sortOrder: 2,
      isCore: true,
    },
    {
      title: "Second Derivative Test",
      titleHe: "מבחן הנגזרת השנייה",
      latex: "f'(c)=0: \\quad f''(c) > 0 \\Rightarrow \\text{min}, \\quad f''(c) < 0 \\Rightarrow \\text{max}",
      explanation: "Concavity at critical point determines extremum type.",
      explanationHe: "הקעירות בנקודה הקריטית קובעת את סוג הקיצון.",
      category: "applications",
      sortOrder: 3,
      isCore: true,
    },
    {
      title: "Closed Interval Method",
      titleHe: "שיטת הקטע הסגור",
      latex: "\\text{Compare } f(a), f(b), f(c_1), f(c_2), \\ldots \\text{ for absolute extrema}",
      explanation: "On [a,b], evaluate f at endpoints and all critical points; compare values.",
      explanationHe: "ב-[a,b], חשב f בקצוות ובכל הנקודות הקריטיות; השווה ערכים.",
      category: "applications",
      sortOrder: 4,
      isCore: true,
    },
  ],
  "curve-sketching": [
    {
      title: "L'Hôpital's Rule",
      titleHe: "כלל לופיטל",
      latex: "\\lim_{x \\to a} \\frac{f(x)}{g(x)} = \\frac{0}{0} \\text{ or } \\frac{\\infty}{\\infty} \\Rightarrow \\lim_{x \\to a} \\frac{f'(x)}{g'(x)}",
      explanation: "For indeterminate forms, take derivative of top and bottom separately.",
      explanationHe: "לצורות לא מוגדרות, קח נגזרת של מונה ומכנה בנפרד.",
      category: "limits",
      sortOrder: 1,
      isCore: true,
    },
    {
      title: "Concavity Test",
      titleHe: "מבחן קעירות",
      latex: "f''(x) > 0: \\text{concave up (U)} \\quad f''(x) < 0: \\text{concave down (∩)}",
      explanation: "Second derivative determines whether curve bends up or down.",
      explanationHe: "הנגזרת השנייה קובעת אם העקומה מתכופפת למעלה או למטה.",
      category: "applications",
      sortOrder: 2,
      isCore: true,
    },
    {
      title: "Inflection Points",
      titleHe: "נקודות פיתול",
      latex: "f''(c) = 0 \\text{ and } f'' \\text{ changes sign at } c \\Rightarrow \\text{inflection point}",
      explanation: "Inflection occurs where concavity changes; f'' must change sign.",
      explanationHe: "פיתול מתרחש כאשר הקעירות משתנה; f'' חייבת להחליף סימן.",
      category: "applications",
      sortOrder: 3,
      isCore: true,
    },
    {
      title: "Asymptotes",
      titleHe: "אסימפטוטות",
      latex: "\\text{Vertical: } \\lim f = \\pm\\infty \\quad \\text{Horizontal: } \\lim_{x\\to\\pm\\infty} f = L",
      explanation: "Vertical where denominator → 0; horizontal from behavior at infinity.",
      explanationHe: "אנכית כאשר מכנה → 0; אופקית מהתנהגות באינסוף.",
      category: "applications",
      sortOrder: 4,
      isCore: true,
    },
  ],
  "antiderivatives": [
    {
      title: "Antiderivative Definition",
      titleHe: "הגדרת האנטי-נגזרת",
      latex: "F'(x) = f(x) \\Rightarrow \\int f(x)\\,dx = F(x) + C",
      explanation: "F is an antiderivative of f if F' = f; always add constant C.",
      explanationHe: "F היא אנטי-נגזרת של f אם F' = f; תמיד הוסף קבוע C.",
      category: "integration",
      sortOrder: 1,
      isCore: true,
    },
    {
      title: "Power Rule (Integration)",
      titleHe: "כלל החזקה (אינטגרציה)",
      latex: "\\int x^n \\, dx = \\frac{x^{n+1}}{n+1} + C, \\quad n \\neq -1",
      explanation: "Add 1 to exponent, divide by new exponent. Exception: n = -1 gives ln|x|.",
      explanationHe: "הוסף 1 לחזקה, חלק בחזקה החדשה. חריג: n = -1 נותן ln|x|.",
      category: "integration",
      sortOrder: 2,
      isCore: true,
    },
    {
      title: "Basic Antiderivatives",
      titleHe: "אנטי-נגזרות בסיסיות",
      latex: "\\int e^x dx = e^x + C, \\quad \\int \\frac{1}{x} dx = \\ln|x| + C, \\quad \\int \\cos x\\, dx = \\sin x + C",
      explanation: "Memorize these fundamental antiderivatives.",
      explanationHe: "שנן את האנטי-נגזרות היסודיות הללו.",
      category: "integration",
      sortOrder: 3,
      isCore: true,
    },
    {
      title: "Definite Integral",
      titleHe: "אינטגרל מסוים",
      latex: "\\int_a^b f(x)\\,dx = F(b) - F(a)",
      explanation: "Evaluate antiderivative at bounds and subtract.",
      explanationHe: "חשב את האנטי-נגזרת בגבולות והחסר.",
      category: "integration",
      sortOrder: 4,
      isCore: true,
    },
  ],
  "ftc-substitution": [
    {
      title: "Fundamental Theorem (Part 1)",
      titleHe: "המשפט היסודי (חלק 1)",
      latex: "\\frac{d}{dx} \\int_a^x f(t)\\,dt = f(x)",
      explanation: "The derivative of an integral (with variable upper limit) is the integrand.",
      explanationHe: "הנגזרת של אינטגרל (עם גבול עליון משתנה) היא הפונקציה המתחת לאינטגרל.",
      category: "integration",
      sortOrder: 1,
      isCore: true,
    },
    {
      title: "Fundamental Theorem (Part 2)",
      titleHe: "המשפט היסודי (חלק 2)",
      latex: "\\int_a^b f(x)\\,dx = F(b) - F(a), \\quad F'=f",
      explanation: "Definite integrals are computed using antiderivatives.",
      explanationHe: "אינטגרלים מסוימים מחושבים באמצעות אנטי-נגזרות.",
      category: "integration",
      sortOrder: 2,
      isCore: true,
    },
    {
      title: "U-Substitution",
      titleHe: "החלפת משתנים (שיטת U)",
      latex: "\\int f(g(x))g'(x)\\,dx = \\int f(u)\\,du, \\quad u = g(x)",
      explanation: "Reverse chain rule: substitute u = g(x), du = g'(x)dx.",
      explanationHe: "כלל שרשרת הפוך: החלף u = g(x), du = g'(x)dx.",
      category: "integration",
      sortOrder: 3,
      isCore: true,
    },
    {
      title: "Definite Integral Substitution",
      titleHe: "החלפה באינטגרל מסוים",
      latex: "\\int_a^b f(g(x))g'(x)\\,dx = \\int_{g(a)}^{g(b)} f(u)\\,du",
      explanation: "Change limits when substituting: new limits are g(a) and g(b).",
      explanationHe: "שנה גבולות בהחלפה: הגבולות החדשים הם g(a) ו-g(b).",
      category: "integration",
      sortOrder: 4,
      isCore: true,
    },
  ],
};

async function getTopicIds(): Promise<void> {
  console.log("Fetching topic IDs from database...\n");

  const response = await databases.listDocuments(DATABASE_ID, "topics", [
    Query.equal("courseId", COURSE_ID),
    Query.limit(100),
  ]);

  for (const topic of response.documents) {
    // Map topic name to our formula keys
    const topicName = topic.name as string;
    let key = "";

    if (topicName.includes("Limit Definition")) key = "limit-definition";
    else if (topicName.includes("Limit Laws")) key = "limit-laws";
    else if (topicName.includes("Continuity")) key = "continuity";
    else if (topicName.includes("Derivative Definition")) key = "derivative-definition";
    else if (topicName.includes("Basic Differentiation")) key = "basic-rules";
    else if (topicName.includes("Product & Quotient")) key = "product-quotient";
    else if (topicName.includes("Trigonometric")) key = "trig-derivatives";
    else if (topicName.includes("Chain Rule")) key = "chain-rule";
    else if (topicName.includes("Exponential")) key = "exp-log-derivatives";
    else if (topicName.includes("Implicit")) key = "implicit-differentiation";
    else if (topicName.includes("Related Rates")) key = "related-rates";
    else if (topicName.includes("Extrema")) key = "extrema-optimization";
    else if (topicName.includes("Curve Sketching")) key = "curve-sketching";
    else if (topicName.includes("Antiderivatives")) key = "antiderivatives";
    else if (topicName.includes("Fundamental Theorem")) key = "ftc-substitution";

    if (key) {
      TOPIC_IDS[key] = topic.$id;
      console.log(`  ${key} -> ${topic.$id}`);
    }
  }

  console.log(`\nFound ${Object.keys(TOPIC_IDS).length} topic mappings\n`);
}

async function seedFormulas(): Promise<void> {
  console.log("=== Seeding Calculus 1 Formulas ===\n");

  await getTopicIds();

  let totalCreated = 0;

  for (const [topicKey, formulas] of Object.entries(FORMULAS_BY_TOPIC)) {
    const topicId = TOPIC_IDS[topicKey];

    if (!topicId) {
      console.log(`  ⚠ Skipping ${topicKey}: topic not found`);
      continue;
    }

    console.log(`Creating formulas for ${topicKey}...`);

    for (const formula of formulas) {
      try {
        await databases.createDocument(
          DATABASE_ID,
          FORMULAS_COLLECTION,
          ID.unique(),
          {
            topicId,
            courseId: COURSE_ID,
            ...formula,
          }
        );
        totalCreated++;
        console.log(`   ✓ ${formula.title}`);
      } catch (error) {
        console.error(`   ✗ Failed: ${formula.title}`, error);
      }
    }
  }

  console.log(`\n=== Formulas Seeded! ===`);
  console.log(`Total formulas created: ${totalCreated}`);
}

seedFormulas().catch(console.error);
