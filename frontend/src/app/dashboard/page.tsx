'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useProofHire } from '@/hooks/useProofHire';
import { useWallet } from '@/context/WalletContext';
import { Job, FreelancerReputation } from '@/lib/types';
import { formatGen, truncateAddress } from '@/lib/utils';
import { JobStatusBadge } from '@/components/StatusBadge';
import { TxModal } from '@/components/TxModal';
import {
  Wallet,
  ArrowDownLeft,
  Award,
  Briefcase,
  Layers,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { EXPLORER_URL } from '@/lib/genlayer';

export default function DashboardPage() {
  const { account, isConnected, connectWallet } = useWallet();
  const {
    getWithdrawableBalance,
    getFreelancerReputation,
    getAllJobs,
    withdraw,
    txFeedback,
    clearTxFeedback,
  } = useProofHire();

  const [balance, setBalance] = useState<string>('0');
  const [reputation, setReputation] = useState<FreelancerReputation | null>(null);
  const [clientJobs, setClientJobs] = useState<Job[]>([]);
  const [freelancerJobs, setFreelancerJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadUserData = async () => {
    if (!account) {
      setLoading(false);
      return;
    }
    try {
      setRefreshing(true);
      const [bal, rep, allJobs] = await Promise.all([
        getWithdrawableBalance(account).catch(() => '0'),
        getFreelancerReputation(account).catch(() => null),
        getAllJobs().catch(() => []),
      ]);

      setBalance(bal);
      setReputation(rep);

      const normalizedAccount = account.toLowerCase();
      const asClient = allJobs.filter((j) => j.client.toLowerCase() === normalizedAccount);
      const asFreelancer = allJobs.filter(
        (j) => j.freelancer && j.freelancer.toLowerCase() === normalizedAccount
      );

      setClientJobs(asClient);
      setFreelancerJobs(asFreelancer);
    } catch (err) {
      console.error('Failed loading user dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [account]);

  const handleWithdraw = async () => {
    try {
      await withdraw();
      await loadUserData();
    } catch (err) {
      console.error('Withdrawal error:', err);
    }
  };

  const hasWithdrawable = BigInt(balance || '0') > 0n;

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-28 text-center">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-6 shadow-xl shadow-emerald-500/10">
          <Wallet className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-3">
          Connect Your Web3 Wallet
        </h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
          Access your withdrawable balances, reputation records, active milestones, and client/freelancer escrows.
        </p>
        <button
          onClick={connectWallet}
          className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 transition"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <TxModal feedback={txFeedback} onClose={clearTxFeedback} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">User Dashboard</h1>
            <button
              onClick={loadUserData}
              disabled={refreshing}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
            <span>{account}</span>
            <a
              href={`${EXPLORER_URL}/address/${account}`}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:text-emerald-300"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <Link
          href="/create"
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition"
        >
          Post New Job
        </Link>
      </div>

      {/* Top Grid: Balance & Reputation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Withdrawable Balance Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Pull-Over-Push
              </span>
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Withdrawable Native Balance
            </h3>
            <div className="text-3xl font-extrabold font-mono text-emerald-400 mb-2">
              {formatGen(balance)}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Funds are isolated in the contract until you pull them, preventing reentrancy vulnerabilities.
            </p>
          </div>

          <button
            onClick={handleWithdraw}
            disabled={!hasWithdrawable}
            className="mt-6 w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {hasWithdrawable ? 'Withdraw Native GEN to Wallet' : 'No Withdrawable Balance'}
          </button>
        </div>

        {/* Reputation Profile Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                On-Chain Score
              </span>
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Freelancer Protocol Reputation
            </h3>

            {reputation ? (
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <div className="text-lg font-bold font-mono text-white">
                    {reputation.completed_milestones}
                  </div>
                  <div className="text-[10px] text-slate-500">Completed</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <div className="text-lg font-bold font-mono text-emerald-400">
                    {reputation.disputes_won}
                  </div>
                  <div className="text-[10px] text-slate-500">Disputes Won</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <div className="text-lg font-bold font-mono text-rose-400">
                    {reputation.disputes_lost}
                  </div>
                  <div className="text-[10px] text-slate-500">Disputes Lost</div>
                </div>
              </div>
            ) : (
              <div className="py-4 text-xs text-slate-500">Loading reputation data...</div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500">Total Lifetime Earned:</span>
            <span className="font-bold font-mono text-emerald-400">
              {reputation ? formatGen(reputation.total_earned) : '0.0000 GEN'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs: Jobs as Client / Jobs as Freelancer */}
      <div className="space-y-10">
        {/* Section: Jobs As Client */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Briefcase className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Jobs Posted as Client ({clientJobs.length})
            </h2>
          </div>

          {clientJobs.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900/30 border border-slate-800 text-slate-500 text-xs">
              You haven&apos;t posted any jobs yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clientJobs.map((job) => (
                <Link
                  key={job.job_id}
                  href={`/jobs/${job.job_id}`}
                  className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-emerald-500/40 transition group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-slate-500">Job #{job.job_id}</span>
                    <JobStatusBadge status={job.status} />
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition mb-2">
                    {job.title}
                  </h4>
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="font-mono text-emerald-400 font-bold">
                      {formatGen(job.total_escrow)}
                    </span>
                    <span className="text-slate-500 font-mono">
                      {job.milestone_count} Milestones
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Section: Jobs As Freelancer */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Layers className="w-5 h-5 text-teal-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Jobs Assigned as Freelancer ({freelancerJobs.length})
            </h2>
          </div>

          {freelancerJobs.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900/30 border border-slate-800 text-slate-500 text-xs">
              You are not currently assigned to any jobs.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {freelancerJobs.map((job) => (
                <Link
                  key={job.job_id}
                  href={`/jobs/${job.job_id}`}
                  className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-teal-500/40 transition group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-slate-500">Job #{job.job_id}</span>
                    <JobStatusBadge status={job.status} />
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-teal-300 transition mb-2">
                    {job.title}
                  </h4>
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="font-mono text-emerald-400 font-bold">
                      {formatGen(job.total_escrow)}
                    </span>
                    <span className="text-slate-500 font-mono">
                      {job.milestone_count} Milestones
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
