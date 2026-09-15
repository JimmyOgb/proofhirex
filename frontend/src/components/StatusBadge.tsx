'use client';

import React from 'react';
import { JobStatus, MilestoneStatus, DELIVERABLE_STATUS_LABELS } from '@/lib/types';

export const JobStatusBadge: React.FC<{ status: JobStatus | string }> = ({ status }) => {
  const styles: Record<string, string> = {
    OPEN: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    ASSIGNED: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    IN_PROGRESS: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    COMPLETED: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    DISPUTED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    CANCELLED: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        styles[status] || styles.OPEN
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current animate-pulse" />
      {status}
    </span>
  );
};

export const MilestoneStatusBadge: React.FC<{ status: MilestoneStatus | string }> = ({ status }) => {
  const styles: Record<string, string> = {
    PENDING: 'bg-slate-800 text-slate-400 border-slate-700',
    SUBMITTED: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    VERIFIED: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    REJECTED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    DISPUTED: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    RELEASED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        styles[status] || styles.PENDING
      }`}
    >
      {status}
    </span>
  );
};

export const DeliverableStatusBadge: React.FC<{ code: number }> = ({ code }) => {
  const meta = DELIVERABLE_STATUS_LABELS[code] || DELIVERABLE_STATUS_LABELS[99];

  return (
    <div className="inline-flex flex-col">
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${meta.color}`}
      >
        <span className="w-2 h-2 rounded-full mr-1.5 bg-current" />
        AI Verification: {meta.label}
      </span>
      <span className="text-[10px] text-slate-400 mt-1">{meta.desc}</span>
    </div>
  );
};
