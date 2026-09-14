# ProofHireX 🛡️

> **Production-Grade Autonomous Web3 Escrow & AI Milestone Verification Protocol for the GenLayer Ecosystem**

ProofHireX is an autonomous, decentralized protocol for trustless freelance, contractor, and grant milestone management. It completely eliminates human escrow intermediaries by utilizing **GenLayer Intelligent Contracts** to fetch deliverables from the public web, evaluate fulfillment against acceptance criteria, and execute native currency releases through validator AI consensus.

---

## 🚀 Live StudioNet Deployment

* **Network:** GenLayer StudioNet (Chain ID: `61999`)
* **RPC Endpoint:** `https://studio.genlayer.com/api`
* **Pinned GenVM Runner:** `py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6`
* **Contract Address:** [`0x24cA909D9fa2a680F4a8004A5EB15e78a20e4d64`](https://genlayer-explorer.vercel.app/address/0x24cA909D9fa2a680F4a8004A5EB15e78a20e4d64)
* **Deployment Tx:** [`0x4778f0408dc876fa52198157de90c94721f075498f299945c590e1a5bf85e66d`](https://genlayer-explorer.vercel.app/transactions/0x4778f0408dc876fa52198157de90c94721f075498f299945c590e1a5bf85e66d)
* **Consensus Status:** `ACCEPTED` / `MAJORITY_AGREE`

---

## 🔒 Architectural & Invariant Guarantees

1. **Deterministic Multi-Milestone Escrow:**
   Every job requires explicit milestones whose allocation percentages sum to exactly 100%. Native GEN is locked upfront upon job creation.
2. **Escrow Conservation Invariant:**
   `total_deposited = total_remaining_escrow + total_released_escrow`. Funds cannot leak or be trapped.
3. **Pull-Over-Push Native Transfers:**
   Milestone releases and dispute resolutions credit the beneficiary's withdrawable balance in storage. The beneficiary calls `withdraw()`, which zeroes out the storage balance before executing `emit_transfer()`, rendering reentrancy attacks impossible.
4. **Bounded AI Status Schema:**
   AI evaluations return bounded result codes (`0=PASS`, `1=FETCH_ERROR`, `2=FAILED_CRITERIA`, `3=INCOMPLETE`, `4=INJECTION_ATTEMPT`), preventing validator consensus splits.
5. **Prompt Injection Hardening:**
   All untrusted deliverable submissions and notes are enclosed in XML tags (`<untagged_submission_content>`) with strict instructions to ignore instructions or override attempts.
6. **Decentralized AI Dispute Court:**
   Milestone disputes are adjudicated by validator consensus into three bounded outcomes: `10` (Full Refund to Client), `20` (Full Payout to Freelancer), or `30` (50/50 Escrow Split).

---

## 📂 Project Structure

```
proofhirex/
├── contracts/
│   └── proofhirex.py              # GenLayer Intelligent Contract
├── tests/
│   └── direct/
│       └── test_proofhirex.py     # 12 GenVM direct mode unit tests
├── scripts/
│   ├── deploy.py                  # StudioNet deployment script
│   └── verify_studionet.py        # End-to-end on-chain verification script
├── docs/
│   ├── ARCHITECTURE.md            # Invariant specification & threat models
│   └── DEPLOYMENT_AND_VERIFICATION.md # On-chain hashes & execution receipts
├── frontend/                      # Next.js 15 + Tailwind + genlayer-js
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx           # Protocol landing & invariant monitor
│   │   │   ├── jobs/page.tsx      # Browse & search live StudioNet jobs
│   │   │   ├── jobs/[id]/page.tsx # Job detail, milestones, AI verification
│   │   │   ├── create/page.tsx    # Create job with 3 milestones & escrow
│   │   │   └── dashboard/page.tsx # Pull withdrawals & reputation profile
│   │   ├── components/            # Navbar, Footer, StatusBadge, TxModal
│   │   ├── context/               # Web3 WalletContext
│   │   ├── hooks/                 # useProofHire smart contract hooks
│   │   └── lib/                   # genlayer client, types, and utils
│   ├── package.json
│   ├── tsconfig.json
│   └── vercel.json
├── gltest.config.yaml
└── README.md
```

---

## 🧪 Testing & Verification

### 1. Direct Unit Tests (GenVM Local Mode)
Execute the direct unit test suite:
```bash
pytest tests/direct/test_proofhirex.py -v
```
Output:
```
============================== 12 passed in 2.30s ==============================
```

### 2. GenVM Linter Verification
Verify intelligent contract syntax, storage rules, and runner compatibility:
```bash
genvm-lint check contracts/proofhirex.py --json
```
Output:
```json
{
  "errors": [],
  "methods": 18
}
```

### 3. Real StudioNet On-Chain Verification
Execute the automated end-to-end verification script against the deployed contract:
```bash
python -u scripts/verify_studionet.py
```
Output:
```
[Step 1] Creating Job with 1 GEN escrow deposit and 3 milestones (30/40/30)...
    Tx Hash: 0x503feb94f19a8b4a3801eae80de51f02f6a129de629a0db9411ef16b7ebdf08e
    [OK] Receipt Status: ACCEPTED, Consensus: MAJORITY_AGREE
[Step 2] Freelancer applying for Job...
    Tx Hash: 0xfe42a975ea7274230b4c45a14f3e61ba808b4f3f46853f2d6c7a75e0fd1220b7
    [OK] Receipt Status: ACCEPTED, Consensus: MAJORITY_AGREE
[Step 3] Client hiring Freelancer...
    Tx Hash: 0x58319c3ecda8b49699ac434e589803ea31f14198ff47e9c1a20fb6d89a7db750
    [OK] Receipt Status: ACCEPTED, Consensus: MAJORITY_AGREE
[Step 4] Freelancer submitting deliverable...
    Tx Hash: 0x7ea578679e70df514b959029e5c146fdcb57c0a4364ea36cdaba506594a66343
    [OK] Receipt Status: FINALIZED, Consensus: MAJORITY_AGREE
[Step 5] Client approving and releasing Milestone 0 funds...
    Tx Hash: 0x8fcdca9e59b1ff187fa2a0c6e171f68403f8b6ce8c4f29dc4baab39c98837a7c
    [OK] Receipt Status: ACCEPTED, Consensus: MAJORITY_AGREE
[Step 6] Freelancer withdrawing native balance...
    Tx Hash: 0xe5f9f937237f1675d866ccf7418878cfa5710723e7390e3d7c07825f05f8b0a4
    [OK] Receipt Status: ACCEPTED, Consensus: MAJORITY_AGREE
[PASS] ALL STUDIONET ON-CHAIN VERIFICATION CHECKS PASSED PERFECTLY!
```

---

## 💻 Frontend Development

The frontend is built with Next.js 15, React 19, Tailwind CSS, Lucide icons, and the official `genlayer-js` SDK.

### Run Locally
```bash
cd frontend
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to interact with the deployed contract on StudioNet.

### Production Build
```bash
cd frontend
npm run build
```
Builds an optimized static and dynamic production bundle with zero TypeScript warnings.

### Vercel Deployment
The repository includes a configured `vercel.json`. Push to GitHub and import the `frontend/` directory into Vercel, or run:
```bash
cd frontend
vercel --prod
```
Ensure the environment variables are set:
```
NEXT_PUBLIC_GENLAYER_RPC=https://studio.genlayer.com/api
NEXT_PUBLIC_CONTRACT_ADDRESS=0x24cA909D9fa2a680F4a8004A5EB15e78a20e4d64
NEXT_PUBLIC_CHAIN_ID=61999
NEXT_PUBLIC_EXPLORER_URL=https://genlayer-explorer.vercel.app
```

---

## 📜 Contract Public Methods

| Method | Type | Description |
|---|---|---|
| `create_job(title, description, percentages, descriptions)` | Write (Payable) | Locks native GEN and registers 3 milestones |
| `apply_for_job(job_id, cover_letter)` | Write | Submits freelancer application |
| `hire_freelancer(job_id, freelancer_address)` | Write | Client assigns approved freelancer |
| `submit_milestone_deliverable(job_id, milestone_id, url, notes)` | Write | Freelancer submits artifact URL |
| `verify_milestone_deliverable(job_id, milestone_id)` | Write (AI) | Triggers GenLayer AI consensus verification |
| `approve_milestone_manual(job_id, milestone_id)` | Write | Client manually releases milestone funds |
| `raise_dispute(job_id, milestone_id, reason)` | Write | Freezes milestone in dispute |
| `arbitrate_dispute(job_id, milestone_id)` | Write (AI) | Triggers GenLayer AI court resolution |
| `withdraw()` | Write | Pulls available balance via `emit_transfer` |
| `get_job_count()` | View | Returns total number of jobs |
| `get_job(job_id)` | View | Returns job metadata and accounting |
| `get_milestone(job_id, milestone_id)` | View | Returns milestone details and deliverable state |
| `get_job_applicants(job_id)` | View | Returns candidate applications |
| `get_escrow_invariants()` | View | Audits total deposited, remaining, and released |
| `get_withdrawable_balance(account)` | View | Queries user's pending balance |
| `get_freelancer_reputation(account)` | View | Returns completed milestones & dispute record |

---

## ⚖️ License
MIT
