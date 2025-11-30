// modules/skill-tree/ui/components/flow/SkillTreeFlowContainer.tsx
// Container component that handles data fetching and device detection

"use client";

import { useMemo } from "react";
import { useLocale } from "next-intl";
import { Icon } from "@iconify/react";

import { useSkillTree } from "@/modules/skill-tree/hooks";
import { useCourseDetail } from "@/modules/courses/hooks";
import { useIsMobile } from "@/shared/hooks/use-is-mobile";
import { Card, CardContent } from "@/shared/ui";

import { SkillTreeFlow } from "./SkillTreeFlow";
import { SkillTreeView } from "../SkillTreeView";

interface SkillTreeFlowContainerProps {
  courseId: string;
  onTopicClick?: (topicId: string) => void;
}

/**
 * Container component that:
 * 1. Fetches skill tree data with user progress
 * 2. Filters branches by course's branchIds
 * 3. Detects device type
 * 4. Renders React Flow on desktop, list view on mobile
 */
export function SkillTreeFlowContainer({
  courseId,
  onTopicClick,
}: SkillTreeFlowContainerProps) {
  const locale = useLocale();
  const isRtl = locale === "he";
  const isMobile = useIsMobile(768); // md breakpoint

  // Fetch course detail to get branchIds
  const { courseDetail, isLoading: courseLoading, error: courseError } = useCourseDetail(courseId);

  // Fetch full skill tree with user progress
  const { skillTree, isLoading: treeLoading, error: treeError } = useSkillTree();

  // Filter skill tree branches by course's branchIds
  const filteredBranches = useMemo(() => {
    if (!skillTree || !courseDetail) return [];

    const courseBranchIds = courseDetail.course.branchIds;
    return skillTree.branches.filter((branch) =>
      courseBranchIds.includes(branch.id)
    );
  }, [skillTree, courseDetail]);

  // Loading state
  if (courseLoading || treeLoading) {
    return <SkillTreeSkeleton />;
  }

  // Error state
  if (courseError || treeError || !skillTree || !courseDetail) {
    return (
      <Card className="border-error-200 dark:border-error-800">
        <CardContent className="py-8 text-center">
          <Icon
            icon="tabler:alert-circle"
            height={48}
            className="mx-auto text-error-500 mb-3"
          />
          <p className="text-error-600 dark:text-error-400">
            Failed to load skill tree
          </p>
        </CardContent>
      </Card>
    );
  }

  // No branches found for course
  if (filteredBranches.length === 0) {
    return (
      <Card className="border-warning-200 dark:border-warning-800">
        <CardContent className="py-8 text-center">
          <Icon
            icon="tabler:tree"
            height={48}
            className="mx-auto text-warning-500 mb-3"
          />
          <p className="text-warning-600 dark:text-warning-400">
            No topics found for this course
          </p>
        </CardContent>
      </Card>
    );
  }

  // Render list view on mobile
  if (isMobile) {
    return <SkillTreeView onTopicClick={onTopicClick} />;
  }

  // Render React Flow on desktop
  return (
    <SkillTreeFlow
      branches={filteredBranches}
      onTopicClick={onTopicClick}
      isRtl={isRtl}
    />
  );
}

function SkillTreeSkeleton() {
  return (
    <div className="h-full w-full bg-gray-100 dark:bg-gray-950 overflow-hidden animate-pulse">
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <Icon
            icon="tabler:loader-2"
            height={48}
            className="mx-auto text-gray-400 dark:text-gray-600 animate-spin mb-3"
          />
          <p className="text-gray-500 dark:text-gray-400">Loading skill tree...</p>
        </div>
      </div>
    </div>
  );
}

export default SkillTreeFlowContainer;
