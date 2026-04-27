
import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_FAQ, FAQItem } from '../constants';
import { UserRole } from '../types';

interface Props {
  role: UserRole;
}

export const FAQSection: React.FC<Props> = ({ role }) => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'CORE' | 'ECONOMY' | 'SECURITY' | 'GOVERNANCE' | 'MERCHANT' | 'NONPROFIT'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('gc_faq_data');
    if (saved) {
      setFaqs(JSON.parse(saved));
    } else {
      setFaqs(INITIAL_FAQ);
    }
  }, []);

  const saveFaqs = (updated: FAQItem[]) => {
    setFaqs(updated);
    localStorage.setItem('gc_faq_data', JSON.stringify(updated));
  };

  const handleEdit = (faq: FAQItem) => {
    setEditingId(faq.id);
    setEditQuestion(faq.question);
    setEditAnswer(faq.answer);
  };

  const handleSaveEdit = () => {
    const updated = faqs.map(f => 
      f.id === editingId ? { ...f, question: editQuestion, answer: editAnswer } : f
    );
    saveFaqs(updated);
    setEditingId(null);
  };

  const categories = [
    { id: 'ALL', label: 'All Pillars' },
    { id: 'CORE', label: '10/10/1 Engine' },
    { id: 'ECONOMY', label: 'GCLA & Banking' },
    { id: 'SECURITY', label: 'Sentinel & Privacy' },
    { id: 'GOVERNANCE', label: 'Policy Hub' },
    { id: 'MERCHANT', label: 'Merchant Center' },
    { id: 'NONPROFIT', label: 'Nonprofit Center' },
  ];

  const filteredFaqs = useMemo(() => {
    return faqs.filter(f => {
      const matchesCategory = activeCategory === 'ALL' || f.category === activeCategory;
      const matchesSearch = f.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            f.answer.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [faqs, activeCategory, searchTerm]);

  const isAdmin = role === 'PLATFORM';

  return (
    <div className="space-y-16 animate-in fade-in duration-700">
      {/* Header Module */}
      <header className="max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
           <div className="w-2 h-2 rounded-full bg-[#7851A9] animate-pulse"></div>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#7851A9] font-accent">Ecosystem Knowledge Base v8.02</p>
        </div>
        <h2 className="text-7xl font-black text-black tracking-tighter italic uppercase leading-[0.9]">
          System Guide.
        </h2>
        <p className="text-slate-500 text-2xl font-medium mt-8 leading-relaxed">
          Comprehensive documentation of the Good Circles fiscal infrastructure, security safeguards, and governance protocols.
        </p>
      </header>

      {/* Control Module */}
      <div className="flex flex-col xl:flex-row gap-8 items-center justify-between bg-white p-8 rounded-[4rem] border border-[#CA9CE1]/20 shadow-sm">
        <div className="flex bg-slate-100 p-1.5 rounded-[2.5rem] w-full xl:w-fit overflow-x-auto scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id as any); setOpenId(null); }}
              className={`whitespace-nowrap px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeCategory === cat.id ? 'bg-black text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="relative w-full xl:w-80 group">
           <input 
             type="text" 
             placeholder="Search knowledge pillar..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full px-8 py-4 bg-slate-50 rounded-[2rem] border border-slate-100 text-xs font-bold outline-none focus:ring-4 focus:ring-[#7851A9]/10 group-hover:border-[#7851A9]/30 transition-all"
           />
           <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
           </div>
        </div>
      </div>

      {/* Content Module */}
      <div className="grid grid-cols-1 gap-6 max-w-6xl mx-auto">
        {filteredFaqs.length === 0 ? (
          <div className="py-24 text-center bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200">
             <p className="text-slate-400 font-bold italic uppercase tracking-widest">No documentation found matching query.</p>
          </div>
        ) : (
          filteredFaqs.map(faq => (
            <div 
              key={faq.id} 
              className={`bg-white rounded-[3rem] border border-[#CA9CE1]/10 overflow-hidden transition-all duration-500 ${openId === faq.id ? 'shadow-2xl ring-2 ring-[#7851A9]/10 scale-[1.02]' : 'hover:border-[#7851A9]/30 shadow-sm'}`}
            >
              {editingId === faq.id ? (
                <div className="p-12 space-y-8 animate-in slide-in-from-top-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Constitutional Question</label>
                    <input
                      type="text"
                      value={editQuestion}
                      onChange={e => setEditQuestion(e.target.value)}
                      className="w-full px-8 py-5 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none focus:ring-4 focus:ring-[#7851A9]/10 transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Certified Answer</label>
                    <textarea
                      value={editAnswer}
                      onChange={e => setEditAnswer(e.target.value)}
                      rows={6}
                      className="w-full px-8 py-5 rounded-2xl bg-slate-50 border border-slate-100 font-medium outline-none focus:ring-4 focus:ring-[#7851A9]/10 transition-all leading-relaxed"
                    />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={handleSaveEdit}
                      className="bg-black text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all shadow-xl"
                    >
                      Update Documentation
                    </button>
                    <button 
                      onClick={() => setEditingId(null)}
                      className="text-slate-400 font-black text-[10px] uppercase tracking-widest px-8"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <button 
                    onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                    className="w-full p-12 flex items-center justify-between text-left group"
                  >
                    <div className="flex-1 min-w-0 pr-10">
                      <span className="text-[10px] font-black text-[#7851A9] uppercase tracking-[0.4em] mb-4 block opacity-60">
                        Knowledge Pillar: {faq.category}
                      </span>
                      <h3 className="text-3xl font-black text-black tracking-tighter leading-tight italic uppercase group-hover:text-[#7851A9] transition-colors">
                        {faq.question}
                      </h3>
                    </div>
                    <div className={`p-5 rounded-2xl bg-slate-50 text-slate-300 transition-all duration-500 ${openId === faq.id ? 'rotate-180 bg-[#7851A9] text-white' : 'group-hover:bg-slate-100 group-hover:text-black'}`}>
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  {openId === faq.id && (
                    <div className="px-12 pb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                      <div className="bg-slate-50/50 p-12 rounded-[3.5rem] border border-slate-100 relative overflow-hidden group/ans">
                        <p className="text-slate-700 text-xl font-medium leading-relaxed italic whitespace-pre-wrap relative z-10">
                          {faq.answer}
                        </p>
                        {isAdmin && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleEdit(faq); }}
                            className="mt-10 flex items-center gap-2 text-[#7851A9] hover:text-black text-[10px] font-black uppercase tracking-widest transition-colors relative z-10"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Amend Official Record
                          </button>
                        )}
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover/ans:opacity-[0.08] transition-opacity">
                           <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001Z" /></svg>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Outro Module */}
      <div className="bg-black text-white p-20 rounded-[5rem] shadow-2xl relative overflow-hidden group">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
           <div className="space-y-6 text-center md:text-left">
              <h3 className="text-5xl font-black tracking-tighter italic uppercase leading-none">Knowledge is Capital.</h3>
              <p className="text-[#CA9CE1] text-2xl font-medium max-w-2xl leading-relaxed">
                The more participants understand the circular logic, the faster we scale community wealth.
              </p>
           </div>
           <button className="whitespace-nowrap bg-[#7851A9] hover:bg-white hover:text-black text-white px-16 py-6 rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] transition-all shadow-2xl group-hover:scale-105 active:scale-95">
             Submit Governance Inquiry
           </button>
        </div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#7851A9]/10 blur-[120px] rounded-full -mt-64 -mr-64 group-hover:scale-150 transition-transform duration-1000"></div>
      </div>
    </div>
  );
};
