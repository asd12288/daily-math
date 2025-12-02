// scripts/seed-videos.ts
// Seed script to add curated YouTube videos to the topic_videos collection

// Load environment variables from .env.local
import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { ID, Client, Databases, Query } from "node-appwrite";

// Direct config to avoid module resolution issues
const appwriteConfig = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
  apiKey: process.env.APPWRITE_API_KEY!,
  databaseId: process.env.APPWRITE_DATABASE_ID || "dailymath",
  collections: {
    topicVideos: process.env.APPWRITE_TOPIC_VIDEOS_COLLECTION || "topic_videos",
  },
};

// Create admin client directly
function createClient() {
  const client = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setKey(appwriteConfig.apiKey);

  return {
    databases: new Databases(client),
  };
}

type VideoLanguage = "en" | "he" | "other";
type VideoSource = "curated" | "api";

interface VideoSeed {
  videoId: string;
  topicId: string;
  courseId: string;
  title: string;
  titleHe?: string;
  channelName: string;
  thumbnailUrl: string;
  duration?: string;
  durationSeconds?: number;
  language: VideoLanguage;
  sortOrder: number;
  source: VideoSource;
  description?: string;
}

// Curated educational videos from trusted channels
const videosToSeed: VideoSeed[] = [
  // =============================
  // ORDER OF OPERATIONS
  // =============================
  {
    videoId: "dAgfnK528RA",
    topicId: "order-of-operations",
    courseId: "pre-calculus-algebra",
    title: "Order of Operations (PEMDAS) - Math Tutorial",
    titleHe: "סדר פעולות חשבון - הדרכה",
    channelName: "The Organic Chemistry Tutor",
    thumbnailUrl: "https://i.ytimg.com/vi/dAgfnK528RA/maxresdefault.jpg",
    duration: "11:23",
    durationSeconds: 683,
    language: "en",
    sortOrder: 1,
    source: "curated",
    description:
      "This math video tutorial provides a basic introduction into order of operations. It explains the PEMDAS rule.",
  },
  {
    videoId: "ugylG8yg6Wk",
    topicId: "order-of-operations",
    courseId: "pre-calculus-algebra",
    title: "סדר פעולות חשבון - הסבר מלא",
    channelName: "מתמטיקה בקלות",
    thumbnailUrl: "https://i.ytimg.com/vi/ugylG8yg6Wk/maxresdefault.jpg",
    duration: "8:15",
    durationSeconds: 495,
    language: "he",
    sortOrder: 2,
    source: "curated",
    description: "הסבר מקיף על סדר פעולות חשבון וכללי PEMDAS",
  },

  // =============================
  // FRACTIONS & DECIMALS
  // =============================
  {
    videoId: "cDP_ABNqyiQ",
    topicId: "fractions-decimals",
    courseId: "pre-calculus-algebra",
    title: "Fractions Addition Subtraction Multiplication Division",
    titleHe: "שברים - חיבור חיסור כפל חילוק",
    channelName: "The Organic Chemistry Tutor",
    thumbnailUrl: "https://i.ytimg.com/vi/cDP_ABNqyiQ/maxresdefault.jpg",
    duration: "21:44",
    durationSeconds: 1304,
    language: "en",
    sortOrder: 1,
    source: "curated",
    description: "Complete guide to fraction operations - adding, subtracting, multiplying, and dividing fractions.",
  },
  {
    videoId: "WE_0Iph6DGw",
    topicId: "fractions-decimals",
    courseId: "pre-calculus-algebra",
    title: "Converting Fractions to Decimals and Percentages",
    titleHe: "המרת שברים לעשרוניים ואחוזים",
    channelName: "Khan Academy",
    thumbnailUrl: "https://i.ytimg.com/vi/WE_0Iph6DGw/maxresdefault.jpg",
    duration: "4:32",
    durationSeconds: 272,
    language: "en",
    sortOrder: 2,
    source: "curated",
    description: "Learn how to convert between fractions, decimals, and percentages.",
  },

  // =============================
  // BASIC EQUATIONS
  // =============================
  {
    videoId: "l3XzepN03KQ",
    topicId: "basic-equations",
    courseId: "pre-calculus-algebra",
    title: "Solving One-Step Equations",
    titleHe: "פתרון משוואות בשלב אחד",
    channelName: "Khan Academy",
    thumbnailUrl: "https://i.ytimg.com/vi/l3XzepN03KQ/maxresdefault.jpg",
    duration: "4:50",
    durationSeconds: 290,
    language: "en",
    sortOrder: 1,
    source: "curated",
    description: "Learn how to solve simple one-step algebraic equations.",
  },
  {
    videoId: "Qyd_v3DGzTM",
    topicId: "basic-equations",
    courseId: "pre-calculus-algebra",
    title: "Solving Two-Step Equations",
    titleHe: "פתרון משוואות בשני שלבים",
    channelName: "Math Antics",
    thumbnailUrl: "https://i.ytimg.com/vi/Qyd_v3DGzTM/maxresdefault.jpg",
    duration: "8:32",
    durationSeconds: 512,
    language: "en",
    sortOrder: 2,
    source: "curated",
    description: "A clear explanation of how to solve two-step equations with examples.",
  },

  // =============================
  // LINEAR EQUATIONS (ONE VARIABLE)
  // =============================
  {
    videoId: "9IUEk9fn2Vs",
    topicId: "linear-equations-one-var",
    courseId: "pre-calculus-algebra",
    title: "Solving Linear Equations - Multi-Step Equations",
    titleHe: "פתרון משוואות ליניאריות - רב שלביות",
    channelName: "The Organic Chemistry Tutor",
    thumbnailUrl: "https://i.ytimg.com/vi/9IUEk9fn2Vs/maxresdefault.jpg",
    duration: "18:45",
    durationSeconds: 1125,
    language: "en",
    sortOrder: 1,
    source: "curated",
    description: "Complete guide to solving multi-step linear equations with variables on both sides.",
  },

  // =============================
  // SYSTEMS OF EQUATIONS
  // =============================
  {
    videoId: "vA-55wZtLeE",
    topicId: "systems-of-equations",
    courseId: "pre-calculus-algebra",
    title: "Systems of Equations - Substitution Method",
    titleHe: "מערכת משוואות - שיטת ההצבה",
    channelName: "Khan Academy",
    thumbnailUrl: "https://i.ytimg.com/vi/vA-55wZtLeE/maxresdefault.jpg",
    duration: "6:15",
    durationSeconds: 375,
    language: "en",
    sortOrder: 1,
    source: "curated",
    description: "Learn how to solve systems of equations using the substitution method.",
  },
  {
    videoId: "oMXmUuH0A6k",
    topicId: "systems-of-equations",
    courseId: "pre-calculus-algebra",
    title: "Systems of Equations - Elimination Method",
    titleHe: "מערכת משוואות - שיטת החיסור",
    channelName: "Professor Leonard",
    thumbnailUrl: "https://i.ytimg.com/vi/oMXmUuH0A6k/maxresdefault.jpg",
    duration: "32:18",
    durationSeconds: 1938,
    language: "en",
    sortOrder: 2,
    source: "curated",
    description: "Comprehensive explanation of the elimination method for solving systems of equations.",
  },

  // =============================
  // EXPANDING EXPRESSIONS
  // =============================
  {
    videoId: "ZRLGnwSdUfM",
    topicId: "expanding-expressions",
    courseId: "pre-calculus-algebra",
    title: "FOIL Method - Multiplying Binomials",
    titleHe: "שיטת FOIL - כפל בינומים",
    channelName: "Math Antics",
    thumbnailUrl: "https://i.ytimg.com/vi/ZRLGnwSdUfM/maxresdefault.jpg",
    duration: "7:58",
    durationSeconds: 478,
    language: "en",
    sortOrder: 1,
    source: "curated",
    description: "Learn the FOIL method for multiplying two binomials together.",
  },

  // =============================
  // FACTORING BASICS
  // =============================
  {
    videoId: "iDXmRuJ6e1M",
    topicId: "factoring-basics",
    courseId: "pre-calculus-algebra",
    title: "Factoring Greatest Common Factor",
    titleHe: "פירוק לגורם משותף גדול ביותר",
    channelName: "The Organic Chemistry Tutor",
    thumbnailUrl: "https://i.ytimg.com/vi/iDXmRuJ6e1M/maxresdefault.jpg",
    duration: "12:34",
    durationSeconds: 754,
    language: "en",
    sortOrder: 1,
    source: "curated",
    description: "Learn how to factor out the greatest common factor (GCF) from polynomial expressions.",
  },
  {
    videoId: "sLQSH3N3x7s",
    topicId: "factoring-basics",
    courseId: "pre-calculus-algebra",
    title: "Difference of Squares Factoring",
    titleHe: "פירוק הפרש ריבועים",
    channelName: "Khan Academy",
    thumbnailUrl: "https://i.ytimg.com/vi/sLQSH3N3x7s/maxresdefault.jpg",
    duration: "3:45",
    durationSeconds: 225,
    language: "en",
    sortOrder: 2,
    source: "curated",
    description: "Factor expressions using the difference of squares pattern.",
  },

  // =============================
  // FACTORING TRINOMIALS
  // =============================
  {
    videoId: "AMEau9OE6Bs",
    topicId: "factoring-trinomials",
    courseId: "pre-calculus-algebra",
    title: "Factoring Trinomials - Easy Method",
    titleHe: "פירוק טרינומים - שיטה קלה",
    channelName: "The Organic Chemistry Tutor",
    thumbnailUrl: "https://i.ytimg.com/vi/AMEau9OE6Bs/maxresdefault.jpg",
    duration: "23:12",
    durationSeconds: 1392,
    language: "en",
    sortOrder: 1,
    source: "curated",
    description: "Complete guide to factoring trinomials with leading coefficient of 1 and greater.",
  },

  // =============================
  // QUADRATIC BY FACTORING
  // =============================
  {
    videoId: "SD2R37BKPjE",
    topicId: "quadratic-by-factoring",
    courseId: "pre-calculus-algebra",
    title: "Solving Quadratic Equations by Factoring",
    titleHe: "פתרון משוואות ריבועיות על ידי פירוק",
    channelName: "The Organic Chemistry Tutor",
    thumbnailUrl: "https://i.ytimg.com/vi/SD2R37BKPjE/maxresdefault.jpg",
    duration: "15:26",
    durationSeconds: 926,
    language: "en",
    sortOrder: 1,
    source: "curated",
    description: "Learn how to solve quadratic equations by factoring using the zero product property.",
  },

  // =============================
  // QUADRATIC FORMULA
  // =============================
  {
    videoId: "IlNAJl36-10",
    topicId: "quadratic-formula",
    courseId: "pre-calculus-algebra",
    title: "The Quadratic Formula Explained",
    titleHe: "נוסחת השורשים - הסבר",
    channelName: "3Blue1Brown",
    thumbnailUrl: "https://i.ytimg.com/vi/IlNAJl36-10/maxresdefault.jpg",
    duration: "14:22",
    durationSeconds: 862,
    language: "en",
    sortOrder: 1,
    source: "curated",
    description: "A visual and intuitive explanation of the quadratic formula and where it comes from.",
  },
  {
    videoId: "2ZzuZvz33X0",
    topicId: "quadratic-formula",
    courseId: "pre-calculus-algebra",
    title: "Quadratic Formula - Solving Quadratic Equations",
    titleHe: "נוסחת השורשים - פתרון משוואות ריבועיות",
    channelName: "The Organic Chemistry Tutor",
    thumbnailUrl: "https://i.ytimg.com/vi/2ZzuZvz33X0/maxresdefault.jpg",
    duration: "17:45",
    durationSeconds: 1065,
    language: "en",
    sortOrder: 2,
    source: "curated",
    description: "Complete tutorial on using the quadratic formula with the discriminant.",
  },

  // =============================
  // FUNCTION NOTATION
  // =============================
  {
    videoId: "kvGsIo1TmsM",
    topicId: "function-notation",
    courseId: "pre-calculus-algebra",
    title: "Function Notation - Introduction",
    titleHe: "סימון פונקציות - מבוא",
    channelName: "Khan Academy",
    thumbnailUrl: "https://i.ytimg.com/vi/kvGsIo1TmsM/maxresdefault.jpg",
    duration: "5:42",
    durationSeconds: 342,
    language: "en",
    sortOrder: 1,
    source: "curated",
    description: "Introduction to f(x) notation and evaluating functions.",
  },

  // =============================
  // DOMAIN & RANGE
  // =============================
  {
    videoId: "O0uUVH8dRiU",
    topicId: "domain-range",
    courseId: "pre-calculus-algebra",
    title: "Domain and Range of Functions",
    titleHe: "תחום וטווח של פונקציות",
    channelName: "The Organic Chemistry Tutor",
    thumbnailUrl: "https://i.ytimg.com/vi/O0uUVH8dRiU/maxresdefault.jpg",
    duration: "22:18",
    durationSeconds: 1338,
    language: "en",
    sortOrder: 1,
    source: "curated",
    description: "Complete guide to finding domain and range of various function types.",
  },

  // =============================
  // BASIC GRAPHING
  // =============================
  {
    videoId: "IL3UCuXrUzE",
    topicId: "basic-graphing",
    courseId: "pre-calculus-algebra",
    title: "Graphing Linear Equations - Slope Intercept Form",
    titleHe: "שרטוט משוואות ליניאריות - צורת שיפוע-חיתוך",
    channelName: "Math Antics",
    thumbnailUrl: "https://i.ytimg.com/vi/IL3UCuXrUzE/maxresdefault.jpg",
    duration: "9:28",
    durationSeconds: 568,
    language: "en",
    sortOrder: 1,
    source: "curated",
    description: "Learn how to graph linear equations using slope-intercept form (y = mx + b).",
  },
  {
    videoId: "WkspBxrzuZo",
    topicId: "basic-graphing",
    courseId: "pre-calculus-algebra",
    title: "Graphing Parabolas - Vertex and Intercepts",
    titleHe: "שרטוט פרבולות - קודקוד ונקודות חיתוך",
    channelName: "Khan Academy",
    thumbnailUrl: "https://i.ytimg.com/vi/WkspBxrzuZo/maxresdefault.jpg",
    duration: "6:55",
    durationSeconds: 415,
    language: "en",
    sortOrder: 2,
    source: "curated",
    description: "Learn how to graph quadratic functions by finding vertex and intercepts.",
  },
];

