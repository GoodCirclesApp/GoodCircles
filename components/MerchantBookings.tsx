
import React, { useState, useEffect, useCallback } from 'react';
import { merchantService } from '../services/merchantService';
import {
  Calendar as CalendarIcon, Clock, User, Check, X, ChevronLeft, ChevronRight,
  Settings, Download, Link, ExternalLink, Plus, Trash2
} from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks, getDay, parseISO } from 'date-fns';
import { showToast } from '../hooks/toast';

// 30-minute time slots from 07:00 to 20:30
const TIME_SLOTS: string[] = Array.from({ length: 28 }, (_, i) => {
  const total = 7 * 60 + i * 30;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
});

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type SlotStatus = 'outside' | 'available' | 'booked' | 'pending';

function getSlotStatus(
  day: Date,
  slot: string,
  availability: any[],
  bookings: any[]
): SlotStatus {
  const dow = getDay(day);
  const windows = availability.filter(a => a.dayOfWeek === dow && a.isActive);
  const inWindow = windows.some(w => slot >= w.startTime && slot < w.endTime);
  if (!inWindow) return 'outside';

  const hit = bookings.find(b => {
    if (!isSameDay(parseISO(b.scheduledDate), day)) return false;
    if (!['PENDING', 'CONFIRMED'].includes(b.status)) return false;
    return b.scheduledTime === slot;
  });
  if (!hit) return 'available';
  return hit.status === 'CONFIRMED' ? 'booked' : 'pending';
}

const slotClasses: Record<SlotStatus, string> = {
  outside:   'bg-slate-50 border-slate-100',
  available: 'bg-emerald-50 border-emerald-100 hover:bg-emerald-100 cursor-pointer',
  booked:    'bg-red-100 border-red-200',
  pending:   'bg-amber-50 border-amber-200',
};

const DEFAULT_AVAILABILITY = DAYS_FULL.map((_, i) => ({
  dayOfWeek: i,
  startTime: '09:00',
  endTime: '17:00',
  isActive: i >= 1 && i <= 5,
}));

