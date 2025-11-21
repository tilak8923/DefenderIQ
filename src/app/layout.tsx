import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Analytics } from "@vercel/analytics/next";
import { FirebaseClientProvider } from '@/firebase';
import { ThemeProvider } from 'next-themes';

export const metadata: Metadata = {
  title: 'DefendIQ',
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
         <link rel="stylesheet" href="https://use.typekit.net/clb1mwh.css" />
      </head>
      <body>
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