async function seedVideos() {
  console.log("🎬 Starting video seed...\n");

  // Verify env variables are loaded
  if (!appwriteConfig.endpoint || !appwriteConfig.projectId || !appwriteConfig.apiKey) {
    console.error("❌ Missing environment variables!");
    console.error("   NEXT_PUBLIC_APPWRITE_ENDPOINT:", appwriteConfig.endpoint ? "✓" : "✗");
    console.error("   NEXT_PUBLIC_APPWRITE_PROJECT_ID:", appwriteConfig.projectId ? "✓" : "✗");
    console.error("   APPWRITE_API_KEY:", appwriteConfig.apiKey ? "✓" : "✗");
    process.exit(1);
  }

  const { databases } = createClient();

  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (const video of videosToSeed) {
    try {
      // Check if video already exists (by videoId + topicId)
      const existing = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.topicVideos,
        [
          Query.equal("videoId", video.videoId),
          Query.equal("topicId", video.topicId),
        ]
      );

      if (existing.total > 0) {
        console.log(`⏭️  Skipping (exists): ${video.title}`);
        skippedCount++;
        continue;
      }

      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.topicVideos,
        ID.unique(),
        {
          videoId: video.videoId,
          topicId: video.topicId,
          courseId: video.courseId,
          title: video.title,
          titleHe: video.titleHe || null,
          channelName: video.channelName,
          thumbnailUrl: video.thumbnailUrl,
          duration: video.duration || null,
          durationSeconds: video.durationSeconds || null,
          language: video.language,
          sortOrder: video.sortOrder,
          source: video.source,
          description: video.description || null,
          isActive: true,
        }
      );

      console.log(`✅ Added: ${video.title}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error adding ${video.title}:`, error);
      errorCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Successfully added: ${successCount}`);
  console.log(`   ⏭️  Skipped (existing): ${skippedCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📝 Total videos: ${videosToSeed.length}`);
}

// Run the seed
seedVideos()
  .then(() => {
    console.log("\n🎉 Video seeding complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seeding failed:", error);
    process.exit(1);
  });
