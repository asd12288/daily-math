import { setRequestLocale } from "next-intl/server";
import { OnboardingWizard } from "@/modules/onboarding";

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <OnboardingWizard />;
}
