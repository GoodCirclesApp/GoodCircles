
import React, { useState, useRef, useEffect } from 'react';
import { SupporterCircle, CircleMessage } from '../types';
import { BrandSubmark } from './BrandAssets';

interface Props {
  circle: SupporterCircle;
  onSendMessage: (content: string) => void;
}

export const NodeCoordination: React.FC<Props> = ({ circle, onSendMessage }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [circle.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-[4rem] border border-[#CA9CE1]/20 shadow-xl overflow-hidden animate-in slide-in-from-right duration-500">
      
      {/* Circle Banner */}
      <div className="p-8 bg-black text-white relative overflow-hidden group shrink-0">
         <div className="relative z-10 space-y-1">
            <p className="text-[8px] font-black text-[#C2A76F] uppercase tracking-[0.4em]">Node Collective</p>
            <h4 className="text-2xl font-black italic uppercase tracking-tighter">{circle.name}</h4>
         </div>
         <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
            <BrandSubmark size={50} variant="WHITE" showCrown={false} />
         </div>
      </div>

      {/* Message Ledger */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth bg-[#FDFCFE]">
         {circle.messages?.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center opacity-30 text-center space-y-4">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              <p className="text-[10px] font-black uppercase tracking-widest">Commence Coordination</p>
           </div>
         ) : (
           circle.messages?.map(msg => (
             <div key={msg.id} className="animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-center mb-2">
                   <p className="text-[9px] font-black text-[#7851A9] uppercase tracking-widest">{msg.senderName}</p>
                   <p className="text-[7px] font-bold text-slate-300 uppercase">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className={`p-5 rounded-[2rem] text-sm font-medium leading-relaxed shadow-sm ${msg.type === 'MILESTONE' ? 'bg-[#C2A76F]/10 border border-[#C2A76F]/20 italic' : 'bg-white border border-slate-100'}`}>
                   {msg.content}
                </div>
             </div>
           ))
         )}
      </div>

      {/* Input Module */}
      <div className="p-8 border-t border-[#CA9CE1]/20 bg-white shrink-0">
         <form onSubmit={handleSend} className="flex gap-4">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Post community action..."
              className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-[#7851A9]/10 transition-all"
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="bg-black text-white p-4 rounded-xl shadow-lg hover:bg-[#7851A9] transition-all disabled:opacity-30 active:scale-90"
            >
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
         </form>
         <div className="mt-4 flex items-center justify-center gap-2 opacity-30">
            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
            <p className="text-[8px] font-black uppercase tracking-widest">End-to-end impact encryption active</p>
         </div>
      </div>
    </div>
  );
};
