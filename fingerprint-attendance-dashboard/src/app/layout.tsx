import type { Metadata } from 'next';
import { Inter, Outfit, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' });

export const metadata: Metadata = {
  title: 'BioSync Attendance Dashboard',
  description: 'Server Dashboard for Fingerprint Solution',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" />
      </head>
      <body className="font-sans antialiased selection:bg-primary/30" suppressHydrationWarning>
        <div className="industrial-grid fixed inset-0 z-[-1] pointer-events-none opacity-50" />
        <div className="scan-line" />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
