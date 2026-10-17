import { supabase } from '@/lib/supabase';
import type { Profile, UserRole, ActivityLog } from '@/types';

export const DEFAULT_USERS: Profile[] = [
  {
    id: 'user-admin',
    email: 'admin@licensewala.com',
    full_name: 'RM Rahul (Super Admin)',
    phone: '+91 98765 43210',
    company_name: 'LicenseWala HQ',
    role: 'super_admin',
    is_blocked: false,
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-1',
    email: 'amit.patel@gmail.com',
    full_name: 'Amit Patel',
    phone: '+91 98200 12345',
    company_name: 'Apex Digitech Solutions',
    city: 'Mumbai',
    country: 'India',
    role: 'customer',
    is_blocked: false,
    created_at: '2026-02-15T10:00:00Z',
  },
  {
    id: 'user-2',
    email: 'rohit.sharma@outlook.com',
    full_name: 'Rohit Sharma',
    phone: '+91 99341 87654',
    company_name: 'LeadBoosters Media',
    city: 'Noida',
    country: 'India',
    role: 'customer',
    is_blocked: false,
    created_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'user-3',
    email: 'vikas.verma@gmail.com',
    full_name: 'Vikas Verma',
    phone: '+91 91234 56789',
    company_name: 'Smart Solutions Inc',
    city: 'Patna',
    country: 'India',
    role: 'customer',
    is_blocked: false,
    created_at: '2026-01-05T00:00:00Z',
  },
  {
    id: 'user-4',
    email: 'priya.sharma@yahoo.com',
    full_name: 'Priya Sharma',
    phone: '+91 97654 32109',
    role: 'customer',
    is_blocked: true,
    created_at: '2026-02-01T00:00:00Z',
  }
];

export async function getUsers(): Promise<Profile[]> {
  try {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) {
      return DEFAULT_USERS;
    }
    return data as Profile[];
  } catch {
    return DEFAULT_USERS;
  }
}

export async function updateUserRole(userId: string, role: UserRole): Promise<boolean> {
  const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
  return !error;
}

export async function toggleUserBlock(userId: string, isBlocked: boolean): Promise<boolean> {
  const { error } = await supabase.from('profiles').update({ is_blocked: isBlocked }).eq('id', userId);
  return !error;
}

export async function getActivityLogs(): Promise<ActivityLog[]> {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*, user:profiles(*)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !data || data.length === 0) {
      return [
        {
          id: 'log-1',
          action: 'PAYMENT_SUCCESS',
          entity_type: 'order',
          entity_id: 'ord-9921',
          details: { amount: 1999, gateway: 'razorpay', product: 'WhatsApp Bulk Sender' },
          ip_address: '103.21.12.89',
          created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          user: DEFAULT_USERS[1],
        },
        {
          id: 'log-2',
          action: 'LICENSE_GENERATED',
          entity_type: 'license',
          entity_id: 'LW-WAPRO-7K9A-4M2X-88PL',
          details: { duration: 180, plan: 'Professional' },
          ip_address: '103.21.12.89',
          created_at: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
          user: DEFAULT_USERS[1],
        },
        {
          id: 'log-3',
          action: 'DEVICE_ACTIVATED',
          entity_type: 'license_activation',
          entity_id: 'act-001',
          details: { browser: 'Chrome 122', os: 'Windows 11', hwid: 'HWID-WIN-98271' },
          ip_address: '103.21.12.89',
          created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          user: DEFAULT_USERS[1],
        },
        {
          id: 'log-4',
          action: 'ADMIN_LOGIN',
          entity_type: 'auth',
          entity_id: 'user-admin',
          details: { email: 'admin@licensewala.com', role: 'super_admin' },
          ip_address: '122.161.45.10',
          created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
          user: DEFAULT_USERS[0],
        },
      ];
    }
    return data as ActivityLog[];
  } catch {
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
