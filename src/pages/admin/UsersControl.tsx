import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  Ban,
  CheckCircle,
  Mail,
  Phone,
  UserCheck,
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

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const list = await getUsers();
    setUsers(list);
  };

  const handleRoleChange = async (userId: string, role: UserRole) => {
    await updateUserRole(userId, role);
    loadUsers();
  };

  const handleToggleBlock = async (userId: string, isBlocked: boolean) => {
    await toggleUserBlock(userId, isBlocked);
    loadUsers();
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Users className="w-8 h-8 text-indigo-400" />
            Users & Staff Control
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Assign administrator roles, manage staff permissions, and restrict blocked accounts.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search user, email, phone..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium rounded-xl px-3 py-2 focus:outline-none w-full md:w-auto"
        >
          <option value="all">All Roles</option>
          <option value="super_admin">Super Admin</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="customer">Customer</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-700">
              <tr>
                <th className="p-4">User Details</th>
                <th className="p-4">Contact & Company</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Registered Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center text-xs">
                        {u.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          {u.full_name}
                          {u.role === 'super_admin' && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold">
                              RM Rahul
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-xs text-slate-300">{u.phone || 'No phone'}</div>
                    <div className="text-xs text-slate-500">{u.company_name || 'Individual'}</div>
                  </td>
                  <td className="p-4">
                    <select
                      value={u.role}
                      disabled={u.email.includes('admin') || u.full_name?.includes('Rahul')}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                      className="bg-slate-800 border border-slate-700 text-xs font-semibold rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none disabled:opacity-50"
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
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {u.is_blocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-slate-400">
                    {formatDate(u.created_at)}
                  </td>
                  <td className="p-4 text-right">
                    {u.role !== 'super_admin' && (
                      <button
                        onClick={() => handleToggleBlock(u.id, !u.is_blocked)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          u.is_blocked
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-rose-600 hover:bg-rose-500 text-white'
                        }`}
                      >
                        {u.is_blocked ? 'Unblock' : 'Block User'}
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
