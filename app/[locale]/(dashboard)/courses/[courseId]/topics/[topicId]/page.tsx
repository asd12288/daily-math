// app/[locale]/(dashboard)/courses/[courseId]/topics/[topicId]/page.tsx
// Topic detail page

import { TopicDetailView } from "@/modules/topics/ui/views";

interface TopicPageProps {
  params: Promise<{
    locale: string;
    courseId: string;
    topicId: string;
  }>;
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { courseId, topicId } = await params;

  return <TopicDetailView topicId={topicId} courseId={courseId} />;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: TopicPageProps) {
  const { topicId } = await params;

  return {
    title: `Topic: ${topicId} | DailyMath`,
    description: "Study this topic with theory, formulas, and practice questions",
  };
}
