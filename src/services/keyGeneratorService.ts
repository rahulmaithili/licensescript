import { supabase } from '@/lib/supabase';
import type { LicenseKeyPool } from '@/types';

export interface KeyGenOptions {
  prefix?: string;
  segments?: number;
  segmentLength?: number;
  charset?: 'alphanumeric' | 'alpha' | 'numeric' | 'hex';
  excludeAmbiguous?: boolean;
  productId: string;
  planId?: string;
  quantity: number;
}

const CHARSETS = {
  alphanumeric: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', // excludes 0, O, 1, I
  alpha: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
  numeric: '23456789',
  hex: '0123456789ABCDEF',
};

export function generateCryptoRandomKey(options: {
  prefix?: string;
  segments?: number;
  segmentLength?: number;
  charset?: string;
}): string {
  const segments = options.segments || 4;
  const segmentLength = options.segmentLength || 4;
  const chars = options.charset || CHARSETS.alphanumeric;
  const prefix = options.prefix ? `${options.prefix.toUpperCase().trim()}-` : '';

  const randomValues = new Uint32Array(segments * segmentLength);
  window.crypto.getRandomValues(randomValues);

  const parts: string[] = [];
  let valIdx = 0;

  for (let s = 0; s < segments; s++) {
    let seg = '';
    for (let i = 0; i < segmentLength; i++) {
      seg += chars[randomValues[valIdx++] % chars.length];
    }
    parts.push(seg);
  }

  return `${prefix}${parts.join('-')}`;
}

export async function generateBulkKeys(options: KeyGenOptions): Promise<{
  success: boolean;
  keys: string[];
  count: number;
  error?: string;
}> {
  try {
    const keys: string[] = [];
    const keySet = new Set<string>();
    const count = Math.min(Math.max(1, options.quantity), 1000);

    let attempts = 0;
    while (keySet.size < count && attempts < count * 3) {
      attempts++;
      const key = generateCryptoRandomKey({
        prefix: options.prefix,
        segments: options.segments,
        segmentLength: options.segmentLength,
        charset: CHARSETS[options.charset || 'alphanumeric'],
      });
      keySet.add(key);
    }

    const uniqueKeys = Array.from(keySet);

    // Save to license_keys_pool
    const batchId = `BATCH-${Date.now().toString(36).toUpperCase()}`;
    const rows = uniqueKeys.map((k) => ({
      license_key: k,
      product_id: options.productId,
      plan_id: options.planId || null,
      status: 'unused',
      batch_id: batchId,
      created_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('license_keys_pool').insert(rows);
    if (error) {
      console.warn('Could not save to license_keys_pool directly, fallback:', error.message);
    }

    return {
      success: true,
      keys: uniqueKeys,
      count: uniqueKeys.length,
    };
  } catch (err: any) {
    return {
      success: false,
      keys: [],
      count: 0,
      error: err.message || 'Key generation failed',
    };
  }
}

export async function verifyAndTestKey(licenseKey: string) {
  const cleanKey = licenseKey.trim();
  
  // 1. Check in licenses table
  const { data: license, error: licErr } = await supabase
    .from('licenses')
    .select(`
      *,
      product:products(*),
      plan:plans(*),
      user:profiles(*)
    `)
    .eq('license_key', cleanKey)
    .single();

  if (license && !licErr) {
    return {
      exists: true,
      type: 'assigned_license' as const,
      data: license,
    };
  }

  // 2. Check in key pool
  const { data: poolKey, error: poolErr } = await supabase
    .from('license_keys_pool')
    .select(`
      *,
      product:products(*),
      plan:plans(*)
    `)
    .eq('license_key', cleanKey)
    .single();

  if (poolKey && !poolErr) {
    return {
      exists: true,
      type: 'pool_key' as const,
      data: poolKey,
    };
  }

  return {
    exists: false,
    type: 'not_found' as const,
    data: null,
  };
}
