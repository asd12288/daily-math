import { setRequestLocale } from "next-intl/server";
import { SessionView } from "@/modules/session/ui";

export default async function ActiveSessionPage({
  params,
}: {
  params: Promise<{ locale: string; sessionId: string }>;
}) {
  const { locale, sessionId } = await params;
  setRequestLocale(locale);

  return (
    <div className="p-6">
      <SessionView sessionId={sessionId} />
    </div>
  );
}
