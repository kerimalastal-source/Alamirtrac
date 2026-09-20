import type { Metadata } from "next";
import { Cairo, Tajawal } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContactButtons from "@/components/FloatingContactButtons";
import JsonLd from "@/components/JsonLd";
import { business } from "@/lib/content";
import { localBusinessSchema } from "@/lib/schema";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["500", "700", "800"],
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(business.url),
  title: {
    default: `${business.fullName} | ${business.tagline}`,
    template: `%s | ${business.nameBrand}`,
  },
  description: business.description,
  keywords: [
    "صيانة معدات ثقيلة",
    "صيانة هيدروليك",
    "صيانة محركات ديزل",
    "إعادة تأهيل معدات ثقيلة",
    "صيانة معدات ثقيلة القاهرة",
    "ALAMIR TRAC",
  ],
  authors: [{ name: business.fullName, url: business.url }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    url: business.url,
    siteName: business.nameBrand,
    title: `${business.fullName} | ${business.tagline}`,
    description: business.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${business.fullName} | ${business.tagline}`,
    description: business.description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${tajawal.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <JsonLd data={localBusinessSchema()} />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingContactButtons />
      </body>
    </html>
  );
}
