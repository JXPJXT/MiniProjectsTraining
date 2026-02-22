import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "ML Insight Explorer — Interactive Machine Learning Platform",
  description:
    "An educational, production-grade ML exploration platform. Select datasets, run EDA, train models, and deeply understand every metric.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
