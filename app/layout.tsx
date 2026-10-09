import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Smart Street Sentinel | Real-Time Municipal Infrastructure & Inspection',
  description: 'Real-time municipal street infrastructure monitoring and inspection mobile application tracking streetlights, drainage, water leaks, potholes, and electrical grid hazards.',
  openGraph: {
    title: 'Smart Street Sentinel | Real-Time Municipal Infrastructure & Inspection',
    description: 'Real-time municipal street infrastructure monitoring and inspection mobile application tracking streetlights, drainage, water leaks, potholes, and electrical grid hazards.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Smart Street Sentinel | Real-Time Municipal Infrastructure & Inspection',
    description: 'Real-time municipal street infrastructure monitoring and inspection mobile application tracking streetlights, drainage, water leaks, potholes, and electrical grid hazards.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-[#0B0F19] text-slate-100 antialiased min-h-screen selection:bg-cyan-500 selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
