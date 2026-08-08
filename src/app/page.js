import dynamic from 'next/dynamic';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { ArrowRight } from 'lucide-react';
import HomeContent from '@/models/HomeContent';
import Banner from '@/models/Banner';
import dbConnect from '@/lib/mongodb';

const HeroBanner = dynamic(() => import('@/components/home/HeroBanner'), { ssr: true });

const SearchSection = dynamic(() => import('@/components/home/SearchSection'), { ssr: true });
const DestinationCards = dynamic(() => import('@/components/home/DestinationCards'), { ssr: true });
const FeaturedActivities = dynamic(() => import('@/components/home/FeaturedActivities'), { ssr: true });
const WhoWeAre = dynamic(() => import('@/components/home/WhoWeAre'), { ssr: true });
const FeaturedTours = dynamic(() => import('@/components/home/FeaturedTours'), { ssr: true });
const LatestBlogs = dynamic(() => import('@/components/home/LatestBlogs'), { ssr: true });
const Testimonials = dynamic(() => import('@/components/home/Testimonials'), { ssr: true });

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
  let content = await HomeContent.findOne({});
  if (!content) {
    content = await HomeContent.create({});
  }
  return JSON.parse(JSON.stringify(content));
}

export default async function Home() {
  const [content, banners] = await Promise.all([
    getHomeContent(),
    Banner.find({ isActive: true }).sort({ order: 1 }).lean().catch(() => []),
  ]);
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value === 'en' ? 'en' : 'no';

  return (
    <main className="relative bg-white">
      <HeroBanner initialBanners={JSON.parse(JSON.stringify(banners))} />
      
      {/* Filter Section */}
      <SearchSection />
      
      {/* Destination Grid */}
      <DestinationCards content={content.destinations} />

      {/* Featured Activities */}
      <FeaturedActivities content={content.activities} />
      
      {/* Who We Are */}
      <WhoWeAre content={content.whoWeAre} />
      
      {/* Featured Tours */}
      <FeaturedTours content={content.tours} />
    
      {/* Purpose Section */}
      <section className="relative py-20 sm:py-28 overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-emerald-900"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20">
          <img
            src={content.purpose?.image || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1920&q=80'}
            alt=""
            className="w-full h-full object-cover"
            fetchPriority="high"
          />
        </div>

        <div className="absolute top-10 -left-20 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Left Content */}
            <div className="flex-1 max-w-xl space-y-8">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-2 rounded-full border border-white/10">
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
                <span className="text-orange-300 font-bold uppercase tracking-widest text-[10px]">
                  {content.purpose?.subtitle || 'Vår Visjon'}
                </span>
              </div>

              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display text-white tracking-tight leading-[1.1]">
                {content.purpose?.title || 'Opplevelser som'}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-300">
                  {' '}forvandler
                </span>
              </h2>

              <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-orange-300 rounded-full"></div>

              <p className="text-white/70 text-lg font-light leading-relaxed">
                {content.purpose?.description || 'Vi skaper autentiske reiser som forbinder deg med hjertet av Nepal – fra Himalaya til eldgamle kulturarv.'}
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4 pt-2">
                <Link
                  href={content.purpose?.buttonLink || '/om-prosjektet'}
                  className="group inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3.5 text-xs font-black uppercase tracking-widest transition-all duration-300 rounded-full shadow-[0_15px_35px_rgba(249,115,22,0.4)] hover:shadow-[0_20px_50px_rgba(249,115,22,0.5)] hover:scale-105 active:scale-95 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    {content.purpose?.buttonText || 'Les mer om prosjektet'}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>

                <Link
                  href="/turer"
                  className="inline-flex items-center gap-2 text-white/70 hover:text-white text-xs font-bold uppercase tracking-wider transition-all border border-white/20 hover:border-white/40 px-7 py-3.5 rounded-full hover:bg-white/5"
                >
                  Utforsk våre turer
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="flex-1 w-full max-w-lg lg:max-w-none">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 to-emerald-500/20 rounded-[2.5rem] blur-xl"></div>
                <div className="relative aspect-[4/3] lg:aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10">
                  <img
                    src={content.purpose?.image || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1920&q=80'}
                    alt="Nepal adventure"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent"></div>

                  <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        {[1,2,3].map(i => (
                          <div key={i} className="w-9 h-9 rounded-full border-2 border-white/30 bg-orange-500/30 flex items-center justify-center text-white text-[9px] font-bold">+{i*2}</div>
                        ))}
                      </div>
                      <div className="text-white text-xs font-light">
                        <span className="font-bold text-orange-300">{content.purpose?.travelersValue || '200+'}</span>{' '}
                        {locale === 'en'
                          ? (content.purpose?.travelersLabelEn || 'happy travelers')
                          : (content.purpose?.travelersLabel || 'reisende fornøyd')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials content={content.testimonials} />

      {/* Blogs / News */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h5 className="text-orange-500 font-bold uppercase tracking-wider text-xs mb-3">
              {content.blog?.subtitle}
            </h5>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-display text-primary tracking-tight leading-tight">
              {content.blog?.title}
            </h2>
          </div>
          
          <LatestBlogs />

          <div className="mt-12 text-center">
            <Link href="/blogg" className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-primary hover:text-orange-500 transition-colors group">
              <span>Se alle artikler</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
