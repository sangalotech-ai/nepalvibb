import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import HomeContent from '@/models/HomeContent';
import Banner from '@/models/Banner';
import Tour from '@/models/Tour';
import Blog from '@/models/Blog';
import dbConnect from '@/lib/mongodb';

const HeroBanner = dynamic(() => import('@/components/home/HeroBanner'), { ssr: true });

const SearchSection = dynamic(() => import('@/components/home/SearchSection'), { ssr: true });
const DestinationCards = dynamic(() => import('@/components/home/DestinationCards'), { ssr: true });
const FeaturedActivities = dynamic(() => import('@/components/home/FeaturedActivities'), { ssr: true });
const WhoWeAre = dynamic(() => import('@/components/home/WhoWeAre'), { ssr: true });
const FeaturedTours = dynamic(() => import('@/components/home/FeaturedTours'), { ssr: true });
const PurposeSection = dynamic(() => import('@/components/home/PurposeSection'), { ssr: true });
const LatestBlogs = dynamic(() => import('@/components/home/LatestBlogs'), { ssr: true });
const Testimonials = dynamic(() => import('@/components/home/Testimonials'), { ssr: true });
const HomeBlogSection = dynamic(() => import('@/components/home/HomeBlogSection'), { ssr: true });

export const revalidate = 300;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nepalvibb.com';

export const metadata = {
  title: 'Nepalvibb – Din Norske Reisepartner til Nepal & Himalaya',
  description: 'Opplev Nepal med Nepalvibb. Vi tilbyr skreddersydde trekking-, kultur- og eventyrreiser i Himalaya. Norskspråklig support, lokale eksperter og uforglemmelige opplevelser.',
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

async function getHomeContent() {
  await dbConnect();
  let content = await HomeContent.findOne({}).lean();
  if (!content) {
    content = await HomeContent.create({});
    content = JSON.parse(JSON.stringify(content));
  }
  return JSON.parse(JSON.stringify(content));
}

export default async function Home() {
  await dbConnect();
  const [content, banners, featuredTours, latestBlogs] = await Promise.all([
    getHomeContent(),
    Banner.find({ isActive: { $ne: false } }).sort({ order: 1 }).lean().catch(() => []),
    Tour.find({})
      .select('title titleEn slug price duration durationEn difficulty difficultyEn image summary summaryEn category categoryEn isFeatured')
      .limit(9)
      .lean()
      .catch(() => []),
    Blog.find({ isPublished: { $ne: false } })
      .select('title titleEn slug image category categoryEn createdAt')
      .sort({ createdAt: -1 })
      .limit(3)
      .lean()
      .catch(() => []),
  ]);

  const serializedBanners = JSON.parse(JSON.stringify(banners));
  const serializedTours = JSON.parse(JSON.stringify(featuredTours));
  const serializedBlogs = JSON.parse(JSON.stringify(latestBlogs));

  return (
    <main className="relative bg-white">
      <HeroBanner initialBanners={serializedBanners} />
      
      {/* Filter Section */}
      <SearchSection />
      
      {/* Destination Grid */}
      <DestinationCards content={content.destinations} />

      {/* Featured Activities */}
      <FeaturedActivities content={content.activities} />
      
      {/* Who We Are */}
      <WhoWeAre content={content.whoWeAre} />
      
      {/* Featured Tours */}
      <FeaturedTours content={content.tours} initialTours={serializedTours} />
    
      {/* Purpose Section */}
      <PurposeSection content={content.purpose} />

      {/* Testimonials */}
      <Testimonials content={content.testimonials} />

      {/* Blogs / News */}
      <HomeBlogSection content={content.blog} initialBlogs={serializedBlogs} />
    </main>
  );
}
