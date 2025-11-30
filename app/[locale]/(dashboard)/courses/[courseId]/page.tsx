"use client";

import { useParams, useRouter } from "next/navigation";
import { CourseDetailView } from "@/modules/courses";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const handleTopicClick = (topicId: string) => {
    // Navigate to topic practice page
    router.push(`/practice/topic/${topicId}`);
  };

  return (
    <CourseDetailView
      courseId={courseId}
      onTopicClick={handleTopicClick}
    />
  );
}
