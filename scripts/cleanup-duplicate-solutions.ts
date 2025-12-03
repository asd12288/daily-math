// Script to clean up duplicate exercise solutions
// Deletes the old format solutions since new format ones already exist

import { Client, Databases, Query } from 'node-appwrite';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = 'dailymath';

interface Solution {
  $id: string;
  exerciseId: string;
}

async function main() {
  const isDryRun = !process.argv.includes('--apply');

  console.log(isDryRun ? '=== DRY RUN MODE ===' : '=== APPLYING CHANGES ===');
  console.log();

  // Fetch all solutions
  console.log('Fetching solutions...');
  const solutions: Solution[] = [];
  let offset = 0;

  while (true) {
    const response = await databases.listDocuments(
      DATABASE_ID,
      'exercise_solutions',
      [Query.limit(100), Query.offset(offset)]
    );

    solutions.push(...response.documents as unknown as Solution[]);

    if (response.documents.length < 100) break;
    offset += 100;
  }

  console.log('Found ' + solutions.length + ' solutions');

  // Get all exercise IDs for verification
  console.log('Fetching exercises for verification...');
  const exerciseIds = new Set<string>();
  offset = 0;

  while (true) {
    const response = await databases.listDocuments(
      DATABASE_ID,
      'exercises',
      [Query.limit(100), Query.offset(offset)]
    );

    for (const doc of response.documents) {
      exerciseIds.add(doc.$id);
    }

    if (response.documents.length < 100) break;
    offset += 100;
  }

  console.log('Found ' + exerciseIds.size + ' exercises');
  console.log();

  // Categorize solutions
  const validSolutions: Solution[] = [];  // exerciseId exists in exercises
  const orphanedSolutions: Solution[] = [];  // exerciseId doesn't exist in exercises

  for (const solution of solutions) {
    if (exerciseIds.has(solution.exerciseId)) {
      validSolutions.push(solution);
    } else {
      orphanedSolutions.push(solution);
    }
  }

  console.log('=== ANALYSIS ===');
  console.log('Valid solutions (linked to exercises): ' + validSolutions.length);
  console.log('Orphaned solutions (to delete): ' + orphanedSolutions.length);
  console.log();

  if (orphanedSolutions.length > 0) {
    console.log('Orphaned solutions (first 10):');
    orphanedSolutions.slice(0, 10).forEach(s => {
      console.log('  ' + s.$id + ': exerciseId=' + s.exerciseId);
    });
    console.log();
  }

  // Delete orphaned solutions
  if (!isDryRun && orphanedSolutions.length > 0) {
    console.log('Deleting orphaned solutions...');
    let successCount = 0;
    let errorCount = 0;

    for (const solution of orphanedSolutions) {
      try {
        await databases.deleteDocument(
          DATABASE_ID,
          'exercise_solutions',
          solution.$id
        );
        successCount++;
        process.stdout.write('\rDeleted ' + successCount + '/' + orphanedSolutions.length);
      } catch (error) {
        errorCount++;
        console.error('\nError deleting ' + solution.$id + ':', error);
      }
    }

    console.log('\n\nDone! Deleted ' + successCount + ' orphaned solutions, ' + errorCount + ' errors');
  } else if (isDryRun) {
    console.log('Dry run complete. Run with --apply to delete orphaned solutions.');
  }
}

main().catch(console.error);
