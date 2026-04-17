
import React from 'react';
import { Order, UserRole } from '../types';

interface Props {
  orders: Order[];
  role: UserRole;
}

export const StatementLedger: React.FC<Props> = ({ orders, role }) => {
  return (
    <div className="bg-white rounded-[3rem] border border-[#CA9CE1]/20 overflow-hidden shadow-sm animate-in fade-in duration-500">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-8 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Date</th>
              <th className="p-8 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Reference</th>
              <th className="p-8 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Gross (10% Off)</th>
              {role === 'MERCHANT' && (
                <>
                  <th className="p-8 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">COGS</th>
                  <th className="p-8 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Platform (1%)</th>
                  <th className="p-8 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] text-[#C2A76F]">Internal (0.5%)</th>
                </>
              )}
              <th className="p-8 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] text-[#7851A9]">
                {role === 'MERCHANT' ? 'Community (10%)' : 'Revenue Generated'}
              </th>
              <th className="p-8 text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em]">Wealth Saved</th>
              <th className="p-8 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] text-right">Net Settlement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={role === 'MERCHANT' ? 8 : 5} className="p-20 text-center text-slate-300 font-bold italic uppercase tracking-widest text-xs">
                  No transaction history recorded for this period.
                </td>
              </tr>
            ) : (
              orders.map(o => (
                <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-8 text-xs font-bold text-slate-500">{new Date(o.date).toLocaleDateString()}</td>
                  <td className="p-8 text-[10px] font-black text-black tracking-widest">#{o.id?.slice(-6).toUpperCase() || 'N/A'}</td>
                  <td className="p-8 text-sm font-black text-slate-900">
                    ${o.subtotal.toFixed(2)}
                    {o.isDiscountWaived && (
                      <span className="block text-[8px] text-emerald-500 uppercase font-black tracking-widest mt-1">Discount Waived</span>
                    )}
                  </td>
                  
                  {role === 'MERCHANT' && (
                    <>
                      <td className="p-8 text-sm font-bold text-slate-400">-${o.accounting.totalCogs.toFixed(2)}</td>
                      <td className="p-8 text-sm font-bold text-slate-400">-${o.accounting.platformFee.toFixed(2)}</td>
                      <td className="p-8 text-sm font-bold text-[#C2A76F]">-${(o.internalFee || 0).toFixed(2)}</td>
                    </>
                  )}
                  
                  <td className="p-8 text-sm font-black text-[#7851A9]">
                    {role === 'MERCHANT' ? '-' : '+'}${o.accounting.donationAmount.toFixed(2)}
                  </td>
                  
                  <td className="p-8">
                    <span className="text-xs font-black text-emerald-500 italic">+${o.accounting.feesSaved.toFixed(2)}</span>
                  </td>

                  <td className="p-8 text-right">
                    <span className={`text-lg font-black italic tracking-tighter ${role === 'MERCHANT' ? 'text-black' : 'text-emerald-500'}`}>
                      ${role === 'MERCHANT' 
                        ? o.accounting.merchantNet.toFixed(2) 
                        : o.accounting.donationAmount.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
