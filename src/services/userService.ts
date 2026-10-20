import { supabase } from '@/lib/supabase';
import type { Profile, UserRole, ActivityLog } from '@/types';

// Normalize a profiles row to the app Profile shape:
// real DB columns are company / tax_id / status (not company_name / gst_number / is_blocked).
export function normalizeProfile(row: any): Profile {
  return {
    ...row,
    company_name: row.company_name ?? row.company ?? undefined,
    gst_number: row.gst_number ?? row.tax_id ?? undefined,
    is_blocked: row.is_blocked ?? row.status === 'blocked',
  } as Profile;
}

export async function getUsers(): Promise<Profile[]> {
  try {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Failed to load users:', error.message);
      return [];
    }
    return (data || []).map(normalizeProfile);
  } catch (err) {
    console.error('Failed to load users:', err);
    return [];
  }
}

export async function updateUserRole(userId: string, role: UserRole): Promise<boolean> {
  const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
  return !error;
}

export async function toggleUserBlock(userId: string, isBlocked: boolean): Promise<boolean> {
  // profiles has no is_blocked column — blocked state lives in the status column.
  const { error } = await supabase
    .from('profiles')
    .update({ status: isBlocked ? 'blocked' : 'active' })
    .eq('id', userId);
  return !error;
}

export async function getActivityLogs(): Promise<ActivityLog[]> {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Failed to load activity logs:', error.message);
      return [];
    }
    return (data || []) as ActivityLog[];
  } catch (err) {
    console.error('Failed to load activity logs:', err);
    return [];
  }
}

export async function logActivity(log: {
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: any;
  user_id?: string;
}) {
  try {
    await supabase.from('activity_logs').insert([
      {
        ...log,
        created_at: new Date().toISOString(),
      },
    ]);
  } catch (err) {
    console.warn('Could not record activity log:', err);
  }
}
