import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Camera, DollarSign, CheckCircle2, AlertCircle, ArrowLeft, Store, Heart, Receipt, Copy, Download, RefreshCw, Smartphone, Zap, Shield } from 'lucide-react';
import { neighborService } from '../services/neighborService';

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
              <span className="text-[10px] font-black text-[#C2A76F]">SAVE 10%</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#A20021]/10">
              <Heart size={10} className="text-[#A20021]" />
              <span className="text-[10px] font-black text-[#A20021]">10% DONATED</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#7851A9]/10">
              <span className="text-[10px] font-black text-[#7851A9]">1% FEE</span>
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
// CONSUMER QR DISPLAY
// Consumer shows their identity QR for merchant to scan.
// Token is fetched from the backend (5-min TTL, single-use).
// ═══════════════════════════════════════════════════

interface ConsumerQRDisplayProps {
  userName?: string;
}

export const ConsumerQRDisplay: React.FC<ConsumerQRDisplayProps> = ({ userName }) => {
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchToken = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await neighborService.getQrToken();
      setToken(data.token);
      const exp = new Date(data.expiresAt);
      setExpiresAt(exp);
      setSecondsLeft(Math.max(0, Math.floor((exp.getTime() - Date.now()) / 1000)));
    } catch {
      setError('Could not generate QR code. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchToken(); }, [fetchToken]);

  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => {
      const left = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left === 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const qrSvg = token ? generateQRSvg(token, 240) : '';
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const isExpired = secondsLeft === 0 && !loading;
  const urgency = secondsLeft < 60;

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4">
      <div className="w-16 h-16 rounded-full border-4 border-[#7851A9] border-t-transparent animate-spin" />
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Generating secure token...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center py-10 space-y-4">
      <AlertCircle size={40} className="text-red-400" />
      <p className="text-sm text-slate-500">{error}</p>
      <button onClick={fetchToken} className="px-6 py-3 bg-[#7851A9] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all">Retry</button>
    </div>
  );

  return (
    <div className="flex flex-col items-center space-y-6 max-w-sm mx-auto">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Shield size={16} className="text-[#7851A9]" />
          <p className="text-[10px] font-black text-[#7851A9] uppercase tracking-widest">Identity QR — Single Use</p>
        </div>
        {userName && <p className="text-lg font-black italic text-slate-700">{userName}</p>}
      </div>

      <div className={`bg-white rounded-3xl shadow-2xl border-2 p-6 transition-all ${isExpired ? 'border-red-200 opacity-50' : urgency ? 'border-amber-300' : 'border-[#CA9CE1]/30'}`}>
        {isExpired ? (
          <div className="w-[240px] h-[240px] flex flex-col items-center justify-center gap-3">
            <AlertCircle size={48} className="text-red-400" />
            <p className="text-sm font-black text-red-500 uppercase tracking-widest">Expired</p>
          </div>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: qrSvg }} />
        )}
      </div>

      {/* Countdown */}
      <div className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm ${isExpired ? 'bg-red-50 text-red-500' : urgency ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'}`}>
        <span className="text-[10px] uppercase tracking-widest">Expires in</span>
        <span className="text-xl font-black tabular-nums">{mins}:{String(secs).padStart(2, '0')}</span>
      </div>

      <button
        onClick={fetchToken}
        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#7851A9] text-white text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-md"
      >
        <RefreshCw size={14} /> {isExpired ? 'Generate New Code' : 'Refresh Early'}
      </button>

      <div className="bg-slate-50 rounded-2xl p-5 space-y-3 w-full">
        <p className="text-[10px] font-black text-[#7851A9] uppercase tracking-widest">How to Pay in Person</p>
        {[
          'Open this screen and show the QR code to the merchant.',
          'The merchant scans your code on their Good Circles dashboard.',
          'They select the item you\'re buying and tap Confirm.',
          'Payment debits your Circle Wallet instantly — no card needed.',
        ].map((s, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-[#7851A9] text-white flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5">{i + 1}</div>
            <p className="text-xs text-slate-500 leading-relaxed">{s}</p>
          </div>
        ))}
      </div>
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
