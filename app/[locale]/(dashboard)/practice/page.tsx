import { setRequestLocale } from "next-intl/server";
import { PracticeView } from "@/modules/practice/ui/views/practice-view";

export default async function PracticePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <PracticeView />;
}
