import React, { useState } from 'react';
import { validateAddress } from '../services/geminiService';
import { BrandSubmark } from './BrandAssets';

interface Props {
  initialAddress?: string;
  onValidated: (data: { address: string; lat: number; lng: number; mapsUrl?: string }) => void;
  label?: string;
}

export const AddressValidator: React.FC<Props> = ({ initialAddress = '', onValidated, label = "Business Address" }) => {
  const [address, setAddress] = useState(initialAddress);
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<{ text: string; url?: string; verified: boolean } | null>(null);

  const handleValidate = async () => {
    if (!address.trim()) return;
    setIsValidating(true);
    setResult(null);

    // Get current location for better grounding
    let userLoc: { latitude: number; longitude: number } | undefined = undefined;
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
      userLoc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
    } catch (e) {
      console.warn("Geolocation access denied, proceeding without it.");
    }

    const validation = await validateAddress(address, userLoc);
    
    if (validation) {
      // FIXED: Use 'any' cast to access groundingChunks properties safely during build
      const mapsUrl = (validation as any).groundingChunks?.[0]?.maps?.uri;
      
      setResult({
        text: validation.text,
        url: mapsUrl,
        verified: !!validation.coords || !!mapsUrl
      });

      if (validation.coords) {
        onValidated({
          address,
          lat: validation.coords.lat,
          lng: validation.coords.lng,
          mapsUrl
        });
      } else if (mapsUrl) {
        onValidated({ address, lat: userLoc?.latitude || 0, lng: userLoc?.longitude || 0, mapsUrl });
      }
    } else {
      setResult({ text: "Unable to verify this location at this time.", verified: false });
    }
    setIsValidating(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-accent ml-2">{label}</label>
        <div className="flex gap-4">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="flex-1 px-6 py-4 rounded-2xl border border-[#CA9CE1]/20 focus:ring-4 focus:ring-[#7851A9]/10 outline-none font-bold transition-all"
            placeholder="e.g. 123 Main St, Los Angeles, CA"
          />
          <button
            type="button"
            onClick={handleValidate}
            disabled={isValidating || !address}
            className={`px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              isValidating ? 'bg-slate-100 text-slate-400 animate-pulse' : 'bg-[#000000] text-white hover:bg-[#7851A9]'
            }`}
          >
            {isValidating ? 'Verifying...' : 'Verify with AI'}
          </button>
        </div>
      </div>

      {result && (
        <div className={`p-8 rounded-[2rem] border-2 animate-in fade-in slide-in-from-top-2 duration-300 ${
          result.verified ? 'bg-[#CA9CE1]/5 border-[#7851A9]/20' : 'bg-red-50 border-red-100'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-xl ${result.verified ? 'bg-[#7851A9] text-white' : 'bg-red-100 text-red-500'}`}>
              {result.verified ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              )}
            </div>
            <div className="flex-1 space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-slate-900">
                {result.verified ? 'Location Authenticated' : 'Verification Unsuccessful'}
              </p>
              <p className="text-sm text-slate-600 leading-relaxed italic">{result.text}</p>
              {result.url && (
                <a 
                  href={result.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 text-[#7851A9] text-[10px] font-black uppercase tracking-[0.2em] hover:underline"
                >
                  View on Google Maps
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              )}
            </div>
            {result.verified && <BrandSubmark size={32} color="#C2A76F" showCrown={false} />}
          </div>
        </div>
      )}
    </div>
  );
};
