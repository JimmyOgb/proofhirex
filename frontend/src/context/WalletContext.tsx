'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { switchToStudioNet, CHAIN_ID_HEX } from '@/lib/genlayer';

interface WalletContextType {
  account: string | null;
  chainId: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  isCorrectNetwork: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: () => Promise<void>;
  error: string | null;
}

const WalletContext = createContext<WalletContextType>({
  account: null,
  chainId: null,
  isConnected: false,
  isConnecting: false,
  isCorrectNetwork: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  switchNetwork: async () => {},
  error: null,
});

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Passive check on mount: does not prompt user or request accounts
  const checkConnection = useCallback(async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) return;
    try {
      const ethereum = (window as any).ethereum;
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
      }
      const currentChain = await ethereum.request({ method: 'eth_chainId' });
      setChainId(currentChain);
    } catch (err: any) {
      console.warn('Passive connection check failed:', err);
    }
  }, []);

  useEffect(() => {
    checkConnection();

    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const ethereum = (window as any).ethereum;
      const handleAccounts = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
        }
      };
      const handleChain = (chain: string) => {
        setChainId(chain);
      };

      ethereum.on?.('accountsChanged', handleAccounts);
      ethereum.on?.('chainChanged', handleChain);

      return () => {
        ethereum.removeListener?.('accountsChanged', handleAccounts);
        ethereum.removeListener?.('chainChanged', handleChain);
      };
    }
  }, [checkConnection]);

  // Explicit user action: only requests connection when user clicks "Connect Wallet"
  const connectWallet = async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      setError('Please install MetaMask or a compatible Web3 wallet.');
      return;
    }
    setIsConnecting(true);
    setError(null);
    try {
      const ethereum = (window as any).ethereum;
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        const currentChain = await ethereum.request({ method: 'eth_chainId' });
        setChainId(currentChain);
        // Prompt network switch if not on StudioNet
        if (currentChain !== CHAIN_ID_HEX) {
          try {
            await switchToStudioNet();
            const updatedChain = await ethereum.request({ method: 'eth_chainId' });
            setChainId(updatedChain);
          } catch (switchErr: any) {
            console.warn('Network switch declined or failed:', switchErr);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const switchNetwork = async () => {
    try {
      await switchToStudioNet();
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const updatedChain = await (window as any).ethereum.request({ method: 'eth_chainId' });
        setChainId(updatedChain);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to switch network');
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
  };

  const isCorrectNetwork = (chainId?.toLowerCase() === CHAIN_ID_HEX.toLowerCase());

  return (
    <WalletContext.Provider
      value={{
        account,
        chainId,
        isConnected: !!account,
        isConnecting,
        isCorrectNetwork,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
