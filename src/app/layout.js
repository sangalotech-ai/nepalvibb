import { Sora, Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";

const sora = Sora({ 
  subsets: ["latin"],
  weight: ['400', '700'],
  variable: '--font-sora',
  display: 'swap',
});

const inter = Inter({
  subsets: ["latin"],
  weight: ['300', '400', '600'],
  variable: '--font-inter',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nepalvibb.com';

export const metadata = {
  title: {
    template: '%s | Nepalvibb',
    default: 'Nepalvibb – Din Norske Reisepartner til Nepal & Himalaya',
  },
  description: 'Opplev Nepal med Nepalvibb. Skreddersydde trekking-, kultur- og eventyrreiser i Himalaya. Norskspråklig support, lokale eksperter og uforglemmelige opplevelser.',
  keywords: ['Nepal reise', 'trekking Nepal', 'Himalaya', 'Everest Base Camp', 'Annapurna', 'Nepal tur', 'reisebyrå Nepal', 'norsk reisebyrå'],
  authors: [{ name: 'Nepalvibb' }],
  creator: 'Nepalvibb',
  publisher: 'Nepalvibb',
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
    languages: { 'no': '/' },
  },
  openGraph: {
    title: 'Nepalvibb – Din Norske Reisepartner til Nepal & Himalaya',
    description: 'Skreddersydde trekking-, kultur- og eventyrreiser i Nepal. Norskspråklig support og lokale eksperter.',
    url: siteUrl,
    siteName: 'Nepalvibb',
    locale: 'nb_NO',
    type: 'website',
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Nepalvibb – Reiser til Nepal og Himalaya',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nepalvibb – Din Norske Reisepartner til Nepal & Himalaya',
    description: 'Skreddersydde trekking-, kultur- og eventyrreiser i Nepal. Norskspråklig support og lokale eksperter.',
    images: [`${siteUrl}/og-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="no" className="scroll-smooth">
      <body className={`${sora.variable} ${inter.variable} font-sans bg-white text-gray-900 antialiased`}>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://nepalvibb.com" />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
