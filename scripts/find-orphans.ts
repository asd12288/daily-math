/**
 * Script to find orphaned records in the database
 * Run with: npx tsx scripts/find-orphans.ts
 */

import { Client, Databases, Query } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;

async function getAllDocuments(collectionId: string) {
  const documents: Record<string, unknown>[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const response = await databases.listDocuments(DATABASE_ID, collectionId, [
      Query.limit(limit),
      Query.offset(offset)
    ]);

    documents.push(...response.documents);

    if (response.documents.length < limit) break;
    offset += limit;
  }

  return documents;
}

async function main() {
  console.log('Fetching all data...\n');

  // Fetch all data
  const [courses, topics, exercises, solutions, formulas, videos] = await Promise.all([
    getAllDocuments('courses'),
    getAllDocuments('topics'),
    getAllDocuments('exercises'),
    getAllDocuments('exercise_solutions'),
    getAllDocuments('topic_formulas'),
    getAllDocuments('topic_videos'),
  ]);

  console.log('Data counts:');
  console.log(`  Courses: ${courses.length}`);
  console.log(`  Topics: ${topics.length}`);
  console.log(`  Exercises: ${exercises.length}`);
  console.log(`  Solutions: ${solutions.length}`);
  console.log(`  Formulas: ${formulas.length}`);
  console.log(`  Videos: ${videos.length}`);
  console.log('');

  // Build valid ID sets
  const validCourseIds = new Set(courses.map(c => c.$id));
  const validTopicIds = new Set(topics.map(t => t.$id));
  const validExerciseIds = new Set(exercises.map(e => e.$id));

  console.log('Valid IDs:');
  console.log(`  Course IDs: ${[...validCourseIds].join(', ')}`);
  console.log(`  Topic IDs (${validTopicIds.size}): ${[...validTopicIds].slice(0, 5).join(', ')}...`);
  console.log('');

  // Find orphaned exercises (invalid topicId)
  const orphanedExercises = exercises.filter(e => !validTopicIds.has(e.topicId));
  console.log(`Orphaned Exercises (invalid topicId): ${orphanedExercises.length}`);
  if (orphanedExercises.length > 0) {
    orphanedExercises.forEach(e => {
      console.log(`  - ${e.$id}: topicId="${e.topicId}"`);
    });
  }

  // Find orphaned solutions (invalid exerciseId)
  const orphanedSolutions = solutions.filter(s => !validExerciseIds.has(s.exerciseId));
  console.log(`\nOrphaned Solutions (invalid exerciseId): ${orphanedSolutions.length}`);
  if (orphanedSolutions.length > 0) {
    orphanedSolutions.forEach(s => {
      console.log(`  - ${s.$id}: exerciseId="${s.exerciseId}"`);
    });
  }

  // Find orphaned formulas (invalid topicId)
  const orphanedFormulas = formulas.filter(f => !validTopicIds.has(f.topicId));
  console.log(`\nOrphaned Formulas (invalid topicId): ${orphanedFormulas.length}`);
  if (orphanedFormulas.length > 0) {
    orphanedFormulas.forEach(f => {
      console.log(`  - ${f.$id}: topicId="${f.topicId}"`);
    });
  }

  // Find orphaned videos (invalid topicId)
  const orphanedVideos = videos.filter(v => !validTopicIds.has(v.topicId));
  console.log(`\nOrphaned Videos (invalid topicId): ${orphanedVideos.length}`);
  if (orphanedVideos.length > 0) {
    orphanedVideos.forEach(v => {
      console.log(`  - ${v.$id}: topicId="${v.topicId}"`);
    });
  }

  // Summary
  const totalOrphans = orphanedExercises.length + orphanedSolutions.length +
                       orphanedFormulas.length + orphanedVideos.length;

  console.log('\n========================================');
  console.log(`TOTAL ORPHANED RECORDS: ${totalOrphans}`);
  console.log('========================================');

  if (totalOrphans > 0) {
    console.log('\nOrphaned record IDs to delete:');
    console.log(JSON.stringify({
      exercises: orphanedExercises.map(e => e.$id),
      solutions: orphanedSolutions.map(s => s.$id),
      formulas: orphanedFormulas.map(f => f.$id),
      videos: orphanedVideos.map(v => v.$id),
    }, null, 2));
  }
}

main().catch(console.error);
