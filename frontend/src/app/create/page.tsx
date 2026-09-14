'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProofHire } from '@/hooks/useProofHire';
import { useWallet } from '@/context/WalletContext';
import { parseGenToWei } from '@/lib/utils';
import { TxModal } from '@/components/TxModal';
import { ShieldCheck, Plus, AlertCircle, ArrowLeft, Layers, Wallet } from 'lucide-react';
import Link from 'next/link';

export default function CreateJobPage() {
  const router = useRouter();
  const { isConnected, connectWallet } = useWallet();
  const { createJob, txFeedback, clearTxFeedback } = useProofHire();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [totalGen, setTotalGen] = useState('1.0');

  const [milestones, setMilestones] = useState([
    { percentage: 30, description: 'Milestone 1: Architecture Specification & Core Contracts' },
    { percentage: 40, description: 'Milestone 2: Unit Testing, Consensus Auditing & Verification' },
    { percentage: 30, description: 'Milestone 3: End-to-End Integration, Frontend & Documentation' },
  ]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const totalPercentage = milestones.reduce((sum, m) => sum + (Number(m.percentage) || 0), 0);

  const handleMilestoneChange = (index: number, field: 'percentage' | 'description', value: any) => {
    const updated = [...milestones];
    updated[index] = {
      ...updated[index],
      [field]: field === 'percentage' ? Number(value) : value,
    };
    setMilestones(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isConnected) {
      setErrorMsg('Please connect your Web3 wallet to post a job.');
      return;
    }

    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please provide a title and job description.');
      return;
    }

    const weiValue = parseGenToWei(totalGen);
    if (weiValue <= 0n) {
      setErrorMsg('Deposit must be greater than 0 GEN.');
      return;
    }

    if (totalPercentage !== 100) {
      setErrorMsg(`Milestone percentages must sum to exactly 100%. Currently: ${totalPercentage}%.`);
      return;
    }

    for (let i = 0; i < milestones.length; i++) {
      if (!milestones[i].description.trim()) {
        setErrorMsg(`Please specify deliverables for Milestone #${i + 1}.`);
        return;
      }
    }

    try {
      setSubmitting(true);
      const percentages = milestones.map((m) => m.percentage);
      const descriptions = milestones.map((m) => m.description);

      const result = await createJob(title, description, percentages, descriptions, weiValue);
      if (result && result.txHash) {
        setTimeout(() => {
          router.push('/jobs');
        }, 3500);
      }
    } catch (err: any) {
      console.error('Job creation failed:', err);
      setErrorMsg(err?.message || 'Transaction submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <TxModal feedback={txFeedback} onClose={clearTxFeedback} />

      {/* Back link */}
      <Link
        href="/jobs"
        className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
        Back to Jobs
      </Link>

      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Create Job with Escrow
            </h1>
            <p className="text-xs text-slate-400">
              Deploy a trustless escrow agreement with 3 explicit milestones on GenLayer StudioNet.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Job Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Build Decentralized AI Oracle Contract"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Job Scope & Requirements
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Specify the technical requirements, architecture constraints, and deliverable standards..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 transition resize-none"
            />
          </div>

          {/* Total Escrow Deposit */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Escrow Deposit (Native GEN)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.001"
                min="0.001"
                required
                value={totalGen}
                onChange={(e) => setTotalGen(e.target.value)}
                placeholder="1.0"
                className="w-full pl-4 pr-16 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-emerald-400 focus:outline-none focus:border-emerald-500/60 transition"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                GEN
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Deposited native GEN is locked in the contract and released milestone-by-milestone.
            </p>
          </div>

          {/* 3 Explicit Milestones */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  3 Explicit Milestones
                </h3>
              </div>
              <div
                className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                  totalPercentage === 100
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}
              >
                Total: {totalPercentage}% / 100%
              </div>
            </div>

            <div className="space-y-4">
              {milestones.map((m, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Milestone #{idx + 1}</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={m.percentage}
                        onChange={(e) => handleMilestoneChange(idx, 'percentage', e.target.value)}
                        className="w-16 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-center text-emerald-400 focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-xs text-slate-400">%</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    required
                    value={m.description}
                    onChange={(e) => handleMilestoneChange(idx, 'description', e.target.value)}
                    placeholder={`Deliverable criteria for Milestone ${idx + 1}...`}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Submit or Connect Button */}
          <div className="pt-6">
            {!isConnected ? (
              <button
                type="button"
                onClick={connectWallet}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-2 transition"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet to Post Job</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting || totalPercentage !== 100}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>
                  {submitting
                    ? 'Submitting Escrow Transaction...'
                    : `Deposit ${totalGen} GEN & Create Job`}
                </span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
