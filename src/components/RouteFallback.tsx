import React from 'react';

/**
 * Shared loading fallback for lazily-loaded routes.
 * Renders inside the already-mounted layout (PublicLayout / AdminLayout),
 * so it stays transparent and inherits the theme background — no layout flash.
 */
export function RouteFallback() {
  return (
    <div
      className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 px-4 py-16"
      role="status"
      aria-live="polite"
    >
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-4 border-[#1E40FF]/15 dark:border-[#1E40FF]/25" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#1E40FF]" />
      </div>
      <p className="animate-pulse text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400">
        Loading…
      </p>
    </div>
  );
}

export default RouteFallback;
