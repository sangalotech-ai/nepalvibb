"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, Map, Compass, MessageSquare, 
  Settings, LogOut, Plus, Search, 
  Menu, X, Bell, User, Users, Image as ImageIcon,
  Mountain, Newspaper, Layout, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  const handleSignOut = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isLoginPage) {
    return <div className="min-h-screen bg-white">{children}</div>;
  }
  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { label: 'Trip Chats', icon: MessageSquare, href: '/admin/requests' },
    { label: 'Trips', icon: Compass, href: '/admin/trips' },
    { label: 'Activities', icon: Mountain, href: '/admin/activities' },
    { label: 'Destinations', icon: Map, href: '/admin/destinations' },
    { label: 'Blogs', icon: Newspaper, href: '/admin/blogs' },
    { label: 'Banners', icon: ImageIcon, href: '/admin/banners' },
    { label: 'Home Content', icon: Layout, href: '/admin/home-content' },
    { label: 'About Content', icon: Layout, href: '/admin/about-content' },
    { label: 'Contact Content', icon: MessageSquare, href: '/admin/contact-content' },
    { label: 'Legal Pages', icon: FileText, href: '/admin/legal' },
    { label: 'Team', icon: Users, href: '/admin/team' },
    { label: 'Plan Trip Form', icon: Settings, href: '/admin/plan-trip' },
    { label: 'Reviews', icon: MessageSquare, href: '/admin/reviews' },
    { label: 'Users', icon: User, href: '/admin/users' },
    { label: 'Settings', icon: Settings, href: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "bg-primary text-white flex flex-col fixed inset-y-0 left-0 z-[70] transition-all duration-300 transform",
        isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0 lg:w-64"
      )}>
        <div className="p-6 flex items-center justify-between">
          <div>
            <Link href="/" className="text-2xl font-black tracking-tighter flex items-center space-x-2">
              <span className="text-white">NEPAL</span><span className="text-orange-500">VIBB</span>
            </Link>
            <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-[0.3em] mt-1">Admin Console</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-white/10 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-sm font-medium"
            >
              <item.icon className="w-5 h-5 opacity-70" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 mt-auto">
          <button 
            onClick={handleSignOut}
            className="flex items-center space-x-3 px-4 py-4 w-full text-left rounded-xl hover:bg-red-500/20 text-red-400 hover:text-red-500 transition-all text-[11px] font-black uppercase tracking-[0.2em] group/logout"
          >
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover/logout:bg-red-500 group-hover/logout:text-white transition-all">
              <LogOut className="w-4 h-4" />
            </div>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col w-full">
        {/* Top Nav */}
        <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-xl lg:hidden text-primary"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search tours..." 
                className="bg-gray-50 border-0 rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 w-64"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4 lg:space-x-6">
            <button className="relative p-2 text-gray-400 hover:text-primary transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-primary">Admin User</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Superadmin</p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-orange-500" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
