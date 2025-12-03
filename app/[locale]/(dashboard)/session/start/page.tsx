import { setRequestLocale } from "next-intl/server";
import { SessionStartView } from "@/modules/session/ui";
import type { SessionSource } from "@/modules/session";

export default async function SessionStartPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ source?: string; id?: string }>;
}) {
  const { locale } = await params;
  const { source, id } = await searchParams;
  setRequestLocale(locale);

  // Validate required params
  if (!source || !id) {
    return (
      <div className="p-6 text-center">
        <p className="text-error-600">Missing source or id parameter</p>
      </div>
    );
  }

  // Validate source type
  const validSources: SessionSource[] = ["topic", "homework", "daily"];
  if (!validSources.includes(source as SessionSource)) {
    return (
      <div className="p-6 text-center">
        <p className="text-error-600">Invalid source type: {source}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <SessionStartView source={source as SessionSource} sourceId={id} />
    </div>
  );
}
