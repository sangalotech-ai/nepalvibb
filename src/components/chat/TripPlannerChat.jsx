"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, User, MapPin, Loader2 } from 'lucide-react';
import { useLocale } from '@/components/providers/useLocale';

export default function TripPlannerChat() {
  const { t } = useLocale();
  const [messages, setMessages] = useState([
    { sender: 'specialist', text: t.tripPlanner.welcomeMsg }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tripRequestId, setTripRequestId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    
    // Optimistic UI update
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, tripRequestId })
      });

      const data = await response.json();
      
      if (data.success) {
        if (!tripRequestId) {
          setTripRequestId(data.tripRequestId);
        }
        // Filter out system messages and update
        const chatMessages = data.messages.filter(m => m.sender !== 'system');
        setMessages(chatMessages);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, { sender: 'system', text: t.tripPlanner.errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between shadow-md z-10">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <MapPin className="text-emerald-600 w-5 h-5" />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-emerald-600 rounded-full"></div>
          </div>
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">{t.tripPlanner.specialistTitle}</h2>
            <p className="text-emerald-100 text-sm">{t.tripPlanner.replyInstantly}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto bg-gray-50 space-y-6">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.sender === 'user' ? 'bg-emerald-100 ml-3' : 'bg-emerald-600 mr-3'
              }`}>
                {msg.sender === 'user' ? (
                  <User className="w-4 h-4 text-emerald-700" />
                ) : (
                  <MapPin className="w-4 h-4 text-white" />
                )}
              </div>
              
              <div className={`rounded-2xl px-5 py-3 shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-emerald-600 text-white rounded-tr-none' 
                  : msg.sender === 'system'
                    ? 'bg-red-50 text-red-600 border border-red-100'
                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex flex-row max-w-[80%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 mr-3 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white text-gray-500 rounded-2xl rounded-tl-none px-5 py-3 border border-gray-100 shadow-sm flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSend} className="flex space-x-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.tripPlanner.inputPlaceholder}
            disabled={isLoading}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-6 py-3 md:py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow text-gray-700"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-emerald-600 text-white rounded-full p-2.5 md:p-3 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-3">
          {t.tripPlanner.replyWithin}
        </p>
      </div>
    </div>
  );
}
