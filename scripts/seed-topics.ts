// scripts/seed-topics.ts
// Migration script to seed topics from static config to Appwrite database
// Run with: npx tsx scripts/seed-topics.ts

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { Client, Databases, Query } from "node-appwrite";
import { TOPICS, BRANCHES } from "../modules/skill-tree/config/topics";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
const TOPICS_COLLECTION = "topics";

// Course ID for Pre-Calculus Algebra (from existing database)
const COURSE_ID = "pre-calculus-algebra";

async function seedTopics() {
  console.log("Starting to seed topics from static config...\n");

  try {
    // Check existing topics
    const existingTopics = await databases.listDocuments(
      DATABASE_ID,
      TOPICS_COLLECTION,
      [Query.limit(100)]
    );

    const existingTopicIds = new Set(
      existingTopics.documents.map((doc) => doc.$id)
    );

    console.log(`Found ${existingTopics.total} existing topics in database\n`);

    let created = 0;
    let skipped = 0;

    // Seed each topic from static config
    for (const topic of TOPICS) {
      // Use the topic.id as the document ID for easy reference
      if (existingTopicIds.has(topic.id)) {
        console.log(`⏭️  Skipping: ${topic.id} (already exists)`);
        skipped++;
        continue;
      }

      try {
        await databases.createDocument(
          DATABASE_ID,
          TOPICS_COLLECTION,
          topic.id, // Use topic ID as document ID
          {
            courseId: COURSE_ID,
            name: topic.name,
            nameHe: topic.nameHe,
            description: topic.description,
            descriptionHe: topic.descriptionHe || "",
            branchId: topic.branchId,
            prerequisites: JSON.stringify(topic.prerequisites),
            order: topic.order,
            difficultyLevels: JSON.stringify(topic.difficultyLevels),
            questionTypes: JSON.stringify(topic.questionTypes || []),
            keywords: JSON.stringify(topic.keywords || []),
            theoryContent: "", // Empty for now, can be filled later
            theoryContentHe: "",
            videoIds: "[]", // Empty array for now
            isActive: true,
            estimatedMinutes: 30, // Default estimate
          }
        );
        created++;
        console.log(`✅ Created: ${topic.id} - ${topic.name}`);
      } catch (error) {
        console.error(`❌ Failed to create topic ${topic.id}:`, error);
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("Topic seeding complete!");
    console.log(`Created: ${created} topics`);
    console.log(`Skipped: ${skipped} (already existed)`);
    console.log("=".repeat(50));

    // Also log branch info for reference
    console.log("\nBranches Reference:");
    for (const branch of BRANCHES) {
      const branchTopics = TOPICS.filter((t) => t.branchId === branch.id);
      console.log(`  ${branch.icon} ${branch.name} (${branch.id}): ${branchTopics.length} topics`);
    }

  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

// Run the seeding
seedTopics();
