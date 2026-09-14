'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from '@/context/WalletContext';
import { useProofHire } from '@/hooks/useProofHire';
import { truncateAddress, formatGen } from '@/lib/utils';
import { ShieldCheck, Wallet, ExternalLink, ArrowRight } from 'lucide-react';
import { PROOFHIREX_CONTRACT_ADDRESS, EXPLORER_URL } from '@/lib/genlayer';

export const Navbar: React.FC = () => {
  const { account, isConnected, isConnecting, connectWallet, disconnectWallet } = useWallet();
  const { getWithdrawableBalance } = useProofHire();
  const [balance, setBalance] = useState<string>('0');

  useEffect(() => {
    if (isConnected && account) {
      getWithdrawableBalance(account)
        .then((b) => setBalance(b))
        .catch(() => setBalance('0'));
    }
  }, [isConnected, account, getWithdrawableBalance]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition">
              <ShieldCheck className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                ProofHireX
              </span>
              <span className="ml-1 text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400">
                GenLayer
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-5 text-sm font-medium">
            <Link
              href="/jobs"
              className="text-slate-300 hover:text-white hover:text-emerald-400 transition"
            >
              Explore Jobs
            </Link>
            <Link
              href="/create"
              className="text-slate-300 hover:text-white hover:text-emerald-400 transition"
            >
              Post a Job
            </Link>
            <Link
              href="/dashboard"
              className="text-slate-300 hover:text-white hover:text-emerald-400 transition"
            >
              Dashboard
            </Link>
          </nav>
        </div>

        {/* Network & Wallet */}
        <div className="flex items-center space-x-3">
          {/* StudioNet Status Badge */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">StudioNet</span>
            <span className="text-slate-600 font-mono">61999</span>
          </div>

          {/* Wallet Actions */}
          {isConnected && account ? (
            <div className="flex items-center space-x-2">
              <Link
                href="/dashboard"
                className="hidden lg:flex flex-col text-right px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-xs"
              >
                <span className="text-slate-400 text-[10px]">Withdrawable</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {formatGen(balance)}
                </span>
              </Link>
              <button
                onClick={disconnectWallet}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-medium transition"
                title="Click to disconnect"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{truncateAddress(account)}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
