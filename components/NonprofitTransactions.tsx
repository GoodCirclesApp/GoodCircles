import React, { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { format } from 'date-fns';
import { nonprofitService } from '../services/nonprofitService';

interface Txn {
  id: string;
  merchantName: string;
  amount: number;
  category: string;
  date: string;
  status: string;
}

export const NonprofitTransactions: React.FC = () => {
  const [txns, setTxns] = useState<Txn[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    nonprofitService
      .getTransactions(1, 50)
      .then((d: any) => setTxns(Array.isArray(d) ? d : d?.items ?? []))
      .catch(() => setTxns([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = txns.filter(
    (tx) =>
      (tx.merchantName ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.category ?? '').toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const currentItems = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-black uppercase tracking-tight">Contribution Feed</h3>
          <p className="text-slate-400 text-xs font-medium">Every purchase that funded your organization</p>
        </div>
        {txns.length > 0 && (
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search merchants..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="pl-12 pr-6 py-3 bg-slate-50 border-none rounded-2xl text-xs font-medium focus:ring-2 focus:ring-[#7851A9] w-64"
              />
            </div>
            <button className="p-3 bg-black text-white rounded-2xl hover:bg-[#7851A9] transition-all" aria-label="Export">
              <Download size={20} />
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs font-black uppercase tracking-widest">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 px-8 text-center">
          <p className="text-[#7851A9] font-black uppercase tracking-widest">No contributions yet</p>
          <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
            Your ledger populates the moment a neighbor's local purchase elects your organization. Every row here will be a
            real, settled contribution.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Merchant</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentItems.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] font-black uppercase">
                          {(tx.merchantName ?? '?')[0]}
                        </div>
                        <span className="text-sm font-bold text-slate-900">{tx.merchantName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-emerald-600">+${Number(tx.amount).toFixed(2)}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase rounded-full">{tx.category}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-medium text-slate-400">{format(new Date(tx.date), 'MMM d, yyyy • HH:mm')}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{tx.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-8 border-t border-slate-50 flex items-center justify-between">
            <p className="text-xs text-slate-400 font-medium">
              Showing <span className="text-black font-bold">{(page - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="text-black font-bold">{Math.min(page * itemsPerPage, filtered.length)}</span> of{' '}
              <span className="text-black font-bold">{filtered.length}</span> results
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-black transition-all disabled:opacity-30">
                <ChevronLeft size={20} />
              </button>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Page {page} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-black transition-all disabled:opacity-30">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
