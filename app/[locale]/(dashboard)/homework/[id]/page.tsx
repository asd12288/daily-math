import { setRequestLocale } from "next-intl/server";
import { HomeworkDetailView } from "@/modules/homework/ui";

export default async function HomeworkDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return (
    <div className="p-6">
      <HomeworkDetailView homeworkId={id} />
    </div>
  );
}
