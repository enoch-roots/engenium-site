import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans, JetBrains_Mono } from "next/font/google";
import ClientShell from "./components/ClientShell";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-dm-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-jetbrains",
  display: "swap",
});

const SITE_URL = "https://engeniumlabs.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0c0a08",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Engenium Labs — Digital Infrastructure for Businesses That Want to Be Found",
    template: "%s | Engenium Labs",
  },
  description:
    "Strategy, systems, and digital infrastructure engineered to compound. Built to be found — in the generation of AI search.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Engenium Labs",
    title: "Engenium Labs — Built to Be Found. In the Generation of AI Search.",
    description:
      "Strategy, systems, and digital infrastructure engineered to compound. Built to be found — in the generation of AI search.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Engenium Labs — Built to be found. In the new generation of search.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Engenium Labs — Built to Be Found. In the Generation of AI Search.",
    description:
      "Strategy, systems, and digital infrastructure engineered to compound. Built to be found — in the generation of AI search.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${cormorant.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className="h-full bg-[#0c0a08] overflow-hidden">
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
