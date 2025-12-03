import { setRequestLocale } from "next-intl/server";
import { SessionResultsView } from "@/modules/session/ui";

export default async function SessionResultsPage({
  params,
}: {
  params: Promise<{ locale: string; sessionId: string }>;
}) {
  const { locale, sessionId } = await params;
  setRequestLocale(locale);

  return (
    <div className="p-6">
      <SessionResultsView sessionId={sessionId} />
    </div>
  );
}
