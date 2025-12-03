// scripts/fix-exercises-courseid.ts
// Fix exercises with invalid courseId

import { config } from "dotenv";
config({ path: ".env.local" });

import { Client, Databases, Query } from "node-appwrite";

if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || !process.env.APPWRITE_API_KEY) {
  console.error("Missing environment variables");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DATABASE_ID = "dailymath";
const EXERCISES_COLLECTION = "exercises";
const INVALID_COURSE_ID = "algebra-1";
const CORRECT_COURSE_ID = "pre-calculus-algebra";

async function main() {
  console.log(`🔧 Fixing exercises with courseId "${INVALID_COURSE_ID}" -> "${CORRECT_COURSE_ID}"...\n`);

  // Fetch all exercises with the invalid courseId
  let exercisesToFix: { $id: string }[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const response = await databases.listDocuments(DATABASE_ID, EXERCISES_COLLECTION, [
      Query.equal("courseId", INVALID_COURSE_ID),
      Query.limit(limit),
      Query.offset(offset),
    ]);

    exercisesToFix = [...exercisesToFix, ...response.documents.map((d) => ({ $id: d.$id }))];

    if (response.documents.length < limit) break;
    offset += limit;
  }

  console.log(`📊 Found ${exercisesToFix.length} exercises to fix\n`);

  if (exercisesToFix.length === 0) {
    console.log("✅ No exercises need fixing!");
    return;
  }

  // Update each exercise
  let fixed = 0;
  let failed = 0;

  for (const exercise of exercisesToFix) {
    try {
      await databases.updateDocument(DATABASE_ID, EXERCISES_COLLECTION, exercise.$id, {
        courseId: CORRECT_COURSE_ID,
      });
      fixed++;
      process.stdout.write(`\r✅ Fixed ${fixed}/${exercisesToFix.length} exercises`);
    } catch (error) {
      failed++;
      console.error(`\n❌ Failed to fix ${exercise.$id}:`, error);
    }
  }

  console.log(`\n\n=== RESULTS ===`);
  console.log(`✅ Fixed: ${fixed}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed === 0) {
    console.log("\n🎉 All exercises fixed successfully!");
  }
}

main().catch(console.error);
