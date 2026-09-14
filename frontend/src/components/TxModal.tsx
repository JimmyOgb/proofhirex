'use client';

import React from 'react';
import { TxFeedback } from '@/hooks/useProofHire';
import { EXPLORER_URL } from '@/lib/genlayer';
import { CheckCircle2, AlertCircle, Loader2, ExternalLink, X } from 'lucide-react';

interface TxModalProps {
  feedback: TxFeedback;
  onClose: () => void;
}

export const TxModal: React.FC<TxModalProps> = ({ feedback, onClose }) => {
  if (!feedback.active) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
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
              <p className="text-sm text-slate-400 mt-1">{feedback.action}</p>
              <p className="text-xs text-slate-500 mt-2">
                Waiting for GenLayer validator consensus on StudioNet...
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
                className="mt-2 inline-flex items-center text-xs text-emerald-400 hover:text-emerald-300 transition"
              >
                View on GenLayer Explorer <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          )}

          <button
            onClick={onClose}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition"
          >
            {feedback.status === 'PENDING' ? 'Dismiss Window (Still Processing)' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
