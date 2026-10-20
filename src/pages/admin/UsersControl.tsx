import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  getUsers,
  updateUserRole,
  toggleUserBlock,
} from '@/services/userService';
import { formatDate } from '@/lib/utils';
import type { Profile, UserRole } from '@/types';

export const UsersControl: React.FC = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    const list = await getUsers();
    setUsers(list);
    setIsLoading(false);
  };

  // Role changes persist through the service first; the UI only reflects
  // the new role when the update actually succeeds.
  const handleRoleChange = async (userId: string, role: UserRole) => {
    if (pendingUserId) return;
    setPendingUserId(userId);
    setFeedback(null);
    const success = await updateUserRole(userId, role);
    setPendingUserId(null);
    if (success) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
      setFeedback({ type: 'success', message: 'User role updated successfully.' });
    } else {
      // Controlled select stays on the old role — nothing was changed.
      setFeedback({ type: 'error', message: 'Could not update the user role. The change was not saved — please try again.' });
    }
  };

  // Block/unblock writes profiles.status via the service; local state
  // flips only on success so the UI never lies about the account state.
  const handleToggleBlock = async (userId: string, isBlocked: boolean) => {
    if (pendingUserId) return;
    setPendingUserId(userId);
    setFeedback(null);
    const success = await toggleUserBlock(userId, isBlocked);
    setPendingUserId(null);
    if (success) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_blocked: isBlocked } : u)));
      setFeedback({
        type: 'success',
        message: isBlocked ? 'User blocked successfully.' : 'User unblocked successfully.',
      });
    } else {
      setFeedback({ type: 'error', message: 'Could not update the account status. The change was not saved — please try again.' });
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q) ||
      u.company_name?.toLowerCase().includes(q);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const hasActiveFilter = searchQuery.trim() !== '' || roleFilter !== 'all';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1330] dark:text-white flex items-center gap-2.5">
            <Users className="w-8 h-8 text-[#1E40FF]" />
            Users & Staff Control
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Assign administrator roles, manage staff permissions, and restrict blocked accounts.
          </p>
        </div>
        <button
          onClick={loadUsers}
          disabled={isLoading}
          className="px-4 py-2.5 rounded-full bg-white dark:bg-slate-800 hover:bg-[#EEF1FF] dark:hover:bg-slate-700 text-[#0A1330] dark:text-slate-300 text-sm font-semibold border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2 disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-sm flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/25 text-rose-600 dark:text-rose-400'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm dark:shadow-xl">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search user, email, phone..."
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-[#0A1330] dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E40FF]/40 focus:border-[#1E40FF]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
            {isLoading ? 'Loading…' : `Showing ${filteredUsers.length} of ${users.length} users`}
          </span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[#0A1330] dark:text-slate-200 text-xs font-medium rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1E40FF]/40 w-full md:w-auto"
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="customer">Customer</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-[#EEF1FF] dark:bg-slate-800/80 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4">User Details</th>
                <th className="p-4">Contact & Company</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Registered Date</th>
                <th className="p-4 text-right">Actions</th>
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

              {!isLoading && users.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <Users className="w-10 h-10 mx-auto text-[#1E40FF]/50" />
                    <p className="mt-3 font-bold text-[#0A1330] dark:text-white">No users yet</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      No profiles exist in the database yet. Users will appear here as soon as someone registers.
                    </p>
                  </td>
                </tr>
              )}

              {!isLoading && users.length > 0 && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <Search className="w-10 h-10 mx-auto text-[#1E40FF]/50" />
                    <p className="mt-3 font-bold text-[#0A1330] dark:text-white">No users match your filters</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Try a different search term or role filter.
                    </p>
                    {hasActiveFilter && (
                      <button
                        onClick={() => { setSearchQuery(''); setRoleFilter('all'); }}
                        className="mt-4 px-4 py-2 rounded-full bg-[#1E40FF] hover:bg-[#1740D6] text-white text-xs font-semibold transition-all"
                      >
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              )}

              {!isLoading &&
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#EEF1FF]/60 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#1E40FF]/10 text-[#1E40FF] dark:text-[#B9C4FF] font-bold flex items-center justify-center text-xs shrink-0">
                          {u.full_name?.charAt(0) || u.email?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-semibold text-[#0A1330] dark:text-white flex items-center gap-1.5">
                            {u.full_name || 'Unnamed user'}
                            {u.role === 'super_admin' && (
                              <span className="text-[10px] bg-[#1E40FF]/10 text-[#1E40FF] dark:text-[#B9C4FF] border border-[#1E40FF]/25 px-2 py-0.5 rounded-full font-bold">
                                Super Admin
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-slate-600 dark:text-slate-300">{u.phone || 'No phone'}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-500">{u.company_name || 'Individual'}</div>
                    </td>
                    <td className="p-4">
                      <select
                        value={u.role}
                        disabled={u.role === 'super_admin' || pendingUserId === u.id}
                        title={u.role === 'super_admin' ? 'The Super Admin role cannot be changed here' : undefined}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold rounded-lg px-2.5 py-1.5 text-[#0A1330] dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1E40FF]/40 disabled:opacity-50"
                      >
                        <option value="super_admin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                        <option value="customer">Customer</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        u.is_blocked
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {u.is_blocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="p-4 text-right">
                      {u.role !== 'super_admin' && (
                        <button
                          onClick={() => handleToggleBlock(u.id, !u.is_blocked)}
                          disabled={pendingUserId === u.id}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all disabled:opacity-50 ${
                            u.is_blocked
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              : 'bg-rose-600 hover:bg-rose-500 text-white'
                          }`}
                        >
                          {pendingUserId === u.id ? 'Saving…' : u.is_blocked ? 'Unblock' : 'Block User'}
                        </button>
                      )}
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
