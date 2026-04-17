
import React, { useState, useEffect } from 'react';
import { merchantService } from '../services/merchantService';
import { Calendar as CalendarIcon, Clock, User, Check, X, AlertCircle, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from 'date-fns';

export const MerchantBookings: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isSettingHours, setIsSettingHours] = useState(false);
  const [isBlockingDates, setIsBlockingDates] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await merchantService.getBookings();
      setBookings(data);
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await merchantService.updateBookingStatus(id, status);
      fetchBookings();
    } catch (err) {
      console.error('Failed to update booking status', err);
    }
  };

  const weekStart = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-3xl" />)}</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-3xl font-black italic uppercase tracking-tighter">Service Node Schedule.</h3>
          <p className="text-slate-400 text-xs font-medium mt-1">Manage your availability and upcoming service bookings.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsSettingHours(true)}
            className="px-6 py-3 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            Set Weekly Hours
          </button>
          <button 
            onClick={() => setIsBlockingDates(true)}
            className="px-6 py-3 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all flex items-center gap-2"
          >
            <Plus size={14} /> Block Dates
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <button onClick={() => setCurrentDate(subWeeks(currentDate, 1))} className="p-2 hover:bg-slate-50 rounded-full"><ChevronLeft size={20} /></button>
                <h4 className="text-xl font-black uppercase italic tracking-tighter">Week of {format(weekStart, 'MMM d, yyyy')}</h4>
                <button onClick={() => setCurrentDate(addWeeks(currentDate, 1))} className="p-2 hover:bg-slate-50 rounded-full"><ChevronRight size={20} /></button>
              </div>
              <button onClick={() => setCurrentDate(new Date())} className="text-[10px] font-black uppercase tracking-widest text-[#7851A9]">Today</button>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day, idx) => {
                const dayBookings = bookings.filter(b => isSameDay(new Date(b.startTime), day));
                const isToday = isSameDay(day, new Date());
                return (
                  <div key={idx} className={`min-h-[120px] p-4 rounded-2xl border transition-all ${isToday ? 'bg-slate-50 border-[#7851A9]/20' : 'bg-white border-slate-50'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isToday ? 'text-[#7851A9]' : 'text-slate-400'}`}>
                      {format(day, 'EEE')} <span className="block text-lg font-black italic">{format(day, 'd')}</span>
                    </p>
                    <div className="space-y-1">
                      {dayBookings.map(b => (
                        <div key={b.id} className={`w-full h-2 rounded-full ${b.status === 'CONFIRMED' ? 'bg-emerald-400' : b.status === 'PENDING' ? 'bg-amber-400' : 'bg-slate-200'}`} title={b.productService.name} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8">Upcoming Bookings</h3>
            <div className="space-y-4">
              {bookings.filter(b => b.status !== 'CANCELLED' && b.status !== 'COMPLETED').length === 0 ? (
                <p className="text-slate-400 text-sm italic py-12 text-center">No upcoming bookings.</p>
              ) : (
                bookings.filter(b => b.status !== 'CANCELLED' && b.status !== 'COMPLETED').map(b => (
                  <div key={b.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#7851A9] shadow-sm">
                        <CalendarIcon size={20} />
                      </div>
                      <div>
                        <h5 className="text-sm font-black uppercase tracking-tight">{b.productService.name}</h5>
                        <p className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                          <Clock size={10} /> {format(new Date(b.startTime), 'MMM d, h:mm a')} - {format(new Date(b.endTime), 'h:mm a')}
                        </p>
                        <p className="text-[10px] font-black text-slate-500 uppercase mt-1 flex items-center gap-1">
                          <User size={10} /> {b.user.firstName} {b.user.lastName}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      {b.status === 'PENDING' && (
                        <button 
                          onClick={() => handleStatusUpdate(b.id, 'CONFIRMED')}
                          className="flex-1 md:flex-none px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                        >
                          <Check size={14} /> Confirm
                        </button>
                      )}
                      {b.status === 'CONFIRMED' && (
                        <button 
                          onClick={() => handleStatusUpdate(b.id, 'COMPLETED')}
                          className="flex-1 md:flex-none px-4 py-2 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all flex items-center justify-center gap-2"
                        >
                          <Check size={14} /> Complete
                        </button>
                      )}
                      <button 
                        onClick={() => handleStatusUpdate(b.id, 'CANCELLED')}
                        className="flex-1 md:flex-none px-4 py-2 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-[#7851A9] p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-xl font-black uppercase italic tracking-tighter mb-2">Schedule Health</h4>
              <p className="text-white/60 text-xs font-medium mb-6">Your service utilization for the last 7 days.</p>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <p className="text-[10px] font-black uppercase tracking-widest">Utilization</p>
                  <p className="text-2xl font-black italic">78%</p>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-[78%]" />
                </div>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-10">
              <CalendarIcon size={200} />
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <h4 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-500" /> System Alerts
            </h4>
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <p className="text-[10px] font-black text-amber-700 uppercase mb-1">Conflict Detected</p>
                <p className="text-[10px] font-medium text-amber-600">You have 2 overlapping bookings on March 25th.</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-[10px] font-black text-blue-700 uppercase mb-1">Holiday Reminder</p>
                <p className="text-[10px] font-medium text-blue-600">Next Monday is a public holiday. Consider blocking dates.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
