
import React, { useState, useEffect } from 'react';
import { DevNote } from '../types';

const INITIAL_NOTE: DevNote = {
  id: 'note-ein-verification',
  title: 'Automated EIN/Tax ID Verification Strategy',
  content: 'Implementation currently uses Gemini Search Grounding for high-efficiency heuristic validation. This provides real-world validation without the overhead of 3rd-party subscriptions during early stage growth. Transition to Official API (Middesk/Charity Navigator) is recommended during the production scaling phase for legally-binding reporting and enterprise-grade KYB compliance.',
  author: 'System Architect',
  date: new Date().toISOString(),
  category: 'COMPLIANCE'
};

export const GovernanceNotes: React.FC = () => {
  const [notes, setNotes] = useState<DevNote[]>([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', category: 'STRATEGY' as DevNote['category'] });

  useEffect(() => {
    const savedNotes = localStorage.getItem('gc_dev_notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    } else {
      setNotes([INITIAL_NOTE]);
    }
  }, []);

  const saveNotes = (updated: DevNote[]) => {
    setNotes(updated);
    localStorage.setItem('gc_dev_notes', JSON.stringify(updated));
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    const note: DevNote = {
      id: `note-${Date.now()}`,
      title: newNote.title,
      content: newNote.content,
      author: 'Platform Admin',
      date: new Date().toISOString(),
      category: newNote.category
    };
    const updated = [note, ...notes];
    saveNotes(updated);
    setNewNote({ title: '', content: '', category: 'STRATEGY' });
    setIsAddingNote(false);
  };

  const handleArchive = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    saveNotes(updated);
  };

  return (
    <div className="bg-white rounded-[4rem] p-12 border border-[#C2A76F]/20 shadow-sm space-y-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-3xl font-black italic uppercase tracking-tighter">Development Journal</h3>
          <p className="text-slate-400 text-xs font-medium mt-1">Strategic roadmaps and governance policy tracking.</p>
        </div>
        <button 
          onClick={() => setIsAddingNote(true)}
          className="bg-black text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#C2A76F] transition-all shadow-xl active:scale-95"
        >
          Add New Entry
        </button>
      </div>

      {isAddingNote && (
        <form onSubmit={handleAddNote} className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 space-y-8 animate-in slide-in-from-top-4 shadow-inner">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Entry Title</label>
              <input 
                required 
                value={newNote.title} 
                onChange={e => setNewNote({...newNote, title: e.target.value})}
                placeholder="e.g. Scaling Roadmaps" 
                className="w-full p-5 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-[#C2A76F]/10 font-bold transition-all" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Taxonomy</label>
              <select 
                value={newNote.category} 
                onChange={e => setNewNote({...newNote, category: e.target.value as DevNote['category']})}
                className="w-full p-5 rounded-2xl border border-slate-200 outline-none font-bold transition-all bg-white"
              >
                <option value="STRATEGY">Strategic Intent</option>
                <option value="COMPLIANCE">Legal & Compliance</option>
                <option value="INFRASTRUCTURE">Core Infrastructure</option>
                <option value="UX">UX Optimization</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Narrative Content</label>
            <textarea 
              required 
              value={newNote.content} 
              onChange={e => setNewNote({...newNote, content: e.target.value})}
              rows={5} 
              placeholder="Describe development updates or platform recommendations..." 
              className="w-full p-8 rounded-[2rem] border border-slate-200 outline-none focus:ring-4 focus:ring-[#C2A76F]/10 font-medium leading-relaxed transition-all" 
            />
          </div>
          <div className="flex gap-4">
            <button type="submit" className="bg-black text-white px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-[#C2A76F] transition-all">Publish Entry</button>
            <button type="button" onClick={() => setIsAddingNote(false)} className="text-slate-400 font-black text-[10px] uppercase px-6 hover:text-black">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-10">
        {notes.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
            <p className="text-slate-400 font-bold italic uppercase tracking-widest">Journal cleared.</p>
          </div>
        ) : (
          notes.map(note => (
            <div key={note.id} className="p-10 bg-white border border-[#C2A76F]/10 rounded-[3rem] shadow-sm hover:shadow-2xl transition-all border-l-8 border-l-[#C2A76F] relative group">
              <button 
                onClick={() => handleArchive(note.id)}
                className="absolute top-10 right-10 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2"
                title="Archive Entry"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <span className="bg-[#C2A76F]/10 text-[#C2A76F] px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest mb-3 inline-block font-accent">
                    {note.category}
                  </span>
                  <h4 className="text-3xl font-black text-black tracking-tighter uppercase italic leading-none">{note.title}</h4>
                </div>
                <div className="text-right pt-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-accent">{new Date(note.date).toLocaleDateString()}</p>
                  <p className="text-[9px] font-bold text-[#C2A76F] uppercase mt-1 tracking-widest">Authored by {note.author}</p>
                </div>
              </div>
              <p className="text-slate-700 text-lg font-medium leading-relaxed whitespace-pre-wrap italic opacity-80">"{note.content}"</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
