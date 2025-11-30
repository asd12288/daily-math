// scripts/seed-exercise-solutions.ts
// Seed script to populate exercise_solutions with step-by-step solutions

import { Client, Databases, ID, Query } from "node-appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
const EXERCISES_COLLECTION = process.env.APPWRITE_EXERCISES_COLLECTION!;
const SOLUTIONS_COLLECTION = "exercise_solutions";

interface SolutionData {
  exerciseId: string;
  solution: string;
  steps: string[];
  stepsHe: string[];
}

// Type for exercise document from Appwrite
interface ExerciseDocument {
  $id: string;
  question: string;
  questionHe: string;
  answer: string;
  tip: string;
  tipHe: string;
  difficulty: string;
  topicId: string;
}

// Generate solutions based on exercise content
function generateSolution(exercise: {
  $id: string;
  question: string;
  questionHe: string;
  answer: string;
  tip: string;
  tipHe: string;
  difficulty: string;
  topicId: string;
}): SolutionData {
  const solutions = getSolutionByExerciseId(exercise);

  return {
    exerciseId: exercise.$id,
    solution: `The answer is ${exercise.answer}`,
    steps: solutions.steps,
    stepsHe: solutions.stepsHe,
  };
}

function getSolutionByExerciseId(exercise: {
  $id: string;
  question: string;
  answer: string;
  tip: string;
  tipHe: string;
}): { steps: string[]; stepsHe: string[] } {
  // Map of exercise IDs to their step-by-step solutions
  const solutionMap: Record<string, { steps: string[]; stepsHe: string[] }> = {
    // Order of Operations
    "order-ops-easy-001": {
      steps: [
        "Given: 3 + 4 × 2",
        "Step 1: Apply multiplication first (PEMDAS/BODMAS)",
        "4 × 2 = 8",
        "Step 2: Add the remaining terms",
        "3 + 8 = 11",
        "Answer: 11"
      ],
      stepsHe: [
        "נתון: 3 + 4 × 2",
        "שלב 1: בצע כפל קודם (סדר פעולות)",
        "4 × 2 = 8",
        "שלב 2: חבר את השאר",
        "3 + 8 = 11",
        "תשובה: 11"
      ]
    },
    "order-ops-easy-002": {
      steps: [
        "Given: (5 + 3) × 2",
        "Step 1: Solve inside parentheses first",
        "5 + 3 = 8",
        "Step 2: Multiply the result",
        "8 × 2 = 16",
        "Answer: 16"
      ],
      stepsHe: [
        "נתון: (5 + 3) × 2",
        "שלב 1: פתור את הסוגריים קודם",
        "5 + 3 = 8",
        "שלב 2: כפול את התוצאה",
        "8 × 2 = 16",
        "תשובה: 16"
      ]
    },
    "order-ops-medium-001": {
      steps: [
        "Given: 2 + 3 × 4 - 6 ÷ 2",
        "Step 1: Do multiplication first: 3 × 4 = 12",
        "Step 2: Do division: 6 ÷ 2 = 3",
        "Step 3: Rewrite: 2 + 12 - 3",
        "Step 4: Add and subtract left to right: 2 + 12 = 14, then 14 - 3 = 11",
        "Answer: 11"
      ],
      stepsHe: [
        "נתון: 2 + 3 × 4 - 6 ÷ 2",
        "שלב 1: בצע כפל קודם: 3 × 4 = 12",
        "שלב 2: בצע חילוק: 6 ÷ 2 = 3",
        "שלב 3: רשום מחדש: 2 + 12 - 3",
        "שלב 4: חבר וחסר משמאל לימין: 2 + 12 = 14, אז 14 - 3 = 11",
        "תשובה: 11"
      ]
    },
    "order-ops-medium-002": {
      steps: [
        "Given: 3² + 4 × (2 + 1)",
        "Step 1: Solve parentheses: (2 + 1) = 3",
        "Step 2: Calculate exponent: 3² = 9",
        "Step 3: Multiply: 4 × 3 = 12",
        "Step 4: Add: 9 + 12 = 21",
        "Answer: 21"
      ],
      stepsHe: [
        "נתון: 3² + 4 × (2 + 1)",
        "שלב 1: פתור סוגריים: (2 + 1) = 3",
        "שלב 2: חשב חזקה: 3² = 9",
        "שלב 3: כפול: 4 × 3 = 12",
        "שלב 4: חבר: 9 + 12 = 21",
        "תשובה: 21"
      ]
    },
    "order-ops-hard-001": {
      steps: [
        "Given: ((2 + 3)² - 5) ÷ 4 + 2³",
        "Step 1: Innermost parentheses: 2 + 3 = 5",
        "Step 2: Exponent in parentheses: 5² = 25",
        "Step 3: Subtraction in parentheses: 25 - 5 = 20",
        "Step 4: Division: 20 ÷ 4 = 5",
        "Step 5: Calculate 2³ = 8",
        "Step 6: Add: 5 + 8 = 13",
        "Answer: 13"
      ],
      stepsHe: [
        "נתון: ((2 + 3)² - 5) ÷ 4 + 2³",
        "שלב 1: סוגריים פנימיים: 2 + 3 = 5",
        "שלב 2: חזקה בסוגריים: 5² = 25",
        "שלב 3: חיסור בסוגריים: 25 - 5 = 20",
        "שלב 4: חילוק: 20 ÷ 4 = 5",
        "שלב 5: חשב 2³ = 8",
        "שלב 6: חבר: 5 + 8 = 13",
        "תשובה: 13"
      ]
    },
    // Fractions and Decimals
    "fractions-easy-001": {
      steps: [
        "Given: Simplify 6/8",
        "Step 1: Find the GCD of 6 and 8",
        "Factors of 6: 1, 2, 3, 6",
        "Factors of 8: 1, 2, 4, 8",
        "GCD = 2",
        "Step 2: Divide both numerator and denominator by GCD",
        "6 ÷ 2 = 3, 8 ÷ 2 = 4",
        "Answer: 3/4"
      ],
      stepsHe: [
        "נתון: פשט 6/8",
        "שלב 1: מצא את המחלק המשותף הגדול של 6 ו-8",
        "מחלקי 6: 1, 2, 3, 6",
        "מחלקי 8: 1, 2, 4, 8",
        "מחלק משותף גדול = 2",
        "שלב 2: חלק מונה ומכנה ב-2",
        "6 ÷ 2 = 3, 8 ÷ 2 = 4",
        "תשובה: 3/4"
      ]
    },
    "fractions-easy-002": {
      steps: [
        "Given: Convert 1/4 to decimal",
        "Step 1: Divide numerator by denominator",
        "1 ÷ 4 = 0.25",
        "Answer: 0.25"
      ],
      stepsHe: [
        "נתון: המר 1/4 לעשרוני",
        "שלב 1: חלק מונה במכנה",
        "1 ÷ 4 = 0.25",
        "תשובה: 0.25"
      ]
    },
    "fractions-medium-001": {
      steps: [
        "Given: 2/3 + 1/4",
        "Step 1: Find LCD of 3 and 4 = 12",
        "Step 2: Convert fractions",
        "2/3 = 8/12 (multiply by 4/4)",
        "1/4 = 3/12 (multiply by 3/3)",
        "Step 3: Add numerators",
        "8/12 + 3/12 = 11/12",
        "Answer: 11/12"
      ],
      stepsHe: [
        "נתון: 2/3 + 1/4",
        "שלב 1: מצא מכנה משותף של 3 ו-4 = 12",
        "שלב 2: המר שברים",
        "2/3 = 8/12 (כפל ב-4/4)",
        "1/4 = 3/12 (כפל ב-3/3)",
        "שלב 3: חבר מונים",
        "8/12 + 3/12 = 11/12",
        "תשובה: 11/12"
      ]
    },
    "fractions-medium-002": {
      steps: [
        "Given: 3/5 × 2/3",
        "Step 1: Multiply numerators: 3 × 2 = 6",
        "Step 2: Multiply denominators: 5 × 3 = 15",
        "Step 3: Result: 6/15",
        "Step 4: Simplify by dividing by GCD (3)",
        "6/15 = 2/5",
        "Answer: 2/5"
      ],
      stepsHe: [
        "נתון: 3/5 × 2/3",
        "שלב 1: כפול מונים: 3 × 2 = 6",
        "שלב 2: כפול מכנים: 5 × 3 = 15",
        "שלב 3: תוצאה: 6/15",
        "שלב 4: פשט על ידי חילוק ב-3",
        "6/15 = 2/5",
        "תשובה: 2/5"
      ]
    },
    "fractions-hard-001": {
      steps: [
        "Given: (3/4 - 1/2) ÷ 1/8",
        "Step 1: Subtract fractions in parentheses",
        "3/4 - 1/2 = 3/4 - 2/4 = 1/4",
        "Step 2: Divide by 1/8 (multiply by reciprocal)",
        "1/4 ÷ 1/8 = 1/4 × 8/1 = 8/4 = 2",
        "Answer: 2"
      ],
      stepsHe: [
        "נתון: (3/4 - 1/2) ÷ 1/8",
        "שלב 1: חסר שברים בסוגריים",
        "3/4 - 1/2 = 3/4 - 2/4 = 1/4",
        "שלב 2: חלק ב-1/8 (כפל בהופכי)",
        "1/4 ÷ 1/8 = 1/4 × 8/1 = 8/4 = 2",
        "תשובה: 2"
      ]
    },
    // Basic Equations
    "basic-eq-easy-001": {
      steps: [
        "Given: x + 5 = 12",
        "Step 1: Subtract 5 from both sides",
        "x + 5 - 5 = 12 - 5",
        "x = 7",
        "Answer: 7"
      ],
      stepsHe: [
        "נתון: x + 5 = 12",
        "שלב 1: חסר 5 משני הצדדים",
        "x + 5 - 5 = 12 - 5",
        "x = 7",
        "תשובה: 7"
      ]
    },
    "basic-eq-easy-002": {
      steps: [
        "Given: 3x = 15",
        "Step 1: Divide both sides by 3",
        "3x ÷ 3 = 15 ÷ 3",
        "x = 5",
        "Answer: 5"
      ],
      stepsHe: [
        "נתון: 3x = 15",
        "שלב 1: חלק שני הצדדים ב-3",
        "3x ÷ 3 = 15 ÷ 3",
        "x = 5",
        "תשובה: 5"
      ]
    },
    "basic-eq-medium-001": {
      steps: [
        "Given: 2x + 3 = 11",
        "Step 1: Subtract 3 from both sides",
        "2x + 3 - 3 = 11 - 3",
        "2x = 8",
        "Step 2: Divide both sides by 2",
        "x = 4",
        "Answer: 4"
      ],
      stepsHe: [
        "נתון: 2x + 3 = 11",
        "שלב 1: חסר 3 משני הצדדים",
        "2x + 3 - 3 = 11 - 3",
        "2x = 8",
        "שלב 2: חלק שני הצדדים ב-2",
        "x = 4",
        "תשובה: 4"
      ]
    },
    "basic-eq-medium-002": {
      steps: [
        "Given: x/4 - 2 = 3",
        "Step 1: Add 2 to both sides",
        "x/4 = 5",
        "Step 2: Multiply both sides by 4",
        "x = 20",
        "Answer: 20"
      ],
      stepsHe: [
        "נתון: x/4 - 2 = 3",
        "שלב 1: הוסף 2 לשני הצדדים",
        "x/4 = 5",
        "שלב 2: כפול שני הצדדים ב-4",
        "x = 20",
        "תשובה: 20"
      ]
    },
    "basic-eq-hard-001": {
      steps: [
        "Given: 3(x - 2) + 4 = 2x + 5",
        "Step 1: Expand: 3x - 6 + 4 = 2x + 5",
        "Step 2: Simplify left side: 3x - 2 = 2x + 5",
        "Step 3: Subtract 2x from both sides: x - 2 = 5",
        "Step 4: Add 2 to both sides: x = 7",
        "Answer: 7"
      ],
      stepsHe: [
        "נתון: 3(x - 2) + 4 = 2x + 5",
        "שלב 1: פתח סוגריים: 3x - 6 + 4 = 2x + 5",
        "שלב 2: פשט צד שמאל: 3x - 2 = 2x + 5",
        "שלב 3: חסר 2x משני הצדדים: x - 2 = 5",
        "שלב 4: הוסף 2 לשני הצדדים: x = 7",
        "תשובה: 7"
      ]
    },
    // Linear Equations One Variable
    "linear-1var-easy-001": {
      steps: [
        "Given: 4x - 8 = 0",
        "Step 1: Add 8 to both sides",
        "4x = 8",
        "Step 2: Divide both sides by 4",
        "x = 2",
        "Answer: 2"
      ],
      stepsHe: [
        "נתון: 4x - 8 = 0",
        "שלב 1: הוסף 8 לשני הצדדים",
        "4x = 8",
        "שלב 2: חלק שני הצדדים ב-4",
        "x = 2",
        "תשובה: 2"
      ]
    },
    "linear-1var-easy-002": {
      steps: [
        "Given: 5x + 10 = 25",
        "Step 1: Subtract 10 from both sides",
        "5x = 15",
        "Step 2: Divide both sides by 5",
        "x = 3",
        "Answer: 3"
      ],
      stepsHe: [
        "נתון: 5x + 10 = 25",
        "שלב 1: חסר 10 משני הצדדים",
        "5x = 15",
        "שלב 2: חלק שני הצדדים ב-5",
        "x = 3",
        "תשובה: 3"
      ]
    },
    "linear-1var-medium-001": {
      steps: [
        "Given: 3x - 7 = 2x + 5",
        "Step 1: Subtract 2x from both sides",
        "x - 7 = 5",
        "Step 2: Add 7 to both sides",
        "x = 12",
        "Answer: 12"
      ],
      stepsHe: [
        "נתון: 3x - 7 = 2x + 5",
        "שלב 1: חסר 2x משני הצדדים",
        "x - 7 = 5",
        "שלב 2: הוסף 7 לשני הצדדים",
        "x = 12",
        "תשובה: 12"
      ]
    },
    "linear-1var-medium-002": {
      steps: [
        "Given: (x + 3)/2 = 5",
        "Step 1: Multiply both sides by 2",
        "x + 3 = 10",
        "Step 2: Subtract 3 from both sides",
        "x = 7",
        "Answer: 7"
      ],
      stepsHe: [
        "נתון: (x + 3)/2 = 5",
        "שלב 1: כפול שני הצדדים ב-2",
        "x + 3 = 10",
        "שלב 2: חסר 3 משני הצדדים",
        "x = 7",
        "תשובה: 7"
      ]
    },
    "linear-1var-hard-001": {
      steps: [
        "Given: 2(3x - 1) - 4(x + 2) = 6",
        "Step 1: Distribute: 6x - 2 - 4x - 8 = 6",
        "Step 2: Combine like terms: 2x - 10 = 6",
        "Step 3: Add 10 to both sides: 2x = 16",
        "Step 4: Divide by 2: x = 8",
        "Answer: 8"
      ],
      stepsHe: [
        "נתון: 2(3x - 1) - 4(x + 2) = 6",
        "שלב 1: פתח סוגריים: 6x - 2 - 4x - 8 = 6",
        "שלב 2: אסוף איברים דומים: 2x - 10 = 6",
        "שלב 3: הוסף 10 לשני הצדדים: 2x = 16",
        "שלב 4: חלק ב-2: x = 8",
        "תשובה: 8"
      ]
    },
    // Linear Word Problems
    "linear-word-easy-001": {
      steps: [
        "Given: A number plus 7 equals 15",
        "Step 1: Let x = the unknown number",
        "Step 2: Write equation: x + 7 = 15",
        "Step 3: Solve: x = 15 - 7 = 8",
        "Answer: 8"
      ],
      stepsHe: [
        "נתון: מספר פלוס 7 שווה 15",
        "שלב 1: נסמן x = המספר הלא ידוע",
        "שלב 2: רשום משוואה: x + 7 = 15",
        "שלב 3: פתור: x = 15 - 7 = 8",
        "תשובה: 8"
      ]
    },
    "linear-word-easy-002": {
      steps: [
        "Given: Three times a number is 21",
        "Step 1: Let x = the unknown number",
        "Step 2: Write equation: 3x = 21",
        "Step 3: Solve: x = 21 ÷ 3 = 7",
        "Answer: 7"
      ],
      stepsHe: [
        "נתון: שלוש פעמים מספר שווה 21",
        "שלב 1: נסמן x = המספר הלא ידוע",
        "שלב 2: רשום משוואה: 3x = 21",
        "שלב 3: פתור: x = 21 ÷ 3 = 7",
        "תשובה: 7"
      ]
    },
    "linear-word-medium-001": {
      steps: [
        "Given: Tom is 5 years older than Sara. Sum of ages = 31",
        "Step 1: Let Sara's age = x",
        "Step 2: Tom's age = x + 5",
        "Step 3: Equation: x + (x + 5) = 31",
        "Step 4: Simplify: 2x + 5 = 31",
        "Step 5: Solve: 2x = 26, x = 13",
        "Answer: Sara is 13 years old"
      ],
      stepsHe: [
        "נתון: תום מבוגר משרה ב-5 שנים. סכום הגילאים = 31",
        "שלב 1: נסמן גיל שרה = x",
        "שלב 2: גיל תום = x + 5",
        "שלב 3: משוואה: x + (x + 5) = 31",
        "שלב 4: פשט: 2x + 5 = 31",
        "שלב 5: פתור: 2x = 26, x = 13",
        "תשובה: שרה בת 13"
      ]
    },
    "linear-word-medium-002": {
      steps: [
        "Given: Base fare $3, $2 per mile, total $15",
        "Step 1: Let m = miles traveled",
        "Step 2: Equation: 3 + 2m = 15",
        "Step 3: Subtract 3: 2m = 12",
        "Step 4: Divide by 2: m = 6",
        "Answer: 6 miles"
      ],
      stepsHe: [
        "נתון: תעריף בסיס 3$, 2$ למייל, סה\"כ 15$",
        "שלב 1: נסמן m = מיילים",
        "שלב 2: משוואה: 3 + 2m = 15",
        "שלב 3: חסר 3: 2m = 12",
        "שלב 4: חלק ב-2: m = 6",
        "תשובה: 6 מיילים"
      ]
    },
    "linear-word-hard-001": {
      steps: [
        "Given: Two consecutive odd numbers sum to 48",
        "Step 1: Let x = smaller odd number",
        "Step 2: Next odd number = x + 2",
        "Step 3: Equation: x + (x + 2) = 48",
        "Step 4: Simplify: 2x + 2 = 48",
        "Step 5: Solve: 2x = 46, x = 23",
        "Answer: 23"
      ],
      stepsHe: [
        "נתון: שני מספרים אי-זוגיים עוקבים מסתכמים ל-48",
        "שלב 1: נסמן x = המספר האי-זוגי הקטן",
        "שלב 2: המספר הבא = x + 2",
        "שלב 3: משוואה: x + (x + 2) = 48",
        "שלב 4: פשט: 2x + 2 = 48",
        "שלב 5: פתור: 2x = 46, x = 23",
        "תשובה: 23"
      ]
    },
  };

  // Return the solution if found, otherwise generate a generic one
  if (solutionMap[exercise.$id]) {
    return solutionMap[exercise.$id];
  }

  // Generic solution based on the tip
  return {
    steps: [
      `Given: ${exercise.question}`,
      `Hint: ${exercise.tip}`,
      `Answer: ${exercise.answer}`
    ],
    stepsHe: [
      `נתון: ${exercise.question}`,
      `רמז: ${exercise.tipHe || exercise.tip}`,
      `תשובה: ${exercise.answer}`
    ]
  };
}

