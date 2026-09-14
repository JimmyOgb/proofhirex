/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_GENLAYER_RPC: process.env.NEXT_PUBLIC_GENLAYER_RPC || "https://studio.genlayer.com/api",
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x24cA909D9fa2a680F4a8004A5EB15e78a20e4d64",
    NEXT_PUBLIC_CHAIN_ID: "61999"
  }
};

export default nextConfig;
