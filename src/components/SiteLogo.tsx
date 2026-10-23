import React, { useEffect, useState } from 'react';
import { GasAgencyMasterLogo } from '@/components/GasLogos';
import { getCompanyProfile } from '@/services/settingsService';

// The company profile is fetched once per page load and shared between the
// Navbar and Footer brand blocks via this module-level promise cache, so
// wiring the uploaded company logo into the header/footer costs one request.
let companyLogoPromise: Promise<string | null> | null = null;

function loadCompanyLogoUrl(): Promise<string | null> {
  if (!companyLogoPromise) {
    companyLogoPromise = getCompanyProfile()
      .then((profile) => {
        const url = (profile.logo_url || '').trim();
        return url ? url : null;
      })
      .catch(() => null);
  }
  return companyLogoPromise;
}

interface SiteLogoProps {
  variant?: 'navbar' | 'footer';
}

/**
 * Brand mark for the public header/footer. When a company logo has been
 * uploaded in Admin → Company Profile (company_profile.logo_url), renders
 * that image next to the "LicenseWala" wordmark; otherwise — and if the
 * image fails to load — renders the built-in icon + wordmark exactly as
 * before.
 */
export const SiteLogo: React.FC<SiteLogoProps> = ({ variant = 'navbar' }) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    loadCompanyLogoUrl().then((url) => {
      if (alive) setLogoUrl(url);
    });
    return () => {
      alive = false;
    };
  }, []);

  const showUploadedLogo = !!logoUrl && !imgFailed;

  if (variant === 'footer') {
    return (
      <>
        {showUploadedLogo ? (
          <img
            src={logoUrl as string}
            alt="LicenseWala"
            onError={() => setImgFailed(true)}
            className="h-10 w-auto max-w-[160px] object-contain shrink-0"
          />
        ) : (
          <GasAgencyMasterLogo size={40} />
        )}
        <span className="font-extrabold text-2xl tracking-tight text-white">
          License<span className="text-(--brand-ink)">Wala</span>
        </span>
      </>
    );
  }

  return (
    <>
      {showUploadedLogo ? (
        <img
          src={logoUrl as string}
          alt="LicenseWala"
          onError={() => setImgFailed(true)}
          className="h-9 w-auto max-w-[160px] object-contain shrink-0"
        />
      ) : (
        <GasAgencyMasterLogo size={38} className="group-hover:scale-105 transition-transform" />
      )}
      <div>
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-lg xl:text-xl tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            License<span className="text-gradient-brand">Wala</span>
          </span>
          <span className="hidden xl:inline-block px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-(--brand)/10 text-(--brand) dark:text-(--brand-ink) border border-(--brand)/25 whitespace-nowrap">
            LPG Suite
          </span>
        </div>
        <span className="hidden xl:block text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-wide whitespace-nowrap">
          IndianOil • HP Gas • Bharat Petroleum
        </span>
      </div>
    </>
  );
};
