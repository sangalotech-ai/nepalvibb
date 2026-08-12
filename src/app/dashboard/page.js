"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Calendar, MapPin, MessageSquare, 
  ArrowRight, Compass, Clock, CheckCircle2,
  ChevronRight, Map
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    const fetchTrips = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/plan-trip');
        const data = await res.json();
        setTrips(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setTrips([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, [status, session]);

  const stats = [
    { label: 'Aktive reiser', value: trips.filter(t => t.status === 'active').length, icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Meldinger', value: trips.reduce((acc, t) => acc + (t.messages?.length || 0), 0), icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Bestilt', value: trips.filter(t => t.status === 'booked').length, icon: CheckCircle2, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-primary uppercase tracking-tighter">
            Namaste, <span className="text-orange-500">{session?.user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-gray-400 font-medium mt-1">Klar for ditt neste eventyr i Himalaya?</p>
        </div>
        <Link href="/plan-your-trip" className="inline-flex items-center px-8 py-4 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:bg-orange-500 transition-all">
          Planlegg en ny reise <Compass className="ml-3 w-4 h-4" />
        </Link>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center space-x-6">
            <div className={`p-4 ${stat.bg} ${stat.color} rounded-2xl`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{stat.label}</p>
              <p className="text-2xl font-black text-primary mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Trips List */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-primary uppercase tracking-tight">Dine reiser</h3>
          {trips.length > 0 && (
             <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{trips.length} Totalt</span>
          )}
        </div>

        {trips.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {trips.map((trip) => (
              <Link 
                key={trip._id} 
                href={`/plan-your-trip/chat/${trip._id}`}
                className="group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-8"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 w-full">
                  <div className="flex flex-1 items-center space-x-8">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                      <Map className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-4">
                        <h4 className="text-xl font-black text-primary uppercase tracking-tight group-hover:text-orange-500 transition-colors">
                          {trip.trip_title || trip.title || trip.destination || 'Skreddersydd reise'}
                        </h4>
                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:gap-6 items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          <div className="space-y-1">
                            <span className="text-[8px] text-gray-300 block sm:hidden">Destinasjon</span>
                            <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1.5 text-orange-500" /> {trip.destination || 'Nepal'}</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[8px] text-gray-300 block sm:hidden">Dato</span>
                            <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1.5 text-orange-500" /> {new Date(trip.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="space-y-1 col-span-2 sm:col-auto">
                            <span className="text-[8px] text-gray-300 block sm:hidden">Status</span>
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[8px] inline-flex items-center",
                              trip.status === 'booked' ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
                            )}>{trip.status}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end md:space-x-8 pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                        <div className="text-left md:text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Budsjett</p>
                          <p className="text-sm font-black text-primary mt-0.5">{trip.budget ? `${trip.budget} NOK` : 'Fleksibelt'}</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] p-12 lg:p-20 border border-gray-100 text-center space-y-8">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
              <MapPin className="w-10 h-10 text-gray-200" />
            </div>
            <div className="max-w-md mx-auto space-y-4">
              <h2 className="text-2xl font-black text-primary uppercase tracking-tight">Ingen reiser funnet</h2>
              <p className="text-gray-400 font-medium leading-relaxed">Start planleggingen av ditt første Himalaya-eventyr i dag.</p>
            </div>
            <Link href="/plan-your-trip" className="inline-flex items-center px-10 py-4 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-orange-500 transition-all">
              Planlegg min reise
            </Link>
          </div>
        )}
      </div>

      {/* Suggested for You */}
      <div className="space-y-8">
        <h3 className="text-xl font-black text-primary uppercase tracking-tight">Toppdestinasjoner</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { title: 'Everest Base Camp', location: 'Nepal', duration: '12 Days', slug: 'everest-base-camp', image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80' },
            { title: 'Tiger\'s Nest Hike', location: 'Bhutan', duration: '7 Days', slug: 'tigers-nest-hike', image: 'https://images.unsplash.com/photo-1578516123434-5fe5009f984b?auto=format&fit=crop&w=800&q=80' },
          ].map((tour, i) => (
            <Link 
              key={i} 
              href={`/trips/${tour.slug}`}
              className="group relative h-64 rounded-[2.5rem] overflow-hidden block border border-gray-100 shadow-sm"
            >
              <img src={tour.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
                <div className="text-white">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400 mb-1">{tour.location}</p>
                  <h4 className="text-xl font-black uppercase tracking-tight">{tour.title}</h4>
                  <div className="flex items-center text-[10px] font-bold text-white/60 mt-2 uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5 mr-1" /> {tour.duration} Dager
                  </div>
                </div>
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl text-white group-hover:bg-white group-hover:text-primary transition-all">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
