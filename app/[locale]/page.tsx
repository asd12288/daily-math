import {
  LandingHeader,
  LandingBanner,
  AIPoweredSection,
  FeatureHomework,
  FeaturePractice,
  FeatureHints,
  BenefitsGrid,
  AppShowcase,
  Testimonials,
  Pricing,
  CTASection,
  LandingFooter,
} from "@/modules/landing";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black font-sans">
      <LandingHeader />
      <main className="flex-grow">
        <LandingBanner />
        <AIPoweredSection />
        <FeatureHomework />
        <FeaturePractice />
        <FeatureHints />
        <BenefitsGrid />
        <AppShowcase />
        <Testimonials />
        <Pricing />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
