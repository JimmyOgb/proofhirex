'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProofHire } from '@/hooks/useProofHire';
import { useWallet } from '@/context/WalletContext';
import { parseGenToWei } from '@/lib/utils';
import { TxModal } from '@/components/TxModal';
import { ShieldCheck, AlertCircle, ArrowLeft, Layers, Wallet } from 'lucide-react';
import Link from 'next/link';

export default function CreateJobPage() {
  const router = useRouter();
  const { isConnected, connectWallet } = useWallet();
  const {
    createJob,
    txPrompt,
    txFeedback,
    confirmPendingTx,
    cancelPendingTx,
    clearTxFeedback,
  } = useProofHire();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [totalGen, setTotalGen] = useState('1.0');

  const [milestones, setMilestones] = useState([
    { title: 'M1: Architecture & Specs', percentage: 30, description: 'Protocol specifications, schemas, and contract interfaces.' },
    { title: 'M2: Core Engine & Testing', percentage: 40, description: 'GenVM contract implementation, storage rules, and automated direct tests.' },
    { title: 'M3: Integration & Frontend', percentage: 30, description: 'End-to-end StudioNet integration, user interface, and complete documentation.' },
  ]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const totalPercentage = milestones.reduce((sum, m) => sum + (Number(m.percentage) || 0), 0);

  const handleMilestoneChange = (index: number, field: 'title' | 'percentage' | 'description', value: any) => {
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
      setErrorMsg('Escrow deposit must be strictly greater than 0 GEN.');
      return;
    }

    if (totalPercentage !== 100) {
      setErrorMsg(`Milestone percentages must sum to exactly 100%. Currently: ${totalPercentage}%.`);
      return;
    }

    for (let i = 0; i < milestones.length; i++) {
      if (!milestones[i].title.trim() || !milestones[i].description.trim()) {
        setErrorMsg(`Please specify title and requirements for Milestone #${i + 1}.`);
        return;
      }
      if (milestones[i].percentage <= 0) {
        setErrorMsg(`Percentage for Milestone #${i + 1} must be positive.`);
        return;
      }
    }

    try {
      setSubmitting(true);
      const result = await createJob(
        title,
        description,
        milestones[0].title,
        milestones[0].description,
        milestones[0].percentage,
        milestones[1].title,
        milestones[1].description,
        milestones[1].percentage,
        milestones[2].title,
        milestones[2].description,
        milestones[2].percentage,
        weiValue
      );
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
      <TxModal
        prompt={txPrompt}
        feedback={txFeedback}
        onConfirmPrompt={confirmPendingTx}
        onCancelPrompt={cancelPendingTx}
        onCloseFeedback={clearTxFeedback}
      />

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
              Create Job with Native Escrow
            </h1>
            <p className="text-xs text-slate-400">
              Deploy a trustless escrow agreement with 3 explicit milestones on GenLayer StudioNet.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800/40 flex items-start space-x-3 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Job Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Develop GenLayer Intelligent Contract Protocol"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 transition"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Job Requirements & Scope
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe deliverables, criteria, and technical stack..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 transition resize-y"
              required
            />
          </div>

          {/* Deposit */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Native Escrow Deposit (GEN)
            </label>
            <div className="relative max-w-xs">
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={totalGen}
                onChange={(e) => setTotalGen(e.target.value)}
                className="w-full pl-4 pr-16 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500/60 transition"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                GEN
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Deposit is locked in the contract upon job creation and auto-partitioned across milestones.
            </p>
          </div>

          {/* 3 Explicit Milestones */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-200 flex items-center">
                  <Layers className="w-4 h-4 mr-1.5 text-emerald-400" />
                  <span>Milestone Structure (Strictly 3 Milestones)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Total Percentage: <span className={totalPercentage === 100 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{totalPercentage}% / 100%</span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {milestones.map((m, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Milestone #{idx + 1} Title
                      </label>
                      <input
                        type="text"
                        value={m.title}
                        onChange={(e) => handleMilestoneChange(idx, 'title', e.target.value)}
                        placeholder={`Milestone #${idx + 1} Title`}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/60 transition"
                        required
                      />
                    </div>

                    <div className="w-28">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Percentage
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max="98"
                          value={m.percentage}
                          onChange={(e) => handleMilestoneChange(idx, 'percentage', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-slate-200 focus:outline-none focus:border-emerald-500/60 transition"
                          required
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold">%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Deliverable Criteria
                    </label>
                    <input
                      type="text"
                      value={m.description}
                      onChange={(e) => handleMilestoneChange(idx, 'description', e.target.value)}
                      placeholder="Specific deliverables and acceptance requirements..."
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/60 transition"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Transaction requires explicit confirmation and wallet signature on StudioNet.
            </div>

            {isConnected ? (
              <button
                type="submit"
                disabled={submitting || totalPercentage !== 100}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Preparing Transaction...' : 'Post Job with Escrow'}
              </button>
            ) : (
              <button
                type="button"
                onClick={connectWallet}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition flex items-center justify-center space-x-2"
              >
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>Connect Wallet to Post</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
