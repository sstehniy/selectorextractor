import { Providers } from "@/lib/providers";
import type { Metadata } from "next";
import "@/index.css";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "AI Scrape Assistant - Extract Data from HTML with AI",
  description:
    "Powerful AI-powered tool to extract structured data from HTML content. Upload HTML and define fields to extract with intelligent CSS selectors.",
  keywords: [
    "AI",
    "web scraping",
    "data extraction",
    "HTML parsing",
    "CSS selectors",
  ],
  authors: [{ name: "AI Scrape Assistant" }],
  robots: "index, follow",
  icons: {
    icon: "/vite.svg",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = headers();
  const theme = (await headersList).get("x-theme") || "light";
  return (
    <html lang="en" className={theme}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
