import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ToasterProvider from '@/components/providers/ToasterProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'House Rent Management',
  description: 'Manage tenants, rooms, meter readings, and payments effortlessly.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} antialiased min-h-screen bg-white dark:bg-slate-900 transition-colors`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <ToasterProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
