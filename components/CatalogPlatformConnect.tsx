// =============================================================================
// GoodCircles AI Catalog Upload Tool — Platform Connection Component
// =============================================================================
// Step 1: Merchant selects their source platform and initiates OAuth.
// Displays Shopify, Etsy, and Amazon as connect options with branding.
// After OAuth callback, runs a lightweight catalog scan to count products.
// =============================================================================

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Store, ShoppingBag, Package, Loader2, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import type { SourcePlatform, ConnectorScanResult } from '../types/catalog';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CatalogPlatformConnectProps {
  onConnected: (platform: SourcePlatform, scanResult: ConnectorScanResult) => void;
}

type ConnectionState = 'idle' | 'connecting' | 'scanning' | 'connected' | 'error';

interface PlatformOption {
  id: SourcePlatform;
  name: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
}

const PLATFORMS: PlatformOption[] = [
  {
    id: 'SHOPIFY' as SourcePlatform,
    name: 'Shopify',
    description: 'Connect your Shopify store to import all products and variants',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200 hover:border-green-400',
    icon: <Store className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />,
  },
  {
    id: 'ETSY' as SourcePlatform,
    name: 'Etsy',
    description: 'Connect your Etsy shop to import all active listings',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200 hover:border-orange-400',
    icon: <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8 text-orange-600" />,
  },
  {
    id: 'AMAZON' as SourcePlatform,
    name: 'Amazon',
    description: 'Connect your Amazon seller account to import your catalog',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200 hover:border-amber-400',
    icon: <Package className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600" />,
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CatalogPlatformConnect({ onConnected }: CatalogPlatformConnectProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<SourcePlatform | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shopDomain, setShopDomain] = useState('');

  // Initiate OAuth connection
  const handleConnect = useCallback(
    async (platformId: SourcePlatform) => {
      setSelectedPlatform(platformId);
      setConnectionState('connecting');
      setErrorMessage(null);

      try {
        // Call our backend to get the OAuth URL
        const response = await fetch(`/api/catalog/connect/${platformId.toLowerCase()}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          ...(platformId === ('SHOPIFY' as SourcePlatform) && shopDomain
            ? { body: JSON.stringify({ shopDomain }) }
            : {}),
        });

        if (!response.ok) {
          throw new Error(`Failed to initiate connection: ${response.status}`);
        }

        const data = await response.json();

        // Mock mode: skip OAuth redirect and go straight to connected
        if (data.mockMode) {
          setConnectionState('connected');
          const mockScanResult: ConnectorScanResult = {
            platform: platformId,
            productCount: data.productCount || 0,
            recommendedTier: { tier: 'STARTER' as any, minProducts: 1, maxProducts: 50, fee: 75, estimatedPlatformCogs: 8, targetMargin: 0.89 },
            shopName: `Mock ${platformId} Store`,
            connectedAt: new Date(),
          };
          setTimeout(() => {
            onConnected(platformId, mockScanResult);
          }, 800);
          return;
        }

        // Real mode: Redirect to platform OAuth page
        // The callback will return to our app with auth tokens
        window.location.href = data.authUrl;
      } catch (err: any) {
        setConnectionState('error');
        setErrorMessage(err.message || 'Failed to connect. Please try again.');
      }
    },
    [shopDomain],
  );

  // Handle OAuth callback (called after redirect back to our app)
  // In practice, this is triggered by the CatalogUploadView detecting
  // OAuth callback params in the URL on mount
  const handleOAuthCallback = useCallback(
    async (platform: SourcePlatform, code: string) => {
      setConnectionState('scanning');

      try {
        // Exchange code for tokens + run catalog scan
        const response = await fetch(`/api/catalog/callback/${platform.toLowerCase()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          throw new Error(`OAuth callback failed: ${response.status}`);
        }

        const scanResult: ConnectorScanResult = await response.json();
        setConnectionState('connected');

        // Brief delay to show success state before advancing
        setTimeout(() => {
          onConnected(platform, scanResult);
        }, 1000);
      } catch (err: any) {
        setConnectionState('error');
        setErrorMessage(err.message || 'Connection failed. Please try again.');
      }
    },
    [onConnected],
  );

  // Check for OAuth callback params on mount
  // useEffect(() => {
  //   const params = new URLSearchParams(window.location.search);
  //   const code = params.get('code');
  //   const platformParam = params.get('platform');
  //   if (code && platformParam) {
  //     handleOAuthCallback(platformParam.toUpperCase() as SourcePlatform, code);
  //   }
  // }, [handleOAuthCallback]);

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-6 sm:mb-10">
        <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2">
          Connect Your Store
        </h2>
        <p className="text-sm sm:text-base text-gray-500 max-w-lg mx-auto">
          Select your e-commerce platform to securely import your product catalog.
          We'll scan your store and show you exactly what will be imported.
        </p>
      </div>

      {/* Shopify Domain Input (shown when Shopify is selected) */}
      {selectedPlatform === ('SHOPIFY' as SourcePlatform) && connectionState === 'idle' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="max-w-md mx-auto mb-6"
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Shopify store domain
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={shopDomain}
              onChange={(e) => setShopDomain(e.target.value)}
              placeholder="your-store"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <span className="flex items-center text-sm text-gray-400">.myshopify.com</span>
          </div>
        </motion.div>
      )}

      {/* Platform Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
        {PLATFORMS.map((platform, index) => {
          const isSelected = selectedPlatform === platform.id;
          const isConnecting = isSelected && (connectionState === 'connecting' || connectionState === 'scanning');
          const isConnected = isSelected && connectionState === 'connected';
          const hasError = isSelected && connectionState === 'error';

          return (
            <motion.button
              key={platform.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => {
                if (platform.id === ('SHOPIFY' as SourcePlatform) && !shopDomain) {
                  setSelectedPlatform(platform.id);
                  return; // Show domain input first
                }
                handleConnect(platform.id);
              }}
              disabled={isConnecting || isConnected}
              className={`relative flex flex-col items-center p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] border-2 transition-all text-center ${
                isConnected
                  ? 'border-green-400 bg-green-50'
                  : hasError
                  ? 'border-red-300 bg-red-50'
                  : isSelected
                  ? `${platform.borderColor} ${platform.bgColor} ring-2 ring-offset-2 ring-purple-200`
                  : `${platform.borderColor} bg-white hover:shadow-md`
              } ${isConnecting ? 'cursor-wait' : isConnected ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {/* Icon */}
              <div className={`mb-4 p-3 rounded-xl ${platform.bgColor}`}>
                {isConnecting ? (
                  <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 text-purple-500 animate-spin" />
                ) : isConnected ? (
                  <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
                ) : (
                  platform.icon
                )}
              </div>

              {/* Name */}
              <h3 className={`text-lg sm:text-xl font-semibold mb-2 ${platform.color}`}>
                {platform.name}
              </h3>

              {/* Description / Status */}
              <p className="text-xs sm:text-sm text-gray-500">
                {isConnecting
                  ? connectionState === 'scanning'
                    ? 'Scanning your catalog...'
                    : 'Connecting...'
                  : isConnected
                  ? 'Connected!'
                  : platform.description}
              </p>

              {/* Connect indicator */}
              {!isConnecting && !isConnected && !hasError && (
                <div className="mt-4 flex items-center gap-1 text-xs text-purple-600 font-medium">
                  <ExternalLink className="w-3 h-3" />
                  Connect with {platform.name}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Error Message */}
      {connectionState === 'error' && errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 max-w-lg mx-auto flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl"
        >
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Connection Failed</p>
            <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
            <button
              onClick={() => {
                setConnectionState('idle');
                setErrorMessage(null);
                setSelectedPlatform(null);
              }}
              className="mt-2 text-xs text-red-700 underline hover:text-red-900"
            >
              Try again
            </button>
          </div>
        </motion.div>
      )}

      {/* Security note */}
      <p className="text-center text-xs text-gray-400 mt-8 max-w-md mx-auto">
        Your credentials are encrypted and stored securely. GoodCircles only
        requests read access to your product catalog — we never modify your
        existing store.
      </p>
    </div>
  );
}

export default CatalogPlatformConnect;
