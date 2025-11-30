import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { isRtlLocale, type Locale } from "@/i18n/config";
import { TRPCProvider } from "@/trpc/provider";
import { ThemeProvider } from "@/shared/context";
import { AppwritePing } from "@/components/AppwritePing";
import { Heebo } from "next/font/google";
import "../globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["latin", "hebrew"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Get messages for the locale
  const messages = await getMessages();

  // Determine text direction
  const dir = isRtlLocale(locale as Locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <body
        className={`${heebo.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <TRPCProvider>
            <ThemeProvider>
              <AppwritePing />
              {children}
            </ThemeProvider>
          </TRPCProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
