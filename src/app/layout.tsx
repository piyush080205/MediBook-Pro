import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import EmergencyFeature from '@/components/layout/EmergencyFeature';
import { FirebaseClientProvider } from '@/firebase';
import OfflineIndicator from '@/components/layout/OfflineIndicator';

export const metadata: Metadata = {
  title: 'MediBook Pro',
  description:
    'An intelligent platform for booking medical appointments, featuring AI-powered triage, slot optimization, and queue predictions.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Literata:opsz,wght@6..72,400;6..72,700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#1C274C" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
          <EmergencyFeature />
          <OfflineIndicator />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
