import { supabase } from '@/lib/supabase';

const FLAG = 'lw_trial_checked';

/**
 * Best-effort automatic 7-day free trial issuance.
 *
 * Fire-and-forget: asks the trial-license Netlify function (server-side,
 * service role) to issue a trial for the signed-in user. The function is
 * idempotent — it returns the existing trial instead of creating a second
 * one — so this is safe to call on every session establishment. This helper
 * never throws and never surfaces UI.
 */
export async function ensureTrialLicense(): Promise<void> {
  try {
    if (sessionStorage.getItem(FLAG)) {
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return;
    }

    // Set the flag BEFORE the fetch so React StrictMode's double-invoke
    // (and any concurrent auth events) don't fire duplicate requests.
    // Server-side idempotency is the real guard anyway.
    sessionStorage.setItem(FLAG, '1');

    await fetch('/.netlify/functions/trial-license', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({}),
    });
    // Response intentionally ignored.
  } catch {
    // Best-effort only — never let trial issuance break auth or the UI.
  }
}
