import React from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { LegalShell, LegalSection, LegalP, LegalList } from '@/components/LegalShell';

export const TermsPage: React.FC = () => {
  return (
    <LegalShell
      icon={FileText}
      badge="Terms of Service"
      title="Terms of Service"
      intro="These terms govern your purchase and use of software licenses from LicenseWala Technologies Pvt Ltd (“LicenseWala”, “we”, “us”) — automation tools for IndianOil (Indane), HP Gas and Bharat Petroleum gas agencies. By creating an account, purchasing a license or activating our software, you accept these terms in full."
    >
      <LegalSection title="1. The Service">
        <LegalP>
          LicenseWala provides downloadable desktop software, browser extensions and related tools that automate routine tasks
          on LPG distributor portals — including area-wise booking generation, batch cash memo printing, booking cancellation
          and delivery-sheet printing — together with an online portal to purchase, manage and renew licenses. Features vary by
          product and plan as described on the product and pricing pages at the time of purchase.
        </LegalP>
      </LegalSection>

      <LegalSection title="2. License Grant">
        <LegalList
          items={[
            'When you purchase a plan, we grant you a non-exclusive, non-transferable, revocable license to install and use the software for one (1) gas agency (one distributorship) for the duration of the plan you purchased.',
            'Each license is bound to a single computer via its hardware / machine ID. You may transfer the binding to a replacement computer through the self-service hardware reset provided in the software, subject to fair-use limits.',
            'Lifetime plans remain valid for the supported lifetime of the product version purchased; monthly and yearly plans expire at the end of their term unless renewed.',
            'The license covers use by the staff of the licensed agency on the bound machine. It does not cover any other agency, branch or third party unless your plan expressly says so.',
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Your Account">
        <LegalList
          items={[
            'You must provide accurate information when registering and keep it updated.',
            'You are responsible for all activity under your account and for keeping your password and license keys confidential.',
            'Notify us immediately at support@licensewala.com if you suspect unauthorised use of your account or keys.',
            'One account may be used only by the agency that purchased the license.',
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Acceptable Use">
        <LegalP>You agree to use the software only for the lawful operations of your own gas agency, including:</LegalP>
        <LegalList
          items={[
            'Processing bookings, cash memos, cancellations and delivery records for your own distributorship.',
            'Using the software on the official distributor portals of IndianOil, HP Gas or Bharat Petroleum with your own authorised portal credentials.',
            'Keeping the software updated to the versions we release.',
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Prohibited Actions">
        <LegalList
          items={[
            <>
              <strong className="text-slate-800 dark:text-slate-200">No redistribution or resale</strong> — you must not sell,
              rent, lease, sublicense, share, publish or otherwise transfer your license key or the software to any other person
              or agency.
            </>,
            <>
              <strong className="text-slate-800 dark:text-slate-200">No circumvention</strong> — you must not attempt to bypass,
              disable or tamper with the hardware binding, activation system or any other licensing control.
            </>,
            <>
              <strong className="text-slate-800 dark:text-slate-200">No reverse engineering</strong> — you must not decompile,
              disassemble or reverse engineer the software, except where such restriction is prohibited by law.
            </>,
            <>
              <strong className="text-slate-800 dark:text-slate-200">No misuse</strong> — you must not use the software to
              access any portal, account or data you are not authorised to access, or for any unlawful purpose.
            </>,
          ]}
        />
        <LegalP>
          A breach of this section may result in immediate suspension or permanent deactivation of your license without a
          refund.
        </LegalP>
      </LegalSection>

      <LegalSection title="6. Payments, Taxes and Invoices">
        <LegalList
          items={[
            'Prices are listed in Indian Rupees (INR) and are exclusive or inclusive of GST as shown at checkout. A GST tax invoice is issued for every successful purchase and is available in your customer portal.',
            'Payments are processed securely by Razorpay. Your license key is delivered digitally, normally within a few minutes of payment confirmation.',
            'You are responsible for providing a correct GSTIN if you wish to claim input tax credit; invoices cannot be re-issued with a different GSTIN after generation.',
          ]}
        />
      </LegalSection>

      <LegalSection title="7. Refunds">
        <LegalP>
          Because our products are digital licenses, refunds are governed by our{' '}
          <Link to="/refund-policy" className="font-bold text-[#1E40FF] dark:text-[#8fa0ff] hover:underline">
            Refund Policy
          </Link>
          , which forms part of these terms. In short: an activated license key is non-refundable, while an unused key may be
          refunded if requested within 7 days of purchase.
        </LegalP>
      </LegalSection>

      <LegalSection title="8. Service Availability and Changes">
        <LegalList
          items={[
            'We work hard to keep the portal and license services available around the clock, but we do not guarantee uninterrupted availability. Maintenance, updates or factors beyond our control may cause brief interruptions.',
            'Our tools interact with third-party distributor portals (IndianOil, HP Gas, Bharat Petroleum). Changes made by those portals may temporarily affect some features; we release compatibility updates as quickly as reasonably possible, and such third-party changes do not by themselves entitle you to a refund.',
            'We may improve, modify or discontinue individual features. Material changes to a purchased plan will be communicated in advance where practical.',
          ]}
        />
      </LegalSection>

      <LegalSection title="9. Intellectual Property">
        <LegalP>
          The software, website, logos and documentation are the intellectual property of LicenseWala Technologies Pvt Ltd or
          its licensors. Your purchase gives you a license to use the software — it does not transfer any ownership or
          intellectual property rights to you. IndianOil, Indane, HP Gas, Bharat Petroleum and other names mentioned are
          trademarks of their respective owners; LicenseWala is an independent tool provider and is not affiliated with or
          endorsed by them.
        </LegalP>
      </LegalSection>

      <LegalSection title="10. Limitation of Liability">
        <LegalList
          items={[
            'The software is provided “as is” and “as available”, without warranties of any kind beyond those required by law.',
            'To the maximum extent permitted by law, LicenseWala will not be liable for indirect, incidental or consequential losses — including loss of business, bookings or profits — arising from the use or inability to use the software.',
            'Our total liability for any claim arising from a purchase will not exceed the amount you paid for the license in question.',
            'Nothing in these terms limits liability that cannot be limited under Indian law.',
          ]}
        />
      </LegalSection>

      <LegalSection title="11. Suspension and Termination">
        <LegalP>
          We may suspend or terminate your account and licenses if you breach these terms, misuse license keys, or use the
          service unlawfully. You may stop using the service at any time; plan fees already paid are handled as per the Refund
          Policy.
        </LegalP>
      </LegalSection>

      <LegalSection title="12. Governing Law">
        <LegalP>
          These terms are governed by the laws of India. Any dispute arising out of or relating to these terms or the service
          will be subject to the exclusive jurisdiction of the competent courts in India. Before approaching a court, both
          parties agree to attempt a good-faith resolution through our support channel.
        </LegalP>
      </LegalSection>

      <LegalSection title="13. Changes to These Terms">
        <LegalP>
          We may revise these terms from time to time. The updated version will be posted on this page with a new “Last updated”
          date. Changes will not retroactively reduce the rights you have under a license you already purchased for its current
          paid term.
        </LegalP>
      </LegalSection>
    </LegalShell>
  );
};
