import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const SITE = "https://shreyas.info";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Shreyas Fegade — Raw signal into legible intelligence",
  description:
    "Portfolio of Shreyas Fegade — second-year CSE at Manipal University Jaipur. Six products that turn messy raw signal into legible intelligence, through custom-built visualization. Cortex, REGIME, Knowledge Mapper, Forensics, Chronicle, Unbored.",
  keywords: [
    "Shreyas Fegade",
    "portfolio",
    "software engineer",
    "data visualization",
    "Cortex",
    "REGIME",
    "Knowledge Mapper",
    "Forensics",
    "Chronicle",
    "Unbored",
  ],
  authors: [{ name: "Shreyas Fegade", url: SITE }],
  openGraph: {
    type: "website",
    url: SITE,
    title: "Shreyas Fegade — Raw signal into legible intelligence",
    description:
      "Six products that turn messy raw signal into legible intelligence, through custom-built visualization.",
    siteName: "Shreyas Fegade",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shreyas Fegade — Raw signal into legible intelligence",
    description:
      "Six products that turn messy raw signal into legible intelligence, through custom-built visualization.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // The void is pure black — paint the browser chrome to match on mobile.
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body>{children}</body>
    </html>
  );
}
