// Analyze exercise and solution IDs to understand the mapping
import { Client, Databases, Query } from 'node-appwrite';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = 'dailymath';

async function main() {
  // Get all exercises
  const exercisesByTopic = new Map<string, string[]>();
  let offset = 0;

  while (true) {
    const response = await databases.listDocuments(
      DATABASE_ID,
      'exercises',
      [Query.limit(100), Query.offset(offset)]
    );

    for (const doc of response.documents) {
      const topicId = doc.topicId as string;
      const id = doc.$id;

      if (!exercisesByTopic.has(topicId)) {
        exercisesByTopic.set(topicId, []);
      }
      exercisesByTopic.get(topicId)!.push(id);
    }

    if (response.documents.length < 100) break;
    offset += 100;
  }

  console.log('=== Exercise IDs by Topic ===\n');
  for (const [topic, ids] of exercisesByTopic) {
    console.log(topic + ':');
    // Show first 3 IDs of each difficulty if possible
    const easyIds = ids.filter(id => id.includes('-e-')).slice(0, 2);
    const mediumIds = ids.filter(id => id.includes('-m-')).slice(0, 2);
    const hardIds = ids.filter(id => id.includes('-h-')).slice(0, 2);
    console.log('  Easy:   ' + easyIds.join(', '));
    console.log('  Medium: ' + mediumIds.join(', '));
    console.log('  Hard:   ' + hardIds.join(', '));
    console.log();
  }

  // Get all solutions
  console.log('\n=== Solution exerciseIds (unique prefixes) ===\n');
  const solutionPrefixes = new Set<string>();
  offset = 0;

  while (true) {
    const response = await databases.listDocuments(
      DATABASE_ID,
      'exercise_solutions',
      [Query.limit(100), Query.offset(offset)]
    );

    for (const doc of response.documents) {
      const exerciseId = doc.exerciseId as string;
      // Extract prefix (everything before -easy/-medium/-hard)
      const match = exerciseId.match(/^(.+)-(easy|medium|hard)-/);
      if (match) {
        solutionPrefixes.add(match[1]);
      }
    }

    if (response.documents.length < 100) break;
    offset += 100;
  }

  console.log('Unique solution prefixes:');
  for (const prefix of solutionPrefixes) {
    console.log('  ' + prefix);
  }
}

main().catch(console.error);
