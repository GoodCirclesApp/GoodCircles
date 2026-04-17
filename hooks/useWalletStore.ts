import { useState, useEffect } from 'react';
import { User, Wallet, WalletTransaction } from '../types';
import { walletService } from '../services/walletService';

export function useWalletStore(user: User | null, onUpdateUser: (user: User) => void) {
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [creditBalance, setCreditBalance] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
        if (user) {
                fetchWalletData();
        }
  }, [user?.id]);

  const fetchWalletData = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
                // Fetch balance and history (primary data)
          const { balance } = await walletService.getBalance();

          // Fetch credit balance separately — graceful fallback if unavailable
          let credits = 0;
                try {
                          const { balance: creditBal } = await walletService.getCreditBalance();
                          credits = Number(creditBal) || 0;
                } catch {
                          // Credit balance temporarily unavailable, default to 0
                }

          const historyData: any = await walletService.getHistory();
        const entries = Array.isArray(historyData) ? historyData : (historyData?.entries || []);

          const updatedWallet: Wallet = {
                    userId: user.id,
                    balance: Number(balance) || 0,
                    currency: 'USD',
                    transactions: entries.map((tx: any) => ({
                                id: tx.id,
                                date: tx.createdAt,
                                amount: tx.amount,
                                type: tx.type === 'DEBIT' ? 'DEBIT' : 'CREDIT',
                                description: tx.description,
                                feeCharged: 0,
                                currency: 'USD'
                    }))
          };

          setWallet(updatedWallet);
                setCreditBalance(credits);
        } catch (error) {
                console.error('Failed to fetch wallet data:', error);
        } finally {
                setIsLoading(false);
        }
  };

  const topUp = async (amount: number) => {
        if (!user) return;
        try {
                await walletService.fundWallet(amount, 'External Capital Injection (Top Up)');
                await fetchWalletData();
        } catch (error) {
                console.error('Top up failed:', error);
        }
  };

  const withdraw = async (amount: number) => {
        if (!user) return;
        try {
                await walletService.withdraw(amount, 'Wallet Withdrawal');
                await fetchWalletData();
        } catch (error) {
                console.error('Withdrawal failed:', error);
                throw error;
        }
  };

  const refundToWallet = async (amount: number, orderId: string) => {
        if (!user) return;
        try {
                await walletService.fundWallet(amount, `Order Refund Recapture: GC-${orderId.slice(-6)}`);
                await fetchWalletData();
        } catch (error) {
                console.error('Refund failed:', error);
        }
  };

  return {
        wallet,
        balance: wallet?.balance ?? 0,
        creditBalance,
        isLoading,
        topUp,
        withdraw,
        refundToWallet,
        refresh: fetchWalletData
  };
}
