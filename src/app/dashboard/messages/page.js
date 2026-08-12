"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  MessageSquare, Calendar, ChevronRight, 
  User, Send, MessageCircle
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function MessagesPage() {
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

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-black text-primary uppercase tracking-tighter">Your Messages</h1>
        <p className="text-gray-400 font-medium mt-1">Chat with your reisespesialister about your upcoming trips.</p>
      </div>

      {trips.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {trips.map((trip) => {
            const lastMessage = trip.messages?.[trip.messages.length - 1];
            const msgText = lastMessage 
              ? (lastMessage.text || (lastMessage.attachment ? `[${lastMessage.attachment.name || 'Vedlegg'}]` : 'Melding mottatt'))
              : 'Ingen meldinger ennå.';

            return (
              <Link 
                key={trip._id} 
                href={`/plan-your-trip/chat/${trip._id}`}
                className="group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-8"
              >
                <div className="flex items-center space-x-8 flex-1">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center relative">
                    <MessageSquare className="w-8 h-8 text-blue-500" />
                    {trip.status === 'active' && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-lg font-black text-primary uppercase tracking-tight">
                        {trip.trip_title || trip.title || trip.destination || 'Reiseforespørsel'}
                      </h4>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {lastMessage ? new Date(lastMessage.timestamp).toLocaleDateString('no-NO') : ''}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-1 italic">
                      {lastMessage ? `${lastMessage.sender === 'specialist' ? 'Spesialist: ' : 'Deg: '}${msgText}` : msgText}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] p-12 lg:p-20 border border-gray-100 text-center space-y-8">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
            <MessageCircle className="w-10 h-10 text-gray-200" />
          </div>
          <div className="max-w-md mx-auto space-y-4">
            <h2 className="text-2xl font-black text-primary uppercase tracking-tight">No messages yet</h2>
            <p className="text-gray-400 font-medium leading-relaxed">Start a conversation by planning your next trip with us.</p>
          </div>
          <Link href="/plan-your-trip" className="inline-flex items-center px-10 py-4 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-orange-500 transition-all">
            Plan and Chat
          </Link>
        </div>
      )}
    </div>
  );
}
