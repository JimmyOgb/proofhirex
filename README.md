# ProofHireX 🛡️

> **Autonomous Web3 Escrow & AI Milestone Verification Protocol on GenLayer StudioNet**

ProofHireX is an autonomous, decentralized protocol for trustless freelance, contractor, and grant milestone management. It completely eliminates human escrow intermediaries by utilizing **GenLayer Intelligent Contracts** to fetch deliverables from the public web, evaluate fulfillment against acceptance criteria, and execute native currency releases through validator AI consensus.

[![Network: GenLayer StudioNet](https://img.shields.io/badge/Network-GenLayer%20StudioNet-blue.svg)](https://studio.genlayer.com)
[![Chain ID: 61999](https://img.shields.io/badge/Chain%20ID-61999-informational.svg)](https://studio.genlayer.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Tests: 12 Passed](https://img.shields.io/badge/Tests-12%2F12%20Passed-brightgreen.svg)](docs/TESTING.md)
[![Linter: 0 Issues](https://img.shields.io/badge/GenVM%20Linter-0%20Issues-brightgreen.svg)](docs/TESTING.md)

---

## 🌐 Production Deployments & Contract Artifacts

| Resource | Value / Endpoint |
|---|---|
| **Canonical Production Frontend** | [https://proofhirex.vercel.app/](https://proofhirex.vercel.app/) |
| **Contract Address** | [`0x24cA909D9fa2a680F4a8004A5EB15e78a20e4d64`](https://genlayer-explorer.vercel.app/address/0x24cA909D9fa2a680F4a8004A5EB15e78a20e4d64) |
| **Network** | GenLayer StudioNet |
| **Chain ID** | `61999` |
| **Authoritative RPC Endpoint** | `https://studio.genlayer.com/api` |
| **Block Explorer** | [https://genlayer-explorer.vercel.app](https://genlayer-explorer.vercel.app) |
| **Pinned GenVM Runner** | `py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6` |
| **Deployment Transaction** | [`0x4778f0408dc876fa52198157de90c94721f075498f299945c590e1a5bf85e66d`](https://genlayer-explorer.vercel.app/transactions/0x4778f0408dc876fa52198157de90c94721f075498f299945c590e1a5bf85e66d) |

---

## 🔒 Security & Wallet Safety Posture

> [!IMPORTANT]
> **Honest Security Disclosure**: ProofHireX is an experimental hackathon dApp deployed to the GenLayer StudioNet testnet. It has **NOT** been audited by a third-party security firm. Do not deploy high-value mainnet funds into experimental smart contract protocols.

### Wallet Safety Guarantees
- **Zero Token Approvals:** ProofHireX has **0 calls** to `approve()`, `permit()`, `setApprovalForAll()`, or `transferFrom()`. Your wallet tokens cannot be drained.
- **Zero Off-Chain Message Signatures:** No `personal_sign` or `eth_signTypedData`. You will never be tricked into signing malicious payloads.
- **Two-Phase Confirmation Modal:** Every transaction triggers an explicit pre-execution modal displaying the Target Contract, Network, Chain ID, Method Name, and exact native GEN value before wallet dispatch.
- **Pull-over-Push Safe Withdrawals:** Follows the Checks-Effects-Interactions (CEI) pattern. Milestone payouts are held in storage until explicitly withdrawn by the beneficiary.
- **Mathematical Invariant Conservation:** The contract continuously validates $\text{total\_deposited} = \sum \text{remaining} + \sum \text{released}$ on-chain via `get_escrow_invariants()`.

For detailed security audits and browser warning analysis, read:
- 📖 [**Wallet Safety & Remediation Guide**](docs/WALLET-SAFETY.md)
- 📖 [**Protocol Security Architecture**](docs/SECURITY.md)
- 📖 [**Production Security & Audit Report (14-Point Audit)**](docs/PRODUCTION-SECURITY-REPORT.md)

---

## 🏗️ Protocol Architecture & Flow

```mermaid
flowchart TD
    Client[Client / Employer] -->|1. create_job + Native GEN Escrow| Contract[ProofHireX Intelligent Contract]
    Freelancer[Freelancer / Contractor] -->|2. apply_for_job| Contract
    Client -->|3. hire_freelancer| Contract
    Freelancer -->|4. submit_milestone_deliverable| Contract
    Validators[GenLayer Validator Consensus] -->|5. verify_milestone_deliverable| Contract
    Validators -->|Fetch Evidence URL & Evaluate Acceptance Criteria| Contract
    Client -->|6. approve_milestone_manual (Alternative)| Contract
    Freelancer -->|7. withdraw (Pull-over-Push)| Contract
    Contract -->|emit_transfer| Freelancer
    
    subgraph Dispute Court
        Client -.->|raise_dispute| Contract
        Freelancer -.->|raise_dispute| Contract
        Validators -.->|arbitrate_dispute (AI Consensus)| Contract
    end
```

### Core Architecture Highlights
1. **Intelligent Equivalence Principle:** GenLayer validators execute web retrieval (`gl.get_webpage`) and LLM evaluation within validator consensus to agree on deliverable completion.
2. **Prompt Injection Hardening:** Untrusted submissions and notes are sandboxed within XML tags (`<untagged_submission_content>`) and bounded to integer status codes (`0=PASS`, `1=FETCH_ERROR`, `2=FAILED_CRITERIA`, `3=INCOMPLETE`, `4=INJECTION_ATTEMPT`).
3. **Decentralized Dispute Court:** When milestones are disputed, validators deliberate between three bounded outcomes: `10` (Full Refund to Client), `20` (Full Payout to Freelancer), or `30` (50/50 Escrow Split).

For deep technical specifications, refer to [**Architecture Specification**](docs/ARCHITECTURE.md).

---

## 📜 Contract Public Methods (`proofhirex.py`)

| Method | Type | Parameters | Description |
|---|---|---|---|
| `create_job` | Write (Payable) | `title, description, m1_title, m1_desc, m1_pct, m2_title, m2_desc, m2_pct, m3_title, m3_desc, m3_pct` | Locks native GEN deposit and creates 3 milestones summing to 100% |
| `apply_for_job` | Write | `job_id: int, proposal: str` | Registers freelancer candidacy |
| `hire_freelancer` | Write | `job_id: int, freelancer: Address` | Employer assigns approved applicant |
| `submit_milestone_deliverable` | Write | `job_id: int, milestone_index: int, evidence_url: str, notes: str` | Freelancer submits work artifacts |
| `verify_milestone_deliverable` | Write (AI Consensus) | `job_id: int, milestone_index: int` | Triggers validator web fetch & AI verification |
| `approve_milestone_manual` | Write | `job_id: int, milestone_index: int` | Employer manually approves milestone |
| `raise_dispute` | Write | `job_id: int, reason: str` | Freezes milestone in disputed state |
| `arbitrate_dispute` | Write (AI Consensus) | `job_id: int` | Triggers GenLayer AI court resolution |
| `withdraw` | Write | *none* | Pulls accumulated balance to sender address |
| `get_job` | View | `job_id: int` | Returns complete Job dataclass |
| `get_job_count` | View | *none* | Returns total number of jobs created |
| `get_job_ids` | View | *none* | Returns array of all active job IDs |
| `get_all_jobs` | View | *none* | Returns array of all Job objects |
| `get_milestone` | View | `job_id: int, milestone_index: int` | Returns Milestone dataclass |
| `get_job_milestones` | View | `job_id: int` | Returns all milestones for a job |
| `get_applicant` | View | `job_id: int, applicant: Address` | Returns applicant proposal |
| `get_reputation` | View | `user: Address` | Returns complete Reputation record |
| `get_withdrawable_balance` | View | `user: Address` | Returns claimable native GEN balance |
| `get_escrow_invariants` | View | *none* | Audits solvency and conservation invariants |

---

## 🧪 Testing & Verification

Comprehensive test suites validate local GenVM execution, syntax linting, and live StudioNet interactions.

### 1. Direct Unit Tests (GenVM Local Execution)
```bash
pytest -v
```
All 12 direct mode tests run within the native GenVM sandbox:
- Contract initialization & state defaults
- Multi-milestone percentage validation (must sum to 100%)
- Native escrow locking & balance accounting
- Freelancer application & hiring logic
- Deliverable submission & manual approval
- Pull-over-push CEI withdrawal mechanics
- Dispute initiation and 3-outcome arbitration
- Escrow conservation invariant verification

### 2. GenVM Linter
```bash
python -c "from genvm_linter import GenVMLinter; linter = GenVMLinter(); errors = linter.lint_file('contracts/proofhirex.py'); print(f'{len(errors)} issues found')"
```
*Result:* `0 issues found`.

### 3. Frontend Static Typecheck & Build
```bash
cd frontend
npm run lint
npx tsc --noEmit
npm run build
```
*Result:* 0 lint errors, 0 TypeScript errors, 7/7 Next.js production routes compiled.

See [**Testing Guide**](docs/TESTING.md) for full execution traces.

---

## 💻 Local Development Setup

### Prerequisites
- Node.js 18+ & npm
- Python 3.11+
- Git

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/JimmyOgb/proofhirex.git
cd proofhirex
npm install
cd frontend
npm install
```

### 2. Configure Environment
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_GENLAYER_RPC=https://studio.genlayer.com/api
NEXT_PUBLIC_CONTRACT_ADDRESS=0x24cA909D9fa2a680F4a8004A5EB15e78a20e4d64
NEXT_PUBLIC_CHAIN_ID=61999
NEXT_PUBLIC_EXPLORER_URL=https://genlayer-explorer.vercel.app
```

### 3. Run Local Development Server
```bash
cd frontend
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📚 Complete Documentation Index

- [**docs/WALLET-SAFETY.md**](docs/WALLET-SAFETY.md) - Deep dive into browser warnings, Vercel SSO redirects, and safety remediation
- [**docs/PRODUCTION-SECURITY-REPORT.md**](docs/PRODUCTION-SECURITY-REPORT.md) - 14-Point production security & wallet audit
- [**docs/ARCHITECTURE.md**](docs/ARCHITECTURE.md) - Protocol storage model, state machines, and AI equivalence engine
- [**docs/SECURITY.md**](docs/SECURITY.md) - Escrow invariants, threat models, and injection defense mechanisms
- [**docs/DEPLOYMENT.md**](docs/DEPLOYMENT.md) - StudioNet deployment guides, Vercel production hosting, and RPC configuration
- [**docs/TESTING.md**](docs/TESTING.md) - Step-by-step test execution and verification instructions

---

## ⚖️ License
MIT License. Copyright (c) 2026 JimmyOgb & ProofHireX Contributors.
