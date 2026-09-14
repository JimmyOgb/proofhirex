'use client';

import React from 'react';
import { ShieldCheck, ExternalLink } from 'lucide-react';
import { PROOFHIREX_CONTRACT_ADDRESS, EXPLORER_URL, RPC_URL } from '@/lib/genlayer';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800 bg-slate-950 py-12 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
                <ShieldCheck className="w-4 h-4 text-slate-950" />
              </div>
              <span className="font-bold text-base text-white">ProofHireX Protocol</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-4">
              Autonomous Web3 escrow & AI milestone verification powered by GenLayer Intelligent Contracts.
              Zero human intermediaries, strictly conserved mathematical escrow balance, and consensus-driven arbitration.
            </p>
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-500">
              <span>Contract:</span>
              <a
                href={`${EXPLORER_URL}/address/${PROOFHIREX_CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:text-emerald-300 transition flex items-center"
              >
                {PROOFHIREX_CONTRACT_ADDRESS} <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          </div>

          {/* Col 2: Network Specs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Network</h4>
            <ul className="space-y-2 text-xs">
              <li>Chain: <span className="text-slate-200">GenLayer StudioNet (61999)</span></li>
              <li>RPC: <span className="text-slate-200 font-mono text-[11px]">{RPC_URL}</span></li>
              <li>Contract Engine: <span className="text-slate-200 font-mono text-[11px]">py-genlayer</span></li>
              <li>Consensus: <span className="text-emerald-400 font-semibold">Equivalence Principle</span></li>
            </ul>
          </div>

          {/* Col 3: Architecture & Security */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Security & Invariants</h4>
            <ul className="space-y-2 text-xs">
              <li>• Pull-over-Push native withdrawals</li>
              <li>• Escrow conservation audit</li>
              <li>• Prompt injection defenses</li>
              <li>• Bounded 5-code AI status schema</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600">
          <div>© {new Date().getFullYear()} ProofHireX. Deployed live on GenLayer StudioNet.</div>
          <div className="mt-2 sm:mt-0 flex space-x-4">
            <a href="https://genlayer.com" target="_blank" rel="noreferrer" className="hover:text-slate-400 transition">
              GenLayer Official
            </a>
            <a href="https://docs.genlayer.com" target="_blank" rel="noreferrer" className="hover:text-slate-400 transition">
              Documentation
            </a>
            <a href={`${EXPLORER_URL}`} target="_blank" rel="noreferrer" className="hover:text-slate-400 transition">
              Explorer
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
