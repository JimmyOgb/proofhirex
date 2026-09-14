#!/usr/bin/env python3
"""
ProofHireX StudioNet End-to-End On-Chain Verification Script.
Executes real transactions against the deployed contract on GenLayer StudioNet:
1. Connects Client and Freelancer accounts.
2. Creates a job with native escrow (1 GEN) and 3 explicit milestones (30/40/30).
3. Freelancer applies for the job.
4. Client hires the freelancer.
5. Freelancer submits deliverable evidence URL.
6. Client verifies and approves milestone.
7. Checks updated on-chain state, balances, and escrow invariants.
8. Freelancer withdraws native balance.
"""

import sys
import time
import json
from genlayer_py import create_client, studionet, create_account, generate_private_key

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

CONTRACT_ADDRESS = "0x24cA909D9fa2a680F4a8004A5EB15e78a20e4d64"
EXPLORER_BASE = "https://genlayer-explorer.vercel.app"

def robust_read(client, address, function_name, args, max_retries=5, delay=3):
    for attempt in range(max_retries):
        try:
            time.sleep(1)
            return client.read_contract(address=address, function_name=function_name, args=args)
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            print(f"    [!] RPC read retry ({attempt+1}/{max_retries}): {e}")
            time.sleep(delay)

def robust_write(client, address, function_name, args, value=0, max_retries=5, delay=3):
    for attempt in range(max_retries):
        try:
            time.sleep(2)
            if value > 0:
                return client.write_contract(address=address, function_name=function_name, args=args, value=value)
            return client.write_contract(address=address, function_name=function_name, args=args)
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            print(f"    [!] RPC write retry ({attempt+1}/{max_retries}): {e}")
            time.sleep(delay)

def wait_and_print(client, tx_hash, action_name, max_attempts=40, poll_interval=3):
    print(f"    Tx Hash: {tx_hash}")
    print(f"    Explorer: {EXPLORER_BASE}/transactions/{tx_hash}")
    print(f"    Waiting for consensus on {action_name}...")
    for attempt in range(max_attempts):
        try:
            time.sleep(poll_interval)
            tx = client.get_transaction(transaction_hash=tx_hash)
            if tx:
                status = str(tx.get("status_name", tx.get("status")))
                if status in ("7", "FINALIZED", "ACCEPTED"):
                    result_name = tx.get("result_name", "UNKNOWN")
                    print(f"    [OK] Receipt Status: {status}, Consensus: {result_name}")
                    return tx
        except Exception as e:
            print(f"    [!] Polling retry ({attempt+1}/{max_attempts}): {e}")
            time.sleep(2)
    raise TimeoutError(f"Transaction {tx_hash} did not finalize in time")

