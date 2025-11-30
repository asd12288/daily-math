"use client";

import { useParams } from "next/navigation";
import { TopicPracticeView } from "@/modules/practice/ui/views/topic-practice-view";

export default function TopicPracticePage() {
  const params = useParams();
  const topicId = params.topicId as string;

  return <TopicPracticeView topicId={topicId} />;
}
