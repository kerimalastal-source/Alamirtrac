import type { Metadata } from "next";
import Script from "next/script";
import { Cairo, Tajawal } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContactButtons from "@/components/FloatingContactButtons";
import JsonLd from "@/components/JsonLd";
import { business } from "@/lib/content";
import { localBusinessSchema, websiteSchema } from "@/lib/schema";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-8N9W3E758L";

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
    "Alamir Trac",
    "الأمير تراك",
    "الامير تراك",
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
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <JsonLd data={localBusinessSchema()} />
        <JsonLd data={websiteSchema()} />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingContactButtons />
      </body>
    </html>
  );
}
