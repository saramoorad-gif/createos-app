import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Create Suite",
  description:
    "Read the terms and conditions governing your use of the Create Suite platform.",
};

export default function TermsOfServicePage() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-[800px] mx-auto">
        {/* Header */}
        <div className="mb-16">
          <p className="text-[12px] font-sans font-semibold uppercase tracking-[3px] text-[#7BAFC8] mb-4">
            Legal
          </p>
          <h1 className="font-serif text-[40px] leading-tight text-[#1A2C38] mb-4">
            Terms of <em className="text-[#3D6E8A]">Service</em>
          </h1>
          <p className="text-[15px] font-sans text-[#4A6070]">
            Effective Date: April 14, 2026
          </p>
        </div>

        {/* Acceptance of Terms */}
        <div className="pb-10 mb-10 border-b border-[#D8E8EE]">
          <h2 className="font-serif text-[24px] text-[#1A2C38] mb-4">
            Acceptance of Terms
          </h2>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed mb-4">
            These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally
            binding agreement between you (&ldquo;User,&rdquo;
            &ldquo;you,&rdquo; or &ldquo;your&rdquo;) and Create Suite, Inc.
            (&ldquo;Create Suite,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
            &ldquo;our&rdquo;), governing your access to and use of the Create
            Suite platform, website at createsuite.co, and all related services
            (collectively, the &ldquo;Service&rdquo;).
          </p>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed">
            By creating an account or using any part of the Service, you
            acknowledge that you have read, understood, and agree to be bound by
            these Terms and our Privacy Policy. If you do not agree to these
            Terms, you may not access or use the Service.
          </p>
        </div>

        {/* Description of Service */}
        <div className="pb-10 mb-10 border-b border-[#D8E8EE]">
          <h2 className="font-serif text-[24px] text-[#1A2C38] mb-4">
            Description of Service
          </h2>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed mb-4">
            Create Suite is a software-as-a-service (SaaS) platform designed for
            content creators, influencers, and talent agencies. The Service
            provides tools for managing brand deals, contracts, invoicing,
            audience analytics, campaign tracking, rate calculations, media kit
            creation, and agency-creator collaboration.
          </p>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed">
            We reserve the right to modify, suspend, or discontinue any part of
            the Service at any time, with or without notice. We will make
            reasonable efforts to notify users of significant changes that
            affect their use of the platform.
          </p>
        </div>

        {/* Account Registration */}
        <div className="pb-10 mb-10 border-b border-[#D8E8EE]">
          <h2 className="font-serif text-[24px] text-[#1A2C38] mb-4">
            Account Registration
          </h2>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed mb-4">
            To use the Service, you must create an account by providing
            accurate, complete, and current information. You represent and
            warrant that you are at least 18 years of age and have the legal
            capacity to enter into these Terms.
          </p>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed mb-4">
            You are solely responsible for maintaining the confidentiality of
            your account credentials, including your password, and for all
            activities that occur under your account. You agree to notify us
            immediately at{" "}
            <a
              href="mailto:legal@createsuite.co"
              className="text-[#3D6E8A] underline"
            >
              legal@createsuite.co
            </a>{" "}
            if you suspect any unauthorized use of your account.
          </p>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed">
            We reserve the right to suspend or terminate accounts that contain
            inaccurate information, violate these Terms, or remain inactive for
            an extended period.
          </p>
        </div>

        {/* Subscription Plans and Billing */}
        <div className="pb-10 mb-10 border-b border-[#D8E8EE]">
          <h2 className="font-serif text-[24px] text-[#1A2C38] mb-4">
            Subscription Plans and Billing
          </h2>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed mb-4">
            Create Suite offers multiple subscription tiers, including Free, UGC
            Creator, Influencer, and Agency plans. Each plan provides access to
            different features and usage limits as described on our pricing
            page.
          </p>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed mb-4">
            Paid subscriptions are billed on either a monthly or annual basis,
            as selected at the time of purchase. All subscriptions automatically
            renew at the end of each billing cycle unless cancelled before the
            renewal date. Prices are listed in U.S. dollars and are subject to
            change with at least 30 days&rsquo; advance notice.
          </p>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed">
            Payment is processed securely through Stripe, Inc. By subscribing to
            a paid plan, you authorize us to charge your designated payment
            method on a recurring basis. You are responsible for keeping your
            payment information current.
          </p>
        </div>

        {/* Cancellation and Refunds */}
        <div className="pb-10 mb-10 border-b border-[#D8E8EE]">
          <h2 className="font-serif text-[24px] text-[#1A2C38] mb-4">
            Cancellation and Refunds
          </h2>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed mb-4">
            You may cancel your subscription at any time from your account
            settings. Upon cancellation, you will continue to have access to
            your paid features until the end of your current billing period.
            After the billing period expires, your account will revert to the
            Free plan.
          </p>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed">
            We do not provide refunds for the current billing period, partial
            months, or unused time on your subscription. If you believe you were
            charged in error, please contact us at{" "}
            <a
              href="mailto:legal@createsuite.co"
              className="text-[#3D6E8A] underline"
            >
              legal@createsuite.co
            </a>{" "}
            within 14 days of the charge, and we will review your case.
          </p>
        </div>

        {/* User Conduct */}
        <div className="pb-10 mb-10 border-b border-[#D8E8EE]">
          <h2 className="font-serif text-[24px] text-[#1A2C38] mb-4">
            User Conduct
          </h2>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed mb-4">
            You agree to use the Service only for lawful purposes and in
            accordance with these Terms. You agree not to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-[15px] font-sans text-[#4A6070] leading-relaxed">
            <li>
              Use the Service in any way that violates any applicable federal,
              state, local, or international law or regulation.
            </li>
            <li>
              Scrape, crawl, or use automated means to access the Service or
              extract data from the platform without our prior written consent.
            </li>
            <li>
              Impersonate or misrepresent your affiliation with any person or
              entity, including other creators, agencies, or brands.
            </li>
            <li>
              Interfere with or disrupt the integrity or performance of the
              Service or its underlying infrastructure.
            </li>
            <li>
              Attempt to gain unauthorized access to any part of the Service,
              other user accounts, or systems connected to the Service.
            </li>
            <li>
              Upload or transmit viruses, malware, or other harmful code.
            </li>
            <li>
              Use the Service to send unsolicited messages, spam, or
              advertisements.
            </li>
          </ul>
        </div>

        {/* Content Ownership */}
        <div className="pb-10 mb-10 border-b border-[#D8E8EE]">
          <h2 className="font-serif text-[24px] text-[#1A2C38] mb-4">
            Content Ownership
          </h2>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed mb-4">
            You retain full ownership of all data, content, and materials that
            you upload, create, or store through the Service (&ldquo;User
            Content&rdquo;). This includes but is not limited to contracts,
            invoices, media kits, campaign data, audience analytics, and any
            other information you input into the platform.
          </p>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed">
            By using the Service, you grant Create Suite a limited,
            non-exclusive, royalty-free license to host, display, and process
            your User Content solely for the purpose of providing the Service to
            you. We will not use your User Content for any other purpose,
            including marketing or training, without your explicit consent. This
            license terminates when you delete your User Content or your
            account.
          </p>
        </div>

        {/* Intellectual Property */}
        <div className="pb-10 mb-10 border-b border-[#D8E8EE]">
          <h2 className="font-serif text-[24px] text-[#1A2C38] mb-4">
            Intellectual Property
          </h2>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed">
            The Service, including all software, code, design, text, graphics,
            logos, trademarks, and other materials (collectively, &ldquo;Create
            Suite Materials&rdquo;) are the exclusive property of Create Suite,
            Inc. and are protected by United States and international
            intellectual property laws. You may not copy, modify, distribute,
            sell, or lease any part of the Create Suite Materials without our
            prior written permission. Nothing in these Terms grants you any
            right, title, or interest in the Create Suite Materials except for
            the limited right to use the Service as permitted under these Terms.
          </p>
        </div>

        {/* Third-Party Services */}
        <div className="pb-10 mb-10 border-b border-[#D8E8EE]">
          <h2 className="font-serif text-[24px] text-[#1A2C38] mb-4">
            Third-Party Services
          </h2>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed mb-4">
            The Service integrates with and relies upon third-party services,
            including but not limited to Supabase (database and authentication),
            Stripe, Inc. (payment processing), and Vercel, Inc. (hosting and
            deployment). Your use of these third-party services is subject to
            their respective terms of service and privacy policies.
          </p>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed">
            We are not responsible for the availability, accuracy, or content of
            any third-party services, and we do not endorse or assume liability
            for their practices. Any issues arising from your use of third-party
            services should be directed to the respective providers.
          </p>
        </div>

        {/* Limitation of Liability */}
        <div className="pb-10 mb-10 border-b border-[#D8E8EE]">
          <h2 className="font-serif text-[24px] text-[#1A2C38] mb-4">
            Limitation of Liability
          </h2>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed mb-4">
            To the maximum extent permitted by applicable law, in no event shall
            Create Suite, Inc., its directors, officers, employees, agents, or
            affiliates be liable for any indirect, incidental, special,
            consequential, or punitive damages, including but not limited to
            loss of profits, revenue, data, use, goodwill, or other intangible
            losses, arising out of or related to your use of or inability to use
            the Service.
          </p>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed">
            Our total aggregate liability for any claims arising under these
            Terms or related to the Service shall not exceed the total amount
            you paid to Create Suite in the twelve (12) months immediately
            preceding the event giving rise to the claim.
          </p>
        </div>

        {/* Disclaimer of Warranties */}
        <div className="pb-10 mb-10 border-b border-[#D8E8EE]">
          <h2 className="font-serif text-[24px] text-[#1A2C38] mb-4">
            Disclaimer of Warranties
          </h2>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed">
            The Service is provided on an &ldquo;as is&rdquo; and &ldquo;as
            available&rdquo; basis, without warranties of any kind, either
            express or implied, including but not limited to implied warranties
            of merchantability, fitness for a particular purpose,
            non-infringement, or course of performance. We do not warrant that
            the Service will be uninterrupted, error-free, secure, or free of
            viruses or other harmful components. You use the Service at your own
            risk.
          </p>
        </div>

        {/* Indemnification */}
        <div className="pb-10 mb-10 border-b border-[#D8E8EE]">
          <h2 className="font-serif text-[24px] text-[#1A2C38] mb-4">
            Indemnification
          </h2>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed">
            You agree to indemnify, defend, and hold harmless Create Suite,
            Inc., its officers, directors, employees, agents, and affiliates
            from and against any and all claims, liabilities, damages, losses,
            costs, and expenses (including reasonable attorneys&rsquo; fees)
            arising out of or related to: (a) your use of the Service; (b) your
            violation of these Terms; (c) your violation of any applicable law
            or regulation; or (d) your User Content. This indemnification
            obligation will survive the termination of your account and these
            Terms.
          </p>
        </div>

        {/* Governing Law */}
        <div className="pb-10 mb-10 border-b border-[#D8E8EE]">
          <h2 className="font-serif text-[24px] text-[#1A2C38] mb-4">
            Governing Law
          </h2>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed">
            These Terms and any disputes arising from or related to the Service
            shall be governed by and construed in accordance with the laws of
            the Commonwealth of Virginia, United States of America, without
            regard to its conflict of law provisions.
          </p>
        </div>

        {/* Dispute Resolution */}
        <div className="pb-10 mb-10 border-b border-[#D8E8EE]">
          <h2 className="font-serif text-[24px] text-[#1A2C38] mb-4">
            Dispute Resolution
          </h2>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed mb-4">
            In the event of any dispute, claim, or controversy arising out of or
            relating to these Terms or the Service, you agree to first attempt
            to resolve the matter informally by contacting us at{" "}
            <a
              href="mailto:legal@createsuite.co"
              className="text-[#3D6E8A] underline"
            >
              legal@createsuite.co
            </a>
            . We will make good-faith efforts to resolve the dispute within 30
            days.
          </p>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed">
            If the dispute cannot be resolved informally, you agree that it
            shall be settled by binding arbitration administered by the American
            Arbitration Association in accordance with its Commercial
            Arbitration Rules. The arbitration shall take place in the
            Commonwealth of Virginia. The arbitrator&rsquo;s decision shall be
            final and binding and may be entered as a judgment in any court of
            competent jurisdiction. You and Create Suite agree that any dispute
            resolution proceedings will be conducted on an individual basis and
            not in a class, consolidated, or representative action.
          </p>
        </div>

        {/* Changes to Terms */}
        <div className="pb-10 mb-10 border-b border-[#D8E8EE]">
          <h2 className="font-serif text-[24px] text-[#1A2C38] mb-4">
            Changes to These Terms
          </h2>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed">
            We reserve the right to modify these Terms at any time. If we make
            material changes, we will notify you by sending an email to the
            address associated with your account at least 30 days before the
            changes take effect. Your continued use of the Service after the
            effective date of the revised Terms constitutes your acceptance of
            the changes. If you do not agree with the revised Terms, you must
            stop using the Service and cancel your account before the changes
            take effect.
          </p>
        </div>

        {/* Contact */}
        <div className="pb-10">
          <h2 className="font-serif text-[24px] text-[#1A2C38] mb-4">
            Contact Us
          </h2>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed mb-4">
            If you have any questions about these Terms, please contact us at:
          </p>
          <div className="text-[15px] font-sans text-[#4A6070] leading-relaxed">
            <p className="font-medium text-[#1A2C38]">Create Suite, Inc.</p>
            <p>
              Email:{" "}
              <a
                href="mailto:legal@createsuite.co"
                className="text-[#3D6E8A] underline"
              >
                legal@createsuite.co
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
