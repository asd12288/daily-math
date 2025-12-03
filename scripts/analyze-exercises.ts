// scripts/analyze-exercises.ts
// Analyze exercises for data quality issues

import { config } from "dotenv";
config({ path: ".env.local" });

import { Client, Databases, Query } from "node-appwrite";

if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || !process.env.APPWRITE_API_KEY) {
  console.error("Missing environment variables. Ensure .env.local has:");
  console.error("- NEXT_PUBLIC_APPWRITE_ENDPOINT");
  console.error("- NEXT_PUBLIC_APPWRITE_PROJECT_ID");
  console.error("- APPWRITE_API_KEY");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DATABASE_ID = "dailymath";
const EXERCISES_COLLECTION = "exercises";
const TOPICS_COLLECTION = "topics";
const COURSES_COLLECTION = "courses";

interface Exercise {
  $id: string;
  courseId: string;
  topicId: string;
  question: string;
  answer: string | null;
  tip: string | null;
  difficulty: string;
}

// Types defined for documentation - used via duck typing
// interface Topic { $id: string; courseId: string; name: string; }
// interface Course { $id: string; name: string; }

async function main() {
  console.log("🔍 Analyzing exercises...\n");

  // Fetch all topics
  const topicsResponse = await databases.listDocuments(DATABASE_ID, TOPICS_COLLECTION);
  const validTopicIds = new Set(topicsResponse.documents.map((t) => t.$id));
  console.log(`✅ Found ${validTopicIds.size} valid topics`);

  // Fetch all courses
  const coursesResponse = await databases.listDocuments(DATABASE_ID, COURSES_COLLECTION);
  const validCourseIds = new Set(coursesResponse.documents.map((c) => c.$id));
  console.log(`✅ Found ${validCourseIds.size} valid courses`);
  console.log(`   Valid course IDs: ${[...validCourseIds].join(", ")}\n`);

  // Fetch all exercises with pagination
  let allExercises: Exercise[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const response = await databases.listDocuments(DATABASE_ID, EXERCISES_COLLECTION, [
      Query.limit(limit),
      Query.offset(offset),
    ]);

    allExercises = [...allExercises, ...(response.documents as unknown as Exercise[])];

    if (response.documents.length < limit) break;
    offset += limit;
  }

  console.log(`📊 Total exercises: ${allExercises.length}\n`);

  // Analyze issues
  const issues = {
    missingAnswer: [] as string[],
    missingTip: [] as string[],
    invalidTopicId: [] as { id: string; topicId: string }[],
    invalidCourseId: [] as { id: string; courseId: string }[],
  };

  for (const exercise of allExercises) {
    // Check for missing answer
    if (!exercise.answer || exercise.answer.trim() === "") {
      issues.missingAnswer.push(exercise.$id);
    }

    // Check for missing tip
    if (!exercise.tip || exercise.tip.trim() === "") {
      issues.missingTip.push(exercise.$id);
    }

    // Check for invalid topic reference
    if (!validTopicIds.has(exercise.topicId)) {
      issues.invalidTopicId.push({ id: exercise.$id, topicId: exercise.topicId });
    }

    // Check for invalid course reference
    if (!validCourseIds.has(exercise.courseId)) {
      issues.invalidCourseId.push({ id: exercise.$id, courseId: exercise.courseId });
    }
  }

  // Report results
  console.log("=== ANALYSIS RESULTS ===\n");

  if (issues.missingAnswer.length > 0) {
    console.log(`❌ Exercises WITHOUT answer (${issues.missingAnswer.length}):`);
    issues.missingAnswer.forEach((id) => console.log(`   - ${id}`));
    console.log();
  } else {
    console.log("✅ All exercises have answers\n");
  }

  if (issues.missingTip.length > 0) {
    console.log(`⚠️  Exercises WITHOUT tip (${issues.missingTip.length}):`);
    issues.missingTip.forEach((id) => console.log(`   - ${id}`));
    console.log();
  } else {
    console.log("✅ All exercises have tips\n");
  }

  if (issues.invalidTopicId.length > 0) {
    console.log(`❌ Exercises with INVALID topic ID (${issues.invalidTopicId.length}):`);
    issues.invalidTopicId.forEach(({ id, topicId }) =>
      console.log(`   - ${id} -> topicId: "${topicId}"`)
    );
    console.log();
  } else {
    console.log("✅ All exercises have valid topic references\n");
  }

  if (issues.invalidCourseId.length > 0) {
    console.log(`❌ Exercises with INVALID course ID (${issues.invalidCourseId.length}):`);
    issues.invalidCourseId.forEach(({ id, courseId }) =>
      console.log(`   - ${id} -> courseId: "${courseId}"`)
    );
    console.log();
  } else {
    console.log("✅ All exercises have valid course references\n");
  }

  // Summary
  const totalIssues =
    issues.missingAnswer.length +
    issues.invalidTopicId.length +
    issues.invalidCourseId.length;

  if (totalIssues === 0) {
    console.log("🎉 All exercises are valid!");
  } else {
    console.log(`⚠️  Found ${totalIssues} critical issues to fix`);
  }

  return issues;
}

main().catch(console.error);
