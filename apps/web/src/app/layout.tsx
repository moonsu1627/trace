import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trace — Developer Signal Engine",
  description:
    "Trace turns GitHub stars, issues, PRs, and waitlist signals into a live timeline of who matters today. Built for solo devs, indie hackers, and AI builders.",
  metadataBase: new URL("https://trace.dev"),
  openGraph: {
    title: "Trace — Developer Signal Engine",
    description: "Know who's about to buy. Before they email you.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
