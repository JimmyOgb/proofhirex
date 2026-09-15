export type JobStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED';
export type MilestoneStatus = 'PENDING' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED' | 'DISPUTED' | 'RELEASED';

export enum DeliverableVerificationStatus {
  PASS = 0,
  FETCH_ERROR = 1,
  FAILED_CRITERIA = 2,
  INCOMPLETE = 3,
  INJECTION_ATTEMPT = 4,
  UNVERIFIED = 99,
}

export const DELIVERABLE_STATUS_LABELS: Record<number, { label: string; color: string; desc: string }> = {
  0: { label: 'PASS', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30', desc: 'Deliverable strictly fulfills all milestone criteria.' },
  1: { label: 'FETCH_ERROR', color: 'text-amber-400 bg-amber-950/40 border-amber-500/30', desc: 'Evidence URL unreachable, non-200 HTTP code, or invalid URL format.' },
  2: { label: 'FAILED_CRITERIA', color: 'text-rose-400 bg-rose-950/40 border-rose-500/30', desc: 'Deliverable content fails acceptance requirements.' },
  3: { label: 'INCOMPLETE', color: 'text-orange-400 bg-orange-950/40 border-orange-500/30', desc: 'Submission is missing required key deliverables.' },
  4: { label: 'INJECTION_ATTEMPT', color: 'text-purple-400 bg-purple-950/40 border-purple-500/30', desc: 'Hostile prompt injection attempt detected and safely quarantined.' },
  99: { label: 'UNVERIFIED', color: 'text-slate-400 bg-slate-900 border-slate-700', desc: 'Awaiting decentralized AI validator consensus verification.' },
};

export enum DisputeResolutionCode {
  NONE = 0,
  FULL_REFUND_CLIENT = 10,
  FULL_PAYOUT_FREELANCER = 20,
  SPLIT_50_50 = 30,
}

export const DISPUTE_RESOLUTION_LABELS: Record<number, string> = {
  0: 'NONE',
  10: 'FULL REFUND TO CLIENT',
  20: 'FULL PAYOUT TO FREELANCER',
  30: '50/50 ESCROW SPLIT',
};

export interface Job {
  id: number;
  client: string;
  freelancer: string;
  title: string;
  description: string;
  total_escrow: string | number | bigint;
  remaining_escrow: string | number | bigint;
  released_escrow: string | number | bigint;
  status: JobStatus;
  current_milestone: number;
  dispute_reason: string;
  dispute_initiator: string;
  arbitration_code: number;
}

export interface Milestone {
  index: number;
  title: string;
  description: string;
  pct: number;
  amount: string | number | bigint;
  status: MilestoneStatus | string;
  evidence_url: string;
  notes: string;
  verification_code: number;
  verification_risk: number;
  released_amount: string | number | bigint;
}

export interface Applicant {
  applicant: string;
  proposal: string;
}

export interface EscrowInvariants {
  total_deposited: string | number | bigint;
  total_withdrawn: string | number | bigint;
  total_remaining_escrow: string | number | bigint;
  total_released_escrow: string | number | bigint;
  invariant_conserved: boolean;
}

export interface UserReputation {
  jobs_completed: number;
  milestones_delivered: number;
  disputes_won: number;
  disputes_lost: number;
  total_earned: string | number | bigint;
  total_spent: string | number | bigint;
}

export interface TxFeedback {
  active: boolean;
  action: string;
  txHash: string | null;
  status: 'PENDING' | 'SUCCESS' | 'ERROR';
  consensusResult?: string;
  error?: string;
}

export interface TxPrompt {
  actionTitle: string;
  functionName: string;
  args: any[];
  nativeValueWei: bigint;
  explanation: string;
  network: string;
  chainId: string;
  contractAddress: string;
}
