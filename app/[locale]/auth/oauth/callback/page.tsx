// OAuth callback page - handles redirect after OAuth authentication
import { redirect } from "next/navigation";
import { createSessionClient, createAdminClient } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";

export default async function OAuthCallbackPage() {
  try {
    // 1. Get the current session (set by Appwrite after OAuth)
    const { account } = await createSessionClient();
    const user = await account.get();

    // 2. Check if user profile exists
    const { databases } = await createAdminClient();
    let profileExists = false;
    let onboardingComplete = false;

    try {
      await databases.getDocument(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_USERS_PROFILE_COLLECTION!,
        user.$id
      );
      profileExists = true;
    } catch {
      // Profile doesn't exist, we'll create it
      profileExists = false;
    }

    // 3. Create profile if it doesn't exist
    if (!profileExists) {
      await databases.createDocument(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_USERS_PROFILE_COLLECTION!,
        user.$id,
        {
          userId: user.$id,
          email: user.email,
          displayName: user.name || user.email.split("@")[0],
          totalXp: 0,
          currentLevel: 1,
          currentStreak: 0,
          longestStreak: 0,
          dailyExerciseCount: 5,
          enrolledCourses: "[]",
          preferredTime: "09:00",
          emailReminders: true,
          streakWarnings: true,
          weeklyReport: false,
        }
      );
    }

    // 4. Check onboarding status
    try {
      const onboardingDocs = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_ONBOARDING_COLLECTION!,
        [Query.equal("userId", user.$id)]
      );

      if (onboardingDocs.documents.length > 0) {
        onboardingComplete = onboardingDocs.documents[0].isCompleted === true;
      }
    } catch {
      // Onboarding collection might not exist or no document found
      onboardingComplete = false;
    }

    // 5. Redirect based on onboarding status
    if (onboardingComplete) {
      redirect("/dashboard");
    } else {
      redirect("/onboarding");
    }
  } catch (error) {
    console.error("OAuth callback error:", error);
    // If session doesn't exist or any error, redirect to login
    redirect("/auth/login?error=oauth_failed");
  }
}
