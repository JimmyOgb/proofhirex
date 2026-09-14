'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useProofHire } from '@/hooks/useProofHire';
import { useWallet } from '@/context/WalletContext';
import { Job, Milestone, Applicant } from '@/lib/types';
import { formatGen, truncateAddress } from '@/lib/utils';
import {
  JobStatusBadge,
  MilestoneStatusBadge,
  DeliverableStatusBadge,
} from '@/components/StatusBadge';
import { TxModal } from '@/components/TxModal';
import {
  ShieldCheck,
  ArrowLeft,
  ExternalLink,
  Cpu,
  CheckCircle,
  AlertTriangle,
  Send,
  UserCheck,
  Scale,
  RefreshCw,
  Clock,
  Layers,
  FileText,
} from 'lucide-react';
import { EXPLORER_URL } from '@/lib/genlayer';

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const jobId = parseInt(resolvedParams.id, 10);

  const { account, isConnected, connectWallet } = useWallet();
  const {
    getJob,
    getJobMilestones,
    getJobApplicants,
    applyForJob,
    hireFreelancer,
    submitDeliverable,
    verifyMilestoneDeliverable,
    approveMilestoneManual,
    raiseDispute,
    arbitrateDispute,
    txFeedback,
    clearTxFeedback,
  } = useProofHire();

  const [job, setJob] = useState<Job | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Form states
  const [coverLetter, setCoverLetter] = useState('');
  const [selectedMilestone, setSelectedMilestone] = useState<number>(0);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [activeModal, setActiveModal] = useState<'submit' | 'dispute' | null>(null);

  const loadJobData = async () => {
    if (isNaN(jobId)) return;
    try {
      setRefreshing(true);
      const jobData = await getJob(jobId);
      setJob(jobData);

      if (jobData && jobData.milestone_count) {
        const ms = await getJobMilestones(jobId, jobData.milestone_count);
        setMilestones(ms);
      }

      if (jobData && jobData.status === 'OPEN') {
        const apps = await getJobApplicants(jobId);
        setApplicants(apps);
      }
    } catch (err) {
      console.error('Failed fetching job detail:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadJobData();
  }, [jobId]);

  const isClient = !!(
    account &&
    job &&
    account.toLowerCase() === job.client.toLowerCase()
  );
  const isFreelancer = !!(
    account &&
    job &&
    job.freelancer &&
    account.toLowerCase() === job.freelancer.toLowerCase()
  );

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverLetter.trim()) return;
    try {
      await applyForJob(jobId, coverLetter);
      setCoverLetter('');
      await loadJobData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleHire = async (applicantAddr: string) => {
    try {
      await hireFreelancer(jobId, applicantAddr);
      await loadJobData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceUrl.trim()) return;
    try {
      await submitDeliverable(jobId, selectedMilestone, evidenceUrl, submissionNotes);
      setActiveModal(null);
      setEvidenceUrl('');
      setSubmissionNotes('');
      await loadJobData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyAI = async (mId: number) => {
    try {
      await verifyMilestoneDeliverable(jobId, mId);
      await loadJobData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (mId: number) => {
    try {
      await approveMilestoneManual(jobId, mId);
      await loadJobData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRaiseDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeReason.trim()) return;
    try {
      await raiseDispute(jobId, selectedMilestone, disputeReason);
      setActiveModal(null);
      setDisputeReason('');
      await loadJobData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleArbitrate = async (mId: number) => {
    try {
      await arbitrateDispute(jobId, mId);
      await loadJobData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 text-center text-slate-500 text-sm">
        Loading Job #{jobId} from GenLayer StudioNet...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Job #{jobId} Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">
          This job may not exist on StudioNet or the transaction is not finalized yet.
        </p>
        <Link
          href="/jobs"
          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <TxModal feedback={txFeedback} onClose={clearTxFeedback} />

      {/* Back link & Refresh */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/jobs"
          className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Jobs
        </Link>
        <button
          onClick={loadJobData}
          disabled={refreshing}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Refresh State</span>
        </button>
      </div>

      {/* Main Job Overview Card */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs font-mono text-slate-500">Job #{job.job_id}</span>
              <JobStatusBadge status={job.status} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {job.title}
            </h1>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-500 block">Total Escrow</span>
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {formatGen(job.total_escrow)}
            </span>
          </div>
        </div>

        <p className="mt-6 text-sm text-slate-300 leading-relaxed whitespace-pre-line">
          {job.description}
        </p>

        {/* Roles & Accounting Bar */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 block mb-1">Client</span>
            <div className="flex items-center space-x-1 font-mono text-slate-200">
              <span>{truncateAddress(job.client, 4)}</span>
              <a
                href={`${EXPLORER_URL}/address/${job.client}`}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:text-emerald-300"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
              {isClient && (
                <span className="px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-800 text-[10px] text-emerald-400 font-bold ml-1">
                  YOU
                </span>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 block mb-1">Assigned Freelancer</span>
            <div className="flex items-center space-x-1 font-mono text-slate-200">
              {job.freelancer && job.freelancer !== '0x0000000000000000000000000000000000000000' ? (
                <>
                  <span>{truncateAddress(job.freelancer, 4)}</span>
                  <a
                    href={`${EXPLORER_URL}/address/${job.freelancer}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  {isFreelancer && (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-800 text-[10px] text-emerald-400 font-bold ml-1">
                      YOU
                    </span>
                  )}
                </>
              ) : (
                <span className="text-slate-500 italic">None Assigned (Open)</span>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 block mb-1">Remaining Escrow</span>
            <span className="font-bold font-mono text-emerald-400">
              {formatGen(job.remaining_escrow)}
            </span>
          </div>
        </div>
      </div>

      {/* Section: Milestones */}
      <div className="mb-12">
        <div className="flex items-center space-x-2 mb-6">
          <Layers className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-bold text-white tracking-tight">
            Escrow Milestones ({milestones.length})
          </h2>
        </div>

        <div className="space-y-6">
          {milestones.map((m, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-white">
                    #{idx + 1}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Milestone {idx + 1} ({m.percentage}%)
                    </h3>
                    <span className="text-xs font-mono text-emerald-400">
                      {formatGen(m.amount)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <MilestoneStatusBadge status={m.status} />
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed">{m.description}</p>

              {/* Deliverable Evidence Details */}
              {m.evidence_url && (
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Submitted Evidence:</span>
                    <a
                      href={m.evidence_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 font-mono"
                    >
                      <span className="truncate max-w-xs">{m.evidence_url}</span>
                      <ExternalLink className="w-3 h-3 ml-0.5 flex-shrink-0" />
                    </a>
                  </div>

                  {m.submission_notes && (
                    <div className="text-slate-400 italic">
                      Notes: &quot;{m.submission_notes}&quot;
                    </div>
                  )}

                  {/* AI Verification result */}
                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                    <DeliverableStatusBadge code={m.verification_status} />
                    {m.verification_reason && (
                      <span className="text-[11px] text-slate-400 max-w-sm text-right">
                        {m.verification_reason}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Actions per Milestone */}
              <div className="pt-3 flex flex-wrap items-center gap-3">
                {/* Freelancer submit button */}
                {isFreelancer && m.status === 'PENDING' && (
                  <button
                    onClick={() => {
                      setSelectedMilestone(idx);
                      setActiveModal('submit');
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Deliverable</span>
                  </button>
                )}

                {/* AI Consensus Verification trigger */}
                {m.status === 'SUBMITTED' && (
                  <button
                    onClick={() => handleVerifyAI(idx)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition flex items-center space-x-1.5"
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Trigger GenLayer AI Consensus</span>
                  </button>
                )}

                {/* Client Manual Approval */}
                {isClient && (m.status === 'SUBMITTED' || m.verification_status === 0) && m.status !== 'APPROVED' && m.status !== 'RESOLVED' && (
                  <button
                    onClick={() => handleApprove(idx)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition flex items-center space-x-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve & Release Funds</span>
                  </button>
                )}

                {/* Dispute Trigger */}
                {(isClient || isFreelancer) && (m.status === 'SUBMITTED' || m.status === 'PENDING') && (
                  <button
                    onClick={() => {
                      setSelectedMilestone(idx);
                      setActiveModal('dispute');
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 border border-slate-700 text-xs font-semibold transition flex items-center space-x-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Raise Dispute</span>
                  </button>
                )}

                {/* Dispute Arbitration Trigger */}
                {m.status === 'DISPUTED' && (
                  <button
                    onClick={() => handleArbitrate(idx)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition flex items-center space-x-1.5"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Trigger AI Intelligent Arbitration</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section: Job Applicants (if OPEN) */}
      {job.status === 'OPEN' && (
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">
                Applicants ({applicants.length})
              </h2>
            </div>
          </div>

          {/* Apply Form if not Client and not applied */}
          {!isClient && (
            <div className="mb-8 p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-2">Apply for this Job</h3>
              <p className="text-xs text-slate-400 mb-4">
                Submit your cover letter and proof of technical capability.
              </p>
              {!isConnected ? (
                <button
                  onClick={connectWallet}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                >
                  Connect Wallet to Apply
                </button>
              ) : (
                <form onSubmit={handleApply} className="space-y-4">
                  <textarea
                    required
                    rows={3}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Describe your experience with GenLayer intelligent contracts and relevant deliverables..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 transition resize-none"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition"
                  >
                    Submit Application
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Applicants List */}
          {applicants.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900/30 border border-slate-800 text-slate-500 text-xs">
              No applications submitted yet.
            </div>
          ) : (
            <div className="space-y-4">
              {applicants.map((app, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-mono font-bold text-xs text-slate-200">
                        {truncateAddress(app.applicant_address, 4)}
                      </span>
                      <a
                        href={`${EXPLORER_URL}/address/${app.applicant_address}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:text-emerald-300"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                      {app.cover_letter}
                    </p>
                  </div>

                  {isClient && (
                    <button
                      onClick={() => handleHire(app.applicant_address)}
                      className="self-start sm:self-auto px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition whitespace-nowrap"
                    >
                      Hire Candidate
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Deliverable Submission Modal */}
      {activeModal === 'submit' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">
              Submit Deliverable for Milestone #{selectedMilestone + 1}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Provide a publicly reachable HTTP URL containing the deliverable artifact (e.g. GitHub repository, raw markdown, or API endpoint).
            </p>

            <form onSubmit={handleSubmitDeliverable} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Evidence Artifact URL
                </label>
                <input
                  type="url"
                  required
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  placeholder="https://raw.githubusercontent.com/.../README.md"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 transition font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Submission Notes
                </label>
                <textarea
                  rows={3}
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  placeholder="Summarize completed criteria and verification instructions..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 transition resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
                >
                  Submit On-Chain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {activeModal === 'dispute' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">
              Raise Dispute on Milestone #{selectedMilestone + 1}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Escalate this milestone to GenLayer AI Intelligent Arbitration. Escrow funds will remain locked until consensus resolution.
            </p>

            <form onSubmit={handleRaiseDispute} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Dispute Reason & Evidence
                </label>
                <textarea
                  required
                  rows={4}
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Detail the failure of criteria, breach of specifications, or lack of deliverables..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500/60 transition resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20"
                >
                  Confirm & Lock Escrow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
