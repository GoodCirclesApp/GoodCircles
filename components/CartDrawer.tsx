
import React, { useState } from 'react';
import { CartItem, Order, Nonprofit, User, FiscalPolicy, CommunityProject } from '../types';
import { calculateOrderTotals } from '../utils/financeEngine';
import { BrandSubmark } from './BrandAssets';

interface Props {
  isOpen: boolean; onClose: () => void;
  cart: CartItem[]; setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  paymentMethod: 'CASH' | 'CARD' | 'BALANCE'; setPaymentMethod: (method: 'CASH' | 'CARD' | 'BALANCE') => void;
  selectedNonprofit: Nonprofit; onCheckout: (order: Order) => void;
  currentUser: User | null;
  policy: FiscalPolicy;
  projects: CommunityProject[];
}

export const CartDrawer: React.FC<Props> = ({ 
  isOpen, onClose, cart, setCart, updateQuantity, removeFromCart, paymentMethod, setPaymentMethod, selectedNonprofit, onCheckout, currentUser, policy, projects
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [handshakeToken, setHandshakeToken] = useState<string | null>(null);
  const [isDiscountWaived, setIsDiscountWaived] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [appliedCredits, setAppliedCredits] = useState(0);

  const totals = calculateOrderTotals(
    cart, 
    paymentMethod, 
    policy, 
    isDiscountWaived, 
    currentUser?.discountMode || 'PRICE_REDUCTION',
    appliedCredits
  );

  const handleCheckoutClick = () => {
    const orderData: any = {
      id: `ord-${Date.now()}`, date: new Date().toISOString(), items: [...cart],
      ...totals, 
      selectedNonprofitId: selectedNonprofit.id, 
      neighborId: currentUser?.id || 'c1', 
      neighborName: currentUser?.name || 'Neighbor', 
      communityId: currentUser?.communityId || 'msa-la',
      isDiscountWaived,
      targetProjectId: isDiscountWaived ? selectedProjectId : undefined,
      appliedCredits,
      discountMode: currentUser?.discountMode || 'PRICE_REDUCTION'
    };

    if (paymentMethod === 'CASH') {
      const newToken = Math.random().toString(36).substr(2, 6).toUpperCase();
      setHandshakeToken(newToken);
      onCheckout({ ...orderData, paymentMethod: 'CASH', handshakeStatus: 'PENDING', impactToken: newToken });
    } else {
      setIsProcessing(true);
      setTimeout(() => {
        // Use the actual selected payment method (CARD or BALANCE)
        onCheckout({ ...orderData, paymentMethod: paymentMethod });
        setIsProcessing(false);
        setCart([]);
        onClose();
      }, 1500);
    }
  };

  if (!isOpen) return null;

    const isInsufficientBalance = paymentMethod === 'BALANCE' && (currentUser?.wallet?.balance || 0) < totals.totalPaid;

    return (
      <div className="fixed inset-0 z-[110] flex justify-end">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
        <div className="relative w-full sm:max-w-lg bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 border-l border-[#CA9CE1]/30">
          <div className="px-5 py-5 sm:px-10 sm:py-8 border-b border-[#CA9CE1]/20 flex items-center justify-between">
            <h2 className="text-xl sm:text-3xl font-black text-black tracking-tighter italic uppercase">Checkout.</h2>
            <button onClick={onClose} className="p-4 text-slate-300 hover:text-black rounded-2xl transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-10 sm:py-8 space-y-8">
            {handshakeToken ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-10 animate-in zoom-in">
                 <h3 className="text-4xl font-black italic tracking-tighter uppercase">Cash Handshake</h3>
                 <div className="p-10 bg-white border-4 border-black rounded-[4rem] shadow-2xl relative">
                    <div className="w-40 h-40 bg-slate-900 grid grid-cols-6 grid-rows-6 gap-1 p-2">
                       {Array.from({length: 36}).map((_, i) => (<div key={i} className={`rounded-[2px] ${Math.random() > 0.5 ? 'bg-white' : 'bg-transparent'}`}></div>))}
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-3 rounded-2xl"><BrandSubmark size={32} color="#000" showCrown={false} /></div>
                 </div>
                 <div className="bg-slate-50 px-5 py-4 sm:px-10 sm:py-6 rounded-[2.5rem] border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 font-accent">Show this to merchant</p>
                    <p className="text-4xl font-black tracking-[0.2em] text-[#7851A9] italic">{handshakeToken}</p>
                 </div>
                 {/* Nonprofit on Receipt */}
                 {selectedNonprofit && (
                   <div className="w-full bg-[#7851A9]/5 px-5 py-4 rounded-2xl border border-[#7851A9]/10">
                     <p className="text-[9px] font-black text-[#7851A9] uppercase tracking-widest mb-1">Your purchase supports</p>
                     <p className="text-sm font-black text-black">{selectedNonprofit.name}</p>
                     <p className="text-[10px] text-slate-500 italic mt-1">10% of merchant savings go to this cause</p>
                   </div>
                 )}

                 <button onClick={() => { setHandshakeToken(null); setCart([]); onClose(); }} className="w-full bg-black text-white py-6 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-xl">Done</button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.product.id} className="flex gap-4 items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <img src={item.product.imageUrl} className="w-16 h-16 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-black text-xs uppercase truncate">{item.product.name}</h4>
                          <button 
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-lg font-black italic tracking-tighter">${(item.product.price * (1 - policy.discountRate) * item.quantity).toFixed(2)}</p>
                          <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden">
                            <button 
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="px-3 py-1 hover:bg-slate-50 text-slate-400 font-black"
                            >
                              -
                            </button>
                            <input 
                              type="number"
                              min="0"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val)) updateQuantity(item.product.id, val);
                              }}
                              className="w-10 py-1 text-[10px] font-black border-x border-slate-200 text-center outline-none focus:bg-slate-50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button 
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="px-3 py-1 hover:bg-slate-50 text-slate-400 font-black"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Nonprofit Display in Checkout */}
                {selectedNonprofit && (
                  <div className="flex items-center gap-4 p-5 bg-[#7851A9]/5 rounded-[2rem] border border-[#7851A9]/10">
                    <div className="w-10 h-10 bg-[#7851A9] rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-black text-[#7851A9] uppercase tracking-widest">Supporting</p>
                      <p className="text-sm font-black text-black truncate">{selectedNonprofit.name}</p>
                      <p className="text-[10px] text-slate-500 italic">10% of merchant savings go to this cause</p>
                    </div>
                  </div>
                )}

                <div className="space-y-6 bg-[#7851A9]/5 p-6 rounded-[2.5rem] border border-[#7851A9]/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-tight text-[#7851A9]">Waive 10% Discount?</h4>
                      <p className="text-[10px] font-medium text-slate-500 italic">Contribute your savings to a community project.</p>
                    </div>
                    <button 
                      onClick={() => setIsDiscountWaived(!isDiscountWaived)}
                      className={`w-14 h-8 rounded-full transition-all relative ${isDiscountWaived ? 'bg-[#7851A9]' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${isDiscountWaived ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>

                  {isDiscountWaived && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select Community Initiative</label>
                      <select 
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        className="w-full bg-white border border-[#CA9CE1]/30 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-[#7851A9]/20"
                      >
                        <option value="">General Community Fund</option>
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {currentUser && (currentUser.platformCredits || 0) > 0 && (
                  <div className="space-y-4 bg-black text-white p-6 rounded-[2.5rem] shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BrandSubmark size={20} variant="WHITE" showCrown={false} />
                        <h4 className="text-sm font-black uppercase tracking-tight">Redeem Credits</h4>
                      </div>
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">${(currentUser.platformCredits || 0).toFixed(2)} Available</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/60">
                        <span>Amount to apply</span>
                        <span className="text-[#CA9CE1]">${appliedCredits.toFixed(2)}</span>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max={Math.min(currentUser.platformCredits || 0, totals.totalMsrp + totals.tax)}
                        step="0.01"
                        value={appliedCredits}
                        onChange={(e) => setAppliedCredits(parseFloat(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#CA9CE1]"
                      />
                    </div>
                    
                    <p className="text-[9px] font-medium text-white/40 italic">
                      Credits are applied to the subtotal before fees.
                    </p>
                  </div>
                )}

                <div className="space-y-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-4">Payment Method</p>
                  <div className="grid grid-cols-1 gap-4">
                    <PaymentCard 
                      active={paymentMethod === 'CASH'} 
                      onClick={() => setPaymentMethod('CASH')}
                      label="Cash In-Person" 
                      desc="Zero processing fees."
                      tag="0% Surcharge"
                      tagColor="bg-emerald-500"
                    />
                    <PaymentCard 
                      active={paymentMethod === 'BALANCE'} 
                      onClick={() => setPaymentMethod('BALANCE')}
                      label="Circle Account Balance" 
                      desc={`Use your internal wallet ($${(currentUser?.wallet?.balance || 0).toFixed(2)} available).`}
                      tag="0.5% Surcharge"
                      tagColor={isInsufficientBalance ? "bg-red-500" : "bg-[#C2A76F]"}
                    />
                    <PaymentCard 
                      active={paymentMethod === 'CARD'} 
                      onClick={() => setPaymentMethod('CARD')}
                      label="Debit/Credit Card" 
                      desc="Bank service costs are transferred to the neighbor total."
                      tag="+3.0% Surcharge"
                      tagColor="bg-[#A20021]"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
  
          {!handshakeToken && cart.length > 0 && (
            <div className="p-5 sm:p-10 bg-slate-50 border-t border-slate-100 space-y-4 sm:space-y-6 sticky bottom-0">
              <div className="space-y-2">
                 <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                    <span>Community Impact</span>
                    <span className="text-[#7851A9]">+${totals.accounting.donationAmount.toFixed(2)}</span>
                 </div>
                 {paymentMethod === 'CARD' && (
                   <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                      <span>Merchant Service Fee</span>
                      <span className="text-[#A20021]">+${totals.cardFee.toFixed(2)}</span>
                   </div>
                 )}
                 {paymentMethod === 'BALANCE' && (
                   <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                      <span>Internal Maintenance Fee</span>
                      <span className="text-[#C2A76F]">+${totals.internalFee.toFixed(2)}</span>
                   </div>
                 )}
                 {appliedCredits > 0 && (
                   <div className="flex justify-between text-xs font-bold text-[#CA9CE1] uppercase">
                      <span>Credits Applied</span>
                      <span>-${appliedCredits.toFixed(2)}</span>
                   </div>
                 )}
              </div>
              <div className="flex justify-between items-end">
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total to Pay</p>
                    <p className={`text-4xl font-black italic tracking-tighter ${isInsufficientBalance ? 'text-red-500' : ''}`}>${totals.totalPaid.toFixed(2)}</p>
                    {isInsufficientBalance && <p className="text-[8px] font-bold text-red-500 uppercase mt-1">Insufficient Funds</p>}
                 </div>
                 <button 
                   onClick={handleCheckoutClick}
                   disabled={isProcessing || isInsufficientBalance}
                   className="bg-black text-white px-6 py-4 sm:px-10 sm:py-5 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-[#7851A9] transition-all disabled:opacity-30"
                 >
                   {isProcessing ? 'Processing...' : isInsufficientBalance ? 'Insufficient Balance' : 'Place Order'}
                 </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
};

const PaymentCard = ({ active, onClick, label, desc, tag, tagColor }: any) => (
  <button 
    onClick={onClick}
    className={`p-6 rounded-3xl border-2 text-left transition-all relative overflow-hidden group ${active ? 'bg-white border-black shadow-xl ring-4 ring-black/5' : 'bg-slate-50 border-slate-100 hover:border-slate-200'}`}
  >
     <div className="flex justify-between items-start mb-2">
        <h4 className="font-black text-sm uppercase tracking-tight">{label}</h4>
        <span className={`px-2 py-1 rounded text-[8px] font-black text-white uppercase ${tagColor}`}>{tag}</span>
     </div>
     <p className="text-xs text-slate-500 font-medium leading-relaxed italic">{desc}</p>
     {active && <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-black rotate-45"></div>}
  </button>
);