export const MerchantBookings: React.FC = () => {
  const [bookings, setBookings]           = useState<any[]>([]);
  const [availability, setAvailability]   = useState<any[]>(DEFAULT_AVAILABILITY);
  const [loading, setLoading]             = useState(true);
  const [weekStart, setWeekStart]         = useState(() => startOfWeek(new Date()));
  const [panel, setPanel]                 = useState<'none' | 'availability' | 'integrations'>('none');
  const [tempAvail, setTempAvail]         = useState<any[]>(DEFAULT_AVAILABILITY);
  const [savingAvail, setSavingAvail]     = useState(false);
  const [blockStart, setBlockStart]       = useState('');
  const [blockEnd, setBlockEnd]           = useState('');
  const [blockReason, setBlockReason]     = useState('');
  const [addingBlock, setAddingBlock]     = useState(false);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [b, a] = await Promise.all([
        merchantService.getBookings(),
        merchantService.getAvailability()
      ]);
      setBookings(b);
      if (a && a.length > 0) {
        const merged = DEFAULT_AVAILABILITY.map(def => {
          const found = a.find((w: any) => w.dayOfWeek === def.dayOfWeek);
          return found ?? def;
        });
        setAvailability(merged);
        setTempAvail(merged);
      }
    } catch {
      // silently fall back to defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSaveAvailability = async () => {
    setSavingAvail(true);
    try {
      await merchantService.setAvailability(
        tempAvail.filter(w => w.isActive).map(({ dayOfWeek, startTime, endTime }) => ({ dayOfWeek, startTime, endTime }))
      );
      setAvailability(tempAvail);
      setPanel('none');
      showToast('Business hours updated.', 'success');
    } catch {
      showToast('Failed to save hours. Try again.', 'error');
    } finally {
      setSavingAvail(false);
    }
  };

  const handleAddBlock = async () => {
    if (!blockStart || !blockEnd) return;
    setAddingBlock(true);
    try {
      await merchantService.addBlock(
        new Date(blockStart).toISOString(),
        new Date(blockEnd).toISOString(),
        blockReason || undefined
      );
      setBlockStart(''); setBlockEnd(''); setBlockReason('');
      showToast('Date blocked successfully.', 'success');
      load();
    } catch {
      showToast('Failed to add block. Try again.', 'error');
    } finally {
      setAddingBlock(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await merchantService.updateBookingStatus(id, status);
      load();
    } catch {
      showToast('Failed to update booking.', 'error');
    }
  };

  const handleDownloadIcs = async () => {
    try {
      await merchantService.downloadCalendarFeed();
      showToast('Calendar downloaded.', 'success');
    } catch {
      showToast('Download failed.', 'error');
    }
  };

  const upcoming = bookings.filter(b => ['PENDING', 'CONFIRMED'].includes(b.status));

  if (loading) return (
    <div className="animate-pulse space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-3xl" />)}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-3xl font-black italic uppercase tracking-tighter">Service Node Schedule.</h3>
          <p className="text-slate-400 text-xs font-medium mt-1">Live view of open and filled time slots.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setPanel(panel === 'availability' ? 'none' : 'availability')}
            className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${panel === 'availability' ? 'bg-[#7851A9] text-white' : 'border border-slate-100 hover:bg-slate-50'}`}
          >
            <Settings size={14} /> Business Hours
          </button>
          <button
            onClick={() => setPanel(panel === 'integrations' ? 'none' : 'integrations')}
            className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${panel === 'integrations' ? 'bg-[#7851A9] text-white' : 'border border-slate-100 hover:bg-slate-50'}`}
          >
            <Link size={14} /> Calendar Sync
          </button>
        </div>
      </div>

      {/* Availability Editor Panel */}
      {panel === 'availability' && (
        <div className="bg-white border border-[#CA9CE1]/20 rounded-[3rem] p-8 shadow-xl animate-in fade-in slide-in-from-top-4 space-y-6">
          <h4 className="text-xl font-black italic uppercase tracking-tighter">Weekly Business Hours</h4>
          <div className="space-y-3">
            {tempAvail.map(w => (
              <div key={w.dayOfWeek} className="flex flex-wrap items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                <label className="flex items-center gap-3 min-w-[120px]">
                  <input
                    type="checkbox" checked={w.isActive}
                    onChange={() => setTempAvail(prev => prev.map(a => a.dayOfWeek === w.dayOfWeek ? { ...a, isActive: !a.isActive } : a))}
                    className="w-4 h-4 rounded text-[#7851A9] accent-[#7851A9]"
                  />
                  <span className="text-xs font-black uppercase tracking-widest">{DAYS_FULL[w.dayOfWeek]}</span>
                </label>
                <div className={`flex items-center gap-3 transition-opacity ${!w.isActive ? 'opacity-30 pointer-events-none' : ''}`}>
                  <input
                    type="time" value={w.startTime}
                    onChange={e => setTempAvail(prev => prev.map(a => a.dayOfWeek === w.dayOfWeek ? { ...a, startTime: e.target.value } : a))}
                    className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-[#7851A9]/30"
                  />
                  <span className="text-slate-400 font-black text-[10px]">TO</span>
                  <input
                    type="time" value={w.endTime}
                    onChange={e => setTempAvail(prev => prev.map(a => a.dayOfWeek === w.dayOfWeek ? { ...a, endTime: e.target.value } : a))}
                    className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-[#7851A9]/30"
                  />
                </div>
                {!w.isActive && <span className="text-[10px] font-black text-slate-300 uppercase">Closed</span>}
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h5 className="text-sm font-black uppercase tracking-tighter mb-4">Block Specific Dates</h5>
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">From</label>
                <input type="datetime-local" value={blockStart} onChange={e => setBlockStart(e.target.value)}
                  className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-[#7851A9]/30" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">To</label>
                <input type="datetime-local" value={blockEnd} onChange={e => setBlockEnd(e.target.value)}
                  className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-[#7851A9]/30" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Reason (optional)</label>
                <input type="text" placeholder="Vacation, training, etc." value={blockReason} onChange={e => setBlockReason(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-[#7851A9]/30" />
              </div>
              <button onClick={handleAddBlock} disabled={!blockStart || !blockEnd || addingBlock}
                className="px-6 py-2.5 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all disabled:opacity-50 flex items-center gap-2">
                <Plus size={12} /> Block
              </button>
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button onClick={handleSaveAvailability} disabled={savingAvail}
              className="bg-[#7851A9] text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 shadow-lg">
              {savingAvail ? 'Saving...' : 'Save Business Hours'}
            </button>
            <button onClick={() => { setTempAvail(availability); setPanel('none'); }}
              className="text-slate-400 font-black text-[10px] uppercase tracking-widest px-6">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Calendar Integrations Panel */}
      {panel === 'integrations' && (
        <div className="bg-white border border-[#CA9CE1]/20 rounded-[3rem] p-8 shadow-xl animate-in fade-in slide-in-from-top-4">
          <h4 className="text-xl font-black italic uppercase tracking-tighter mb-6">Calendar Sync</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center"><Download size={18} /></div>
                <div>
                  <p className="text-sm font-black uppercase tracking-tight">iCal Export</p>
                  <p className="text-[10px] text-slate-400">Apple Calendar, Outlook</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Download your upcoming bookings as a standard .ics file. Import into any calendar app.</p>
              <button onClick={handleDownloadIcs}
                className="w-full py-3 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all flex items-center justify-center gap-2">
                <Download size={12} /> Download .ics
              </button>
            </div>

            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#4285F4] text-white rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12s4.48 10 10 10 10-4.48 10-10zm-10 8c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-tight">Google Calendar</p>
                  <p className="text-[10px] text-slate-400">Two-way sync</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Connect your Google Calendar to automatically sync bookings and block times from your existing schedule.</p>
              <div className="w-full py-3 bg-slate-200 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center">
                Coming Soon
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#006BFF] text-white rounded-xl flex items-center justify-center">
                  <ExternalLink size={18} />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-tight">Calendly</p>
                  <p className="text-[10px] text-slate-400">Booking page sync</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Link your Calendly account to keep both booking systems in sync and avoid double-bookings.</p>
              <div className="w-full py-3 bg-slate-200 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center">
                Coming Soon
              </div>
            </div>

          </div>
          <p className="text-[10px] text-slate-400 mt-6 italic">Google Calendar and Calendly integrations require platform API credentials and will be activated at launch. The .ics download works today and is compatible with all major calendar applications.</p>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="bg-white p-4 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-sm overflow-x-auto">

        {/* Week nav */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setWeekStart(subWeeks(weekStart, 1))} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><ChevronLeft size={20} /></button>
            <h4 className="text-lg font-black italic uppercase tracking-tighter">Week of {format(weekStart, 'MMM d, yyyy')}</h4>
            <button onClick={() => setWeekStart(addWeeks(weekStart, 1))} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><ChevronRight size={20} /></button>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setWeekStart(startOfWeek(new Date()))} className="text-[10px] font-black uppercase tracking-widest text-[#7851A9] hover:underline">Today</button>
            <div className="hidden sm:flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200 inline-block" />Available</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 border border-red-200 inline-block" />Booked</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-50 border border-amber-200 inline-block" />Pending</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-50 border border-slate-100 inline-block" />Closed</span>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="min-w-[640px]">
          {/* Day header row */}
          <div className="grid grid-cols-[56px_repeat(7,1fr)] gap-1 mb-1">
            <div />
            {weekDays.map((day, i) => {
              const isToday = isSameDay(day, new Date());
              return (
                <div key={i} className={`text-center py-2 rounded-xl ${isToday ? 'bg-[#7851A9] text-white' : 'bg-slate-50 text-slate-500'}`}>
                  <p className="text-[10px] font-black uppercase tracking-widest">{DAYS[i]}</p>
                  <p className={`text-lg font-black italic leading-tight ${isToday ? 'text-white' : 'text-slate-800'}`}>{format(day, 'd')}</p>
                </div>
              );
            })}
          </div>

          {/* Time slot rows */}
          <div className="space-y-0.5">
            {TIME_SLOTS.map((slot, si) => (
              <div key={slot} className="grid grid-cols-[56px_repeat(7,1fr)] gap-1">
                <div className="flex items-center justify-end pr-2">
                  {slot.endsWith(':00') && (
                    <span className="text-[9px] font-bold text-slate-300 uppercase">{format(new Date(`2000-01-01T${slot}`), 'h a')}</span>
                  )}
                </div>
                {weekDays.map((day, di) => {
                  const status = getSlotStatus(day, slot, availability, bookings);
                  const booking = status !== 'outside' && status !== 'available'
                    ? bookings.find(b => isSameDay(parseISO(b.scheduledDate), day) && b.scheduledTime === slot)
                    : null;
                  return (
                    <div
                      key={di}
                      title={booking ? `${booking.listing?.name || 'Booking'} — ${booking.consumer?.firstName || ''}` : status === 'available' ? 'Available' : status === 'outside' ? 'Closed' : ''}
                      className={`h-6 rounded border text-[8px] font-black uppercase transition-all ${slotClasses[status]} ${booking ? 'flex items-center justify-center overflow-hidden px-0.5' : ''}`}
                    >
                      {booking && (
                        <span className="truncate text-center leading-none">{booking.listing?.name?.slice(0, 8)}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Bookings List */}
      <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-sm">
        <h3 className="text-xl font-black italic uppercase tracking-tighter mb-6">Upcoming Bookings</h3>
        {upcoming.length === 0 ? (
          <p className="text-slate-400 text-sm italic py-12 text-center">No pending or confirmed bookings.</p>
        ) : (
          <div className="space-y-4">
            {upcoming.map(b => (
              <div key={b.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex gap-4 items-start">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${b.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    <CalendarIcon size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${b.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{b.status}</span>
                    </div>
                    <h5 className="text-sm font-black uppercase tracking-tight">{b.listing?.name || b.listingName || 'Service'}</h5>
                    <p className="text-[10px] font-medium text-slate-400 mt-0.5 flex items-center gap-1">
                      <Clock size={10} />
                      {format(parseISO(b.scheduledDate), 'EEE MMM d, yyyy')} @ {b.scheduledTime}
                      {b.durationMinutes && ` · ${b.durationMinutes} min`}
                    </p>
                    <p className="text-[10px] font-black text-slate-500 mt-0.5 flex items-center gap-1">
                      <User size={10} />
                      {b.consumer?.firstName} {b.consumer?.lastName}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  {b.status === 'PENDING' && (
                    <button onClick={() => handleStatusUpdate(b.id, 'CONFIRMED')}
                      className="flex-1 md:flex-none px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-1.5">
                      <Check size={12} /> Confirm
                    </button>
                  )}
                  {b.status === 'CONFIRMED' && (
                    <button onClick={() => handleStatusUpdate(b.id, 'COMPLETED')}
                      className="flex-1 md:flex-none px-5 py-2.5 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all flex items-center justify-center gap-1.5">
                      <Check size={12} /> Mark Complete
                    </button>
                  )}
                  <button onClick={() => handleStatusUpdate(b.id, 'CANCELLED')}
                    className="flex-1 md:flex-none px-5 py-2.5 bg-red-50 text-red-500 border border-red-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-1.5">
                    <X size={12} /> Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
