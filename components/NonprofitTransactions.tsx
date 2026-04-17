
import React, { useState } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { format } from 'date-fns';

const MOCK_TRANSACTIONS = Array.from({ length: 50 }).map((_, i) => ({
  id: `tx-${i}`,
  merchantName: ['Whole Foods', 'Patagonia', 'Local Coffee', 'Green Grocer', 'Tech Hub'][Math.floor(Math.random() * 5)],
  amount: Math.floor(Math.random() * 100) + 5,
  category: ['Groceries', 'Apparel', 'Dining', 'Technology', 'Services'][Math.floor(Math.random() * 5)],
  date: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  status: 'SETTLED'
}));

export const NonprofitTransactions: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  const filtered = MOCK_TRANSACTIONS.filter(tx => 
    tx.merchantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentItems = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-black uppercase tracking-tight">Transaction Feed</h3>
          <p className="text-slate-400 text-xs font-medium">Real-time contribution ledger</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search merchants..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3 bg-slate-50 border-none rounded-2xl text-xs font-medium focus:ring-2 focus:ring-[#7851A9] w-64"
            />
          </div>
          <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-black transition-all">
            <Filter size={20} />
          </button>
          <button className="p-3 bg-black text-white rounded-2xl hover:bg-[#7851A9] transition-all">
            <Download size={20} />
          </button>
        </div>
      </div>

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
                      {tx.merchantName[0]}
                    </div>
                    <span className="text-sm font-bold text-slate-900">{tx.merchantName}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-sm font-black text-emerald-600">+${tx.amount.toFixed(2)}</span>
                </td>
                <td className="px-8 py-6">
                  <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase rounded-full">
                    {tx.category}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <span className="text-xs font-medium text-slate-400">
                    {format(new Date(tx.date), 'MMM d, yyyy • HH:mm')}
                  </span>
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
          Showing <span className="text-black font-bold">{(page - 1) * itemsPerPage + 1}</span> to <span className="text-black font-bold">{Math.min(page * itemsPerPage, filtered.length)}</span> of <span className="text-black font-bold">{filtered.length}</span> results
        </p>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-black transition-all disabled:opacity-30"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button 
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-xl text-[10px] font-black transition-all ${page === i + 1 ? 'bg-black text-white' : 'bg-slate-50 text-slate-400 hover:text-black'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-black transition-all disabled:opacity-30"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
