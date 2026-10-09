'use client';

import { useState } from 'react';
import { SensorLogEntry, CivicCategory } from '@/types/civic';
import {
  FileText,
  Search,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  Flame,
  ArrowUpDown,
} from 'lucide-react';

interface SensorLogsViewProps {
  logs: SensorLogEntry[];
}

export function SensorLogsView({ logs }: SensorLogsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [categoryFilter, setCategoryFilter] = useState<CivicCategory | 'all'>('all');

  const filteredLogs = logs.filter((log) => {
    if (severityFilter !== 'all' && log.severity !== severityFilter) return false;
    if (categoryFilter !== 'all' && log.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.nodeId.toLowerCase().includes(q) ||
        log.nodeName.toLowerCase().includes(q) ||
        log.message.toLowerCase().includes(q) ||
        log.metricName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const exportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Node ID', 'Node Name', 'Category', 'Severity', 'Metric', 'Value', 'Threshold', 'Message'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp,
      l.nodeId,
      `"${l.nodeName}"`,
      l.category,
      l.severity,
      l.metricName,
      `"${l.metricValue}"`,
      `"${l.threshold}"`,
      `"${l.message.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sentinel_sensor_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(filteredLogs, null, 2))}`;
    const link = document.createElement('a');
    link.setAttribute('href', jsonString);
    link.setAttribute('download', `sentinel_sensor_logs_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-[#0B0F19] text-slate-100 overflow-y-auto p-4 space-y-4">
      {/* Header and Export Actions */}
      <div className="p-4 rounded-2xl bg-[#131B2E] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Persistent Sensor Telemetry Audit Trail</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable sensor tripwire event logs persisted across sessions and plant connectivity states.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={exportCSV}
            className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportJSON}
            className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search logs by Node ID, metric, or event message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-[40px] pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center justify-between gap-2 overflow-x-auto text-xs">
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-400 mr-1">Severity:</span>
            {(['all', 'critical', 'warning', 'info'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`min-h-[32px] px-2.5 py-1 rounded-lg border capitalize transition-colors ${
                  severityFilter === sev
                    ? 'bg-slate-200 text-slate-950 font-semibold border-slate-300'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Showing <strong className="text-white">{filteredLogs.length}</strong> entries
          </div>
        </div>
      </div>

      {/* Tabular Log Entries */}
      <div className="rounded-2xl border border-slate-800 bg-[#131B2E] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Node / Asset</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Metric & Value</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Event Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No sensor telemetry events match current criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isCrit = log.severity === 'critical';
                  const isWarn = log.severity === 'warning';

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-900/50 transition-colors text-slate-300"
                    >
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400 text-[11px]" suppressHydrationWarning>
                        {log.timestamp.includes('T') ? log.timestamp.split('T')[1].slice(0, 8) : log.timestamp}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <strong className="text-white">{log.nodeId}</strong>
                        <span className="block text-[11px] text-slate-400 font-sans truncate max-w-[140px]">
                          {log.nodeName}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap capitalize font-sans text-slate-300">
                        {log.category.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-white tabular-nums font-bold">{log.metricValue}</span>
                        <span className="block text-[10px] text-slate-500">{log.threshold}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                            isCrit
                              ? 'bg-rose-950/60 border-rose-800 text-rose-300'
                              : isWarn
                              ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                              : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                          }`}
                        >
                          {log.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs font-sans text-slate-300 max-w-xs leading-relaxed">
                        {log.message}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
