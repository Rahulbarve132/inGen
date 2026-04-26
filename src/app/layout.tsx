import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { SidebarProvider } from '@/components/layout/SidebarContext';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'Generator Monitoring System',
  description: 'Industrial-grade IoT Dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 overflow-x-hidden min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SidebarProvider>
            {/* Outer flex: sidebar (desktop) | content column */}
            <div className="flex min-h-screen">
            {/* Sidebar: sticky on desktop, drawer on mobile */}
            <Sidebar />

            {/* Main content column */}
            <div className="flex flex-col flex-1 min-w-0 overflow-x-hidden">
              <Header />
              <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
