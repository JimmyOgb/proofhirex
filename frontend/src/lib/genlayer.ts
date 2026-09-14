import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { TransactionStatus, ExecutionResult } from 'genlayer-js/types';

export const PROOFHIREX_CONTRACT_ADDRESS = (
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x24cA909D9fa2a680F4a8004A5EB15e78a20e4d64'
) as `0x${string}`;

export const EXPLORER_URL = process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://genlayer-explorer.vercel.app';
export const RPC_URL = process.env.NEXT_PUBLIC_GENLAYER_RPC || 'https://studio.genlayer.com/api';

// Create singleton read client connected to StudioNet
export const readClient = createClient({
  chain: studionet,
});

/**
 * Robust read call with retry and exponential backoff to handle network drops and rate limits.
 */
export async function robustReadContract<T = any>(
  functionName: string,
  args: any[] = [],
  maxRetries = 4,
  delayMs = 1200
): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await readClient.readContract({
        address: PROOFHIREX_CONTRACT_ADDRESS,
        functionName,
        args,
      });
      return result as T;
    } catch (err: any) {
      lastError = err;
      if (attempt < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

/**
 * Creates write client connected to window.ethereum or supplied provider.
 */
export function getWriteClient(accountAddress: string) {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('No Web3 wallet detected in browser.');
  }

  return createClient({
    chain: studionet,
    account: accountAddress as `0x${string}`,
    provider: (window as any).ethereum,
  });
}

/**
 * Switches the user wallet to StudioNet.
 */
export async function switchToStudioNet(accountAddress: string): Promise<void> {
  if (typeof window === 'undefined' || !(window as any).ethereum) return;
  const client = getWriteClient(accountAddress);
  await client.connect('studionet');
}

export { TransactionStatus, ExecutionResult, studionet };
