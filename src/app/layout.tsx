import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const sans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const title = "left / right — which hand types faster?";
const description =
  "A typing test that times each hand separately. See whether your left or right hand is faster, key by key, and compare with everyone else.";

export const metadata: Metadata = {
  metadataBase: new URL("https://leftrighthand.vercel.app"),
  title,
  description,
  openGraph: { title, description, siteName: "left / right", type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = {
  themeColor: "#0c0c0d",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-dvh bg-bg font-mono text-neutral-300 antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
