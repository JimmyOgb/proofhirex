# ProofHireX Deployment & StudioNet Verification Report

## 1. Network & Contract Identity

* **Network:** GenLayer StudioNet
* **Chain ID:** `61999`
* **RPC Endpoint:** `https://studio.genlayer.com/api`
* **Pinned GenVM Runner:** `py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6`
* **Block Explorer:** [https://genlayer-explorer.vercel.app](https://genlayer-explorer.vercel.app)
* **Deployed Contract Address:** `0x24cA909D9fa2a680F4a8004A5EB15e78a20e4d64`
* **Contract Deployer:** `0xe4220c4b71877bb94eb173f467ef5c5557017085`
* **Deployment Tx Hash:** `0x4778f0408dc876fa52198157de90c94721f075498f299945c590e1a5bf85e66d`
* **Deployment Status:** `ACCEPTED` / `MAJORITY_AGREE`

---

## 2. Direct Mode Test Suite Execution

All 12 intelligent contract unit tests passed using GenVM direct mode in **2.30 seconds**:

```
tests/direct/test_proofhirex.py::test_create_job_rejection_zero_deposit PASSED   [  8%]
tests/direct/test_proofhirex.py::test_create_job_rejection_invalid_percentages PASSED [ 16%]
tests/direct/test_proofhirex.py::test_create_job_success_3_milestones PASSED     [ 25%]
tests/direct/test_proofhirex.py::test_apply_and_hire_freelancer PASSED           [ 33%]
tests/direct/test_proofhirex.py::test_hire_unauthorized_rejection PASSED         [ 41%]
tests/direct/test_proofhirex.py::test_approve_milestone_manual PASSED            [ 50%]
tests/direct/test_proofhirex.py::test_cannot_double_approve_milestone PASSED     [ 58%]
tests/direct/test_proofhirex.py::test_verify_milestone_deliverable_pass_and_release PASSED [ 66%]
tests/direct/test_proofhirex.py::test_verify_milestone_prompt_injection_defense PASSED [ 75%]
tests/direct/test_proofhirex.py::test_dispute_and_arbitration_refund PASSED      [ 83%]
tests/direct/test_proofhirex.py::test_dispute_and_arbitration_split_50_50 PASSED [ 91%]
tests/direct/test_proofhirex.py::test_withdraw_pull_over_push PASSED             [100%]

============================== 12 passed in 2.30s ==============================
```

---

## 3. Real StudioNet On-Chain End-to-End Verification

The complete protocol lifecycle was verified on GenLayer StudioNet using `scripts/verify_studionet.py`. Every write transaction achieved confirmed validator consensus (`MAJORITY_AGREE`):

| Step | Action | Transaction Hash | Consensus | Result |
|---|---|---|---|---|
| **Step 1** | `create_job` (1 GEN deposit, 3 milestones 30/40/30) | `0x503feb94f19a8b4a3801eae80de51f02f6a129de629a0db9411ef16b7ebdf08e` | `MAJORITY_AGREE` | Job #5 created, status `OPEN` |
| **Step 2** | `apply_for_job` | `0xfe42a975ea7274230b4c45a14f3e61ba808b4f3f46853f2d6c7a75e0fd1220b7` | `MAJORITY_AGREE` | Applicant recorded |
| **Step 3** | `hire_freelancer` | `0x58319c3ecda8b49699ac434e589803ea31f14198ff47e9c1a20fb6d89a7db750` | `MAJORITY_AGREE` | Job status updated to `IN_PROGRESS` |
| **Step 4** | `submit_milestone_deliverable` | `0x7ea578679e70df514b959029e5c146fdcb57c0a4364ea36cdaba506594a66343` | `MAJORITY_AGREE` | Milestone 0 status `SUBMITTED` |
| **Step 5** | `approve_milestone_manual` | `0x8fcdca9e59b1ff187fa2a0c6e171f68403f8b6ce8c4f29dc4baab39c98837a7c` | `MAJORITY_AGREE` | 0.3 GEN released to withdrawable balance |
| **Step 6** | `withdraw` | `0xe5f9f937237f1675d866ccf7418878cfa5710723e7390e3d7c07825f05f8b0a4` | `MAJORITY_AGREE` | 0.3 GEN native transfer executed |

### Escrow Conservation Invariant Audit Result
```
======================================================================
ESCROW CONSERVATION INVARIANT AUDIT:
Total Deposited:        5000000000000000000 wei (5.0 GEN)
Total Remaining Escrow: 4700000000000000000 wei (4.7 GEN)
Total Released Escrow:   300000000000000000 wei (0.3 GEN)
Total Withdrawn:         300000000000000000 wei (0.3 GEN)
Invariant Conserved:    True
======================================================================
[PASS] ALL STUDIONET ON-CHAIN VERIFICATION CHECKS PASSED PERFECTLY!
```
