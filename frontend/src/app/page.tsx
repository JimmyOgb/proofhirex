'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useProofHire } from '@/hooks/useProofHire';
import { EscrowInvariants, Job } from '@/lib/types';
import { formatGen, truncateAddress } from '@/lib/utils';
import { JobStatusBadge } from '@/components/StatusBadge';
import {
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  Lock,
  Scale,
  RefreshCw,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';
import { PROOFHIREX_CONTRACT_ADDRESS, EXPLORER_URL } from '@/lib/genlayer';

export default function HomePage() {
  const { getEscrowInvariants, getAllJobs } = useProofHire();
  const [invariants, setInvariants] = useState<EscrowInvariants | null>(null);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [invData, jobsData] = await Promise.all([
        getEscrowInvariants().catch(() => null),
        getAllJobs().catch(() => []),
      ]);
      setInvariants(invData);
      setRecentJobs(jobsData.slice(0, 4));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32 border-b border-slate-800/80 bg-gradient-to-b from-emerald-950/20 via-slate-950 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>StudioNet Intelligent Contract Protocol</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              Autonomous Web3 Escrow &{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                AI Milestone Verification
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400 mb-8 leading-relaxed">
              No human escrow agents. No centralized arbiters. ProofHireX harnesses GenLayer&apos;s
              intelligent contracts to autonomously verify deliverables against acceptance criteria
              via decentralized AI validator consensus.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/jobs"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-2 transition group"
              >
                <span>Browse Protocol Jobs</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>
              <Link
                href="/create"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm flex items-center justify-center space-x-2 transition"
              >
                <span>Post Job with Escrow</span>
              </Link>
            </div>
          </div>

          {/* Live Invariant & Protocol State Card */}
          <div className="mt-16 max-w-5xl mx-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-white">Live Escrow Invariant Monitor</h3>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live StudioNet RPC</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Contract: <span className="font-mono text-slate-300">{truncateAddress(PROOFHIREX_CONTRACT_ADDRESS, 6)}</span>
                </p>
              </div>

              <button
                onClick={loadData}
                disabled={refreshing}
                className="self-start sm:self-auto flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
                <span>Refresh RPC</span>
              </button>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center items-center text-slate-500 text-sm">
                Fetching protocol invariants from GenLayer StudioNet...
              </div>
            ) : invariants ? (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-xs text-slate-500 font-medium">Total Deposited</div>
                  <div className="text-lg font-bold font-mono text-slate-100 mt-1">
                    {formatGen(invariants.total_deposited)}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-xs text-slate-500 font-medium">Remaining Escrow</div>
                  <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
                    {formatGen(invariants.total_remaining_escrow)}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-xs text-slate-500 font-medium">Total Released</div>
                  <div className="text-lg font-bold font-mono text-cyan-400 mt-1">
                    {formatGen(invariants.total_released_escrow)}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-xs text-slate-500 font-medium">Invariant Status</div>
                  <div className="mt-1 flex items-center space-x-1.5">
                    {invariants.invariant_conserved ? (
                      <span className="inline-flex items-center text-xs font-bold text-emerald-400">
                        <CheckCircle className="w-4 h-4 mr-1 text-emerald-400" />
                        CONSERVED
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-rose-400">BREACHED</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                Unable to query invariants. Ensure network connection to StudioNet.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Protocol Architecture Features */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
              Non-Negotiable Architecture
            </h2>
            <h3 className="text-3xl font-extrabold text-white tracking-tight">
              Designed for High-Value Trustless Collaboration
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-emerald-500/40 transition flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                  <Layers className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Multi-Milestone Escrow</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every job specifies explicit milestones summing exactly to 100%. Funds are locked upfront
                  in native GEN and protected by atomic accounting invariants.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-emerald-400">
                total_deposited = remaining + released
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-teal-500/40 transition flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4">
                  <Cpu className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">GenLayer AI Verification</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Validators fetch live deliverable artifacts and execute deterministic AI consensus.
                  Equipped with strict defenses against hostile prompt injection and bounded result codes.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-teal-400">
                5 Bounded Codes: 0 to 4
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-cyan-500/40 transition flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
                  <Scale className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Intelligent Dispute Court</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  When disagreement arises, GenLayer validator consensus acts as an intelligent digital court,
                  reviewing the contract specifications, submission notes, and dispute reasons for fair resolution.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-cyan-400">
                10: Refund | 20: Payout | 30: 50/50 Split
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent On-Chain Jobs */}
      <section className="py-20 border-t border-slate-800/80 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-bold text-white">Live On-Chain Jobs</h3>
              <p className="text-xs text-slate-400 mt-1">
                Real jobs loaded directly from GenLayer StudioNet contract state.
              </p>
            </div>
            <Link
              href="/jobs"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              Loading on-chain jobs...
            </div>
          ) : recentJobs.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800 text-slate-400 text-sm">
              No jobs posted yet. Be the first to post a job!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentJobs.map((job) => (
                <Link
                  key={job.job_id}
                  href={`/jobs/${job.job_id}`}
                  className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/80 transition group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono text-slate-500">Job #{job.job_id}</span>
                      <JobStatusBadge status={job.status} />
                    </div>
                    <h4 className="text-lg font-bold text-white group-hover:text-emerald-300 transition mb-2">
                      {job.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                      {job.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500">Escrow:</span>{' '}
                      <span className="font-bold font-mono text-emerald-400">
                        {formatGen(job.total_escrow)}
                      </span>
                    </div>
                    <div className="text-slate-400 font-mono">
                      {job.milestone_count} Milestones
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
