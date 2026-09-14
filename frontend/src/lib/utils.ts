import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatGen(wei: string | number | bigint | undefined | null): string {
  if (wei === undefined || wei === null) return '0.0000 GEN';
  try {
    const valBig = BigInt(wei.toString());
    const ether = Number(valBig) / 1e18;
    return `${ether.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} GEN`;
  } catch {
    return '0.0000 GEN';
  }
}

export function parseGenToWei(gen: string | number): bigint {
  try {
    const num = parseFloat(gen.toString());
    if (isNaN(num) || num <= 0) return 0n;
    return BigInt(Math.floor(num * 1e18));
  } catch {
    return 0n;
  }
}

export function truncateAddress(address: string, chars = 4): string {
  if (!address || address.length < chars * 2 + 2) return address || '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatTimestamp(ts: number): string {
  if (!ts) return 'N/A';
  return new Date(ts * 1000).toLocaleString();
}
