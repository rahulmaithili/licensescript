import React from 'react';
import { Undo2 } from 'lucide-react';
import { LegalShell, LegalSection, LegalP, LegalList } from '@/components/LegalShell';

export const RefundPolicyPage: React.FC = () => {
  return (
    <LegalShell
      icon={Undo2}
      badge="Refund Policy"
      title="Refund &amp; Cancellation Policy"
      intro="LicenseWala sells digital software licenses that are delivered instantly and activated on your computer. This policy explains clearly when a refund is possible, when it is not, and how to request one — no fine-print surprises."
    >
      <LegalSection title="1. The Basic Rule: Activated Keys Are Non-Refundable">
        <LegalP>
          A license key that has been <strong className="text-slate-800 dark:text-slate-200">activated</strong> — that is,
          redeemed in the software and bound to a hardware / machine ID — is{' '}
          <strong className="text-slate-800 dark:text-slate-200">non-refundable</strong>. Once activated, the key is consumed,
          tied to your machine, and cannot be resold or reissued to anyone else. This is standard practice for digital
          software, and the activation screen informs you before you confirm.
        </LegalP>
        <LegalP>The following are also not eligible for a refund:</LegalP>
        <LegalList
          items={[
            'Plans that have been partially used after activation.',
            'Change of mind, wrong plan selection or “no longer needed” requests after the key has been activated.',
            'Features affected by changes made by third-party portals (IndianOil, HP Gas, Bharat Petroleum) — we issue compatibility updates for these instead, as described in our Terms of Service.',
            'Licenses suspended for misuse, key sharing or resale in breach of our Terms of Service.',
          ]}
        />
      </LegalSection>

      <LegalSection title="2. When You Can Get a Refund">
        <LegalList
          items={[
            <>
              <strong className="text-slate-800 dark:text-slate-200">Key never activated</strong> — if the license key was never
              activated, you may request a full refund within{' '}
              <strong className="text-slate-800 dark:text-slate-200">7 days of purchase</strong>.
            </>,
            <>
              <strong className="text-slate-800 dark:text-slate-200">Software failure we cannot fix</strong> — if the software
              genuinely fails to work on a supported system and our support team is unable to resolve the problem within a
              reasonable window (normally 7 business days from your first support report, with your cooperation), you may
              request a refund for that license.
            </>,
            <>
              <strong className="text-slate-800 dark:text-slate-200">Duplicate or failed payment</strong> — if you were charged
              twice for the same order, or payment was deducted but no license was delivered, we will refund the extra/undelivered
              amount in full.
            </>,
            <>
              <strong className="text-slate-800 dark:text-slate-200">Wrong product delivered</strong> — if a system error
              delivered a different product than the one you paid for and we cannot correct it, you may choose a refund instead.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="3. How to Request a Refund">
        <LegalList
          items={[
            <>
              Email us at{' '}
              <a href="mailto:support@licensewala.com" className="font-bold text-(--brand) dark:text-(--brand-ink) hover:underline">
                support@licensewala.com
              </a>{' '}
              or message us on WhatsApp from your registered mobile number.
            </>,
            'Include your order ID / invoice number, the email address used for purchase, and the reason for the request.',
            'For “software failure” requests, please first raise a support request and give our team the reasonable window described above to fix the issue — most problems are resolved the same day.',
            'We confirm receipt within 1 business day and inform you of approval or the reason for rejection within 3 business days of a complete request.',
          ]}
        />
      </LegalSection>

      <LegalSection title="4. How and When the Refund Reaches You">
        <LegalList
          items={[
            'Approved refunds are processed to the original source account / payment method used at checkout (the same bank account, card or UPI ID) — refunds cannot be issued to a different account.',
            'Refunds are credited within 5–7 business days of approval, depending on your bank and the payment gateway (Razorpay) timelines.',
            'You will receive the refund confirmation and reference number by email.',
            'On refund, the related license key is permanently deactivated and the software will stop working on the bound machine.',
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Plan Changes and Cancellations">
        <LegalList
          items={[
            'You may cancel a renewal at any time from your customer portal or by contacting support — cancellation stops future charges and your current plan simply runs until its expiry date.',
            'Because activated plans are non-refundable, cancelling a plan mid-term does not generate a pro-rata refund.',
            'If you bought the wrong plan and the key is still unused, contact us within 7 days — we will either swap the plan or refund you under Section 2 so you can purchase the correct one.',
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Chargebacks">
        <LegalP>
          If something has gone wrong, please contact us first — we resolve almost every billing issue quickly. Raising a
          chargeback through your bank for a license that was delivered and activated may result in immediate deactivation of
          the license while the dispute is reviewed, and fraudulent chargebacks may lead to account suspension.
        </LegalP>
      </LegalSection>
    </LegalShell>
  );
};
