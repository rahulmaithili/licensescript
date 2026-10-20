import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Search,
  RefreshCw,
} from 'lucide-react';
import { getActivityLogs } from '@/services/userService';
import { formatDateTime } from '@/lib/utils';
import type { ActivityLog } from '@/types';

// Details arrive as `any` — they can be a plain string, a number, an
// object, an array, or missing entirely. Render every shape safely and
// never let a stringify throw take the whole table down.
function formatDetails(details: unknown): string {
  if (details === null || details === undefined || details === '') return '—';
  if (typeof details === 'string') return details;
  if (typeof details === 'number' || typeof details === 'boolean') return String(details);
  try {
    return JSON.stringify(details);
  } catch {
    return '[Details could not be displayed]';
  }
}

function truncate(text: string, max = 80): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export const ActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setIsLoading(true);
    const data = await getActivityLogs();
    setLogs(data);
    setIsLoading(false);
  };

  const entityTypes = useMemo(
    () => Array.from(new Set(logs.map((l) => l.entity_type).filter(Boolean))).sort(),
    [logs]
  );

  const filteredLogs = logs.filter((log) => {
    const s = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !s ||
      log.action?.toLowerCase().includes(s) ||
      log.entity_type?.toLowerCase().includes(s) ||
      log.entity_id?.toLowerCase().includes(s) ||
      log.user?.full_name?.toLowerCase().includes(s) ||
      log.user?.email?.toLowerCase().includes(s) ||
      log.ip_address?.toLowerCase().includes(s) ||
      formatDetails(log.details).toLowerCase().includes(s);
    const matchesEntity = entityFilter === 'all' || log.entity_type === entityFilter;
    return matchesSearch && matchesEntity;
  });

  const hasActiveFilter = searchQuery.trim() !== '' || entityFilter !== 'all';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1330] dark:text-white flex items-center gap-2.5">
            <Activity className="w-8 h-8 text-[#1E40FF]" />
            System & Security Audit Logs
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Append-only immutable record of device activations, key generation, payment webhooks, and administrative changes.
          </p>
        </div>

        <button
          onClick={loadLogs}
          disabled={isLoading}
          className="px-4 py-2.5 rounded-full bg-white dark:bg-slate-800 hover:bg-[#EEF1FF] dark:hover:bg-slate-700 text-[#0A1330] dark:text-slate-300 text-sm font-semibold border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2 disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Audit Trail</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 shadow-sm dark:shadow-xl">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, IP, user name, details..."
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-[#0A1330] dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E40FF]/40 focus:border-[#1E40FF]"
          />
        </div>
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[#0A1330] dark:text-slate-200 text-xs font-medium rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1E40FF]/40 w-full md:w-auto"
        >
          <option value="all">All Entity Types</option>
          {entityTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <span className="text-xs text-slate-500 dark:text-slate-400 md:ml-auto whitespace-nowrap">
          {isLoading ? 'Loading…' : `Showing ${filteredLogs.length} of ${logs.length} entries`}
        </span>
      </div>

      {/* Activity Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-[#EEF1FF] dark:bg-slate-800/80 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Action Event</th>
                <th className="p-4">Target Entity</th>
                <th className="p-4">Initiated By</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading &&
                [1, 2, 3].map((i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse">
                    <td className="p-4" colSpan={6}>
                      <div className="h-9 rounded-xl bg-slate-100 dark:bg-slate-800" />
                    </td>
                  </tr>
                ))}

              {!isLoading && logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <Activity className="w-10 h-10 mx-auto text-[#1E40FF]/50" />
                    <p className="mt-3 font-bold text-[#0A1330] dark:text-white">No activity recorded yet</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      The audit trail is empty. License activations, payment webhooks, and admin actions will be recorded here as they happen.
                    </p>
                  </td>
                </tr>
              )}

              {!isLoading && logs.length > 0 && filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <Search className="w-10 h-10 mx-auto text-[#1E40FF]/50" />
                    <p className="mt-3 font-bold text-[#0A1330] dark:text-white">No log entries match your filters</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Try a different search term or entity type.
                    </p>
                    {hasActiveFilter && (
                      <button
                        onClick={() => { setSearchQuery(''); setEntityFilter('all'); }}
                        className="mt-4 px-4 py-2 rounded-full bg-[#1E40FF] hover:bg-[#1740D6] text-white text-xs font-semibold transition-all"
                      >
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              )}

              {!isLoading &&
                filteredLogs.map((log) => {
                  const detailsText = formatDetails(log.details);
                  return (
                    <tr key={log.id} className="hover:bg-[#EEF1FF]/60 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 text-xs font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {formatDateTime(log.created_at)}
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-xs font-bold text-[#1E40FF] dark:text-[#B9C4FF] bg-[#EEF1FF] dark:bg-[#1E40FF]/15 px-2.5 py-1 rounded-lg border border-[#1E40FF]/20 dark:border-[#1E40FF]/30">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-medium text-[#0A1330] dark:text-white capitalize">
                        {log.entity_type} {log.entity_id ? `(${log.entity_id})` : ''}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-[#0A1330] dark:text-white text-xs">{log.user?.full_name || 'System / Guest'}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{log.user?.email || 'API Request'}</div>
                      </td>
                      <td className="p-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                        {log.ip_address || '—'}
                      </td>
                      <td className="p-4 text-xs font-mono text-slate-500 dark:text-slate-400" title={detailsText}>
                        {truncate(detailsText)}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
