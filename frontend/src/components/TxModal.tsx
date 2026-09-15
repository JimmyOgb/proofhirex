'use client';

import React from 'react';
import { TxFeedback, TxPrompt } from '@/lib/types';
import { EXPLORER_URL, PROOFHIREX_CONTRACT_ADDRESS, CHAIN_ID, NETWORK_NAME } from '@/lib/genlayer';
import { formatGen, truncateAddress } from '@/lib/utils';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  X,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';

interface TxModalProps {
  prompt?: TxPrompt | null;
  feedback: TxFeedback;
  onConfirmPrompt?: () => void;
  onCancelPrompt?: () => void;
  onCloseFeedback: () => void;
}

export const TxModal: React.FC<TxModalProps> = ({
  prompt,
  feedback,
  onConfirmPrompt,
  onCancelPrompt,
  onCloseFeedback,
}) => {
  // 1. PRE-TRANSACTION CONFIRMATION MODAL
  if (prompt) {
    const isPayable = prompt.nativeValueWei > 0n;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
        <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative text-slate-100">
          <button
            onClick={onCancelPrompt}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            aria-label="Cancel"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Review Transaction Request</h3>
              <p className="text-xs text-slate-400">Explicit user confirmation required before wallet prompt</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 mb-5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <span className="text-slate-400">Network:</span>
              <span className="font-semibold text-slate-200">{prompt.network || NETWORK_NAME}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <span className="text-slate-400">Chain ID:</span>
              <span className="font-mono font-semibold text-emerald-400">{prompt.chainId || CHAIN_ID}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <span className="text-slate-400">Contract Address:</span>
              <a
                href={`${EXPLORER_URL}/address/${prompt.contractAddress || PROOFHIREX_CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-emerald-400 hover:text-emerald-300 flex items-center"
              >
                {truncateAddress(prompt.contractAddress || PROOFHIREX_CONTRACT_ADDRESS, 6)}{' '}
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <span className="text-slate-400">Smart Contract Method:</span>
              <span className="font-mono font-bold text-slate-200 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {prompt.functionName}()
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Native Value (GEN):</span>
              <span className={`font-mono font-bold ${isPayable ? 'text-amber-400 text-sm' : 'text-slate-300'}`}>
                {isPayable ? `${formatGen(prompt.nativeValueWei.toString())} (Escrow Deposit)` : '0.00 GEN (No value transfer)'}
              </span>
            </div>
          </div>

          {/* Human Readable Explanation */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 mb-5">
            <div className="text-xs font-semibold text-slate-300 mb-1 flex items-center">
              <span>Action Overview:</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{prompt.explanation}</p>
          </div>

          {/* Safety Notice */}
          <div className="flex items-start space-x-2 text-[11px] text-slate-400 mb-6 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              Verify that the contract address in your Web3 wallet matches{' '}
              <span className="font-mono text-slate-300">{truncateAddress(PROOFHIREX_CONTRACT_ADDRESS, 6)}</span>.
              ProofHireX uses native GEN escrow only and will never request token approvals or off-chain signature permits.
            </p>
          </div>

          {/* Confirm & Cancel Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onCancelPrompt}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition border border-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={onConfirmPrompt}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition flex items-center justify-center space-x-1.5"
            >
              <span>Confirm & Send</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. TRANSACTION EXECUTION / RECEIPT FEEDBACK MODAL
  if (!feedback.active) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onCloseFeedback}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          {feedback.status === 'PENDING' && (
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              </div>
              <h3 className="text-lg font-bold">Transaction in Progress</h3>
              <p className="text-sm text-slate-300 mt-1 font-semibold">{feedback.action}</p>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Waiting for transaction execution and GenLayer validator consensus on StudioNet (Chain ID 61999)...
              </p>
            </div>
          )}

          {feedback.status === 'SUCCESS' && (
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-emerald-400">Transaction Confirmed</h3>
              <p className="text-sm text-slate-300 mt-1">{feedback.action}</p>
              {feedback.consensusResult && (
                <div className="mt-3 px-3 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-emerald-300">
                  Consensus: {feedback.consensusResult}
                </div>
              )}
            </div>
          )}

          {feedback.status === 'ERROR' && (
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-rose-400" />
              </div>
              <h3 className="text-lg font-bold text-rose-400">Transaction Failed</h3>
              <p className="text-sm text-slate-300 mt-1">{feedback.action}</p>
              <div className="mt-3 p-3 rounded-lg bg-rose-950/40 border border-rose-800/40 text-xs text-rose-300 font-mono text-left max-h-32 overflow-y-auto w-full">
                {feedback.error}
              </div>
            </div>
          )}

          {feedback.txHash && (
            <div className="mt-5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-left">
              <div className="text-xs text-slate-400 font-semibold mb-1">Transaction Hash</div>
              <div className="text-xs font-mono text-slate-300 break-all">{feedback.txHash}</div>
              <a
                href={`${EXPLORER_URL}/transactions/${feedback.txHash}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center text-xs text-emerald-400 hover:text-emerald-300 transition font-medium"
              >
                View on GenLayer Explorer <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          )}

          <button
            onClick={onCloseFeedback}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
          >
            {feedback.status === 'PENDING' ? 'Dismiss Window (Continues in Background)' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
