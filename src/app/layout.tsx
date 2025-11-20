import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Analytics } from "@vercel/analytics/next";
import { FirebaseClientProvider } from '@/firebase';
import { ThemeProvider } from 'next-themes';

export const metadata: Metadata = {
  title: 'TSIEM',
  description: 'A cybersecurity monitoring and threat analysis dashboard.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <FirebaseClientProvider>
              {children}
            </FirebaseClientProvider>
            <Toaster />
            <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
