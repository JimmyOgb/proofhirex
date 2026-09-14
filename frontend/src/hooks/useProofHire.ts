'use client';

import { useState, useCallback } from 'react';
import {
  robustReadContract,
  getWriteClient,
  PROOFHIREX_CONTRACT_ADDRESS,
  readClient,
  TransactionStatus,
  ExecutionResult,
} from '@/lib/genlayer';
import { useWallet } from '@/context/WalletContext';
import { Job, Milestone, Applicant, EscrowInvariants, FreelancerReputation } from '@/lib/types';

export interface TxFeedback {
  active: boolean;
  action: string;
  txHash: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'FINALIZED' | 'SUCCESS' | 'ERROR';
  consensusResult?: string;
  error?: string;
}

export function useProofHire() {
  const { account } = useWallet();
  const [txFeedback, setTxFeedback] = useState<TxFeedback>({
    active: false,
    action: '',
    txHash: null,
    status: 'PENDING',
  });

  const clearTxFeedback = useCallback(() => {
    setTxFeedback({ active: false, action: '', txHash: null, status: 'PENDING' });
  }, []);

  // --- READS ---

  const getJobCount = useCallback(async (): Promise<number> => {
    const count = await robustReadContract<number>('get_job_count', []);
    return Number(count);
  }, []);

  const getJob = useCallback(async (jobId: number): Promise<Job> => {
    const job = await robustReadContract<Job>('get_job', [jobId]);
    return job;
  }, []);

  const getMilestone = useCallback(async (jobId: number, milestoneId: number): Promise<Milestone> => {
    const m = await robustReadContract<Milestone>('get_milestone', [jobId, milestoneId]);
    return m;
  }, []);

  const getJobMilestones = useCallback(async (jobId: number, count: number): Promise<Milestone[]> => {
    const milestones: Milestone[] = [];
    for (let i = 0; i < count; i++) {
      const m = await robustReadContract<Milestone>('get_milestone', [jobId, i]);
      milestones.push(m);
    }
    return milestones;
  }, []);

  const getJobApplicants = useCallback(async (jobId: number): Promise<Applicant[]> => {
    const applicants = await robustReadContract<Applicant[]>('get_job_applicants', [jobId]);
    return applicants || [];
  }, []);

  const getAllJobs = useCallback(async (): Promise<Job[]> => {
    const count = await getJobCount();
    const jobs: Job[] = [];
    // Fetch newest to oldest
    for (let i = count; i >= 1; i--) {
      try {
        const j = await getJob(i);
        if (j && j.title) {
          jobs.push(j);
        }
      } catch (err) {
        console.warn(`Failed reading job #${i}:`, err);
      }
    }
    return jobs;
  }, [getJobCount, getJob]);

  const getEscrowInvariants = useCallback(async (): Promise<EscrowInvariants> => {
    const inv = await robustReadContract<EscrowInvariants>('get_escrow_invariants', []);
    return inv;
  }, []);

  const getWithdrawableBalance = useCallback(async (targetAccount?: string): Promise<string> => {
    const acct = targetAccount || account;
    if (!acct) return '0';
    const bal = await robustReadContract<string | number | bigint>('get_withdrawable_balance', [acct]);
    return bal.toString();
  }, [account]);

  const getFreelancerReputation = useCallback(async (targetAccount?: string): Promise<FreelancerReputation> => {
    const acct = targetAccount || account;
    if (!acct) {
      return { completed_milestones: 0, disputes_won: 0, disputes_lost: 0, total_earned: '0' };
    }
    const rep = await robustReadContract<FreelancerReputation>('get_freelancer_reputation', [acct]);
    return rep;
  }, [account]);

  // --- WRITES ---

  const executeWrite = async (
    actionName: string,
    functionName: string,
    args: any[],
    valueWei: bigint = 0n
  ): Promise<{ txHash: string; receipt: any }> => {
    if (!account) throw new Error('Please connect your Web3 wallet first.');

    setTxFeedback({
      active: true,
      action: actionName,
      txHash: null,
      status: 'PENDING',
    });

    try {
      const writeClient = getWriteClient(account);
      const txHash = await writeClient.writeContract({
        address: PROOFHIREX_CONTRACT_ADDRESS,
        functionName,
        args,
        value: valueWei,
      });

      setTxFeedback({
        active: true,
        action: actionName,
        txHash,
        status: 'PENDING',
      });

      // Poll until receipt is accepted or finalized
      const receipt = await readClient.waitForTransactionReceipt({
        hash: txHash,
        status: TransactionStatus.ACCEPTED,
        retries: 40,
        interval: 3000,
      });

      const consensus = (receipt as any).txExecutionResultName || (receipt as any).result_name || 'ACCEPTED';

      setTxFeedback({
        active: true,
        action: actionName,
        txHash,
        status: 'SUCCESS',
        consensusResult: consensus,
      });

      return { txHash, receipt };
    } catch (err: any) {
      const msg = err?.message || 'Transaction failed or rejected';
      setTxFeedback({
        active: true,
        action: actionName,
        txHash: null,
        status: 'ERROR',
        error: msg,
      });
      throw err;
    }
  };

  const createJob = async (
    title: string,
    description: string,
    milestonePercentages: number[],
    milestoneDescriptions: string[],
    depositWei: bigint
  ) => {
    return executeWrite(
      'Create Job with Escrow',
      'create_job',
      [title, description, milestonePercentages, milestoneDescriptions],
      depositWei
    );
  };

  const applyForJob = async (jobId: number, coverLetter: string) => {
    return executeWrite(
      `Apply for Job #${jobId}`,
      'apply_for_job',
      [jobId, coverLetter]
    );
  };

  const hireFreelancer = async (jobId: number, freelancerAddress: string) => {
    return executeWrite(
      `Hire Freelancer for Job #${jobId}`,
      'hire_freelancer',
      [jobId, freelancerAddress]
    );
  };

  const submitDeliverable = async (
    jobId: number,
    milestoneId: number,
    evidenceUrl: string,
    submissionNotes: string
  ) => {
    return executeWrite(
      `Submit Deliverable (Milestone #${milestoneId + 1})`,
      'submit_milestone_deliverable',
      [jobId, milestoneId, evidenceUrl, submissionNotes]
    );
  };

  const verifyMilestoneDeliverable = async (jobId: number, milestoneId: number) => {
    return executeWrite(
      `Trigger GenLayer AI Consensus Verification (Milestone #${milestoneId + 1})`,
      'verify_milestone_deliverable',
      [jobId, milestoneId]
    );
  };

  const approveMilestoneManual = async (jobId: number, milestoneId: number) => {
    return executeWrite(
      `Approve & Release Milestone #${milestoneId + 1}`,
      'approve_milestone_manual',
      [jobId, milestoneId]
    );
  };

  const raiseDispute = async (jobId: number, milestoneId: number, reason: string) => {
    return executeWrite(
      `Raise Dispute on Milestone #${milestoneId + 1}`,
      'raise_dispute',
      [jobId, milestoneId, reason]
    );
  };

  const arbitrateDispute = async (jobId: number, milestoneId: number) => {
    return executeWrite(
      `Trigger GenLayer AI Intelligent Arbitration (Milestone #${milestoneId + 1})`,
      'arbitrate_dispute',
      [jobId, milestoneId]
    );
  };

  const withdraw = async () => {
    return executeWrite(
      'Withdraw Available Balance',
      'withdraw',
      []
    );
  };

  return {
    account,
    txFeedback,
    clearTxFeedback,
    getJobCount,
    getJob,
    getMilestone,
    getJobMilestones,
    getJobApplicants,
    getAllJobs,
    getEscrowInvariants,
    getWithdrawableBalance,
    getFreelancerReputation,
    createJob,
    applyForJob,
    hireFreelancer,
    submitDeliverable,
    verifyMilestoneDeliverable,
    approveMilestoneManual,
    raiseDispute,
    arbitrateDispute,
    withdraw,
  };
}
