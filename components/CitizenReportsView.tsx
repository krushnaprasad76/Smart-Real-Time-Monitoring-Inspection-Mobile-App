'use client';

import { useState } from 'react';
import { CitizenReport, CivicCategory, UserRole } from '@/types/civic';
import {
  AlertTriangle,
  Lightbulb,
  Droplets,
  Gauge,
  Zap,
  ThumbsUp,
  MapPin,
  Clock,
  Plus,
  CheckCircle2,
  Search,
  Filter,
} from 'lucide-react';

interface CitizenReportsViewProps {
  reports: CitizenReport[];
  role: UserRole;
  onUpvote: (id: string) => void;
  onUpdateStatus: (id: string, status: CitizenReport['status']) => void;
  onOpenReportModal: () => void;
}

export function CitizenReportsView({
  reports,
  role,
  onUpvote,
  onUpdateStatus,
  onOpenReportModal,
}: CitizenReportsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<CivicCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<CitizenReport['status'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReports = reports.filter((report) => {
    if (selectedCategory !== 'all' && report.category !== selectedCategory) return false;
    if (statusFilter !== 'all' && report.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        report.title.toLowerCase().includes(q) ||
        report.description.toLowerCase().includes(q) ||
        report.address.toLowerCase().includes(q) ||
        report.ward.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getCategoryIcon = (category: CivicCategory) => {
    switch (category) {
      case 'streetlight':
        return <Lightbulb className="w-4 h-4 text-amber-400" />;
      case 'drainage':
        return <Droplets className="w-4 h-4 text-cyan-400" />;
      case 'water_leak':
        return <Gauge className="w-4 h-4 text-blue-400" />;
      case 'pothole':
        return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case 'electrical':
        return <Zap className="w-4 h-4 text-purple-400" />;
    }
  };

  const getStatusBadge = (status: CitizenReport['status']) => {
    switch (status) {
      case 'reported':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono border bg-amber-950/60 border-amber-800 text-amber-300">
            REPORTED
          </span>
        );
      case 'investigating':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono border bg-blue-950/60 border-blue-800 text-blue-300">
            CREW DISPATCHED
          </span>
        );
      case 'scheduled':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono border bg-purple-950/60 border-purple-800 text-purple-300">
            SCHEDULED REPAIR
          </span>
        );
      case 'resolved':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono border bg-emerald-950/60 border-emerald-800 text-emerald-300">
            RESOLVED
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0B0F19] text-slate-100 overflow-y-auto p-4 space-y-4">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#131B2E] border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Civic Problem Reports & Community Tickets</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time citizen reporting of potholes, drainage clogs, dark luminaires, and electrical faults.
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-98 transition-all shrink-0"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>Report a Street Issue</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search problem tickets (e.g. pothole, 4th Ave, leak)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-[40px] pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`min-h-[34px] px-3 py-1 rounded-lg border whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-slate-200 text-slate-950 font-semibold border-slate-300'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            All Categories ({reports.length})
          </button>
          <button
            onClick={() => setSelectedCategory('pothole')}
            className={`min-h-[34px] px-2.5 py-1 rounded-lg border whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              selectedCategory === 'pothole'
                ? 'bg-orange-500/20 text-orange-300 border-orange-500 font-medium'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            Potholes
          </button>
          <button
            onClick={() => setSelectedCategory('drainage')}
            className={`min-h-[34px] px-2.5 py-1 rounded-lg border whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              selectedCategory === 'drainage'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 font-medium'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            Drainage & Floods
          </button>
          <button
            onClick={() => setSelectedCategory('streetlight')}
            className={`min-h-[34px] px-2.5 py-1 rounded-lg border whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              selectedCategory === 'streetlight'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-medium'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            Streetlights
          </button>
          <button
            onClick={() => setSelectedCategory('water_leak')}
            className={`min-h-[34px] px-2.5 py-1 rounded-lg border whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              selectedCategory === 'water_leak'
                ? 'bg-blue-500/20 text-blue-300 border-blue-500 font-medium'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            Water Leaks
          </button>
          <button
            onClick={() => setSelectedCategory('electrical')}
            className={`min-h-[34px] px-2.5 py-1 rounded-lg border whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              selectedCategory === 'electrical'
                ? 'bg-purple-500/20 text-purple-300 border-purple-500 font-medium'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            Electrical
          </button>
        </div>
      </div>

      {/* Reports Feed */}
      <div className="space-y-3">
        {filteredReports.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500 text-xs">
            No civic reports match your filter criteria.
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="p-4 rounded-2xl bg-[#131B2E] border border-slate-800 space-y-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                    {getCategoryIcon(report.category)}
                  </div>
                  <div>
                    {/* Unboxed Metadata with · separator */}
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-1">
                      <span className="font-semibold text-white">{report.id}</span>
                      <span>·</span>
                      <span>{report.ward}</span>
                      <span>·</span>
                      <span className="capitalize">{report.severity} Priority</span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{report.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>{report.address}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">{getStatusBadge(report.status)}</div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed pl-11">
                {report.description}
              </p>

              {/* Photo Evidence Thumbnail if present */}
              {report.photoUrl && (
                <div className="pl-11">
                  <div className="h-32 sm:h-40 w-full sm:w-72 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={report.photoUrl} alt="Hazard photo" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="pt-2 pl-11 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  {/* Upvote Button */}
                  <button
                    onClick={() => onUpvote(report.id)}
                    className="min-h-[36px] px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center gap-1.5 transition-colors active:scale-95"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 text-amber-400" />
                    <span>Upvote ({report.upvotes})</span>
                  </button>

                  <span className="text-slate-500 font-mono text-[11px]">
                    By {report.reporterName}
                  </span>
                </div>

                {/* Inspector Workflow Status Changer */}
                {role === 'inspector' && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[11px] hidden sm:inline">Set Status:</span>
                    <select
                      value={report.status}
                      onChange={(e) =>
                        onUpdateStatus(report.id, e.target.value as CitizenReport['status'])
                      }
                      className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-cyan-300 focus:outline-none"
                    >
                      <option value="reported">Reported</option>
                      <option value="investigating">Dispatched</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
