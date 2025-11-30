import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DailyMath - Master math, one day at a time",
  description: "Daily math exercises with AI-powered feedback and gamification",
};

// Root layout is a passthrough - the actual html/body are rendered in [locale]/layout.tsx
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
