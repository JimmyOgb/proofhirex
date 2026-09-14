#!/usr/bin/env python3
"""
ProofHireX StudioNet Deployment Script
Automates deployment of contracts/proofhirex.py to GenLayer StudioNet.
"""

import subprocess
import sys
import json
import os
from pathlib import Path

CONTRACT_PATH = Path(__file__).parent.parent / "contracts" / "proofhirex.py"
GENLAYER_BIN = r"C:\Users\NO GO NO\AppData\Roaming\npm\genlayer.cmd"

def deploy():
    print(f"[*] Deploying ProofHireX from {CONTRACT_PATH} to GenLayer StudioNet...")
    if not CONTRACT_PATH.exists():
        print(f"[!] Error: Contract file {CONTRACT_PATH} not found.")
        sys.exit(1)

    cmd = [GENLAYER_BIN, "deploy", "--contract", str(CONTRACT_PATH)]
    print(f"[*] Running command: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)

    print("--- STDOUT ---")
    print(result.stdout)
    if result.stderr:
        print("--- STDERR ---")
        print(result.stderr)

    if result.returncode != 0:
        print("[!] Deployment failed!")
        sys.exit(result.returncode)

    print("[✔] Deployment command completed successfully.")

if __name__ == "__main__":
    deploy()
