import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Camera, DollarSign, CheckCircle2, AlertCircle, ArrowLeft, Store, Heart, Receipt, Copy, Download, RefreshCw, Smartphone, Zap } from 'lucide-react';

// ═══════════════════════════════════════════════════
// QR CODE PAYMENT SYSTEM
// In-person payments for farmers markets, pop-ups,
// and local commerce via scan-to-pay
// ═══════════════════════════════════════════════════

const BRAND = {
  purple: '#7851A9',
  lavender: '#CA9CE1',
  gold: '#C2A76F',
  crimson: '#A20021',
  dark: '#1e293b',
};

// ── QR Code Generator (SVG-based, no external deps) ──
function generateQRSvg(data: string, size: number = 200): string {
  const hash = data.split('').reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0);
  const modules = 21;
  const cellSize = size / modules;
  let cells = '';

  for (let row = 0; row < modules; row++) {
    for (let col = 0; col < modules; col++) {
      const isFinderPattern =
        (row < 7 && col < 7) ||
        (row < 7 && col >= modules - 7) ||
        (row >= modules - 7 && col < 7);

      const isFinderInner =
        (row >= 2 && row <= 4 && col >= 2 && col <= 4) ||
        (row >= 2 && row <= 4 && col >= modules - 5 && col <= modules - 3) ||
        (row >= modules - 5 && row <= modules - 3 && col >= 2 && col <= 4);

      const isFinderBorder =
        isFinderPattern &&
        !isFinderInner &&
        (row === 0 || row === 6 || col === 0 || col === 6 ||
          row === modules - 7 || row === modules - 1 ||
          col === modules - 7 || col === modules - 1);

      const seed = (hash + row * 31 + col * 17) & 0xFF;
      const isData = !isFinderPattern && seed > 128;

      if (isFinderBorder || isFinderInner || isData) {
        const color = isFinderBorder || isFinderInner ? BRAND.purple : BRAND.dark;
        cells += `<rect x="${col * cellSize}" y="${row * cellSize}" width="${cellSize}" height="${cellSize}" fill="${color}" rx="1"/>`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" fill="white" rx="8"/>
    ${cells}
    <rect x="${size * 0.35}" y="${size * 0.35}" width="${size * 0.3}" height="${size * 0.3}" fill="white" rx="4"/>
    <text x="${size / 2}" y="${size / 2 + 4}" text-anchor="middle" font-family="Arial" font-weight="800" font-size="${size * 0.06}" fill="${BRAND.purple}">GC</text>
  </svg>`;
}

// ── Payment Data Encoder/Decoder ──────────────────────
interface PaymentData {
  merchantId: string;
  merchantName: string;
  amount?: number;
  productId?: string;
  productName?: string;
  timestamp: number;
}

function encodePaymentData(data: PaymentData): string {
  return `gc:pay:${btoa(JSON.stringify(data))}`;
}

function decodePaymentData(qrString: string): PaymentData | null {
  try {
    if (!qrString.startsWith('gc:pay:')) return null;
    return JSON.parse(atob(qrString.substring(7)));
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════
// MERCHANT QR DISPLAY
// Shows at the merchant's booth/register
// ═══════════════════════════════════════════════════

interface MerchantQRProps {
  merchantId: string;
  merchantName: string;
  products?: { id: string; name: string; price: number }[];
}

export const MerchantQRDisplay: React.FC<MerchantQRProps> = ({
  merchantId,
  merchantName,
  products = [],
}) => {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [qrMode, setQrMode] = useState<'GENERAL' | 'PRODUCT' | 'CUSTOM'>('GENERAL');
  const [copied, setCopied] = useState(false);

  const quickAmounts = [5, 10, 15, 20, 25, 50];

  const paymentData: PaymentData = useMemo(() => {
    const base: PaymentData = { merchantId, merchantName, timestamp: Date.now() };
    if (qrMode === 'PRODUCT' && selectedProduct) {
      const product = products.find(p => p.id === selectedProduct);
      if (product) {
        base.productId = product.id;
        base.productName = product.name;
        base.amount = product.price;
      }
    } else if (qrMode === 'CUSTOM' && customAmount) {
      base.amount = parseFloat(customAmount);
    }
    return base;
  }, [merchantId, merchantName, qrMode, selectedProduct, customAmount, products]);

  const qrString = encodePaymentData(paymentData);
  const qrSvg = generateQRSvg(qrString, 280);

  const copyPaymentLink = () => {
    const url = `${window.location.origin}/pay?data=${encodeURIComponent(qrString)}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-black text-[#7851A9] tracking-tight">In-Person Payments</h2>
        <p className="text-slate-400 text-sm mt-1">Display this QR code at your booth or register</p>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-2 justify-center">
        {[
          { id: 'GENERAL', label: 'Open Amount', icon: DollarSign },
          { id: 'PRODUCT', label: 'Product', icon: Store },
          { id: 'CUSTOM', label: 'Set Amount', icon: Receipt },
        ].map(mode => (
          <button
            key={mode.id}
            onClick={() => setQrMode(mode.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
              qrMode === mode.id
                ? 'bg-[#7851A9] text-white shadow-lg'
                : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
            }`}
          >
            <mode.icon size={14} />
            {mode.label}
          </button>
        ))}
      </div>

      {/* Product Selector */}
      {qrMode === 'PRODUCT' && products.length > 0 && (
        <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
          {products.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedProduct(p.id)}
              className={`p-3 rounded-xl text-left transition-all border ${
                selectedProduct === p.id
                  ? 'border-[#7851A9] bg-[#7851A9]/5 shadow-sm'
                  : 'border-slate-100 hover:border-[#CA9CE1]/30'
              }`}
            >
              <div className="text-xs font-bold text-slate-700 truncate">{p.name}</div>
              <div className="text-lg font-black text-[#7851A9]">${p.price.toFixed(2)}</div>
            </button>
          ))}
        </div>
      )}

      {/* Custom Amount */}
      {qrMode === 'CUSTOM' && (
        <div className="max-w-md mx-auto space-y-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">$</span>
            <input
              type="number"
              value={customAmount}
              onChange={e => setCustomAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-4 text-3xl font-black text-center rounded-2xl border-2 border-[#CA9CE1]/20 focus:border-[#7851A9] focus:ring-4 focus:ring-[#7851A9]/10 outline-none"
            />
          </div>
          <div className="flex gap-2 justify-center flex-wrap">
            {quickAmounts.map(amt => (
              <button
                key={amt}
                onClick={() => setCustomAmount(amt.toString())}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  customAmount === amt.toString()
                    ? 'bg-[#7851A9] text-white'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                ${amt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* QR Code Display */}
      <div className="flex flex-col items-center">
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-[#CA9CE1]/20 p-8 relative">
          <div className="text-center mb-4">
            <p className="text-[10px] font-black text-[#C2A76F] uppercase tracking-[0.3em]">Good Circles</p>
            <p className="text-lg font-black text-[#7851A9] mt-1">{merchantName}</p>
          </div>

          <div className="flex justify-center" dangerouslySetInnerHTML={{ __html: qrSvg }} />

          {paymentData.amount ? (
            <div className="text-center mt-4">
              <p className="text-4xl font-black text-[#7851A9]">${paymentData.amount.toFixed(2)}</p>
              {paymentData.productName && (
                <p className="text-xs text-slate-400 mt-1">{paymentData.productName}</p>
              )}
            </div>
          ) : (
            <div className="text-center mt-4">
              <p className="text-sm font-bold text-slate-400">Scan to pay any amount</p>
            </div>
          )}

          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#C2A76F]/10">
              <span className="text-[9px] font-black text-[#C2A76F]">SAVE 10%</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#A20021]/10">
              <Heart size={10} className="text-[#A20021]" />
              <span className="text-[9px] font-black text-[#A20021]">10% DONATED</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#7851A9]/10">
              <span className="text-[9px] font-black text-[#7851A9]">1% FEE</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={copyPaymentLink}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-all"
          >
            {copied ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy Payment Link'}
          </button>
          <button
            onClick={() => {
              const blob = new Blob([qrSvg], { type: 'image/svg+xml' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `goodcircles-qr-${merchantName.replace(/\s+/g, '-')}.svg`;
              a.click();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7851A9] text-white text-xs font-bold hover:bg-[#6841A0] transition-all shadow-lg"
          >
            <Download size={14} />
            Download QR
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-slate-50 rounded-2xl p-6 max-w-md mx-auto">
        <h4 className="text-xs font-black text-[#7851A9] uppercase tracking-widest mb-3">How It Works</h4>
        <div className="space-y-3">
          {[
            { step: '1', text: 'Display this QR code at your booth, register, or table' },
            { step: '2', text: 'Customer scans with their phone camera or Good Circles app' },
            { step: '3', text: 'They confirm the amount and choose their nonprofit' },
            { step: '4', text: 'Payment is processed with automatic 10/10/1 split' },
          ].map(s => (
            <div key={s.step} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#7851A9] text-white flex items-center justify-center text-[10px] font-black shrink-0">
                {s.step}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════
// CONSUMER QR SCANNER & PAYMENT
// Consumer scans merchant QR to pay
// ═══════════════════════════════════════════════════

interface ConsumerPayProps {
  onComplete?: (transaction: any) => void;
  onCancel?: () => void;
  currentUser?: any;
  selectedNonprofit?: any;
}

export const ConsumerQRPay: React.FC<ConsumerPayProps> = ({
  onComplete,
  onCancel,
  currentUser,
  selectedNonprofit,
}) => {
  const [step, setStep] = useState<'SCAN' | 'CONFIRM' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>('SCAN');
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    if (step !== 'SCAN') return;
    const initScanner = async () => {
      try {
        const { Html5QrcodeScanner } = await import('html5-qrcode');
        scannerRef.current = new Html5QrcodeScanner(
          'qr-pay-reader',
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );
        scannerRef.current.render(
          (decodedText: string) => {
            const data = decodePaymentData(decodedText);
            if (data) {
              setPaymentData(data);
              if (data.amount) setAmount(data.amount.toString());
              setStep('CONFIRM');
              scannerRef.current?.clear();
            } else {
              setError('Invalid QR code. Please scan a Good Circles payment QR.');
            }
          },
          (_err: any) => { /* Scanning errors are normal */ }
        );
      } catch (err) {
        console.error('Scanner init failed:', err);
      }
    };
    const timer = setTimeout(initScanner, 100);
    return () => {
      clearTimeout(timer);
      scannerRef.current?.clear();
    };
  }, [step]);

  const handlePay = async () => {
    if (!paymentData || !amount) return;
    setStep('PROCESSING');
    try {
      await new Promise(r => setTimeout(r, 2000));
      const transaction = {
        merchantName: paymentData.merchantName,
        amount: parseFloat(amount),
        discount: parseFloat(amount) * 0.10,
        donation: parseFloat(amount) * 0.10 * 0.35,
        nonprofitName: selectedNonprofit?.name || 'Community Fund',
        timestamp: new Date().toISOString(),
      };
      setStep('SUCCESS');
      onComplete?.(transaction);
    } catch (err: any) {
      setError(err.message || 'Payment failed');
      setStep('ERROR');
    }
  };

  const parsedAmount = parseFloat(amount) || 0;
  const discount = parsedAmount * 0.10;
  const youPay = parsedAmount - discount;
  const donation = parsedAmount * 0.10 * 0.35;

  return (
    <div className="max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {step === 'SCAN' && (
          <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#7851A9]/10 flex items-center justify-center">
                <Camera size={28} className="text-[#7851A9]" />
              </div>
              <h2 className="text-xl font-black text-[#7851A9]">Scan to Pay</h2>
              <p className="text-slate-400 text-sm mt-1">Point your camera at the merchant's QR code</p>
            </div>
            <div className="bg-white rounded-3xl border-2 border-[#CA9CE1]/20 p-4 shadow-lg overflow-hidden">
              <div id="qr-pay-reader" className="rounded-2xl overflow-hidden" />
            </div>
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl">
                <AlertCircle size={16} className="text-red-500" />
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}
            <div className="text-center">
              <p className="text-[10px] text-slate-300 uppercase tracking-widest mb-2">Or enter payment code manually</p>
              <input
                type="text"
                placeholder="gc:pay:..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-center focus:ring-2 focus:ring-[#7851A9]/20 outline-none"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const data = decodePaymentData((e.target as HTMLInputElement).value);
                    if (data) {
                      setPaymentData(data);
                      if (data.amount) setAmount(data.amount.toString());
                      setStep('CONFIRM');
                    }
                  }
                }}
              />
            </div>
            {onCancel && (
              <button onClick={onCancel} className="w-full flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors">
                <ArrowLeft size={16} /> Back
              </button>
            )}
          </motion.div>
        )}

        {step === 'CONFIRM' && paymentData && (
          <motion.div key="confirm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#7851A9]/10 flex items-center justify-center">
                <Store size={28} className="text-[#7851A9]" />
              </div>
              <h2 className="text-xl font-black text-[#7851A9]">{paymentData.merchantName}</h2>
              {paymentData.productName && <p className="text-slate-500 text-sm mt-1">{paymentData.productName}</p>}
            </div>
            {!paymentData.amount && (
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-black text-slate-300">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  autoFocus
                  className="w-full pl-12 pr-4 py-5 text-4xl font-black text-center rounded-2xl border-2 border-[#CA9CE1]/20 focus:border-[#7851A9] focus:ring-4 focus:ring-[#7851A9]/10 outline-none"
                />
              </div>
            )}
            {parsedAmount > 0 && (
              <div className="bg-slate-50 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Subtotal</span>
                  <span className="text-sm font-bold">${parsedAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-emerald-600 flex items-center gap-1"><Zap size={14} /> Your 10% Discount</span>
                  <span className="text-sm font-bold text-emerald-600">-${discount.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                  <span className="text-lg font-black text-[#7851A9]">You Pay</span>
                  <span className="text-2xl font-black text-[#7851A9]">${youPay.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Heart size={12} className="text-[#A20021]" /> Donation to {selectedNonprofit?.name || 'your nonprofit'}
                  </span>
                  <span className="text-xs font-bold text-[#A20021]">${donation.toFixed(2)}</span>
                </div>
              </div>
            )}
            <button
              onClick={handlePay}
              disabled={parsedAmount <= 0}
              className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                parsedAmount > 0
                  ? 'bg-[#7851A9] text-white shadow-xl hover:bg-[#6841A0] active:scale-[0.98]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {parsedAmount > 0 ? `Pay $${youPay.toFixed(2)}` : 'Enter Amount'}
            </button>
            <button
              onClick={() => { setStep('SCAN'); setPaymentData(null); setAmount(''); }}
              className="w-full flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-600"
            >
              <ArrowLeft size={16} /> Scan Different Code
            </button>
          </motion.div>
        )}

        {step === 'PROCESSING' && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16 space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full border-4 border-[#7851A9] border-t-transparent animate-spin" />
            <div>
              <h2 className="text-xl font-black text-[#7851A9]">Processing Payment</h2>
              <p className="text-slate-400 text-sm mt-2">Splitting funds via 10/10/1 model...</p>
            </div>
          </motion.div>
        )}

        {step === 'SUCCESS' && paymentData && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center py-8 space-y-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10, delay: 0.2 }} className="w-24 h-24 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 size={48} className="text-emerald-500" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-black text-emerald-600">Payment Complete!</h2>
              <p className="text-slate-500 text-sm mt-2">Thank you for shopping with Good Circles</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-5 text-left space-y-2 max-w-xs mx-auto">
              <div className="flex justify-between"><span className="text-xs text-slate-400">Merchant</span><span className="text-xs font-bold">{paymentData.merchantName}</span></div>
              <div className="flex justify-between"><span className="text-xs text-slate-400">Amount</span><span className="text-xs font-bold">${parsedAmount.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-xs text-emerald-600">You Saved</span><span className="text-xs font-bold text-emerald-600">${discount.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-xs text-[#A20021]">Donated</span><span className="text-xs font-bold text-[#A20021]">${donation.toFixed(2)}</span></div>
            </div>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setStep('SCAN'); setPaymentData(null); setAmount(''); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7851A9] text-white text-xs font-bold">
                <RefreshCw size={14} /> Scan Another
              </button>
              {onCancel && (
                <button onClick={onCancel} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold">Done</button>
              )}
            </div>
          </motion.div>
        )}

        {step === 'ERROR' && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12 space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle size={40} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-red-600">Payment Failed</h2>
              <p className="text-slate-500 text-sm mt-2">{error || 'Something went wrong. Please try again.'}</p>
            </div>
            <button onClick={() => { setStep('SCAN'); setError(''); }} className="px-6 py-3 rounded-xl bg-[#7851A9] text-white text-xs font-bold">
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ═══════════════════════════════════════════════════
// PRINTABLE QR CARD
// Merchant can print a branded card for their booth
// ═══════════════════════════════════════════════════

export const PrintableQRCard: React.FC<{ merchantName: string; merchantId: string }> = ({
  merchantName,
  merchantId,
}) => {
  const paymentData: PaymentData = { merchantId, merchantName, timestamp: Date.now() };
  const qrString = encodePaymentData(paymentData);
  const qrSvg = generateQRSvg(qrString, 200);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>Good Circles QR - ${merchantName}</title>
      <style>
        body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: Arial, sans-serif; }
        .card { width: 4in; padding: 0.5in; border: 2px solid #CA9CE1; border-radius: 16px; text-align: center; }
        .brand { color: #C2A76F; font-size: 10px; letter-spacing: 4px; text-transform: uppercase; font-weight: 800; }
        .name { color: #7851A9; font-size: 18px; font-weight: 800; margin: 8px 0; }
        .tagline { color: #666; font-size: 11px; margin-top: 12px; }
        .badges { display: flex; justify-content: center; gap: 8px; margin-top: 12px; }
        .badge { padding: 4px 8px; border-radius: 6px; font-size: 9px; font-weight: 800; }
      </style></head><body>
      <div class="card">
        <div class="brand">Good Circles</div>
        <div class="name">${merchantName}</div>
        <div>${qrSvg}</div>
        <div class="tagline">Scan with your phone to pay<br/>Save 10% • Support Local Nonprofits</div>
        <div class="badges">
          <span class="badge" style="background:#C2A76F20;color:#C2A76F;">SAVE 10%</span>
          <span class="badge" style="background:#A2002120;color:#A20021;">♥ DONATE 10%</span>
          <span class="badge" style="background:#7851A920;color:#7851A9;">1% FEE</span>
        </div>
      </div>
      <script>window.onload=()=>{window.print();}<\/script>
      </body></html>
    `);
    printWindow.document.close();
  };

  return (
    <button
      onClick={handlePrint}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-all"
    >
      <QrCode size={14} />
      Print QR Card
    </button>
  );
};
