export type JobStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED';
export type MilestoneStatus = 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'DISPUTED' | 'RESOLVED';

export enum DeliverableVerificationStatus {
  PASS = 0,
  FETCH_ERROR = 1,
  FAILED_CRITERIA = 2,
  INCOMPLETE = 3,
  INJECTION_ATTEMPT = 4,
  UNVERIFIED = 99,
}

export const DELIVERABLE_STATUS_LABELS: Record<number, { label: string; color: string; desc: string }> = {
  0: { label: 'PASS', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30', desc: 'Deliverable strictly fulfills all criteria.' },
  1: { label: 'FETCH_ERROR', color: 'text-amber-400 bg-amber-950/40 border-amber-500/30', desc: 'Evidence URL unreachable or non-200 HTTP code.' },
  2: { label: 'FAILED_CRITERIA', color: 'text-rose-400 bg-rose-950/40 border-rose-500/30', desc: 'Deliverable fails acceptance requirements.' },
  3: { label: 'INCOMPLETE', color: 'text-orange-400 bg-orange-950/40 border-orange-500/30', desc: 'Submission is missing required artifacts.' },
  4: { label: 'INJECTION_ATTEMPT', color: 'text-purple-400 bg-purple-950/40 border-purple-500/30', desc: 'Hostile prompt injection payload detected and rejected.' },
  99: { label: 'UNVERIFIED', color: 'text-slate-400 bg-slate-900 border-slate-700', desc: 'Awaiting AI consensus verification.' },
};

export enum DisputeResolutionCode {
  FULL_REFUND = 10,
  FULL_PAYOUT = 20,
  SPLIT_50_50 = 30,
}

export const DISPUTE_RESOLUTION_LABELS: Record<number, string> = {
  10: 'FULL REFUND TO CLIENT',
  20: 'FULL PAYOUT TO FREELANCER',
  30: '50/50 ESCROW SPLIT',
};

export interface Job {
  job_id: number;
  client: string;
  freelancer: string;
  title: string;
  description: string;
  total_escrow: string | number | bigint;
  remaining_escrow: string | number | bigint;
  status: JobStatus;
  created_at: number;
  milestone_count: number;
  active_dispute_milestone: number;
}

export interface Milestone {
  milestone_id: number;
  percentage: number;
  amount: string | number | bigint;
  description: string;
  status: MilestoneStatus;
  evidence_url: string;
  deliverable_hash: string;
  submission_notes: string;
  verification_status: number;
  verification_reason: string;
}

export interface Applicant {
  applicant_address: string;
  cover_letter: string;
  applied_at: number;
}

export interface EscrowInvariants {
  total_deposited: string;
  total_remaining_escrow: string;
  total_released_escrow: string;
  total_withdrawn: string;
  invariant_conserved: boolean;
}

export interface FreelancerReputation {
  completed_milestones: number;
  disputes_won: number;
  disputes_lost: number;
  total_earned: string;
}
