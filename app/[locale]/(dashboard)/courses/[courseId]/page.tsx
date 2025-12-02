"use client";

import { useParams, useRouter } from "next/navigation";
import { CourseDetailView } from "@/modules/courses";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const handleTopicClick = (topicId: string) => {
    // Navigate to topic detail page (study hub)
    router.push(`/courses/${courseId}/topics/${topicId}`);
  };

  return (
    <CourseDetailView
      courseId={courseId}
      onTopicClick={handleTopicClick}
    />
  );
}
