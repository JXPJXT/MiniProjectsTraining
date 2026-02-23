// ============================================
// Root Layout — Rajasthan Weather Monitor
// ============================================

import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rajasthan Weather & Air Quality Monitor',
  description:
    'Live weather, air quality, heatwave alerts, dust storm monitoring, and monsoon tracking for Rajasthan cities — Jaipur, Jodhpur, Udaipur, Bikaner, Ajmer, Kota and more.',
  keywords: [
    'Rajasthan weather',
    'Jaipur weather',
    'air quality India',
    'heatwave alert',
    'dust storm Thar',
    'monsoon tracker',
    'AQI Rajasthan',
  ],
  authors: [{ name: 'Weather Monitor' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0e1a' },
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div id="app-root">{children}</div>
      </body>
    </html>
  );
}
