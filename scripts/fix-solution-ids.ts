// Script to fix orphaned exercise solution IDs
// Maps old format (e.g., "order-ops-easy-001") to new format (e.g., "oop-e-001")

import { Client, Databases, Query } from 'node-appwrite';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = 'dailymath';

// Mapping from solution prefix to exercise prefix
const PREFIX_MAPPING: Record<string, string> = {
  'order-ops': 'oop',
  'fractions': 'frd',
  'basic-eq': 'beq',
  'linear-1var': 'leq',
  'linear-word': 'lwp',
};

// Difficulty mapping
const DIFFICULTY_MAPPING: Record<string, string> = {
  'easy': 'e',
  'medium': 'm',
  'hard': 'h',
};

interface Solution {
  $id: string;
  exerciseId: string;
}

function convertSolutionExerciseId(oldId: string): string | null {
  // Pattern: {prefix}-{difficulty}-{number} e.g., "order-ops-easy-001"
  const match = oldId.match(/^(.+)-(easy|medium|hard)-(\d+)$/);
  if (!match) {
    return null;
  }

  const [, prefix, difficulty, number] = match;
  const newPrefix = PREFIX_MAPPING[prefix];
  const newDifficulty = DIFFICULTY_MAPPING[difficulty];

  if (!newPrefix || !newDifficulty) {
    return null;
  }

  return newPrefix + '-' + newDifficulty + '-' + number;
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

  // Process solutions
  const updates: { solutionId: string; oldId: string; newId: string }[] = [];
  const notFound: { solutionId: string; oldId: string; newId: string | null }[] = [];

  for (const solution of solutions) {
    const newExerciseId = convertSolutionExerciseId(solution.exerciseId);

    if (!newExerciseId) {
      notFound.push({ solutionId: solution.$id, oldId: solution.exerciseId, newId: null });
      continue;
    }

    if (!exerciseIds.has(newExerciseId)) {
      notFound.push({ solutionId: solution.$id, oldId: solution.exerciseId, newId: newExerciseId });
      continue;
    }

    // Only add if the ID is actually different
    if (solution.exerciseId !== newExerciseId) {
      updates.push({
        solutionId: solution.$id,
        oldId: solution.exerciseId,
        newId: newExerciseId,
      });
    }
  }

  console.log('=== RESULTS ===');
  console.log('Solutions to update: ' + updates.length);
  console.log('Solutions with missing exercises: ' + notFound.length);
  console.log();

  if (updates.length > 0) {
    console.log('Sample updates (first 10):');
    updates.slice(0, 10).forEach(u => {
      console.log('  ' + u.solutionId + ': ' + u.oldId + ' -> ' + u.newId);
    });
    console.log();
  }

  if (notFound.length > 0) {
    console.log('Missing exercises (first 10):');
    notFound.slice(0, 10).forEach(u => {
      console.log('  ' + u.solutionId + ': ' + u.oldId + ' -> ' + (u.newId || 'PARSE ERROR'));
    });
    console.log();
  }

  // Apply updates if not dry run
  if (!isDryRun && updates.length > 0) {
    console.log('Applying updates...');
    let successCount = 0;
    let errorCount = 0;

    for (const update of updates) {
      try {
        await databases.updateDocument(
          DATABASE_ID,
          'exercise_solutions',
          update.solutionId,
          { exerciseId: update.newId }
        );
        successCount++;
        process.stdout.write('\rUpdated ' + successCount + '/' + updates.length);
      } catch (error) {
        errorCount++;
        console.error('\nError updating ' + update.solutionId + ':', error);
      }
    }

    console.log('\n\nDone! Updated ' + successCount + ' solutions, ' + errorCount + ' errors');
  } else if (isDryRun) {
    console.log('Dry run complete. Run with --apply to perform updates.');
  }
}

main().catch(console.error);
