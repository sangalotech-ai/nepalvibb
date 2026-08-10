"use client";

import { useState, useRef, useEffect, use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Send, MapPin, Calendar, Users, 
  Clock, Edit2, ChevronRight, Paperclip,
  CheckCircle2, Circle, MoreHorizontal,
  MessageCircle, Phone, Star, X, CreditCard, ArrowRight, Shield,
  Check, CheckCheck, Image as ImageIcon, FileIcon, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { io } from 'socket.io-client';
import { useLocale } from '@/components/providers/useLocale';

// Notification sound - short beep using Web Audio API
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) { /* ignore audio errors */ }
}

export default function ChatPage({ params }) {
  const { t } = useLocale();
  const { id } = use(params);
  const searchParams = useSearchParams();

  const SPECIALIST = {
    name: t.chatPage.specialistName,
    title: t.chatPage.specialistTitle,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80",
    rating: 4.9,
    trips: 312,
    responseTime: t.chatPage.responseTime,
  };

  const QUICK_REPLIES = [
    t.chatPage.quickReply1,
    t.chatPage.quickReply2,
    t.chatPage.quickReply3,
    t.chatPage.quickReply4,
  ];

  const TRIP_DEFAULTS = {
    title: t.chatPage.defaultTitle,
    slug: 'nepal',
    price: '1800',
    duration: t.chatPage.defaultDuration,
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
    destination: t.chatPage.defaultDestination,
  };

  const tripTitle = searchParams.get('title') || TRIP_DEFAULTS.title;
  const tripSlug = searchParams.get('slug') || TRIP_DEFAULTS.slug;
  const tripPrice = searchParams.get('price') || TRIP_DEFAULTS.price;
  const tripDuration = searchParams.get('duration') || TRIP_DEFAULTS.duration;
  const tripImage = searchParams.get('image') || TRIP_DEFAULTS.image;
  const tripDestination = searchParams.get('destination') || TRIP_DEFAULTS.destination;

  const [messages, setMessages] = useState([]);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('oversikt');
  const [isSpecialistTyping, setIsSpecialistTyping] = useState(false);
  const [specialistOnline, setSpecialistOnline] = useState(false);
  const [connected, setConnected] = useState(false);
  const [messagesRead, setMessagesRead] = useState(false);
  const [showNewMsg, setShowNewMsg] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const endRef = useRef(null);
  const chatContainerRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const isAtBottomRef = useRef(true);

  useEffect(() => {
    let socket;
    const initSocket = async () => {
      await fetch('/api/socket');
      socket = io({ path: '/api/socket' });
      socketRef.current = socket;

      socket.on('connect', () => {
        setConnected(true);
        socket.emit('join-room', { tripId: id, role: 'user' });
        // Mark messages as read when user opens the chat
        socket.emit('messages-read', { tripId: id, role: 'user' });
      });

      socket.on('disconnect', () => {
        setConnected(false);
      });

      socket.on('receive-message', (data) => {
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.id === data.id)) return prev;
          return [...prev, data];
        });

        // If message is from specialist, play sound
        if (data.from === 'specialist') {
          playNotificationSound();
          if (!isAtBottomRef.current) {
            setShowNewMsg(true);
          }
          // Mark as read since user has the chat open
          if (socketRef.current) {
            socketRef.current.emit('messages-read', { tripId: id, role: 'user' });
          }
        }
      });

      socket.on('user-typing', (data) => {
        if (data.role === 'specialist') {
          setIsSpecialistTyping(true);
        }
      });

      socket.on('user-stop-typing', (data) => {
        if (data.role === 'specialist') {
          setIsSpecialistTyping(false);
        }
      });

      socket.on('presence-update', (data) => {
        setSpecialistOnline(data.onlineRoles?.includes('specialist') || false);
      });

      socket.on('messages-marked-read', (data) => {
        if (data.by === 'specialist') {
          setMessagesRead(true);
          setMessages(prev => prev.map(m => 
            m.from === 'user' ? { ...m, read: true } : m
          ));
        }
      });
    };

    if (id !== 'new') {
      initSocket();
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [id]);

  useEffect(() => {
    const fetchChat = async () => {
      if (id === 'new') {
        setMessages([
          { id: 1, from: 'specialist', text: t.chatPage.helloMsg, time: t.chatPage.timeNow },
          { id: 2, from: 'specialist', text: t.chatPage.interestMsg.replace('{title}', tripTitle), time: t.chatPage.timeJustNow }
        ]);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/chat?id=${id}`);
        const data = await res.json();
        if (data && !data.error) {
          setRequest(data);
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages.map((m, i) => ({
              id: m._id || `db-${i}`,
              from: m.sender === 'user' ? 'user' : 'specialist',
              text: m.text,
              attachment: m.attachment || null,
              time: m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
              read: m.read || false,
              timestamp: m.timestamp
            })));
          } else {
            const clientDesc = data.trip_description || data.message || data.notes;
            const initialText = clientDesc && clientDesc.trim() ? clientDesc.trim() : `Hei! Jeg ønsker å planlegge en tur til ${data.destination || 'Nepal'}.`;
            setMessages([
              { id: 'fallback-1', from: 'user', text: initialText, time: t.chatPage.timeNow },
              { id: 'fallback-2', from: 'specialist', text: t.chatPage.helloMsg, time: t.chatPage.timeJustNow }
            ]);
          }
        }
      } catch (error) {
        console.error('Error fetching chat:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchChat();
  }, [id, tripTitle, t]);

  const tripSummary = {
    title: tripTitle,
    destination: tripDestination,
    dates: request?.startDate 
      ? `${new Date(request.startDate).toLocaleDateString('no-NO', { day: '2-digit', month: 'short' })} - ${request.endDate ? new Date(request.endDate).toLocaleDateString('no-NO', { day: '2-digit', month: 'short' }) : ''}`
      : t.chatPage.notSelected,
    duration: tripDuration,
    travelers: request?.adults ? t.chatPage.travelersValue.replace('{count}', request.adults) : t.chatPage.defaultTravelers,
    budget: request?.budget || t.chatPage.mediumBudget,
    status: request?.status || t.chatPage.statusPlanning,
    price: request?.price || tripPrice,
  };

  const [checklist, setChecklist] = useState([
    { id: 1, done: true, label: t.chatPage.checklist1 },
    { id: 2, done: true, label: t.chatPage.checklist2 },
    { id: 3, done: false, label: t.chatPage.checklist3 },
    { id: 4, done: false, label: t.chatPage.checklist4 },
    { id: 5, done: false, label: t.chatPage.checklist5 },
  ]);

  const updateTask = (id, done = true) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, done } : item));
  };

  useEffect(() => {
    if (isAtBottomRef.current) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.from === 'specialist') {
      const txt = lastMsg.text.toLowerCase();
      if (txt.includes('itinerary') || txt.includes('proposal') || txt.includes('reiserute')) {
        updateTask(3, true);
      }
    }
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setSending(true);

    const userMsg = { id: `temp-${Date.now()}`, from: 'user', text: msg, time: t.chatPage.timeJustNow };

    if (id !== 'new' && socketRef.current?.connected) {
      socketRef.current.emit('send-message', {
        tripId: id,
        message: msg,
        from: 'user'
      });
      setSending(false);
    } else {
      // Local only / fallback
      setMessages(prev => [...prev, userMsg]);
      // For 'new' trips or if socket fails
      setTimeout(() => {
        const botMsg = { id: Date.now() + 1, from: 'specialist', text: t.chatPage.botReply, time: t.chatPage.timeJustNow };
        setMessages(prev => [...prev, botMsg]);
        setSending(false);
      }, 1000);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSending(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.url) {
        if (socketRef.current?.connected) {
          socketRef.current.emit('send-message', {
            tripId: id,
            message: '',
            from: 'user',
            attachment: {
              url: data.url,
              type: data.type,
              name: data.name
            }
          });
        } else {
          // No socket - just add locally (user chat usually doesn't have a REST respond API like admin)
          setMessages(prev => [...prev, {
            id: `fb-file-${Date.now()}`,
            from: 'user',
            text: '',
            attachment: { url: data.url, type: data.type, name: data.name },
            time: t.chatPage.timeJustNow,
            read: false,
            timestamp: new Date().toISOString()
          }]);
        }
      }
    } catch (err) {
      console.error('File upload failed:', err);
    } finally {
      setSending(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Tracking scroll
  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container) return;
    const threshold = 100;
    isAtBottomRef.current = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    if (isAtBottomRef.current) setShowNewMsg(false);
  };

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowNewMsg(false);
  };

  // Typing indicator emit
  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (socketRef.current) {
      socketRef.current.emit('typing', { tripId: id, role: 'user' });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('stop-typing', { tripId: id, role: 'user' });
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shrink-0">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="bg-primary text-white p-1.5 rounded-lg group-hover:bg-emerald-900 transition-colors">
            <X className="w-4 h-4" />
          </div>
          <span className="text-xl font-black tracking-tighter">
            <span className="text-primary">NEPAL</span><span className="text-orange-500">VIBB</span>
          </span>
        </Link>
        <div className="text-center">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">{t.chatPage.planningOverview}</p>
        </div>
        <div className="w-20" />
      </div>

      <div className="flex flex-col lg:flex-row flex-1">
        <div className="flex flex-col flex-1 min-w-0">
          <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img src={SPECIALIST.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-primary" alt={SPECIALIST.name} />
                <div className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white transition-colors",
                  specialistOnline ? "bg-green-500" : "bg-gray-300"
                )} />
              </div>
              <div>
                <p className="font-black text-primary text-sm uppercase tracking-tight">{SPECIALIST.name}</p>
                <div className="flex items-center space-x-1.5">
                  <div className={cn("w-1.5 h-1.5 rounded-full", specialistOnline ? "bg-green-500 animate-pulse" : "bg-gray-300")} />
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">
                    {specialistOnline ? t.chatPage.onlineNow : t.chatPage.offline}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <div className="flex items-center space-x-1.5">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-primary font-black">{SPECIALIST.rating}</span>
                  <span>({SPECIALIST.trips} {t.chatPage.trips})</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{t.chatPage.respondsIn} {SPECIALIST.responseTime}</span>
                </div>
              </div>
              <button
                onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                className="lg:hidden text-[10px] font-black uppercase tracking-widest bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl transition-all flex items-center space-x-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{showMobileSidebar ? 'Chat' : 'Info'}</span>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary to-emerald-700 px-8 py-3 flex items-center justify-between shrink-0 border-b border-white/10">
            <div className="flex items-center space-x-4">
              <div className="bg-white/10 p-2 rounded-xl">
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-black text-[11px] uppercase tracking-tight">{t.chatPage.confirmTrip}</p>
                <p className="text-emerald-200 text-[9px] font-medium">{t.chatPage.confirmTripDesc}</p>
              </div>
            </div>
            <Link
              href={`/payment?tripId=${id}&amount=${tripSummary.price}`}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center space-x-2"
            >
              <span>{t.chatPage.book}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div 
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto relative"
          >
            {/* Interactive Trip Request Summary Card */}
            <div className="bg-emerald-50/60 border border-emerald-100/80 rounded-3xl p-6 mb-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-primary">
                  <Sparkles className="w-5 h-5 text-orange-500 animate-pulse" />
                  <h4 className="font-black text-xs sm:text-sm uppercase tracking-tight italic">Din Himalaya Reiseforespørsel</h4>
                </div>
                <span className="bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-primary/10">
                  {request?.status || 'Aktiv'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="bg-white p-3 rounded-2xl border border-emerald-50 shadow-xs">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Destinasjon</p>
                  <p className="text-xs font-bold text-primary truncate mt-0.5">{tripSummary.destination}</p>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-emerald-50 shadow-xs">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Reisende</p>
                  <p className="text-xs font-bold text-primary truncate mt-0.5">{tripSummary.travelers}</p>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-emerald-50 shadow-xs">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Datoer</p>
                  <p className="text-xs font-bold text-primary truncate mt-0.5">{tripSummary.dates}</p>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-emerald-50 shadow-xs">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Budsjett</p>
                  <p className="text-xs font-bold text-primary truncate mt-0.5">{tripSummary.budget}</p>
                </div>
              </div>
            </div>
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex items-end space-x-4", msg.from === 'user' ? "flex-row-reverse space-x-reverse" : "")}
                >
                  {msg.from === 'specialist' && (
                    <img src={SPECIALIST.avatar} className="w-8 h-8 rounded-full object-cover border border-gray-100 shrink-0" alt="" />
                  )}
                  <div className={cn(
                    "max-w-lg px-6 py-4 rounded-3xl text-sm leading-relaxed font-medium",
                    msg.from === 'user' 
                      ? "bg-primary text-white rounded-br-sm" 
                      : "bg-white text-gray-700 rounded-bl-sm shadow-sm border border-gray-100"
                  )}>
                    {msg.attachment ? (
                      <div className="space-y-2">
                        {msg.attachment.type === 'image' ? (
                          <div className="rounded-2xl overflow-hidden border border-gray-100/50 max-w-sm">
                            <img src={msg.attachment.url} alt={msg.attachment.name} className="w-full h-auto max-h-64 object-cover" />
                          </div>
                        ) : (
                          <a 
                            href={msg.attachment.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={cn(
                              "flex items-center space-x-3 p-3 rounded-2xl border transition-all",
                              msg.from === 'user' ? "bg-white/10 border-white/20 hover:bg-white/20" : "bg-gray-50 border-gray-100 hover:bg-gray-100"
                            )}
                          >
                            <div className={cn(
                              "p-2 rounded-lg",
                              msg.from === 'user' ? "bg-white/20" : "bg-primary/10 text-primary"
                            )}>
                              <FileIcon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-black truncate">{msg.attachment.name}</p>
                              <p className="text-[8px] opacity-60 font-bold uppercase tracking-widest">{t.chatPage.clickToOpen}</p>
                            </div>
                            <ExternalLink className="w-3 h-3 opacity-40" />
                          </a>
                        )}
                        {msg.text && <p className="mt-2">{msg.text}</p>}
                      </div>
                    ) : (
                      msg.text
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <p className={cn("text-[10px] font-normal", msg.from === 'user' ? "text-white/50" : "text-gray-300")}>
                        {msg.time}
                      </p>
                      {msg.from === 'user' && (
                        <div className="ml-2">
                          {msg.read ? (
                            <CheckCheck className="w-3 h-3 text-white/70" />
                          ) : (
                            <Check className="w-3 h-3 text-white/40" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isSpecialistTyping && (
              <div className="flex items-end space-x-4">
                <img src={SPECIALIST.avatar} className="w-8 h-8 rounded-full object-cover border border-gray-100" alt="" />
                <div className="bg-white rounded-3xl rounded-bl-sm px-6 py-4 shadow-sm border border-gray-100 flex space-x-1.5 items-center">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-1.5 h-1.5 bg-gray-300 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
                  ))}
                  <span className="text-[10px] text-gray-400 font-bold ml-2">{t.chatPage.typing}</span>
                </div>
              </div>
            )}
            <div ref={endRef} />

            {/* New message indicator */}
            <AnimatePresence>
              {showNewMsg && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onClick={scrollToBottom}
                  className="sticky bottom-32 left-1/2 -translate-x-1/2 bg-primary text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl z-50 flex items-center space-x-2 border-2 border-white/20 backdrop-blur-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{t.chatPage.newMessage}</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>



          <div className="bg-white border-t border-gray-100 p-5 shrink-0 sticky bottom-0 z-40 space-y-4">
            <div className="flex flex-wrap gap-2">
              {QUICK_REPLIES.map(reply => (
                <button
                  key={reply}
                  onClick={() => sendMessage(reply)}
                  className="text-[10px] font-bold border border-gray-200 rounded-full px-3 py-1.5 text-gray-500 hover:border-primary hover:text-primary hover:bg-emerald-50 transition-all"
                >
                  {reply}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-4 bg-gray-50 rounded-2xl px-5 py-3 border-2 border-gray-100 focus-within:border-primary transition-colors">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*,.pdf,.doc,.docx"
              />
              <button 
                onClick={handleFileClick}
                className="text-gray-400 hover:text-primary transition-colors shrink-0"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder={t.chatPage.inputPlaceholder}
                className="flex-1 bg-transparent text-sm font-medium focus:outline-none text-gray-800 placeholder-gray-400"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || sending}
                className={cn(
                  "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                  input.trim() ? "bg-primary text-white hover:bg-emerald-900 shadow-lg" : "bg-gray-100 text-gray-400"
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <aside className={cn(
          "w-full lg:w-[360px] bg-white border-l border-gray-100 flex flex-col transition-all duration-300",
          showMobileSidebar ? "fixed inset-0 z-50 pt-20 overflow-y-auto bg-white" : "hidden lg:flex"
        )}>
          {showMobileSidebar && (
            <button 
              onClick={() => setShowMobileSidebar(false)}
              className="lg:hidden absolute top-6 right-6 p-2 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 z-50"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <div className="flex border-b border-gray-100 px-6 pt-4 sticky top-[72px] bg-white z-40">
            {['oversikt', 'sjekkliste'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "mr-8 pb-4 text-[11px] font-black uppercase tracking-widest transition-all border-b-2",
                  activeTab === tab ? "text-primary border-primary" : "text-gray-400 border-transparent"
                )}
              >
                {tab === 'oversikt' ? t.chatPage.tabOverview : t.chatPage.tabChecklist}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-8 overflow-y-auto">
            {activeTab === 'oversikt' && (
              <>
                <div className="relative rounded-3xl overflow-hidden h-48">
                  <img src={tripImage} className="w-full h-full object-cover" alt={tripTitle} />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent flex items-end p-6">
                    <div>
                      <p className="text-white font-black text-lg uppercase tracking-tighter leading-tight">{tripSummary.title}</p>
                      <p className="text-emerald-300 text-[10px] font-bold uppercase tracking-widest mt-1">{tripSummary.duration} • {tripSummary.dates}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">{t.chatPage.tripDetails}</h3>
                  <div className="space-y-3">
                    {[
                      { icon: MapPin, label: t.chatPage.detailDestination, value: tripSummary.destination },
                      { icon: Calendar, label: t.chatPage.detailDates, value: tripSummary.dates },
                      { icon: Clock, label: t.chatPage.detailDuration, value: tripSummary.duration },
                      { icon: Users, label: t.chatPage.detailTravelers, value: tripSummary.travelers },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <item.icon className="w-4 h-4 text-orange-500" />
                          <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{item.label}</span>
                        </div>
                        <span className="text-xs font-bold text-primary">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {(request?.trip_description || request?.message || request?.notes) && (
                  <div className="bg-gray-50 rounded-2xl p-4 space-y-2 border border-gray-100">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Din Beskrivelse</span>
                    <p className="text-xs text-gray-700 font-medium italic leading-relaxed">
                      "{request.trip_description || request.message || request.notes}"
                    </p>
                  </div>
                )}

                <button className="w-full flex items-center justify-center space-x-3 border-2 border-dashed border-gray-200 rounded-2xl py-4 text-[11px] font-black uppercase tracking-widest text-gray-400 hover:border-primary hover:text-primary transition-all">
                  <Edit2 className="w-4 h-4" />
                  <span>{t.chatPage.editTripDetails}</span>
                </button>

                <div className="bg-emerald-50/50 rounded-3xl p-5 space-y-4 border border-emerald-100">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">{t.chatPage.yourSpecialist}</h3>
                  <div className="flex items-center space-x-4">
                    <img src={SPECIALIST.avatar} className="w-12 h-12 rounded-full border-2 border-primary object-cover" alt="" />
                    <div>
                      <p className="font-black text-primary text-sm uppercase tracking-tight">{SPECIALIST.name}</p>
                      <p className="text-[10px] text-gray-400">{SPECIALIST.title}</p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button className="flex-1 bg-primary text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center space-x-2">
                      <MessageCircle className="w-3.5 h-3.5" /><span>{t.chatPage.message}</span>
                    </button>
                    <button className="flex-1 border-2 border-gray-100 text-gray-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center space-x-2 hover:border-primary hover:text-primary transition-all">
                      <Phone className="w-3.5 h-3.5" /><span>{t.chatPage.call}</span>
                    </button>
                  </div>
                </div>

                <div className="rounded-3xl overflow-hidden border-2 border-orange-100 bg-orange-50/30">
                  <div className="p-6 space-y-5">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">{t.common.fra}</p>
                      <p className="text-3xl font-black text-primary tracking-tighter mt-1">NOK {tripPrice}<span className="text-sm text-gray-400 font-light">{t.chatPage.perPerson}</span></p>
                    </div>

                    <Link
                      href={`/payment?tripId=${id}&amount=${tripSummary.price}`}
                      className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all shadow-xl"
                    >
{t.chatPage.bookThisTrip}
                      </Link>

                    <Link
                      href={`/trips/${tripSlug}`}
                      className="block w-full text-center border-2 border-gray-200 text-gray-500 hover:border-primary hover:text-primary py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
{t.chatPage.viewFullItinerary}
                      </Link>

                    <div className="space-y-2 pt-1 text-[10px] font-medium text-gray-400">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{t.chatPage.securePayment}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{t.chatPage.freeCancellation}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'sjekkliste' && (
              <div className="space-y-8">
                <div className="bg-gray-50 rounded-3xl p-6 space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-gray-400">{t.chatPage.progress}</span>
                    <span className="text-primary">{checklist.filter(i => i.done).length}/{checklist.length}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(checklist.filter(i => i.done).length / checklist.length) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  {checklist.map(item => (
                    <div key={item.id} className={cn(
                      "flex items-center space-x-4 p-4 rounded-2xl transition-all",
                      item.done ? "bg-emerald-50/50" : "bg-gray-50"
                    )}>
                      {item.done ? <CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> : <Circle className="w-5 h-5 text-gray-300 shrink-0" />}
                      <div className="flex flex-col flex-1">
                        <span className={cn("text-sm font-medium", item.done ? "text-primary" : "text-gray-400")}>{item.label}</span>
                        {item.id === 4 && !item.done && (
                          <button onClick={() => updateTask(4, true)} className="text-[10px] font-black uppercase tracking-widest text-orange-500 mt-1 hover:underline text-left">
                            {t.chatPage.confirmDatesNow}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
