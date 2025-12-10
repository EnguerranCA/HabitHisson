import { Geist, Geist_Mono } from 'next/font/google';
import type { Metadata } from 'next'

import '@repo/ui/globals.css';
import { Providers } from '@/components/providers';

const fontSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'HabitHisson - Suivi de vos habitudes',
  description: 'Suivez vos habitudes quotidiennes et hebdomadaires avec votre hérisson personnel',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
