# ProofHireX Deployment & Network Specification

This document provides the authoritative deployment reference, network parameters, RPC audit, and frontend hosting configuration for ProofHireX.

---

## 1. Authoritative Network Parameters

| Parameter | Authoritative Value | Verification Status | Notes |
|---|---|---|---|
| **Network Name** | GenLayer StudioNet | **VERIFIED** | GenLayer developer test network |
| **Chain ID (Dec)** | `61999` | **VERIFIED** | Verified via `net_version` JSON-RPC call |
| **Chain ID (Hex)** | `0xf22f` | **VERIFIED** | EVM hex representation |
| **Official RPC Endpoint** | `https://studio.genlayer.com/api` | **VERIFIED** | HTTP 200, responds to `net_version`, `gen_call`, and transaction submissions |
| **Deprecated / Invalid RPC** | `https://studionet.genlayer.com` | **FAILED / INVALID** | **DNS failure (`Could not resolve host`). Do not use.** |
| **Block Explorer** | `https://genlayer-explorer.vercel.app` | **VERIFIED** | Supports address and transaction lookups |
| **Contract Address** | `0x24cA909D9fa2a680F4a8004A5EB15e78a20e4d64` | **VERIFIED** | Live on StudioNet with active jobs and escrow |
| **Deployment Tx Hash** | `0x4778f0408dc876fa52198157de90c94721f075498f299945c590e1a5bf85e66d` | **VERIFIED** | Consensus status: `ACCEPTED` / `MAJORITY_AGREE` |
| **Pinned GenVM Runner** | `py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6` | **VERIFIED** | Pinned in `contracts/proofhirex.py` line 1 |
| **Canonical Frontend** | `https://proofhirex.vercel.app/` | **VERIFIED** | Official production URL |

---

## 2. Comprehensive RPC Audit: StudioNet Endpoint

### 2.1 The Two Discovered Endpoints
During initial project audits, two conflicting RPC endpoints were referenced across old documentation and configuration files:
1. `https://studio.genlayer.com/api`
2. `https://studionet.genlayer.com`

### 2.2 Live Network Test Results

#### Test 1: `https://studio.genlayer.com/api`
```bash
curl -s -X POST https://studio.genlayer.com/api \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"net_version","params":[],"id":1}'
```
**Result:**
```json
{"jsonrpc":"2.0","result":"61999","id":1}
```
*Verdict:* **PASSED.** Responds in ~400ms with Chain ID `61999`. Hardcoded in `genlayer-js` under `SIMULATOR_JSON_RPC_URL2 = "https://studio.genlayer.com/api"`.

#### Test 2: `https://studionet.genlayer.com`
```bash
curl -v -m 5 https://studionet.genlayer.com
```
**Result:**
```
* Could not resolve host: studionet.genlayer.com
curl: (6) Could not resolve host: studionet.genlayer.com
```
*Verdict:* **FAILED.** The hostname `studionet.genlayer.com` does not have a valid DNS record. Any wallet attempting to connect to this endpoint fails with network connection errors.

### 2.3 Unification Policy
The repository has been strictly updated to use **only** `https://studio.genlayer.com/api` across:
- `frontend/src/lib/genlayer.ts`
- `frontend/src/context/WalletContext.tsx`
- `frontend/src/components/Footer.tsx`
- `frontend/vercel.json`
- `frontend/.env.example`
- `README.md`
- All documentation in `/docs`

---

## 3. Production Frontend Deployment & Vercel Configuration

### 3.1 Canonical Production Domain
The canonical production domain is:
```
https://proofhirex.vercel.app/
```

### 3.2 Analysis of Older Preview URL (`frontend-iota-nine-65.vercel.app`)
When the project was initially created on Vercel under project name `frontend` (`prj_XHjZlfVOgjIJpgfR7SJfTzhYbGkd`), Vercel generated the auto-assigned domain `frontend-iota-nine-65.vercel.app`.
Once the custom domain `proofhirex.vercel.app` was added and aliased to the production branch, it became the official canonical frontend.

### 3.3 Vercel Deployment Protection Status (Verified Disabled)
Vercel Authentication (Deployment Protection) is **disabled** on the production environment.
Unauthenticated HTTP requests confirm direct delivery:
```http
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
```
Direct public access is confirmed: external reviewers (including stewards), automated evaluators, and Web3 visitors load the dApp directly without any SSO or login redirection.


### 3.4 Production Environment Variables
Configured in `frontend/vercel.json`:
```json
{
  "NEXT_PUBLIC_GENLAYER_RPC": "https://studio.genlayer.com/api",
  "NEXT_PUBLIC_CONTRACT_ADDRESS": "0x24cA909D9fa2a680F4a8004A5EB15e78a20e4d64",
  "NEXT_PUBLIC_CHAIN_ID": "61999",
  "NEXT_PUBLIC_EXPLORER_URL": "https://genlayer-explorer.vercel.app"
}
```

---

## 4. Deploying the Intelligent Contract

### 4.1 Prerequisites
- Python 3.11 or 3.12
- GenLayer CLI (`genlayer`) installed globally via npm
- A funded StudioNet account (or private key)

### 4.2 Deployment Command
```bash
python scripts/deploy.py
```
or via the GenLayer CLI directly:
```bash
genlayer deploy --contract contracts/proofhirex.py
```

### 4.3 On-Chain Verification
Run the end-to-end verification script to execute real on-chain transactions (create job, apply, hire, submit deliverable, and verify invariants):
```bash
python scripts/verify_studionet.py
```
