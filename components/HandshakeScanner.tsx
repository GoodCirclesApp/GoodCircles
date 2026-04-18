
import React, { useState, useEffect, useRef } from 'react';
import { BrandSubmark } from './BrandAssets';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Check, ChevronRight } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
}

interface Props {
  onVerify: (token: string, productServiceId?: string) => Promise<{ success: boolean; message: string; amount?: number }>;
  onCancel: () => void;
  products?: Product[];
}

type Step = 'SCAN' | 'SELECT_PRODUCT' | 'RESULT';

export const HandshakeScanner: React.FC<Props> = ({ onVerify, onCancel, products = [] }) => {
  const [step, setStep] = useState<Step>('SCAN');
  const [token, setToken] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; amount?: number } | null>(null);
  const [useOptical, setUseOptical] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const handleTokenSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (token.length < 6) return;
    if (products.length > 0) {
      setStep('SELECT_PRODUCT');
    } else {
      handleSettle();
    }
  };

  const handleSettle = async () => {
    setIsVerifying(true);
    const verification = await onVerify(token.toUpperCase(), selectedProduct || undefined);
    setResult(verification);
    setIsVerifying(false);
    setStep('RESULT');
  };

  useEffect(() => {
    if (useOptical) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );
      scannerRef.current.render((decodedText) => {
        setToken(decodedText.slice(0, 6).toUpperCase());
        setUseOptical(false);
        if (scannerRef.current) scannerRef.current.clear();
        if (products.length > 0) {
          setStep('SELECT_PRODUCT');
        } else {
          handleSettle();
        }
      }, (_error) => { /* ignore scanning errors */ });
    }
    return () => {
      if (scannerRef.current) scannerRef.current.clear();
    };
  }, [useOptical]);

  const reset = () => {
    setStep('SCAN');
    setResult(null);
    setToken('');
    setSelectedProduct('');
    setUseOptical(false);
  };

  return (
    <div className="bg-white rounded-[4rem] md:p-12 p-8 border border-[#7851A9]/20 shadow-2xl space-y-10 animate-in zoom-in duration-500 max-w-2xl mx-auto overflow-hidden relative">
      {isVerifying && (
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#7851A9] animate-[bounce_1.5s_infinite] shadow-[0_0_20px_#7851A9] z-50"></div>
      )}

      <div className="text-center space-y-4">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-black text-[#C2A76F] rounded-3xl flex items-center justify-center mx-auto shadow-xl">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        </div>
        <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">Optical Settlement Node</h3>
        <p className="text-slate-400 text-xs font-medium px-6 md:px-10 leading-relaxed italic">
          {step === 'SCAN' && 'Scan or enter the customer\'s identity QR code from their Good Circles app.'}
          {step === 'SELECT_PRODUCT' && 'Select the item the customer is purchasing to complete settlement.'}
          {step === 'RESULT' && 'Settlement complete.'}
        </p>
      </div>

      {/* Step indicator when products are available */}
      {products.length > 0 && step !== 'RESULT' && (
        <div className="flex items-center justify-center gap-3">
          {(['SCAN', 'SELECT_PRODUCT'] as Step[]).map((s, i) => (
            <React.Fragment key={s}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${step === s ? 'bg-[#7851A9] text-white' : step === 'SELECT_PRODUCT' && i === 0 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {step === 'SELECT_PRODUCT' && i === 0 ? <Check size={12} /> : i + 1}
              </div>
              {i === 0 && <ChevronRight size={14} className="text-slate-300" />}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Step 1: Scan / Enter Token */}
      {step === 'SCAN' && (
        <div className="space-y-10">
          {useOptical ? (
            <div id="qr-reader" className="w-full bg-slate-50 rounded-[3rem] overflow-hidden border-2 border-slate-200"></div>
          ) : (
            <div className="aspect-square w-full max-w-[280px] mx-auto relative group cursor-pointer" onClick={() => setUseOptical(true)}>
              <div className="absolute inset-0 bg-slate-100 rounded-[3rem] overflow-hidden border-2 border-slate-200">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#7851A9_1px,transparent_1px)] [background-size:20px_20px]"></div>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="p-6 bg-white rounded-full shadow-2xl text-[#7851A9] animate-pulse">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <p className="text-[10px] font-black uppercase text-[#7851A9] tracking-widest">Activate Secure Lens</p>
              </div>
              <div className="absolute top-0 left-0 w-14 h-14 border-t-8 border-l-8 border-black rounded-tl-[3rem] group-hover:scale-110 transition-transform"></div>
              <div className="absolute top-0 right-0 w-14 h-14 border-t-8 border-r-8 border-black rounded-tr-[3rem] group-hover:scale-110 transition-transform"></div>
              <div className="absolute bottom-0 left-0 w-14 h-14 border-b-8 border-l-8 border-black rounded-bl-[3rem] group-hover:scale-110 transition-transform"></div>
              <div className="absolute bottom-0 right-0 w-14 h-14 border-b-8 border-r-8 border-black rounded-br-[3rem] group-hover:scale-110 transition-transform"></div>
            </div>
          )}

          <form onSubmit={handleTokenSubmit} className="space-y-8">
            <div className="relative">
              <input
                type="text"
                maxLength={6}
                value={token}
                onChange={(e) => setToken(e.target.value.toUpperCase())}
                placeholder="------"
                className="w-full px-4 py-8 bg-slate-50 border-4 border-slate-100 rounded-[2.5rem] text-5xl font-black tracking-[0.4em] outline-none focus:border-[#7851A9] focus:bg-white transition-all text-center placeholder:text-slate-200 shadow-inner"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button type="button" onClick={onCancel} className="flex-1 py-5 rounded-3xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-all bg-slate-50">
                Dismiss
              </button>
              <button
                type="submit"
                disabled={token.length < 6}
                className="flex-[2] bg-black text-white py-5 rounded-3xl text-[11px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all shadow-xl disabled:opacity-50 active:scale-95"
              >
                {products.length > 0 ? 'Next: Select Item' : 'Authorize Settlement'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 2: Select Product */}
      {step === 'SELECT_PRODUCT' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
            {products.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedProduct(p.id)}
                className={`p-4 rounded-2xl text-left border-2 transition-all ${selectedProduct === p.id ? 'border-[#7851A9] bg-[#7851A9]/5 shadow-md' : 'border-slate-100 hover:border-[#CA9CE1]/40 bg-slate-50'}`}
              >
                <p className="text-xs font-black uppercase tracking-tight text-slate-700 truncate">{p.name}</p>
                <p className="text-2xl font-black italic text-[#7851A9] mt-1">${Number(p.price).toFixed(2)}</p>
              </button>
            ))}
          </div>
          <div className="flex gap-4">
            <button onClick={() => setStep('SCAN')} className="flex-1 py-5 rounded-3xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-black bg-slate-50 transition-all">
              Back
            </button>
            <button
              onClick={handleSettle}
              disabled={!selectedProduct || isVerifying}
              className="flex-[2] bg-black text-white py-5 rounded-3xl text-[11px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all shadow-xl disabled:opacity-50 active:scale-95"
            >
              {isVerifying ? 'Verifying Hash...' : 'Authorize Settlement'}
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {step === 'RESULT' && result && (
        <div className="space-y-8 animate-in fade-in zoom-in duration-500">
          <div className={`p-10 rounded-[3rem] text-center space-y-6 ${result.success ? 'bg-emerald-50 border-2 border-emerald-100 shadow-xl' : 'bg-red-50 border-2 border-red-100'}`}>
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-2xl ${result.success ? 'bg-emerald-500' : 'bg-red-500'} text-white`}>
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d={result.success ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
              </svg>
            </div>
            <div>
              <h4 className={`text-4xl font-black italic uppercase tracking-tighter ${result.success ? 'text-emerald-600' : 'text-red-600'}`}>
                {result.success ? 'Settled' : 'Failed'}
              </h4>
              <p className="text-sm font-bold text-slate-500 mt-2 px-6 italic">"{result.message}"</p>
            </div>
            {result.amount && (
              <div className="pt-8 border-t border-black/5 flex flex-col items-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Funds Disbursed to Community</p>
                <div className="flex items-baseline gap-1 bg-white px-8 py-3 rounded-2xl shadow-sm border border-slate-100">
                  <span className="text-xl font-black text-emerald-600">$</span>
                  <p className="text-4xl font-black text-black italic tracking-tighter">{result.amount.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>
          <button onClick={reset} className="w-full bg-black text-white py-6 rounded-3xl text-[11px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all shadow-2xl active:scale-95">
            Ready for Next Customer
          </button>
        </div>
      )}

      <div className="flex items-center justify-center gap-4 opacity-40 pt-4 border-t border-slate-50">
        <BrandSubmark size={24} color="#000" showCrown={false} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Optical Settlement Hub v10.1</p>
      </div>
    </div>
  );
};
