"use client";

import { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import {
  Calendar, User, Tag, Share2, ArrowLeft,
  ArrowRight, Clock, MessageSquare, Heart,
  ChevronRight, Facebook, Twitter, Linkedin,
  Mail, Bookmark, CheckCircle2, Layout,
  MapPin, Coffee, Eye, Mountain
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { cn } from '@/lib/utils';
import { tr } from '@/lib/tr';
import { useLocale } from '@/components/providers/useLocale';

export default function BlogDetailPage({ params }) {
  const { t, locale } = useLocale();
  const { slug } = use(params);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toc, setToc] = useState([]);
  const [activeId, setActiveId] = useState('');
  const contentRef = useRef(null);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 250]);
  const opacityHero = useTransform(scrollY, [0, 500], [1, 0]);
  const blurHero = useTransform(scrollY, [0, 500], [0, 10]);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(`/api/blogs/${slug}`);
        const result = await res.json();
        setData(result);

        setTimeout(() => {
          if (contentRef.current) {
            const headings = contentRef.current.querySelectorAll('h2, h3');
            const tocItems = Array.from(headings).map((heading, index) => {
              const id = heading.id || `section-${index}`;
              heading.id = id;
              return {
                id,
                text: heading.innerText,
                level: heading.tagName.toLowerCase() === 'h2' ? 2 : 3
              };
            });
            setToc(tocItems);
          }
        }, 300);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-10% 0px -80% 0px', threshold: 1.0 }
    );

    const headings = contentRef.current?.querySelectorAll('h2, h3') || [];
    headings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, [toc]);

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-[3px] border-primary/5 border-t-orange-500 rounded-full"
      />
      <p className="mt-6 text-[10px] font-bold uppercase tracking-wider text-primary/40 animate-pulse">{t.blogDetail.loadingText}</p>
    </div>
  );

  if (!data?.blog) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-8xl font-bold text-primary/5 absolute select-none">404</h1>
      <div className="relative space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold font-display text-primary tracking-tight">{t.blogDetail.notFoundTitle}</h2>
        <p className="text-gray-400 font-light max-w-xs mx-auto text-sm">{t.blogDetail.notFoundDesc}</p>
        <Link href="/blogg" className="inline-flex items-center space-x-2 bg-primary text-white px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:bg-orange-500 transition-all">
          <ArrowLeft className="w-4 h-4" /> <span>{t.blogDetail.backToBlog}</span>
        </Link>
      </div>
    </div>
  );

  const { blog, related } = data;
  const readingTime = Math.ceil((blog.content || "").split(' ').length / 200);
  return (
    <div className="min-h-screen bg-[#FAFAF9] selection:bg-orange-500 selection:text-white overflow-x-hidden">
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-orange-500 z-[200] origin-left" style={{ scaleX }} />
      <Navbar />

      {/* Editorial Header Section */}
      <header className="pt-32 pb-12 md:pt-40 md:pb-20 max-w-4xl mx-auto px-6 text-center">
        <div className="flex items-center justify-center space-x-2 text-[11px] font-bold uppercase tracking-[0.2em] text-orange-600 mb-6">
          <span>{t.blogDetail.breadcrumbBlog}</span>
          <span>•</span>
          <span>{tr(blog, 'category', locale) || t.blogDetail.categoryFallback}</span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary tracking-tight leading-tight max-w-4xl mx-auto font-display">
          {tr(blog, 'title', locale)}
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-y-4 gap-x-6 mt-8 text-gray-500 text-xs font-medium">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xs uppercase">
              {tr(blog, 'author', locale) ? tr(blog, 'author', locale)[0] : t.blogDetail.authorInitial}
            </div>
            <span className="font-semibold text-primary">{tr(blog, 'author', locale) || t.blogDetail.editorName}</span>
          </div>
          <div className="w-[1px] h-4 bg-gray-200 hidden sm:block" />
          <div className="flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>{new Date(blog.createdAt).toLocaleDateString('no-NO', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <div className="w-[1px] h-4 bg-gray-200 hidden sm:block" />
          <div className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>{readingTime} {t.blogDetail.readingTime}</span>
          </div>
        </div>
      </header>

      {/* Feature Image */}
      <div className="max-w-9xl mx-auto px-6 mb-16">
        <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-[2rem] overflow-hidden shadow-md border border-gray-100 bg-gray-50">
          <img src={blog.image} className="w-full h-full object-cover" alt={tr(blog, 'title', locale)} />
        </div>
      </div>

      {/* Content Layout */}
      <section className="pb-24">
        <div className="max-w-9xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16">

            {/* Left Rail: TOC */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-40 space-y-12">
                {toc.length > 0 && (
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary/40">{t.blogDetail.inThisArticle}</h4>
                    <nav className="flex flex-col space-y-3">
                      {toc.map((item) => (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          className={cn(
                            "text-xs leading-relaxed transition-all duration-300 font-medium py-1 border-l-2 pl-4 block",
                            activeId === item.id
                              ? "border-orange-500 text-orange-600 font-semibold"
                              : "border-transparent text-gray-400 hover:text-primary hover:border-gray-300"
                          )}
                        >
                          {item.text}
                        </a>
                      ))}
                    </nav>
                  </div>
                )}

                <div className="pt-8 border-t border-gray-100 space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary/40 flex items-center gap-2">
                    <Share2 className="w-3.5 h-3.5" /> {t.blogDetail.shareStory}
                  </span>
                  <div className="flex items-center gap-2">
                    {[
                      { Icon: Facebook, link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}` },
                      { Icon: Twitter, link: `https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}` },
                      { Icon: Linkedin, link: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}` },
                      { Icon: Mail, link: `mailto:?subject=${encodeURIComponent(tr(blog, 'title', locale))}&body=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}` }
                    ].map(({ Icon, link }, i) => (
                      <a
                        key={i}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-orange-500 hover:border-orange-300 hover:bg-orange-50/30 transition-all cursor-pointer"
                      >
                        <Icon className="w-4 h-4" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Center: The Article */}
            <main className="flex-1 max-w-9xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 md:p-12 border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.015)] relative"
              >
                <article
                  ref={contentRef}
                  className="prose prose-primary max-w-none font-sans
                    prose-headings:text-primary prose-headings:font-bold prose-headings:tracking-tight prose-headings:font-display
                    prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                    prose-h3:text-xl md:prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                    prose-p:text-gray-700 prose-p:font-light prose-p:leading-[1.8] prose-p:text-base md:prose-p:lg prose-p:mb-8
                    prose-strong:text-primary prose-strong:font-bold
                    prose-blockquote:border-l-4 prose-blockquote:border-orange-500 prose-blockquote:bg-orange-50/20 prose-blockquote:py-6 prose-blockquote:px-8 prose-blockquote:rounded-r-2xl prose-blockquote:italic prose-blockquote:text-gray-800 prose-blockquote:text-lg md:prose-blockquote:text-xl prose-blockquote:my-10 prose-blockquote:font-normal prose-blockquote:shadow-none
                    prose-img:rounded-2xl prose-img:shadow-md prose-img:my-12 prose-img:border-0
                    prose-a:text-orange-500 prose-a:no-underline hover:prose-a:underline
                    prose-li:text-gray-700 prose-li:font-light prose-li:text-base md:prose-li:text-lg prose-li:leading-relaxed prose-li:mb-2
                    marker:text-orange-500"
                  dangerouslySetInnerHTML={{ __html: tr(blog, 'content', locale) }}
                />

                {/* Tags & Footer Meta */}
                <div className="mt-16 pt-8 border-t border-gray-100 flex flex-wrap gap-3">
                  {tr(blog, 'category', locale) && (
                    <div className="bg-gray-50 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider text-primary/60 flex items-center space-x-1.5">
                      <Tag className="w-3.5 h-3.5 text-orange-500" />
                      <span>{tr(blog, 'category', locale)}</span>
                    </div>
                  )}
                  <div className="bg-gray-50 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider text-primary/60 flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-orange-500" />
                    <span>{t.blogDetail.insider}</span>
                  </div>
                </div>
              </motion.div>

              {/* Author Section */}
              <div className="mt-12 p-8 md:p-12 bg-primary rounded-3xl text-white flex flex-col md:flex-row items-center gap-8 shadow-sm border border-emerald-950 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-125 transition-transform duration-1000" />
                <div className="relative z-10 shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-orange-500 p-0.5 shadow-xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                    <div className="w-full h-full rounded-2xl bg-primary flex items-center justify-center text-orange-500 font-bold text-3xl font-display uppercase">
                      {tr(blog, 'author', locale) ? tr(blog, 'author', locale)[0] : t.blogDetail.authorInitial}
                    </div>
                  </div>
                </div>
                <div className="relative z-10 flex-1 text-center md:text-left space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-400">{t.blogDetail.writtenBy}</p>
                  <h3 className="text-2xl font-bold font-display text-white">{tr(blog, 'author', locale) || t.blogDetail.editorName}</h3>
                  <p className="text-emerald-100/75 text-sm leading-relaxed max-w-xl">
                    {t.blogDetail.authorDescription}
                  </p>
                </div>
              </div>

              {/* Enhanced CTA */}
              <div className="mt-8 bg-emerald-50/50 rounded-3xl p-8 md:p-12 border border-emerald-100/80 text-center space-y-6 relative overflow-hidden">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto">
                    <Mountain className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold font-display text-primary tracking-tight">{t.blogDetail.ctaTitle}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{t.blogDetail.ctaDescription}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                  <Link href="/plan-your-trip" className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2">
                    <span>{t.blogDetail.ctaPlanButton}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link href="/trips" className="w-full sm:w-auto border border-gray-200 bg-white text-primary px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-wider hover:border-primary transition-all">
                    {t.blogDetail.ctaExploreButton}
                  </Link>
                </div>
              </div>
            </main>

            {/* Right Rail: Floating Features */}
            <aside className="hidden xl:block w-80 shrink-0">
              <div className="sticky top-40 space-y-8">
                {/* Newsletter Box */}
                <div className="bg-[#1C2C1C] rounded-3xl p-8 text-white space-y-6 shadow-sm border border-emerald-900/50">
                  <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold font-display tracking-tight text-white">{t.blogDetail.newsletterTitle}</h4>
                    <p className="text-emerald-100/60 text-xs leading-relaxed font-light">{t.blogDetail.newsletterDesc}</p>
                  </div>
                  <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                    <input
                      type="email"
                      placeholder={t.blogDetail.newsletterPlaceholder}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white placeholder-white/30 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
                    />
                    <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-orange-500/20">
                      {t.blogDetail.newsletterButton}
                    </button>
                  </form>
                </div>

                {/* Popular Destinations Card */}
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary/40">{t.blogDetail.popularTours}</h4>
                  <div className="space-y-5">
                    {[
                      { name: "Everest Base Camp Trek", price: "24 900 kr", img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=100&q=80" },
                      { name: "Annapurna Circuit", price: "18 500 kr", img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=100&q=80" },
                      { name: "Poon Hill Trek", price: "9 900 kr", img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=100&q=80" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center space-x-3 group cursor-pointer">
                        <img src={item.img} className="w-12 h-12 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all duration-300" alt="" />
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-primary group-hover:text-orange-500 transition-colors leading-tight">{item.name}</p>
                          <p className="text-[11px] font-semibold text-gray-400">{t.common.fra} {item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Recommended for reading */}
      {related?.length > 0 && (
        <section className="py-24 bg-white border-t border-gray-100">
          <div className="max-w-9xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="space-y-2">
                <p className="text-orange-500 font-bold uppercase tracking-widest text-xs">{t.blogDetail.inspiration}</p>
                <h2 className="text-3xl md:text-4xl font-bold font-display text-primary tracking-tight">{t.blogDetail.relatedTitle}</h2>
              </div>
              <Link href="/blogg" className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-orange-500 transition-colors">
                <span>{t.common.seAlleArtikler}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {related.map((post) => (
                <Link key={post._id} href={`/blogg/${post.slug}`} className="group block space-y-4">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden relative shadow-sm bg-gray-50">
                    <img src={post.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-orange-600 text-[10px] font-bold uppercase tracking-widest">{tr(post, 'category', locale)}</p>
                    <h4 className="text-lg font-bold font-display text-primary group-hover:text-orange-500 transition-colors leading-snug">
                      {tr(post, 'title', locale)}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
