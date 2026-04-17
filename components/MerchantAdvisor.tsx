
import React, { useState, useRef, useEffect } from 'react';
import { Product, Order } from '../types';
import { getMerchantAdvisorResponse } from '../services/geminiService';
import { BrandSubmark } from './BrandAssets';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  merchantProfile: any;
  currentProducts: Product[];
  allProducts: Product[];
  orders: Order[];
}

export const MerchantAdvisor: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  merchantProfile,
  currentProducts,
  allProducts,
  orders
}) => {
  const productCount = currentProducts.length;
  const orderCount = orders.length;
  const greeting = `Welcome back${merchantProfile?.name ? `, ${merchantProfile.name}` : ''}. I'm your Good Circles Merchant Advisor — powered by Claude.\n\nI'm here to help you on three fronts: optimizing your ${productCount > 0 ? productCount + ' current listing' + (productCount !== 1 ? 's' : '') : 'listings'}, identifying product gaps in your niche that the ecosystem doesn't yet serve, and strengthening your community node through referrals, supply chain connections, and operational cost reduction.\n\nWhere would you like to start?`;

  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: greeting }
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

    const response = await getMerchantAdvisorResponse(
      userMessage,
      merchantProfile,
      currentProducts,
      allProducts,
      orders
    );

    setMessages(prev => [...prev, { role: 'assistant', content: response || "I'm currently analyzing the marketplace. Please try again in a moment." }]);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 border-l border-[#CA9CE1]/30">
        
        {/* Header */}
        <div className="p-10 bg-slate-900 text-white border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <BrandSubmark size={50} color="#C2A76F" />
            <div>
              <h2 className="text-2xl font-black tracking-tighter italic uppercase">Merchant Advisor.</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#CA9CE1] font-accent">Strategic Ecosystem Growth</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-xl transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 bg-[#FDFCFE]">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] p-6 rounded-[2rem] text-sm font-medium leading-relaxed shadow-sm ${
                m.role === 'user' 
                  ? 'bg-black text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 border border-[#CA9CE1]/20 rounded-tl-none border-l-4 border-l-[#C2A76F]'
              }`}>
                {m.content.split('\n').map((line, idx) => (
                  <p key={idx} className={idx > 0 ? 'mt-3' : ''}>{line}</p>
                ))}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-[#CA9CE1]/20 p-6 rounded-[2rem] rounded-tl-none flex gap-2">
                <div className="w-2 h-2 bg-[#C2A76F] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[#C2A76F] rounded-full animate-bounce [animation-delay:-0.2s]"></div>
                <div className="w-2 h-2 bg-[#C2A76F] rounded-full animate-bounce [animation-delay:-0.4s]"></div>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        <div className="px-10 pb-4 flex gap-2 overflow-x-auto scrollbar-hide bg-[#FDFCFE]">
          {["What's missing from my niche?", "Reduce my COGS", "How to recruit merchants", "Cut processing fees", "Strengthen my node"].map(s => (
            <button 
              key={s} 
              onClick={() => { setInput(s); }}
              className="whitespace-nowrap px-5 py-2.5 bg-white border border-[#CA9CE1]/20 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-600 hover:border-[#C2A76F] transition-all"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-10 border-t border-[#CA9CE1]/10 bg-white">
          <form onSubmit={handleSend} className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Query strategic advice..."
              className="flex-1 px-8 py-5 bg-slate-50 rounded-2xl border border-[#CA9CE1]/20 text-sm font-bold focus:ring-4 focus:ring-[#C2A76F]/10 outline-none transition-all"
            />
            <button type="submit" className="bg-black text-white p-5 rounded-2xl hover:bg-[#C2A76F] transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
