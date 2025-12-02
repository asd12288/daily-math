import { setRequestLocale } from "next-intl/server";
import { HomeworkListView } from "@/modules/homework/ui";

export default async function HomeworkPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="p-6">
      <HomeworkListView />
    </div>
  );
}
