
import React from 'react';
import { Order, Nonprofit, User, Booking } from '../types';
import { ReferralCenter } from '../components/ReferralCenter';
import { useGoodCirclesStore } from '../hooks/useGoodCirclesStore';
import { format, parseISO } from 'date-fns';
import { showToast } from '../hooks/toast';

interface Props {
  orders: Order[];
  bookings: Booking[];
  selectedNonprofit: Nonprofit;
  onInvoiceClick: (order: Order) => void;
  onCancelBooking: (id: string, reason: string, paymentMethod: string) => void;
  currentUser?: User | null;
  onUpdateUser?: (user: User) => void;
  onNavigate?: (view: string) => void;
}

const MILESTONES = [
  { count: 1, label: 'First Settlement', emoji: '✦', color: 'bg-[#C2A76F] text-black' },
  { count: 5, label: 'Community Regular', emoji: '⬡', color: 'bg-[#7851A9] text-white' },
  { count: 10, label: 'Circle Advocate', emoji: '◆', color: 'bg-black text-white' },
  { count: 25, label: 'Impact Leader', emoji: '★', color: 'bg-emerald-500 text-white' },
];

function getMilestoneBadge(orderIndex: number, totalOrders: number) {
  const orderNumber = totalOrders - orderIndex;
  return MILESTONES.find(m => m.count === orderNumber) ?? null;
}

function getNextMilestoneMeta(totalOrders: number) {
  const next = MILESTONES.find(m => m.count > totalOrders);
  if (!next) return null;
  return { label: next.label, remaining: next.count - totalOrders, target: next.count };
}

