import React from 'react';

interface LogoProps {
  className?: string;
  size?: number | string;
}

// IndianOil Official Emblem Component
export const IndianOilLogo: React.FC<LogoProps> = ({ className = '', size = 48 }) => {
  const dimension = typeof size === 'number' ? `${size}px` : size;
  return (
    <div
      style={{ width: dimension, height: dimension }}
      className={`relative inline-flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-white p-1.5 shadow-md border border-slate-300 dark:border-slate-600 ring-1 ring-slate-900/5 overflow-hidden shrink-0 ${className}`}
    >
      <img
        src="/images/logos/indianoil.jpg"
        alt="IndianOil - Indane Gas"
        className="w-full h-full object-contain"
        loading="lazy"
      />
    </div>
  );
};

// HP Gas (Hindustan Petroleum) Official Emblem Component
export const HpGasLogo: React.FC<LogoProps> = ({ className = '', size = 48 }) => {
  const dimension = typeof size === 'number' ? `${size}px` : size;
  return (
    <div
      style={{ width: dimension, height: dimension }}
      className={`relative inline-flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-white p-1.5 shadow-md border border-slate-300 dark:border-slate-600 ring-1 ring-slate-900/5 overflow-hidden shrink-0 ${className}`}
    >
      <img
        src="/images/logos/hp-gas.png"
        alt="HP Gas - Hindustan Petroleum"
        className="w-full h-full object-contain"
        loading="lazy"
      />
    </div>
  );
};

// Bharat Petroleum Official Emblem Component
export const BharatGasLogo: React.FC<LogoProps> = ({ className = '', size = 48 }) => {
  const dimension = typeof size === 'number' ? `${size}px` : size;
  return (
    <div
      style={{ width: dimension, height: dimension }}
      className={`relative inline-flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-white p-1.5 shadow-md border border-slate-300 dark:border-slate-600 ring-1 ring-slate-900/5 overflow-hidden shrink-0 ${className}`}
    >
      <img
        src="/images/logos/bharat-petroleum.png"
        alt="Bharat Petroleum - Bharat Gas"
        className="w-full h-full object-contain"
        loading="lazy"
      />
    </div>
  );
};

// Master Suite Branding Icon
export const GasAgencyMasterLogo: React.FC<LogoProps> = ({ className = '', size = 48 }) => {
  const dimension = typeof size === 'number' ? `${size}px` : size;
  return (
    <div
      style={{ width: dimension, height: dimension }}
      className={`relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-blue-600 shadow-lg shadow-orange-500/25 p-2 text-white shrink-0 ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-full h-full"
      >
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </svg>
    </div>
  );
};

// Interactive Official Logos Showcase Strip for Header / Hero
export const GasBrandsShowcase: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const brands = [
    {
      name: 'IndianOil (Indane)',
      category: 'SDMS Portal Automation',
      desc: '1-Click Refill Booking, Cash Memo Auto-Print & Subsidies',
      img: '/images/logos/indianoil.jpg',
      tag: 'Indane Gas',
      color: 'from-(--brand)/10 to-sky-500/10 border-(--brand)/30 text-(--brand) dark:text-(--brand-ink)',
    },
    {
      name: 'HP Gas (HPCL)',
      category: 'HPCL CMS Portal Tool',
      desc: 'Bulk Cash Memo Dispatch, PMUY 2.0 KYC & HWID Security',
      img: '/images/logos/hp-gas.png',
      tag: 'HPCL Portal',
      color: 'from-sky-500/10 to-(--brand)/10 border-sky-500/30 text-sky-600 dark:text-sky-400',
    },
    {
      name: 'Bharat Petroleum',
      category: 'EBharat Portal Sync',
      desc: 'Smart Cylinder Reconciliation, Instant WhatsApp Receipts',
      img: '/images/logos/bharat-petroleum.png',
      tag: 'Bharat Gas',
      color: 'from-(--brand)/10 to-(--brand)/10 border-(--brand)/30 text-(--brand) dark:text-(--brand-ink)',
    },
  ];

  if (compact) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
        {brands.map((b) => (
          <div key={b.name} className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-white p-1 shadow-md border border-slate-300 dark:border-slate-600 ring-1 ring-slate-900/5 flex items-center justify-center shrink-0">
              <img src={b.img} alt={b.name} className="w-full h-full object-contain" />
            </div>
            <div className="text-left">
              <div className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{b.name}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{b.tag}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
      {brands.map((b) => (
        <div
          key={b.name}
          className="group relative rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-5 shadow-lg hover:shadow-2xl hover:border-(--brand)/40 transition-all duration-300 transform hover:-translate-y-1 text-left"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white p-1.5 shadow-md border border-slate-300 dark:border-slate-600 ring-1 ring-slate-900/5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <img src={b.img} alt={b.name} className="w-full h-full object-contain" />
            </div>
            <div>
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border mb-1 bg-gradient-to-r ${b.color}`}>
                {b.tag}
              </span>
              <h4 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                {b.name}
              </h4>
            </div>
          </div>
          <p className="text-xs font-semibold text-(--brand) dark:text-(--brand-ink) mb-1">
            {b.category}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {b.desc}
          </p>
        </div>
      ))}
    </div>
  );
};
