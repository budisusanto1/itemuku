'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import './globals.css';
import MainLayout from '@/app/(view)/layout/main';
import { usePathname } from 'next/navigation';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isAuthPage = pathname === '/signin' || pathname === '/signup';

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="light">
            {isAuthPage ? children : <MainLayout>{children}</MainLayout>}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
