'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useProofHire } from '@/hooks/useProofHire';
import { Job, JobStatus } from '@/lib/types';
import { formatGen, truncateAddress } from '@/lib/utils';
import { JobStatusBadge } from '@/components/StatusBadge';
import { Search, Filter, RefreshCw, PlusCircle, ArrowRight, Layers } from 'lucide-react';

export default function JobsPage() {
  const { getAllJobs } = useProofHire();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const loadJobs = async () => {
    try {
      setRefreshing(true);
      const data = await getAllJobs();
      setJobs(data);
      applyFilter(data, searchQuery, statusFilter);
    } catch (err) {
      console.error('Failed fetching jobs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilter = (data: Job[], query: string, status: string) => {
    let result = [...data];
    if (status !== 'ALL') {
      result = result.filter((j) => j.status === status);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (j) => j.title.toLowerCase().includes(q) || j.description.toLowerCase().includes(q)
      );
    }
    setFilteredJobs(result);
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    applyFilter(jobs, q, statusFilter);
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    applyFilter(jobs, searchQuery, status);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Explore Protocol Jobs
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Live marketplace verified and escrowed on GenLayer StudioNet.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadJobs}
            disabled={refreshing}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/create"
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Post Job</span>
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search jobs by title or description..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 transition"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'DISPUTED'].map((st) => (
            <button
              key={st}
              onClick={() => handleStatusChange(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === st
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="py-24 text-center text-slate-500 text-sm">
          Loading live jobs from StudioNet contract...
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-slate-900/30 border border-slate-800 text-slate-400 text-sm">
          No matching jobs found on StudioNet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <Link
              key={job.job_id}
              href={`/jobs/${job.job_id}`}
              className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900/70 transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-slate-500">Job #{job.job_id}</span>
                  <JobStatusBadge status={job.status} />
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition mb-2">
                  {job.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 mb-6 leading-relaxed">
                  {job.description}
                </p>
              </div>

              <div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500">Client:</span>{' '}
                    <span className="font-mono text-slate-300">
                      {truncateAddress(job.client, 3)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-400 font-mono">
                    <Layers className="w-3 h-3 text-slate-500" />
                    <span>{job.milestone_count} Milestones</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Total Escrow</span>
                    <span className="text-sm font-bold font-mono text-emerald-400">
                      {formatGen(job.total_escrow)}
                    </span>
                  </div>

                  <span className="inline-flex items-center text-xs font-semibold text-emerald-400 group-hover:translate-x-0.5 transition">
                    Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
