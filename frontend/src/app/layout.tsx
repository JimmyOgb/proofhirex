import type { Metadata } from 'next';
import './globals.css';
import { WalletProvider } from '@/context/WalletContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'ProofHireX | Autonomous Web3 Escrow & AI Milestone Verification',
  description: 'Production-grade autonomous escrow and milestone verification protocol powered by GenLayer Intelligent Contracts on StudioNet.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#07090e] text-slate-100 antialiased min-h-screen flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
        <WalletProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </WalletProvider>
      </body>
    </html>
  );
}
