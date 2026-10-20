import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { LegalShell, LegalSection, LegalP, LegalList } from '@/components/LegalShell';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <LegalShell
      icon={ShieldCheck}
      badge="Privacy Policy"
      title="Privacy Policy"
      intro="LicenseWala Technologies Pvt Ltd (“LicenseWala”, “we”, “us”) operates a software licensing platform for LPG gas agency automation tools used by IndianOil (Indane), HP Gas and Bharat Petroleum distributors. This policy explains what information we collect, how we use it, and the choices you have. By using our website and software, you agree to the practices described here."
    >
      <LegalSection title="1. Information We Collect">
        <LegalP>We collect only the information needed to sell, deliver and support your software license:</LegalP>
        <LegalList
          items={[
            <>
              <strong className="text-slate-800 dark:text-slate-200">Account information</strong> — your name, email address,
              mobile number, agency name and address, and (where you provide it for GST invoicing) your GSTIN / tax ID, collected
              when you register or purchase.
            </>,
            <>
              <strong className="text-slate-800 dark:text-slate-200">Payment information</strong> — payments are processed
              directly by our payment partner, Razorpay. We never see or store your full card number, UPI PIN or
              net-banking credentials. We receive only the transaction ID, amount, payment method type and payment status so we
              can confirm your order and issue your invoice.
            </>,
            <>
              <strong className="text-slate-800 dark:text-slate-200">License &amp; device information</strong> — the license keys
              issued to you and the hardware / machine ID of the computer on which a license is activated. Hardware binding is a
              core security feature of our software and is used solely to enforce your license.
            </>,
            <>
              <strong className="text-slate-800 dark:text-slate-200">Support communications</strong> — messages, emails and
              screenshots you send us when you ask for help, including remote-assistance sessions you initiate.
            </>,
            <>
              <strong className="text-slate-800 dark:text-slate-200">Technical information</strong> — basic device, browser and
              log data generated when you use the platform, used to keep the service secure and working.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="2. How We Use Your Information">
        <LegalList
          items={[
            'To create and manage your account and customer portal.',
            'To process payments, generate GST invoices and deliver your license key.',
            'To activate, bind, renew and verify your license on your hardware.',
            'To provide customer support, including troubleshooting and remote assistance at your request.',
            'To send service-related messages such as payment confirmations, invoice copies, license expiry reminders and important product updates.',
            'To prevent fraud, license-key sharing and other misuse of the platform.',
            'To meet our legal, accounting and tax obligations under Indian law.',
          ]}
        />
        <LegalP>
          We do not use your information for advertising profiling, and we never sell your personal data to anyone.
        </LegalP>
      </LegalSection>

      <LegalSection title="3. How We Share Information">
        <LegalP>Your information is shared only where it is necessary to run the service:</LegalP>
        <LegalList
          items={[
            <>
              <strong className="text-slate-800 dark:text-slate-200">Payment gateway</strong> — Razorpay processes
              your payment under its own privacy policy. This is the only category of third party that receives your payment
              details.
            </>,
            <>
              <strong className="text-slate-800 dark:text-slate-200">Infrastructure providers</strong> — our hosting and
              database providers store platform data on our behalf under strict access controls.
            </>,
            <>
              <strong className="text-slate-800 dark:text-slate-200">Legal requirements</strong> — we may disclose information
              if required by law, court order or a lawful request from a government authority, or to protect our rights and the
              security of the platform.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Cookies">
        <LegalP>
          We use only essential cookies and local storage — for example, to keep you signed in and to remember your light/dark
          theme preference. We do not use advertising cookies or third-party tracking cookies. If you disable essential cookies
          in your browser, some parts of the platform, such as sign-in, may not work correctly.
        </LegalP>
      </LegalSection>

      <LegalSection title="5. Data Security">
        <LegalP>
          Data is transmitted over encrypted (HTTPS/TLS) connections, access to production systems is restricted to authorised
          team members, and license keys are delivered through authenticated channels. Payment processing is handled by
          PCI-DSS compliant gateways. While we apply industry-standard safeguards, no method of transmission or storage is
          completely secure, and we cannot guarantee absolute security.
        </LegalP>
      </LegalSection>

      <LegalSection title="6. Data Retention">
        <LegalP>
          We keep your account, license and invoice records for as long as your license is active and for the period required
          afterwards by Indian accounting and tax law. Support conversations are retained only as long as needed to resolve and
          reference your requests. When data is no longer required, it is deleted or anonymised.
        </LegalP>
      </LegalSection>

      <LegalSection title="7. Your Rights">
        <LegalP>
          In line with the Digital Personal Data Protection Act, 2023 (India), you may request access to the personal data we
          hold about you, correction of inaccurate data, and deletion of your data where the law permits. You may also withdraw
          consent for non-essential processing. To exercise any of these rights, write to us at{' '}
          <a href="mailto:support@licensewala.com" className="font-bold text-[#1E40FF] dark:text-[#8fa0ff] hover:underline">
            support@licensewala.com
          </a>
          . We may verify your identity before acting on a request, and we respond within the timelines required by law.
        </LegalP>
      </LegalSection>

      <LegalSection title="8. Who This Service Is For">
        <LegalP>
          LicenseWala is a business-to-business service for LPG distributorships and their staff. It is not directed at
          individuals under 18 years of age, and we do not knowingly collect their data.
        </LegalP>
      </LegalSection>

      <LegalSection title="9. Changes to This Policy">
        <LegalP>
          We may update this policy from time to time. The revised version will be posted on this page with a new “Last updated”
          date, and significant changes will be announced on the platform or by email. Continued use of the service after an
          update means you accept the revised policy.
        </LegalP>
      </LegalSection>
    </LegalShell>
  );
};
