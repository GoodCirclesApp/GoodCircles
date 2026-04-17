
import React, { useState, useRef, useEffect } from 'react';
import { Product, Order, Nonprofit } from '../types';
import { getPersonalShopperResponse } from '../services/geminiService';
import { BrandSubmark } from './BrandAssets';
import { useGoodCirclesStore } from '../hooks/useGoodCirclesStore';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  availableProducts: Product[];
  currentNonprofit: Nonprofit;
  userLocation?: { lat: number, lng: number };
  onAddToCart: (product: Product) => void;
}

const BRAND_PURPLE = '#7851A9';
const BRAND_LAVENDER = '#CA9CE1';
const BRAND_GOLD = '#C2A76F';

export const PersonalShopper: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  orders, 
  availableProducts, 
  currentNonprofit, 
  userLocation,
  onAddToCart
}) => {
  const { walletBalance } = useGoodCirclesStore();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Greetings! I am your Good Circles Personal Shopper. I've analyzed your community contributions. I see you have $${walletBalance.toFixed(2)} in your Circle Account—using this will save you 2.5% compared to card fees today. How can I assist you?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const response = await getPersonalShopperResponse(
      userMessage,
      orders,
      availableProducts,
      currentNonprofit,
      userLocation,
      walletBalance
    );

    setMessages(prev => [...prev, { role: 'assistant', content: response || 'I apologize, the circle network encountered a temporary synchronization issue.' }]);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-[#000000]/60 backdrop-blur-md transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 border-l border-[#CA9CE1]/30">
        
        {/* Header */}
        <div className="p-10 border-b border-[#CA9CE1]/20 flex items-center justify-between bg-black text-white relative overflow-hidden group">
          <div className="flex items-center gap-6 relative z-10">
            <BrandSubmark size={54} color={BRAND_GOLD} />
            <div>
              <h2 className="text-2xl font-black tracking-tighter italic uppercase">Personal Shopper.</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7851A9] font-accent">Sophisticated Impact Optimizer</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all relative z-10 border border-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#7851A9]/20 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 scroll-smooth bg-[#FDFCFE]">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] p-6 rounded-[2.5rem] text-sm font-medium leading-relaxed shadow-sm ${
                m.role === 'user' 
                  ? 'bg-black text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 border border-[#CA9CE1]/30 rounded-tl-none border-l-4 border-l-[#7851A9]'
              }`}>
                {m.content.split('\n').map((line, idx) => (
                  <p key={idx} className={idx > 0 ? 'mt-3' : ''}>{line}</p>
                ))}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-[#CA9CE1]/30 p-6 rounded-[2.5rem] rounded-tl-none flex gap-3 shadow-sm">
                <div className="w-2.5 h-2.5 bg-[#7851A9] rounded-full animate-bounce"></div>
                <div className="w-2.5 h-2.5 bg-[#7851A9] rounded-full animate-bounce [animation-delay:-.3s]"></div>
                <div className="w-2.5 h-2.5 bg-[#7851A9] rounded-full animate-bounce [animation-delay:-.5s]"></div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="px-10 pb-6 flex gap-3 overflow-x-auto scrollbar-hide bg-[#FDFCFE]">
          {["Fee comparison", "Reinvestment strategy", "Available balance"].map(s => (
            <button 
              key={s} 
              onClick={() => { setInput(s); }}
              className="whitespace-nowrap px-6 py-3 bg-white hover:bg-[#CA9CE1]/10 text-[#7851A9] hover:text-[#000000] rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-[#CA9CE1]/20 transition-all font-accent shadow-sm"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input Field */}
        <div className="p-10 border-t border-[#CA9CE1]/20 bg-white">
          <form onSubmit={handleSend} className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Query impact analytics..."
              className="flex-1 px-8 py-5 bg-slate-50 border border-[#CA9CE1]/20 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-[#7851A9]/10 outline-none transition-all placeholder-slate-400"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="bg-black hover:bg-[#7851A9] disabled:opacity-50 text-white p-5 rounded-2xl shadow-2xl transition-all active:scale-90"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] font-accent italic">Sophisticated Intelligence by Good Circles</span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#C2A76F]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
