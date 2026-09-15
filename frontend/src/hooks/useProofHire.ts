'use client';

import { useState, useCallback, useRef } from 'react';
import {
  robustReadContract,
  getWriteClient,
  PROOFHIREX_CONTRACT_ADDRESS,
  readClient,
  TransactionStatus,
  CHAIN_ID,
  NETWORK_NAME,
} from '@/lib/genlayer';
import { useWallet } from '@/context/WalletContext';
import {
  Job,
  Milestone,
  Applicant,
  EscrowInvariants,
  UserReputation,
  TxFeedback,
  TxPrompt,
} from '@/lib/types';

export function useProofHire() {
  const { account } = useWallet();

  const [txPrompt, setTxPrompt] = useState<TxPrompt | null>(null);
  const pendingActionRef = useRef<(() => Promise<any>) | null>(null);

  const [txFeedback, setTxFeedback] = useState<TxFeedback>({
    active: false,
    action: '',
    txHash: null,
    status: 'PENDING',
  });

  const clearTxFeedback = useCallback(() => {
    setTxFeedback({ active: false, action: '', txHash: null, status: 'PENDING' });
  }, []);

  const cancelPendingTx = useCallback(() => {
    setTxPrompt(null);
    pendingActionRef.current = null;
  }, []);

  const confirmPendingTx = useCallback(async () => {
    const action = pendingActionRef.current;
    setTxPrompt(null);
    pendingActionRef.current = null;
    if (action) {
      await action();
    }
  }, []);

  // --- ON-CHAIN READ CALLS ---

  const getJobCount = useCallback(async (): Promise<number> => {
    const count = await robustReadContract<number | string>('get_job_count', []);
    return Number(count);
  }, []);

  const getJob = useCallback(async (jobId: number): Promise<Job> => {
    const job = await robustReadContract<Job>('get_job', [jobId]);
    return job;
  }, []);

  const getMilestone = useCallback(async (jobId: number, milestoneIdx: number): Promise<Milestone> => {
    const m = await robustReadContract<Milestone>('get_milestone', [jobId, milestoneIdx]);
    return m;
  }, []);

  const getJobMilestones = useCallback(async (jobId: number): Promise<Milestone[]> => {
    try {
      const ms = await robustReadContract<Milestone[]>('get_job_milestones', [jobId]);
      return ms || [];
    } catch (err) {
      console.warn(`Failed reading get_job_milestones for #${jobId}, falling back to per-milestone read:`, err);
      const list: Milestone[] = [];
      for (let i = 0; i < 3; i++) {
        try {
          const m = await getMilestone(jobId, i);
          list.push(m);
        } catch {
          break;
        }
      }
      return list;
    }
  }, [getMilestone]);

  const getJobApplicants = useCallback(async (jobId: number): Promise<Applicant[]> => {
    const applicants = await robustReadContract<Applicant[]>('get_job_applicants', [jobId]);
    return applicants || [];
  }, []);

  const getAllJobs = useCallback(async (): Promise<Job[]> => {
    try {
      const count = await getJobCount();
      if (count === 0) return [];

      // Try get_all_jobs batch view first
      try {
        const batch = await robustReadContract<Job[]>('get_all_jobs', [0, count]);
        if (batch && Array.isArray(batch) && batch.length > 0) {
          return [...batch].reverse();
        }
      } catch (batchErr) {
        console.warn('Batch get_all_jobs call fell back to individual reads:', batchErr);
      }

      // Fallback to individual sequential reads
      const jobs: Job[] = [];
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
    } catch (err) {
      console.error('Failed fetching all jobs:', err);
      return [];
    }
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

  const getReputation = useCallback(async (targetAccount?: string): Promise<UserReputation> => {
    const acct = targetAccount || account;
    if (!acct) {
      return {
        jobs_completed: 0,
        milestones_delivered: 0,
        disputes_won: 0,
        disputes_lost: 0,
        total_earned: '0',
        total_spent: '0',
      };
    }
    const rep = await robustReadContract<UserReputation>('get_reputation', [acct]);
    return rep;
  }, [account]);

  // --- EXPLICIT ON-CHAIN WRITE EXECUTION ---

  /**
   * Directly executes on-chain transaction after user confirmation in UI.
   * Waits for the REAL consensus receipt on StudioNet.
   */
  const executeConfirmedWrite = async (
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

      // Poll until the real receipt is accepted or finalized on StudioNet
      const receipt = await readClient.waitForTransactionReceipt({
        hash: txHash,
        status: TransactionStatus.ACCEPTED,
        retries: 45,
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
      const msg = err?.message || 'Transaction failed or was rejected by user';
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

  /**
   * Prompts user with pre-transaction details modal before triggering wallet.
   */
  const promptAndExecute = (
    promptDetails: Omit<TxPrompt, 'network' | 'chainId' | 'contractAddress'>,
    executeFn: () => Promise<any>
  ) => {
    setTxPrompt({
      ...promptDetails,
      network: NETWORK_NAME,
      chainId: CHAIN_ID,
      contractAddress: PROOFHIREX_CONTRACT_ADDRESS,
    });
    pendingActionRef.current = executeFn;
  };

  // 1. create_job (payable) - 11 contract arguments
  const createJob = (
    title: string,
    description: string,
    m0_title: string,
    m0_desc: string,
    m0_pct: number,
    m1_title: string,
    m1_desc: string,
    m1_pct: number,
    m2_title: string,
    m2_desc: string,
    m2_pct: number,
    depositWei: bigint
  ) => {
    return new Promise<{ txHash: string; receipt: any }>((resolve, reject) => {
      promptAndExecute(
        {
          actionTitle: 'Create Job with Native Escrow',
          functionName: 'create_job',
          args: [
            title,
            description,
            m0_title,
            m0_desc,
            m0_pct,
            m1_title,
            m1_desc,
            m1_pct,
            m2_title,
            m2_desc,
            m2_pct,
          ],
          nativeValueWei: depositWei,
          explanation: `Locks ${Number(depositWei) / 1e18} GEN into the ProofHireX contract escrow. The escrow will be strictly partitioned into 3 milestones (${m0_pct}%, ${m1_pct}%, ${m2_pct}%).`,
        },
        async () => {
          try {
            const res = await executeConfirmedWrite(
              'Create Job with Escrow',
              'create_job',
              [
                title,
                description,
                m0_title,
                m0_desc,
                m0_pct,
                m1_title,
                m1_desc,
                m1_pct,
                m2_title,
                m2_desc,
                m2_pct,
              ],
              depositWei
            );
            resolve(res);
          } catch (e) {
            reject(e);
          }
        }
      );
    });
  };

  // 2. apply_for_job - 2 arguments
  const applyForJob = (jobId: number, proposal: string) => {
    return new Promise<{ txHash: string; receipt: any }>((resolve, reject) => {
      promptAndExecute(
        {
          actionTitle: `Apply for Job #${jobId}`,
          functionName: 'apply_for_job',
          args: [jobId, proposal],
          nativeValueWei: 0n,
          explanation: `Submits proposal on-chain for Job #${jobId}. Requires 0 GEN.`,
        },
        async () => {
          try {
            const res = await executeConfirmedWrite(
              `Apply for Job #${jobId}`,
              'apply_for_job',
              [jobId, proposal]
            );
            resolve(res);
          } catch (e) {
            reject(e);
          }
        }
      );
    });
  };

  // 3. hire_freelancer - 2 arguments
  const hireFreelancer = (jobId: number, freelancerAddress: string) => {
    return new Promise<{ txHash: string; receipt: any }>((resolve, reject) => {
      promptAndExecute(
        {
          actionTitle: `Hire Freelancer for Job #${jobId}`,
          functionName: 'hire_freelancer',
          args: [jobId, freelancerAddress],
          nativeValueWei: 0n,
          explanation: `Assigns freelancer (${freelancerAddress.slice(0, 10)}...) to Job #${jobId} and moves status to IN_PROGRESS.`,
        },
        async () => {
          try {
            const res = await executeConfirmedWrite(
              `Hire Freelancer for Job #${jobId}`,
              'hire_freelancer',
              [jobId, freelancerAddress]
            );
            resolve(res);
          } catch (e) {
            reject(e);
          }
        }
      );
    });
  };

  // 4. submit_milestone_deliverable - 4 arguments
  const submitDeliverable = (
    jobId: number,
    milestoneIdx: number,
    evidenceUrl: string,
    notes: string
  ) => {
    return new Promise<{ txHash: string; receipt: any }>((resolve, reject) => {
      promptAndExecute(
        {
          actionTitle: `Submit Milestone #${milestoneIdx + 1} Deliverable`,
          functionName: 'submit_milestone_deliverable',
          args: [jobId, milestoneIdx, evidenceUrl, notes],
          nativeValueWei: 0n,
          explanation: `Submits external evidence URL (${evidenceUrl.slice(0, 35)}...) and delivery notes for decentralized verification.`,
        },
        async () => {
          try {
            const res = await executeConfirmedWrite(
              `Submit Milestone #${milestoneIdx + 1} Deliverable`,
              'submit_milestone_deliverable',
              [jobId, milestoneIdx, evidenceUrl, notes]
            );
            resolve(res);
          } catch (e) {
            reject(e);
          }
        }
      );
    });
  };

  // 5. verify_milestone_deliverable - 2 arguments
  const verifyMilestoneDeliverable = (jobId: number, milestoneIdx: number) => {
    return new Promise<{ txHash: string; receipt: any }>((resolve, reject) => {
      promptAndExecute(
        {
          actionTitle: `Run AI Validator Consensus (Milestone #${milestoneIdx + 1})`,
          functionName: 'verify_milestone_deliverable',
          args: [jobId, milestoneIdx],
          nativeValueWei: 0n,
          explanation: `Triggers GenLayer AI validator consensus. Validators fetch external evidence, inspect for prompt injections, evaluate acceptance criteria, and auto-release escrow if status is PASS (code 0).`,
        },
        async () => {
          try {
            const res = await executeConfirmedWrite(
              `Run AI Validator Consensus (Milestone #${milestoneIdx + 1})`,
              'verify_milestone_deliverable',
              [jobId, milestoneIdx]
            );
            resolve(res);
          } catch (e) {
            reject(e);
          }
        }
      );
    });
  };

  // 6. approve_milestone_manual - 2 arguments
  const approveMilestoneManual = (jobId: number, milestoneIdx: number) => {
    return new Promise<{ txHash: string; receipt: any }>((resolve, reject) => {
      promptAndExecute(
        {
          actionTitle: `Client Manual Approval (Milestone #${milestoneIdx + 1})`,
          functionName: 'approve_milestone_manual',
          args: [jobId, milestoneIdx],
          nativeValueWei: 0n,
          explanation: `Client manually approves deliverable and releases the milestone escrow payment to the freelancer's withdrawable balance.`,
        },
        async () => {
          try {
            const res = await executeConfirmedWrite(
              `Approve & Release Milestone #${milestoneIdx + 1}`,
              'approve_milestone_manual',
              [jobId, milestoneIdx]
            );
            resolve(res);
          } catch (e) {
            reject(e);
          }
        }
      );
    });
  };

  // 7. raise_dispute - 3 arguments
  const raiseDispute = (jobId: number, milestoneIdx: number, reason: string) => {
    return new Promise<{ txHash: string; receipt: any }>((resolve, reject) => {
      promptAndExecute(
        {
          actionTitle: `Raise Dispute (Milestone #${milestoneIdx + 1})`,
          functionName: 'raise_dispute',
          args: [jobId, milestoneIdx, reason],
          nativeValueWei: 0n,
          explanation: `Escalates active milestone to DISPUTED status. Halts standard payout and prepares the job for autonomous arbitration.`,
        },
        async () => {
          try {
            const res = await executeConfirmedWrite(
              `Raise Dispute on Milestone #${milestoneIdx + 1}`,
              'raise_dispute',
              [jobId, milestoneIdx, reason]
            );
            resolve(res);
          } catch (e) {
            reject(e);
          }
        }
      );
    });
  };

  // 8. arbitrate_dispute - 1 argument (jobId only!)
  const arbitrateDispute = (jobId: number) => {
    return new Promise<{ txHash: string; receipt: any }>((resolve, reject) => {
      promptAndExecute(
        {
          actionTitle: `Trigger AI Autonomous Arbitration Court (Job #${jobId})`,
          functionName: 'arbitrate_dispute',
          args: [jobId],
          nativeValueWei: 0n,
          explanation: `Dispatches dispute to GenLayer AI Arbitration Court. Validators evaluate evidence and dispute reason, arriving at an unalterable ruling: Full Refund (10), Full Payout (20), or 50/50 Split (30).`,
        },
        async () => {
          try {
            const res = await executeConfirmedWrite(
              `Trigger GenLayer AI Arbitration (Job #${jobId})`,
              'arbitrate_dispute',
              [jobId]
            );
            resolve(res);
          } catch (e) {
            reject(e);
          }
        }
      );
    });
  };

  // 9. withdraw - 0 arguments
  const withdraw = () => {
    return new Promise<{ txHash: string; receipt: any }>((resolve, reject) => {
      promptAndExecute(
        {
          actionTitle: 'Withdraw Available Native Balance',
          functionName: 'withdraw',
          args: [],
          nativeValueWei: 0n,
          explanation: `Executes pull-over-push native GEN withdrawal. Sets your recorded balance to 0 on-chain before emitting native GEN transfer to your address.`,
        },
        async () => {
          try {
            const res = await executeConfirmedWrite(
              'Withdraw Available Balance',
              'withdraw',
              []
            );
            resolve(res);
          } catch (e) {
            reject(e);
          }
        }
      );
    });
  };

  return {
    account,
    txPrompt,
    txFeedback,
    confirmPendingTx,
    cancelPendingTx,
    clearTxFeedback,
    getJobCount,
    getJob,
    getMilestone,
    getJobMilestones,
    getJobApplicants,
    getAllJobs,
    getEscrowInvariants,
    getWithdrawableBalance,
    getReputation,
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
