"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit3, Newspaper, 
  Search, Save, Star, User, Tag
} from 'lucide-react';
import { motion } from 'framer-motion';
import ImageUpload from '@/components/admin/ImageUpload';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { cn } from '@/lib/utils';

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    image: '',
    content: '',
    author: 'Nepalvibb Editor',
    category: 'Travel Tips',
    isFeatured: false,
    titleEn: '',
    contentEn: '',
    authorEn: '',
    categoryEn: '',
  });

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

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const method = isEditing && isEditing !== 'new' ? 'PUT' : 'POST';
    const url = isEditing && isEditing !== 'new' ? `/api/admin/blogs/${isEditing._id}` : '/api/blogs';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsEditing(null);
        fetchBlogs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteBlog = async (id) => {
    if (!confirm('Delete this article?')) return;
    try {
      await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE' });
      fetchBlogs();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBlogs = blogs.filter(b => 
    (b.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-12 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-primary uppercase tracking-tighter italic">Manage Blogs</h1>
          <p className="text-gray-400 font-medium">Share stories and inspire your travelers</p>
        </div>
        <button 
          onClick={() => {
            setIsEditing('new');
            setFormData({
              title: '', slug: '', image: '', content: '',
              author: 'Nepalvibb Editor', category: 'Travel Tips', isFeatured: false,
              titleEn: '', contentEn: '', authorEn: '', categoryEn: ''
            });
          }}
          className="flex items-center space-x-2 bg-primary text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-orange-500 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Write New Post</span>
        </button>
      </div>

      <div className="relative md:w-96">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search articles..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-white border-none rounded-2xl pl-14 pr-6 py-4 text-sm font-medium shadow-sm focus:ring-2 focus:ring-primary transition-all"
        />
      </div>

      {isEditing && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-[3rem] border-2 border-primary/10 shadow-2xl shadow-primary/5"
        >
          <form onSubmit={handleSave} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <ImageUpload 
                value={formData.image} 
                onChange={url => setFormData({...formData, image: url})} 
                label="Cover Image" 
              />
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Article Title</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')})}
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all"
                    required
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Title (English)</label>
                  <input 
                    type="text" 
                    value={formData.titleEn}
                    onChange={e => setFormData({...formData, titleEn: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Category</label>
                    <input 
                      type="text" 
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Author</label>
                    <input 
                      type="text" 
                      value={formData.author}
                      onChange={e => setFormData({...formData, author: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Category (English)</label>
                    <input 
                      type="text" 
                      value={formData.categoryEn}
                      onChange={e => setFormData({...formData, categoryEn: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Author (English)</label>
                    <input 
                      type="text" 
                      value={formData.authorEn}
                      onChange={e => setFormData({...formData, authorEn: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <RichTextEditor 
                label="Article Content"
                value={formData.content}
                onChange={val => setFormData({...formData, content: val})}
              />
            </div>

            <div className="space-y-4">
              <RichTextEditor 
                label="Content (English)"
                value={formData.contentEn}
                onChange={val => setFormData({...formData, contentEn: val})}
              />
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-gray-50">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <div className={cn(
                  "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                  formData.isFeatured ? "bg-orange-500 border-orange-500 shadow-lg shadow-orange-500/20" : "border-gray-200 group-hover:border-orange-500"
                )}>
                  <input 
                    type="checkbox" 
                    className="hidden"
                    checked={formData.isFeatured}
                    onChange={e => setFormData({...formData, isFeatured: e.target.checked})}
                  />
                  {formData.isFeatured && <Star className="w-3.5 h-3.5 text-white fill-current" />}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Featured Article</span>
              </label>

              <div className="flex items-center space-x-6">
                <button type="button" onClick={() => setIsEditing(null)} className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors">Cancel</button>
                <button type="submit" className="bg-emerald-500 text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>Publish Article</span>
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredBlogs.map((blog) => (
          <div key={blog._id} className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group">
            <div className="h-56 relative">
              <img src={blog.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
              <div className="absolute top-6 left-6">
                <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-primary flex items-center">
                  <Tag className="w-3 h-3 mr-1.5 text-orange-500" /> {blog.category}
                </div>
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4 backdrop-blur-[2px]">
                <button 
                  onClick={() => {
                    setIsEditing(blog);
                    setFormData(blog);
                  }}
                  className="p-4 bg-white text-primary rounded-2xl hover:bg-primary hover:text-white transition-all shadow-xl"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => deleteBlog(blog._id)}
                  className="p-4 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-all shadow-xl"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-8 space-y-4">
              <div className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-gray-300">
                <User className="w-3.5 h-3.5" /> <span>{blog.author}</span>
              </div>
              <h3 className="text-xl font-black text-primary uppercase tracking-tight line-clamp-2 leading-none h-14">
                {blog.title}
              </h3>
              <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">
                  {new Date(blog.createdAt).toLocaleDateString()}
                </span>
                {blog.isFeatured && (
                  <span className="bg-orange-500/10 text-orange-600 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Featured</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