export const TimelineView: React.FC<Props> = ({
  orders,
  bookings,
  selectedNonprofit,
  onInvoiceClick,
  onCancelBooking,
  currentUser,
  onUpdateUser,
  onNavigate,
}) => {
  const { refundToWallet } = useGoodCirclesStore();

  const handleReferral = (bizName: string) => {
    if (currentUser && onUpdateUser) {
      onUpdateUser({
        ...currentUser,
        referralCount: (currentUser.referralCount || 0) + 1,
        impactPoints: (currentUser.impactPoints || 0) + 25,
      });
    }
  };

  const handleRefundToCircle = async (order: Order) => {
    const refundAmount = order.accounting.merchantNet + order.accounting.platformFee;
    const donationAmount = order.accounting.donationAmount;
    if (confirm(`Refund $${refundAmount.toFixed(2)} to your Circle Account?\n\nNote: The $${donationAmount.toFixed(2)} donation already disbursed to your elected nonprofit is non-refundable. This is by design — community impact is permanent.`)) {
      await refundToWallet(refundAmount, `Refund Recapture: GC-${order.id.slice(-6)}`);
      showToast(`$${refundAmount.toFixed(2)} recaptured to your Circle Wallet. Donation of $${donationAmount.toFixed(2)} retained by nonprofit.`, 'success');
    }
  };

  const nextMilestone = getNextMilestoneMeta(orders.length);
  const totalDonated = orders.reduce((sum, o) => sum + (o.accounting?.donationAmount ?? 0), 0);

  return (
    <div className="space-y-24 animate-in fade-in duration-700">
      <header className="max-w-3xl">
        <h2 className="text-7xl font-black text-black tracking-tighter italic uppercase leading-[0.9]">My Impact Journey.</h2>
        <p className="text-slate-500 text-2xl font-medium mt-8">Verifiable proof of how your community purchases changed lives.</p>
      </header>

      {/* Progress toward next milestone */}
      {nextMilestone && orders.length > 0 && (
        <div className="bg-white border border-[#CA9CE1]/20 rounded-[3rem] p-8 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Milestone</p>
              <p className="text-xl font-black italic uppercase tracking-tighter">{nextMilestone.label}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{nextMilestone.remaining} order{nextMilestone.remaining !== 1 ? 's' : ''} away</p>
              <p className="text-xl font-black text-[#7851A9]">${totalDonated.toFixed(2)} donated</p>
            </div>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#7851A9] transition-all duration-1000 ease-out rounded-full"
              style={{ width: `${(orders.length / nextMilestone.target) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 font-medium">{orders.length} of {nextMilestone.target} settlements</p>
        </div>
      )}

      {currentUser && <ReferralCenter user={currentUser} onReferralSubmit={handleReferral} />}

      {/* Bookings */}
      <section className="space-y-12">
        <h3 className="text-3xl font-black italic uppercase tracking-tighter border-b border-slate-100 pb-6">My Bookings</h3>
        {bookings.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[4rem] space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <p className="text-slate-400 font-bold italic">No bookings scheduled yet.</p>
            <p className="text-slate-300 text-sm font-medium">Browse services in the marketplace to book your first appointment.</p>
            {onNavigate && (
              <button
                onClick={() => onNavigate('MAIN')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all mt-2"
              >
                Browse Marketplace →
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {bookings.map(booking => (
              <div key={booking.id} className="p-10 bg-white rounded-[3.5rem] border border-[#CA9CE1]/20 shadow-xl group hover:shadow-2xl transition-all relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${
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
                    <h4 className="text-2xl font-black italic tracking-tighter uppercase">{booking.listingName}</h4>
                  </div>
                  {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to cancel this booking? A late cancellation fee may apply if cancelled within 24 hours.')) {
                          onCancelBooking(booking.id, 'User cancellation', 'INTERNAL');
                        }
                      }}
                      className="p-4 border border-red-100 text-[#A20021] rounded-2xl hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
                {booking.status === 'COMPLETED' && booking.transactionId && (
                  <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Completed</p>
                    <span className="text-[10px] font-black text-[#7851A9] uppercase tracking-widest">Transaction: {booking.transactionId.slice(-8)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Orders — timeline thread */}
      <section className="space-y-12">
        <h3 className="text-3xl font-black italic uppercase tracking-tighter border-b border-slate-100 pb-6">Recent Settlements</h3>
        {orders.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[4rem] space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            </div>
            <p className="text-slate-400 font-bold italic">No settlements recorded yet.</p>
            <p className="text-slate-300 text-sm font-medium">Every purchase you make builds your impact record and funds your elected nonprofit.</p>
            {onNavigate && (
              <button
                onClick={() => onNavigate('MAIN')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#7851A9] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all mt-2"
              >
                Start Your Journey →
              </button>
            )}
          </div>
        ) : (
          <div className="relative">
            {/* Vertical timeline thread */}
            <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gradient-to-b from-[#7851A9] via-[#CA9CE1]/40 to-transparent hidden md:block" />

            <div className="space-y-8">
              {orders.map((order, index) => {
                const badge = getMilestoneBadge(index, orders.length);
                return (
                  <div key={order.id} className="md:pl-16 relative">
                    {/* Timeline dot */}
                    <div className="absolute left-3.5 top-10 w-5 h-5 rounded-full border-2 border-[#7851A9] bg-white hidden md:flex items-center justify-center z-10">
                      <div className="w-2 h-2 rounded-full bg-[#7851A9]" />
                    </div>

                    {/* Milestone badge above card */}
                    {badge && (
                      <div className="mb-3 flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${badge.color}`}>
                          {badge.emoji} {badge.label}
                        </span>
                      </div>
                    )}

                    <div className="p-10 bg-white rounded-[3.5rem] border border-[#CA9CE1]/20 shadow-xl group hover:shadow-2xl transition-all relative overflow-hidden">
                       <div className="flex justify-between items-start mb-8 relative z-10">
                          <div>
                            <p className="text-[10px] font-black text-[#7851A9] uppercase tracking-widest mb-1 font-accent">{new Date(order.date).toLocaleDateString()}</p>
                            <h4 className="text-2xl font-black italic tracking-tighter uppercase">Order Settlement</h4>
                            <div className="flex gap-2 flex-wrap mt-2">
                              {order.paymentMethod === 'CASH' && order.handshakeStatus === 'PENDING' && (
                                <span className="px-3 py-1 bg-amber-50 text-amber-500 rounded-lg text-[10px] font-black uppercase tracking-widest">Handshake Pending</span>
                              )}
                              {order.paymentMethod === 'BALANCE' && (
                                <span className="px-3 py-1 bg-[#C2A76F]/10 text-[#C2A76F] rounded-lg text-[10px] font-black uppercase tracking-widest">Circle Account Payment</span>
                              )}
                              {order.accounting.feesSaved > 0 && (
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-500 rounded-lg text-[10px] font-black uppercase tracking-widest">Wealth Saved: +${order.accounting.feesSaved.toFixed(2)}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                             <button onClick={() => handleRefundToCircle(order)} className="p-4 border border-red-100 text-[#A20021] rounded-2xl hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100" title="Refund to Circle">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3" /></svg>
                             </button>
                             {order.handshakeStatus !== 'PENDING' && (
                               <button onClick={() => onInvoiceClick(order)} className="bg-black text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all shadow-lg">Digital Invoice</button>
                             )}
                          </div>
                       </div>
                       <div className="flex gap-4 mb-8 overflow-x-auto scrollbar-hide pb-2 relative z-10">
                          {order.items.map((item, idx) => (
                            <img key={idx} src={item.product.imageUrl} className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-sm" />
                          ))}
                       </div>
                       <div className="flex items-center justify-between pt-6 border-t border-slate-50 relative z-10">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Community Impact</p>
                            <p className={`text-2xl font-black ${order.handshakeStatus === 'PENDING' ? 'text-slate-300' : 'text-[#7851A9]'} italic tracking-tighter`}>+${order.accounting.donationAmount.toFixed(2)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Settled Amount</p>
                            <p className="text-2xl font-black text-black italic tracking-tighter">${order.totalPaid.toFixed(2)}</p>
                          </div>
                       </div>
                       <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-[#CA9CE1]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Community Outcomes */}
      <section className="space-y-12">
        <h3 className="text-3xl font-black italic uppercase tracking-tighter border-b border-slate-100 pb-6">Community Outcomes</h3>
        {(!selectedNonprofit.impactStories || selectedNonprofit.impactStories.length === 0) ? (
          <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[4rem] space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </div>
            <p className="text-slate-400 font-bold italic">Impact stories coming soon.</p>
            <p className="text-slate-300 text-sm font-medium">Your elected nonprofit will share updates as funding milestones are reached.</p>
            {onNavigate && (
              <button
                onClick={() => onNavigate('NONPROFIT_SELECTION')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] hover:text-white transition-all mt-2"
              >
                Choose a Nonprofit →
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            {selectedNonprofit.impactStories.map(story => (
              <div key={story.id} className="flex flex-col xl:flex-row gap-10 bg-white p-10 rounded-[4rem] border border-[#CA9CE1]/20 shadow-xl relative overflow-hidden group">
                <div className="xl:w-1/3 aspect-video rounded-[3rem] overflow-hidden shadow-2xl"><img src={story.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000" /></div>
                <div className="flex-1 space-y-4">
                  <p className="text-[10px] font-black text-[#7851A9] uppercase tracking-widest">{new Date(story.date).toLocaleDateString()}</p>
                  <h3 className="text-4xl font-black italic uppercase tracking-tighter">{story.title}</h3>
                  <p className="text-xl text-slate-500 font-medium leading-relaxed italic">"{story.description}"</p>
                  <div className="pt-6 flex items-center gap-4 text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em] font-accent">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                    </div>
                    Verified Settlement Node Contribution
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
