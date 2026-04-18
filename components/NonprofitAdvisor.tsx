
import React, { useState, useRef, useEffect } from 'react';
import { Nonprofit, Order } from '../types';
import { getNonprofitAdvisorResponse } from '../services/geminiService';
import { BrandSubmark } from './BrandAssets';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  nonprofitProfile: Nonprofit;
  orders: Order[];
}

export const NonprofitAdvisor: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  nonprofitProfile,
  orders
}) => {
  const supporterCount = new Set(orders.map((o: any) => o.neighborId).filter(Boolean)).size;
  const totalFunding = orders.reduce((s: number, o: any) => s + (Number(o.nonprofitShare) || 0), 0);
  const greeting = `Hello${nonprofitProfile?.name ? ` — welcome, ${nonprofitProfile.name}` : ''}. I'm your Good Circles Impact Advisor, powered by Claude.\n\nMy job is to help you grow the number of community members who choose ${nonprofitProfile?.name ?? 'your organization'} as their designated nonprofit partner — because every Neighbor who selects you generates automatic funding through their everyday shopping, with no donation ask required.\n\n${supporterCount > 0 ? `You currently have ${supporterCount} active supporter${supporterCount !== 1 ? 's' : ''} generating $${totalFunding.toFixed(2)} in funding. Let's grow that.` : "Let's build your supporter base and turn daily spending into your most reliable funding stream."}\n\nWhere would you like to start — member acquisition, marketing campaigns, or ecosystem integration?`;

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

    const response = await getNonprofitAdvisorResponse(
      userMessage,
      nonprofitProfile,
      orders
    );

    setMessages(prev => [...prev, { role: 'assistant', content: response || "I'm having trouble analyzing the impact ledger right now." }]);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 border-l border-[#CA9CE1]/30">
        
        {/* Header */}
        <div className="p-10 bg-[#7851A9] text-white border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <BrandSubmark size={50} variant="WHITE" showCrown={false} />
            <div>
              <h2 className="text-2xl font-black tracking-tighter italic uppercase">Impact Advisor.</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#CA9CE1] font-accent">Nonprofit Marketing Strategy</p>
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
                  : 'bg-white text-slate-800 border border-[#CA9CE1]/20 rounded-tl-none border-l-4 border-l-[#7851A9]'
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
                <div className="w-2 h-2 bg-[#7851A9] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[#7851A9] rounded-full animate-bounce [animation-delay:-0.2s]"></div>
                <div className="w-2 h-2 bg-[#7851A9] rounded-full animate-bounce [animation-delay:-0.4s]"></div>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        <div className="px-10 pb-4 flex gap-2 overflow-x-auto scrollbar-hide bg-[#FDFCFE]">
          {["Grow my supporter base", "Write a campaign post", "Draft a press release", "How Waived Discounts work", "Set up as a vendor"].map(s => (
            <button 
              key={s} 
              onClick={() => { setInput(s); }}
              className="whitespace-nowrap px-5 py-2.5 bg-white border border-[#CA9CE1]/20 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-[#7851A9] transition-all"
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
              placeholder="Query impact strategy..."
              className="flex-1 px-8 py-5 bg-slate-50 rounded-2xl border border-[#CA9CE1]/20 text-sm font-bold focus:ring-4 focus:ring-[#7851A9]/10 outline-none transition-all"
            />
            <button type="submit" className="bg-[#7851A9] text-white p-5 rounded-2xl hover:bg-black transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
