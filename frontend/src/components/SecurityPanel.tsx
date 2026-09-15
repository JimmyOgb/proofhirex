'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  Info,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { PROOFHIREX_CONTRACT_ADDRESS, EXPLORER_URL, RPC_URL, CHAIN_ID, NETWORK_NAME } from '@/lib/genlayer';
import { truncateAddress } from '@/lib/utils';

export const SecurityPanel: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="w-full bg-slate-950/90 border-b border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span className="font-semibold text-slate-300">ProofHireX Security Policy:</span>
          <span className="text-slate-400">Native GEN Escrow • No Token Approvals • Explicit User Confirmation</span>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 font-medium transition text-left sm:text-right self-start sm:self-auto"
        >
          <span>{expanded ? 'Hide Security Details' : 'Verify Security & Contract Invariants'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-t border-slate-900 bg-slate-900/60 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Box 1: Network & Contract Identity */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center">
                <Info className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                <span>On-Chain Identity</span>
              </h4>
              <ul className="space-y-1.5 text-slate-400 text-[11px]">
                <li>
                  Network: <span className="text-slate-200 font-semibold">{NETWORK_NAME}</span>
                </li>
                <li>
                  Chain ID: <span className="font-mono text-emerald-400 font-semibold">{CHAIN_ID}</span>
                </li>
                <li>
                  RPC: <span className="font-mono text-slate-300 text-[10px] break-all">{RPC_URL}</span>
                </li>
                <li className="pt-1">
                  Contract Address:
                  <div className="mt-0.5">
                    <a
                      href={`${EXPLORER_URL}/address/${PROOFHIREX_CONTRACT_ADDRESS}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-emerald-400 hover:text-emerald-300 flex items-center text-[10px] break-all"
                    >
                      {PROOFHIREX_CONTRACT_ADDRESS} <ExternalLink className="w-3 h-3 ml-1 shrink-0" />
                    </a>
                  </div>
                </li>
              </ul>
            </div>

            {/* Box 2: Wallet Permission Guarantees */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                <span>Wallet Safety Invariants</span>
              </h4>
              <ul className="space-y-1.5 text-slate-400 text-[11px]">
                <li className="flex items-start">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 mr-1.5 mt-0.5 shrink-0" />
                  <span><strong>Native GEN Escrow:</strong> No ERC-20 token approvals (<code className="text-[10px]">approve</code> / <code className="text-[10px]">permit</code>) exist in this protocol.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 mr-1.5 mt-0.5 shrink-0" />
                  <span><strong>No Arbitrary Signatures:</strong> Zero off-chain message signing requests (<code className="text-[10px]">personal_sign</code> or <code className="text-[10px]">eth_signTypedData</code>).</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 mr-1.5 mt-0.5 shrink-0" />
                  <span><strong>Explicit Confirmation:</strong> Every state change requires explicit confirmation before triggering wallet prompts.</span>
                </li>
              </ul>
            </div>

            {/* Box 3: Honest Security Disclaimer & Burner Wallet Guidance */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center">
                <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                <span>Security Notice & Testing Guidance</span>
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                ProofHireX is an experimental hackathon project running on GenLayer StudioNet testnet.
                It has <strong>not</strong> undergone a formal independent third-party security audit.
              </p>
              <div className="p-2 rounded bg-amber-950/30 border border-amber-900/40 text-[11px] text-amber-300">
                <strong>Safety Recommendation:</strong> Always use a dedicated testnet burner wallet when testing on StudioNet. Never import mainnet private keys or hold substantial funds in test wallets.
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-800/80 gap-1">
            <span>Always verify the contract address <span className="font-mono text-slate-400">{truncateAddress(PROOFHIREX_CONTRACT_ADDRESS, 8)}</span> in your wallet before signing any transaction.</span>
            <a
              href={`${EXPLORER_URL}/address/${PROOFHIREX_CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center"
            >
              Verify on Explorer <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
