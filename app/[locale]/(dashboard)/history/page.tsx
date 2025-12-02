import { setRequestLocale } from "next-intl/server";
import { HistoryView } from "@/modules/practice/ui/views/history-view";

export default async function HistoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HistoryView />;
}
