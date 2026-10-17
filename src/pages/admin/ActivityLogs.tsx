import React, { useState, useEffect } from 'react';
import {
  Activity,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Terminal,
} from 'lucide-react';
import { getActivityLogs } from '@/services/userService';
import { formatDateTime } from '@/lib/utils';
import type { ActivityLog } from '@/types';

export const ActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredLogs = logs.filter((log) => {
    const s = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(s) ||
      log.entity_type.toLowerCase().includes(s) ||
      log.user?.full_name?.toLowerCase().includes(s) ||
      log.ip_address?.includes(s)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Activity className="w-8 h-8 text-indigo-400" />
            System & Security Audit Logs
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Append-only immutable record of device activations, key generation, payment webhooks, and administrative changes.
          </p>
        </div>

        <button
          onClick={loadLogs}
          disabled={isLoading}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold border border-slate-700 transition-all flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Audit Trail</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, IP, user name..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-700">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Action Event</th>
                <th className="p-4">Target Entity</th>
                <th className="p-4">Initiated By</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 text-xs font-mono text-slate-400">
                    {formatDateTime(log.created_at)}
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-800/50">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-medium text-white capitalize">
                    {log.entity_type} {log.entity_id ? `(${log.entity_id})` : ''}
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-white text-xs">{log.user?.full_name || 'System / Guest'}</div>
                    <div className="text-[11px] text-slate-400">{log.user?.email || 'API Request'}</div>
                  </td>
                  <td className="p-4 font-mono text-xs text-slate-400">
                    {log.ip_address || '127.0.0.1'}
                  </td>
                  <td className="p-4 text-xs font-mono text-slate-400">
                    {log.details ? JSON.stringify(log.details).slice(0, 45) + '...' : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