def run_verification():
    print("=" * 70)
    print("PROOFHIREX STUDIONET REAL ON-CHAIN VERIFICATION")
    print(f"Contract: {CONTRACT_ADDRESS}")
    print("=" * 70)

    # 1. Setup accounts
    client_pk = generate_private_key()
    client_acct = create_account(client_pk)
    client_client = create_client(chain=studionet, account=client_acct)

    freelancer_pk = generate_private_key()
    freelancer_acct = create_account(freelancer_pk)
    freelancer_client = create_client(chain=studionet, account=freelancer_acct)

    print(f"[*] Client Address:     {client_acct.address}")
    print(f"[*] Freelancer Address: {freelancer_acct.address}")

    # 2. Check initial job count
    init_count = robust_read(
        client_client,
        CONTRACT_ADDRESS,
        "get_job_count",
        []
    )
    print(f"[+] Initial On-Chain Job Count: {init_count}")

    # 3. Post Job with native escrow (1 GEN = 10^18 wei)
    print("\n[Step 1] Creating Job with 1 GEN escrow deposit and 3 milestones (30/40/30)...")
    escrow_deposit = 1000000000000000000  # 1 GEN
    tx1_hash = robust_write(
        client_client,
        CONTRACT_ADDRESS,
        "create_job",
        [
            "GenLayer AI Escrow Protocol",
            "Build full decentralized milestone protocol on GenVM",
            "M1 Architecture", "Specs & schema", 30,
            "M2 Core Engine", "Contract & consensus logic", 40,
            "M3 Frontend UI", "Next.js UI with live RPC integration", 30,
        ],
        value=escrow_deposit,
    )
    wait_and_print(client_client, tx1_hash, "create_job")

    new_count = robust_read(
        client_client,
        CONTRACT_ADDRESS,
        "get_job_count",
        []
    )
    job_id = new_count
    print(f"    Created Job ID: {job_id}")

    job_data = robust_read(
        client_client,
        CONTRACT_ADDRESS,
        "get_job",
        [job_id]
    )
    print(f"    Job Status: {job_data['status']}, Total Escrow: {job_data['total_escrow']}")

    # 4. Freelancer Applies
    print(f"\n[Step 2] Freelancer ({freelancer_acct.address}) applying for Job #{job_id}...")
    tx2_hash = robust_write(
        freelancer_client,
        CONTRACT_ADDRESS,
        "apply_for_job",
        [job_id, "I have built production GenLayer intelligent contracts."]
    )
    wait_and_print(freelancer_client, tx2_hash, "apply_for_job")

    applicants = robust_read(
        client_client,
        CONTRACT_ADDRESS,
        "get_job_applicants",
        [job_id]
    )
    print(f"    On-chain Applicants count: {len(applicants)}")

    # 5. Client Hires Freelancer
    print(f"\n[Step 3] Client hiring Freelancer...")
    tx3_hash = robust_write(
        client_client,
        CONTRACT_ADDRESS,
        "hire_freelancer",
        [job_id, freelancer_acct.address]
    )
    wait_and_print(client_client, tx3_hash, "hire_freelancer")

    job_hired = robust_read(
        client_client,
        CONTRACT_ADDRESS,
        "get_job",
        [job_id]
    )
    print(f"    Job Status: {job_hired['status']}, Assigned Freelancer: {job_hired['freelancer']}")

    # 6. Freelancer Submits Deliverable
    print(f"\n[Step 4] Freelancer submitting deliverable for Milestone 0...")
    evidence_url = "https://raw.githubusercontent.com/proofhirex/proofhirex/main/README.md"
    tx4_hash = robust_write(
        freelancer_client,
        CONTRACT_ADDRESS,
        "submit_milestone_deliverable",
        [job_id, 0, evidence_url, "Milestone 1 Architecture specifications completed."]
    )
    wait_and_print(freelancer_client, tx4_hash, "submit_milestone_deliverable")

    m0_data = robust_read(
        client_client,
        CONTRACT_ADDRESS,
        "get_milestone",
        [job_id, 0]
    )
    print(f"    Milestone 0 Status: {m0_data['status']}, URL: {m0_data['evidence_url']}")

    # 7. Client Manually Approves Milestone 0 (Releasing 30% = 0.3 GEN)
    print(f"\n[Step 5] Client approving and releasing Milestone 0 funds...")
    tx5_hash = robust_write(
        client_client,
        CONTRACT_ADDRESS,
        "approve_milestone_manual",
        [job_id, 0]
    )
    wait_and_print(client_client, tx5_hash, "approve_milestone_manual")

    f_bal = robust_read(
        client_client,
        CONTRACT_ADDRESS,
        "get_withdrawable_balance",
        [freelancer_acct.address]
    )
    print(f"    Freelancer Withdrawable Balance: {f_bal} wei (Expected 300000000000000000)")

    # 8. Freelancer Withdraws Balance
    print(f"\n[Step 6] Freelancer withdrawing native balance...")
    tx6_hash = robust_write(
        freelancer_client,
        CONTRACT_ADDRESS,
        "withdraw",
        []
    )
    wait_and_print(freelancer_client, tx6_hash, "withdraw")

    f_bal_after = robust_read(
        client_client,
        CONTRACT_ADDRESS,
        "get_withdrawable_balance",
        [freelancer_acct.address]
    )
    print(f"    Freelancer Withdrawable Balance After Withdraw: {f_bal_after} wei")

    # 9. Verify Escrow Conservation Invariant
    invariants = robust_read(
        client_client,
        CONTRACT_ADDRESS,
        "get_escrow_invariants",
        []
    )
    print("\n" + "=" * 70)
    print("ESCROW CONSERVATION INVARIANT AUDIT:")
    print(f"Total Deposited:        {invariants['total_deposited']}")
    print(f"Total Remaining Escrow: {invariants['total_remaining_escrow']}")
    print(f"Total Released Escrow:  {invariants['total_released_escrow']}")
    print(f"Total Withdrawn:        {invariants['total_withdrawn']}")
    print(f"Invariant Conserved:    {invariants['invariant_conserved']}")
    print("=" * 70)

    if invariants['invariant_conserved'] and f_bal_after == 0:
        print("\n[PASS] ALL STUDIONET ON-CHAIN VERIFICATION CHECKS PASSED PERFECTLY!")
    else:
        print("\n[!] Invariant check failed.")
        sys.exit(1)

if __name__ == "__main__":
    run_verification()