async function seedSolutions() {
  console.log("Starting to seed exercise solutions...");

  try {
    // Fetch all exercises
    const exercisesResponse = await databases.listDocuments(
      DATABASE_ID,
      EXERCISES_COLLECTION,
      [Query.limit(100)]
    );

    console.log(`Found ${exercisesResponse.total} exercises`);

    // Check existing solutions
    const existingSolutions = await databases.listDocuments(
      DATABASE_ID,
      SOLUTIONS_COLLECTION,
      [Query.limit(100)]
    );

    const existingExerciseIds = new Set(
      existingSolutions.documents.map((doc) => doc.exerciseId)
    );

    console.log(`Found ${existingSolutions.total} existing solutions`);

    let created = 0;
    let skipped = 0;

    for (const exercise of exercisesResponse.documents) {
      if (existingExerciseIds.has(exercise.$id)) {
        skipped++;
        continue;
      }

      const solutionData = generateSolution(exercise as unknown as ExerciseDocument);

      try {
        await databases.createDocument(
          DATABASE_ID,
          SOLUTIONS_COLLECTION,
          ID.unique(),
          {
            exerciseId: solutionData.exerciseId,
            solution: solutionData.solution,
            steps: JSON.stringify(solutionData.steps),
            stepsHe: JSON.stringify(solutionData.stepsHe),
          }
        );
        created++;
        console.log(`Created solution for: ${exercise.$id}`);
      } catch (error) {
        console.error(`Failed to create solution for ${exercise.$id}:`, error);
      }
    }

    console.log(`\nSeeding complete!`);
    console.log(`Created: ${created} solutions`);
    console.log(`Skipped: ${skipped} (already existed)`);

  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

// Run the seeding
seedSolutions();
