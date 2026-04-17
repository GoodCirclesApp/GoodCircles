
import React, { useState } from 'react';
import { Booking, MerchantAvailability } from '../types';
import { format, parseISO } from 'date-fns';

interface Props {
  bookings: Booking[];
  availability: MerchantAvailability[];
  onConfirm: (id: string) => void;
  onComplete: (id: string, paymentMethod: string) => Promise<string | undefined>;
  onCancel: (id: string, reason: string, paymentMethod: string) => void;
  onUpdateAvailability: (newAvail: Partial<MerchantAvailability>[]) => void;
}

export const MerchantScheduleView: React.FC<Props> = ({ 
  bookings, 
  availability, 
  onConfirm, 
  onComplete, 
  onCancel, 
  onUpdateAvailability 
}) => {
  const [isEditingAvailability, setIsEditingAvailability] = useState(false);
  const [tempAvailability, setTempAvailability] = useState<MerchantAvailability[]>(availability);

  const handleSaveAvailability = () => {
    onUpdateAvailability(tempAvailability);
    setIsEditingAvailability(false);
  };

  const handleToggleDay = (day: number) => {
    setTempAvailability(prev => prev.map(a => 
      a.dayOfWeek === day ? { ...a, isActive: !a.isActive } : a
    ));
  };

  const handleTimeChange = (day: number, field: 'startTime' | 'endTime', value: string) => {
    setTempAvailability(prev => prev.map(a => 
      a.dayOfWeek === day ? { ...a, [field]: value } : a
    ));
  };

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-5xl font-black text-black tracking-tighter uppercase italic">Merchant Schedule</h2>
          <p className="text-slate-500 font-medium mt-2 uppercase tracking-widest text-[10px]">Manage your availability and bookings</p>
        </div>
        <button 
          onClick={() => setIsEditingAvailability(!isEditingAvailability)}
          className="px-6 py-3 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest"
        >
          {isEditingAvailability ? 'Cancel Editing' : 'Edit Weekly Availability'}
        </button>
      </div>

      {isEditingAvailability && (
        <div className="bg-white border border-[#CA9CE1]/30 rounded-[3rem] p-8 shadow-xl animate-in fade-in slide-in-from-top-4">
          <h3 className="text-xl font-black mb-6 uppercase tracking-tighter">Weekly Availability</h3>
          <div className="space-y-4">
            {tempAvailability.sort((a, b) => a.dayOfWeek - b.dayOfWeek).map((avail) => (
              <div key={avail.dayOfWeek} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <input 
                    type="checkbox" 
                    checked={avail.isActive} 
                    onChange={() => handleToggleDay(avail.dayOfWeek)}
                    className="w-5 h-5 rounded border-slate-300 text-[#7851A9] focus:ring-[#7851A9]"
                  />
                  <span className="font-black text-xs uppercase tracking-widest w-24">{days[avail.dayOfWeek]}</span>
                </div>
                <div className="flex items-center gap-4">
                  <input 
                    type="time" 
                    value={avail.startTime} 
                    disabled={!avail.isActive}
                    onChange={(e) => handleTimeChange(avail.dayOfWeek, 'startTime', e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold disabled:opacity-50"
                  />
                  <span className="text-slate-400 font-black text-[10px]">TO</span>
                  <input 
                    type="time" 
                    value={avail.endTime} 
                    disabled={!avail.isActive}
                    onChange={(e) => handleTimeChange(avail.dayOfWeek, 'endTime', e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold disabled:opacity-50"
                  />
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={handleSaveAvailability}
            className="mt-8 w-full py-4 bg-[#7851A9] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg"
          >
            Save Weekly Schedule
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {bookings.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[4rem]">
            <p className="text-slate-400 font-bold italic uppercase tracking-widest">No bookings scheduled yet.</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div key={booking.id} className="bg-white border border-[#CA9CE1]/20 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 hover:shadow-xl transition-all">
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="w-16 h-16 bg-[#7851A9]/10 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">📅</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
                      booking.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' :
                      booking.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                      booking.status === 'PAYMENT_PENDING' ? 'bg-purple-100 text-purple-700' :
                      booking.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {booking.status.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {format(parseISO(booking.scheduledDate), 'MMM d, yyyy')} @ {booking.scheduledTime}
                    </span>
                  </div>
                  <h4 className="text-xl font-black text-black uppercase tracking-tighter">{booking.listingName}</h4>
                  <p className="text-xs text-slate-500 font-medium">Customer: <span className="text-black font-bold">{booking.consumerName}</span></p>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                {booking.status === 'PENDING' && (
                  <>
                    <button 
                      onClick={() => onConfirm(booking.id)}
                      className="flex-1 md:flex-none px-6 py-3 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                    >
                      Confirm
                    </button>
                    <button 
                      onClick={() => onCancel(booking.id, 'Merchant unavailable', 'INTERNAL')}
                      className="flex-1 md:flex-none px-6 py-3 bg-white border border-red-100 text-[#A20021] rounded-xl font-black text-[10px] uppercase tracking-widest"
                    >
                      Decline
                    </button>
                  </>
                )}
                {booking.status === 'CONFIRMED' && (
                  <>
                    <button 
                      onClick={async () => {
                        const url = await onComplete(booking.id, 'INTERNAL');
                        if (url) window.open(url, '_blank');
                      }}
                      className="flex-1 md:flex-none px-6 py-3 bg-[#7851A9] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#7851A9]/20"
                    >
                      Complete & Pay
                    </button>
                    <button 
                      onClick={() => onCancel(booking.id, 'Merchant cancellation', 'INTERNAL')}
                      className="flex-1 md:flex-none px-6 py-3 bg-white border border-red-100 text-[#A20021] rounded-xl font-black text-[10px] uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {booking.status === 'PAYMENT_PENDING' && (
                  <div className="px-6 py-3 bg-purple-50 text-purple-700 rounded-xl font-black text-[10px] uppercase tracking-widest border border-purple-100">
                    Waiting for Payment
                  </div>
                )}
                {booking.status === 'COMPLETED' && (
                  <div className="px-6 py-3 bg-blue-50 text-blue-700 rounded-xl font-black text-[10px] uppercase tracking-widest border border-blue-100">
                    Paid & Settled
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
