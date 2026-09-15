# ProofHireX Protocol Security Specification

This document details the security architecture, invariant guarantees, threat model, and defense mechanisms implemented in the ProofHireX protocol.

---

## 1. Honest Security Disclosure

> [!CAUTION]
> **Experimental Hackathon Software:**
> ProofHireX is an experimental protocol developed for GenLayer StudioNet. It has **NOT** undergone a formal, independent third-party security audit.
> **Do not use mainnet private keys or hold valuable assets in wallets interacting with StudioNet.** Always use a dedicated burner testnet wallet.

ProofHireX makes **no claims** of being "100% secure", "audited", or "infallible". Instead, this document specifies the mathematical invariants, deterministic state transitions, and defensive measures implemented in code to resist specific attack vectors.

---

## 2. Core Protocol Invariants

### 2.1 Escrow Conservation Invariant

The fundamental financial invariant enforced by `contracts/proofhirex.py` is that the contract's native balance strictly equals total deposited escrow minus total withdrawn funds:

$$\text{total\_deposited} = \sum_{j \in \text{Jobs}} \text{remaining\_escrow}(j) + \sum_{j \in \text{Jobs}} \text{released\_escrow}(j)$$

$$\sum_{j \in \text{Jobs}} \text{released\_escrow}(j) = \text{total\_withdrawn} + \sum_{u \in \text{Users}} \text{withdrawable\_balance}(u)$$

#### Mathematical Properties:
- **No inflation:** Native GEN cannot be minted or created out of thin air.
- **No balance destruction:** Escrow cannot be lost or permanently trapped in an unreachable state.
- **Auditable via RPC:** The view function `get_escrow_invariants()` dynamically sums all active jobs and returns:
  ```json
  {
    "total_deposited": "5000000000000000000",
    "total_remaining_escrow": "4700000000000000000",
    "total_released_escrow": "300000000000000000",
    "total_withdrawn": "300000000000000000",
    "invariant_conserved": true
  }
  ```
  This is independently verified on StudioNet for contract `0x24cA909D9fa2a680F4a8004A5EB15e78a20e4d64`.

### 2.2 Reentrancy-Immune Pull-over-Push Withdrawals

ProofHireX implements the strict **Checks-Effects-Interactions (Pull-over-Push)** pattern for all native GEN disbursements.

When a milestone is approved (`approve_milestone_manual`), passes AI consensus (`verify_milestone_deliverable`), or is settled in court (`arbitrate_dispute`), the contract **never sends native GEN directly** to the beneficiary's wallet. Instead:

1. **Effects:** The beneficiary's address is credited in the `withdrawable_balances` mapping in contract storage.
2. **Pull Request:** The user manually calls `withdraw()`.
3. **Checks & Zeroing:**
   ```python
   amount = int(self.withdrawable_balances[caller])
   if amount <= 0:
       raise gl.vm.UserError(f"{ERROR_EXPECTED} No withdrawable balance")

   # Invariant security: zero balance BEFORE external interaction
   self.withdrawable_balances[caller] = u256(0)
   self.total_withdrawn = u256(int(self.total_withdrawn) + amount)

   # External interaction: emit_transfer occurs only after state is zeroed
   gl.get_contract_at(caller).emit_transfer(value=u256(amount), on='finalized')
   ```
4. **Reentrancy Immunity:** Because the balance is zeroed in storage prior to issuing the transfer, any re-entrant call back into `withdraw()` encounters a balance of `0` and immediately reverts with `No withdrawable balance`.

---

## 3. Prompt Injection Defense Matrix

In GenLayer intelligent contracts, validators execute non-deterministic AI prompts to evaluate deliverables. Malicious freelancers might embed prompt injection attacks into deliverable URLs to trick the AI into returning a `PASS` verdict.

ProofHireX implements a multi-layered defense matrix:

| Layer | Defense Mechanism | Action upon Detection |
|---|---|---|
| **Layer 1: URL & Protocol Sanitization** | Contract verifies `evidence_url` starts with `http://` or `https://` and does not exceed 512 characters. | Reverts transaction if malformed. |
| **Layer 2: Size Bounding** | Validator fetches external evidence via `gl.nondet.web.get(target_url)` and truncates response to the first 3,000 bytes. | Prevents buffer exhaustion and denial-of-service via massive payloads. |
| **Layer 3: Heuristic Regex / String Quarantining** | Pre-scans raw content for known jailbreak triggers: `ignore previous instructions`, `override system prompt`, `developer mode activated`, `release all funds immediately`. | Assigns `STATUS_INJECTION_ATTEMPT` (code 4) and flags `RISK_HIGH` (code 2) before the LLM prompt executes. |
| **Layer 4: Data Delimitation Framing** | External content is enclosed in defensive delimiters: `<<<UNTRUSTED_EXTERNAL_EVIDENCE>>>...<<<END_UNTRUSTED_EXTERNAL_EVIDENCE>>>`. | Explicitly demarcates user input as passive untrusted data. |
| **Layer 5: Bounded Integer Status Schema** | LLM is instructed to output strictly structured JSON containing integer codes (`0`, `2`, `3`, `4`) rather than freeform text. | Prevents non-deterministic textual output and format hijacking. |
| **Layer 6: Validator Equivalence Consensus** | Multiple validator nodes evaluate the deliverable independently. Strict consensus is required on both `status` and `risk`. | A compromised single validator cannot force approval. |

---

## 4. Threat Model & Analysis

### Threat 1: Escrow Redirection to Attacker Address
- *Objective:* Attacker attempts to divert escrowed funds to an address other than the designated client or hired freelancer.
- *Mitigation:* The contract stores `client` and `freelancer` addresses immutably inside the `Job` storage record during `create_job` and `hire_freelancer`. The `_release_milestone_funds` function hardcodes destination lookups to `job.freelancer`. The `arbitrate_dispute` function restricts payouts strictly to `job.client` and `job.freelancer`. There are **no** setter methods or administrative functions that can override these addresses.

### Threat 2: Client Refusal to Pay (Hostage Escrow)
- *Objective:* A dishonest client receives high-quality work but refuses to click approve, attempting to extort the freelancer.
- *Mitigation:* The freelancer can trigger `verify_milestone_deliverable()`. GenLayer AI validator consensus independently inspects the evidence artifact. If criteria are met, the milestone passes and the contract **autonomously releases funds** to the freelancer's withdrawable balance without requiring client approval. Alternatively, either party can escalate to `arbitrate_dispute()`.

### Threat 3: Freelancer Submitting Incomplete or Copied Work
- *Objective:* Freelancer submits an empty repository or broken link and demands payment.
- *Mitigation:* Validators verify the live HTTP artifact against the job requirements and milestone description. Broken or unreachable links trigger `STATUS_FETCH_ERROR` (code 1), incomplete deliverables trigger `STATUS_INCOMPLETE` (code 3), and failing criteria triggers `STATUS_FAILED_CRITERIA` (code 2). No funds are released.

### Threat 4: Front-Running & Unauthorized Milestones
- *Objective:* Attacker calls `submit_milestone_deliverable` or `approve_milestone_manual` on someone else's job.
- *Mitigation:* Strict authorization checks verify `gl.message.sender_address == job.freelancer` for submissions and `gl.message.sender_address == job.client` for manual approvals.

---

## 5. Reporting Vulnerabilities

If you discover a potential vulnerability or security issue in the ProofHireX intelligent contract or frontend:

1. **Do not** post details publicly on social media or GitHub issues.
2. Email full reproduction steps and transaction hashes to the project maintainers via the contact listed in the GitHub profile: `https://github.com/JimmyOgb`.
