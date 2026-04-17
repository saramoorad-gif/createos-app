import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Affiliate Program Agreement — Create Suite",
  description: "Terms and conditions for the CreateSuite Affiliate Program. Version 1.0, effective April 2026.",
};

const sectionClass = "pb-10 mb-10 border-b border-[#D8E8EE]";
const h2Class = "font-serif text-[24px] text-[#1A2C38] mb-4";
const pClass = "text-[15px] font-sans text-[#4A6070] leading-relaxed mb-4";
const listClass = "list-disc pl-6 space-y-2 text-[15px] font-sans text-[#4A6070] leading-relaxed mb-4";

export default function AffiliateAgreementPage() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-[800px] mx-auto">
        {/* Header */}
        <div className="mb-16">
          <p className="text-[12px] font-sans font-semibold uppercase tracking-[3px] text-[#7BAFC8] mb-4">
            Legal
          </p>
          <h1 className="font-serif text-[40px] leading-tight text-[#1A2C38] mb-4">
            Affiliate Program <em className="text-[#3D6E8A]">Agreement</em>
          </h1>
          <p className="text-[15px] font-sans text-[#4A6070]">
            Version 1.0 — Effective April 2026
          </p>
        </div>

        <div className={sectionClass}>
          <p className={pClass}>
            This Affiliate Program Agreement (&quot;Agreement&quot;) is between Create Suite LLC
            (&quot;CreateSuite,&quot; &quot;we,&quot; &quot;us&quot;) and the individual or entity accepting this
            Agreement (&quot;Affiliate,&quot; &quot;you&quot;). By clicking &quot;I Agree&quot; during onboarding,
            you accept these terms.
          </p>
        </div>

        {/* 1. Program Overview */}
        <div className={sectionClass}>
          <h2 className={h2Class}>1. Program Overview</h2>
          <p className={pClass}>
            You will receive a unique affiliate link and promo code. Anyone who signs up
            for CreateSuite&apos;s UGC + Influencer plan ($39/month) using your link or code
            will receive $12 off their first month ($27 instead of $39). You will earn
            commission on their subscription payments as described in Section 3.
          </p>
        </div>

        {/* 2. Eligibility */}
        <div className={sectionClass}>
          <h2 className={h2Class}>2. Eligibility</h2>
          <p className={pClass}>To participate, you must:</p>
          <ul className={listClass}>
            <li>Be 18 years of age or older</li>
            <li>Have an active CreateSuite account in good standing</li>
            <li>Have been approved by us for the affiliate program</li>
            <li>Comply with all applicable laws and platform rules where you promote</li>
          </ul>
          <p className={pClass}>
            We may reject applications or terminate participation at our sole discretion.
          </p>
        </div>

        {/* 3. Commission Structure */}
        <div className={sectionClass}>
          <h2 className={h2Class}>3. Commission Structure</h2>
          <p className={pClass}>
            <strong>Rate:</strong> 15% of the net subscription revenue (after Stripe fees, before taxes)
            from each paying subscriber you refer.
          </p>
          <p className={pClass}>
            <strong>Duration:</strong> Commissions are paid for 12 consecutive months from the date
            of the subscriber&apos;s first successful payment. After 12 months, the subscriber
            is &quot;graduated&quot; and no further commissions are earned on that account.
          </p>
          <p className={pClass}>
            <strong>Eligible plans:</strong> Only the UGC + Influencer tier ($39/month). You do not
            earn commission on Free plan conversions or Agency plan subscriptions.
          </p>
          <p className={pClass}>
            <strong>Example:</strong> Subscriber signs up May 1 using your link. They pay $27 month one
            (your commission: $4.05). They pay $39/month for months 2–12 (your commission:
            $5.85/month). Total earned over 12 months: approximately $68.40.
          </p>
        </div>

        {/* 4. Attribution */}
        <div className={sectionClass}>
          <h2 className={h2Class}>4. Attribution</h2>
          <p className={pClass}>Signups are attributed to you if the follower:</p>
          <ul className={listClass}>
            <li>Clicks your affiliate link (cookie persists for 30 days); OR</li>
            <li>Enters your promo code at checkout</li>
          </ul>
          <p className={pClass}>
            If a follower both clicks a link and enters a different code, the code at
            checkout takes precedence. If a follower clicks multiple affiliate links,
            the most recent click within the 30-day window is credited.
          </p>
        </div>

        {/* 5. Payouts */}
        <div className={sectionClass}>
          <h2 className={h2Class}>5. Payouts</h2>
          <p className={pClass}>
            <strong>Schedule:</strong> Commissions are paid monthly, on or around the 15th of each
            month, for commissions earned and released in the prior period.
          </p>
          <p className={pClass}>
            <strong>Minimum payout:</strong> $50. Balances below $50 roll forward to the next month.
          </p>
          <p className={pClass}>
            <strong>Holding period:</strong> Commissions are held for 30 days after the original
            charge to account for refunds, chargebacks, and disputes. After 30 days,
            they become payable.
          </p>
          <p className={pClass}>
            <strong>Method:</strong> Payouts are sent via Stripe Connect to a bank account you
            provide during onboarding. You are responsible for any local bank fees.
          </p>
          <p className={pClass}>
            <strong>Taxes:</strong> You are solely responsible for reporting and paying taxes on your
            commission income. If you are a U.S. resident and earn $600 or more in a
            calendar year, we will issue a 1099-NEC as required by law.
          </p>
        </div>

        {/* 6. Refunds, Chargebacks, and Voided Commissions */}
        <div className={sectionClass}>
          <h2 className={h2Class}>6. Refunds, Chargebacks, and Voided Commissions</h2>
          <p className={pClass}>
            If a subscriber refunds a payment or initiates a chargeback, the associated
            commission is voided. If the commission has already been paid to you, the
            voided amount will be deducted from your next payout. If your balance becomes
            negative and remains so for 90 days, we reserve the right to invoice you
            for the deficit.
          </p>
        </div>

        {/* 7. Permitted Promotion */}
        <div className={sectionClass}>
          <h2 className={h2Class}>7. Permitted Promotion</h2>
          <p className={pClass}><strong>You MAY:</strong></p>
          <ul className={listClass}>
            <li>Promote CreateSuite on your owned social channels, website, newsletter, podcast, or similar</li>
            <li>Share your honest experience using the product</li>
            <li>Use screenshots of your own CreateSuite account</li>
            <li>Share the one-pager, promotional assets, and content we provide</li>
            <li>Describe publicly available features, pricing, and benefits</li>
          </ul>
          <p className={pClass}><strong>You MAY NOT:</strong></p>
          <ul className={listClass}>
            <li>Misrepresent CreateSuite&apos;s features, pricing, or capabilities</li>
            <li>Impersonate CreateSuite, its team, or other creators</li>
            <li>Make claims about earnings or results that are not your own actual experience</li>
            <li>Use paid advertising (Meta Ads, Google Ads, TikTok Ads) that targets CreateSuite brand keywords or URLs without prior written approval</li>
            <li>Bid on or register domains that include &quot;createsuite&quot; or confusingly similar terms</li>
            <li>Use spam, unsolicited email, SMS, or any deceptive marketing practices</li>
            <li>Offer unauthorized cashback, rebates, or incentives on top of the program benefit</li>
          </ul>
        </div>

        {/* 8. FTC Disclosure */}
        <div className={sectionClass}>
          <h2 className={h2Class}>8. FTC Disclosure</h2>
          <p className={pClass}>
            U.S. law requires that you disclose your material connection with CreateSuite
            in every sponsored post. You agree to include clear disclosure such as &quot;#ad,&quot;
            &quot;#sponsored,&quot; or &quot;paid partnership&quot; per FTC Endorsement Guides. Failure to
            comply may result in termination and forfeiture of unpaid commissions.
          </p>
        </div>

        {/* 9. Intellectual Property */}
        <div className={sectionClass}>
          <h2 className={h2Class}>9. Intellectual Property</h2>
          <p className={pClass}>
            We grant you a limited, revocable, non-exclusive license to use the
            CreateSuite name, logo, and marketing materials solely for the purpose of
            promoting the product under this Agreement. You may not modify the logo,
            combine it with other marks, or imply an endorsement relationship beyond
            this affiliate program.
          </p>
        </div>

        {/* 10. Term and Termination */}
        <div className={sectionClass}>
          <h2 className={h2Class}>10. Term and Termination</h2>
          <p className={pClass}>
            Either party may terminate this Agreement at any time, with or without cause,
            by written notice (including email). Upon termination:
          </p>
          <ul className={listClass}>
            <li>Commissions earned through the termination date will be paid per Section 5</li>
            <li>Commissions in the 30-day holding period will be released normally</li>
            <li>Your affiliate link and promo code will be deactivated</li>
          </ul>
          <p className={pClass}>
            We may terminate immediately and void unpaid commissions if you breach this
            Agreement, engage in fraud, or harm the CreateSuite brand.
          </p>
        </div>

        {/* 11. Confidentiality */}
        <div className={sectionClass}>
          <h2 className={h2Class}>11. Confidentiality</h2>
          <p className={pClass}>
            You may receive non-public information about CreateSuite, including
            unreleased features, financial data, and other creators&apos; earnings. You agree
            not to share this information publicly or with third parties.
          </p>
        </div>

        {/* 12. No Employment Relationship */}
        <div className={sectionClass}>
          <h2 className={h2Class}>12. No Employment Relationship</h2>
          <p className={pClass}>
            You are an independent contractor. This Agreement does not create an
            employment, partnership, joint venture, or agency relationship. You have no
            authority to bind CreateSuite to any contract or obligation.
          </p>
        </div>

        {/* 13. Disclaimers and Limitations */}
        <div className={sectionClass}>
          <h2 className={h2Class}>13. Disclaimers and Limitations</h2>
          <p className={pClass}>
            CreateSuite provides the affiliate program &quot;as is.&quot; We make no guarantee
            about your earnings — results depend on your audience, content, and effort.
            Our total liability under this Agreement is limited to the amount of
            commissions we owe you at the time of the claim.
          </p>
        </div>

        {/* 14. Changes to This Agreement */}
        <div className={sectionClass}>
          <h2 className={h2Class}>14. Changes to This Agreement</h2>
          <p className={pClass}>
            We may update this Agreement from time to time. Material changes will be
            communicated by email at least 14 days before taking effect. Continued
            participation after changes take effect constitutes acceptance.
          </p>
        </div>

        {/* 15. Governing Law */}
        <div className="pb-10 mb-10">
          <h2 className={h2Class}>15. Governing Law</h2>
          <p className={pClass}>
            This Agreement is governed by the laws of the Commonwealth of Virginia,
            without regard to conflict of laws principles. Disputes will be resolved in
            the state or federal courts located in Fairfax County, Virginia.
          </p>
        </div>

        {/* Footer */}
        <div className="bg-[#F2F8FB] border border-[#D8E8EE] rounded-[10px] p-6 text-center">
          <p className={pClass}>
            By accepting this Agreement, you confirm that you have read, understood,
            and agree to be bound by these terms.
          </p>
          <p className="text-[14px] font-sans text-[#8AAABB]">
            Questions?{" "}
            <a href="mailto:hello@createsuite.co" className="text-[#7BAFC8] hover:underline">
              hello@createsuite.co
            </a>
          </p>
          <p className="text-[13px] font-sans text-[#8AAABB] mt-4">
            Create Suite LLC
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link href="/referral-program" className="text-[14px] font-sans text-[#7BAFC8] hover:underline">
            &larr; Back to Referral Program
          </Link>
        </div>
      </div>
    </section>
  );
}
