import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import '../styles/globals.css';
import { Toaster } from 'sonner';
import AuthProvider from '@/providers/AuthProvider';
import RQueryClientProvider from '@/providers/RQueryClientProvider';
import ThemeProvider from '@/providers/ThemeProvider';

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
  display: 'swap',
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'Pristyn Service Desk',
  description: 'Customer service ticketing platform with role-based dashboards',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${nunito.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <RQueryClientProvider>
            <AuthProvider>{children}</AuthProvider>
          </RQueryClientProvider>
        </ThemeProvider>

        <Toaster position='bottom-right' richColors />
      </body>
    </html>
  );
}
