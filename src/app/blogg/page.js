"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, User, Tag, ArrowRight, Newspaper } from 'lucide-react';
import { tr } from '@/lib/tr';
import { useLocale } from '@/components/providers/useLocale';

export default function BlogListPage() {
  const { t, locale } = useLocale();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch('/api/blogs');
        const data = await res.json();
        setBlogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      
      {/* Hero Section */}
      <section className="relative pt-44 pb-20 bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.h5 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-orange-500 font-bold uppercase tracking-wider text-xs mb-3"
          >
            {t.blogList.tipsInspirasjon}
          </motion.h5>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-7xl font-bold font-display text-white tracking-tight leading-tight"
          >
            {t.blogList.title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-emerald-100/80 max-w-2xl mx-auto text-base sm:text-lg font-light leading-relaxed"
          >
            {t.blogList.subtitle}
          </motion.p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse space-y-4">
                  <div className="bg-gray-100 aspect-[4/3] rounded-3xl" />
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-6 bg-gray-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog, index) => (
                <motion.article
                  key={blog._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <Link href={`/blogg/${blog.slug}`}>
                    <div className="overflow-hidden rounded-3xl mb-6 shadow-md h-80 relative border-2 border-white group-hover:border-orange-500/20 transition-all">
                      <img src={blog.image} alt={tr(blog, 'title', locale)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" loading="lazy" />
                      <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-all duration-500"></div>
                      <div className="absolute top-6 left-6">
                        <span className="bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider text-primary flex items-center shadow-sm">
                          <Tag className="w-3 h-3 mr-1.5 text-orange-500" /> {tr(blog, 'category', locale)}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3 px-2">
                      <div className="flex items-center space-x-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-2" /> {new Date(blog.createdAt).toLocaleDateString()}</span>
                        <span className="flex items-center"><User className="w-3.5 h-3.5 mr-2" /> {tr(blog, 'author', locale)}</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold font-display text-primary tracking-tight leading-snug group-hover:text-orange-500 transition-colors line-clamp-2">
                        {tr(blog, 'title', locale)}
                      </h3>
                      <div className="flex items-center space-x-2 text-orange-500 text-[10px] font-bold uppercase tracking-wider">
                        <span>{t.common.lesMer}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
