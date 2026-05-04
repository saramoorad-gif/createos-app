import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Create Suite",
  description:
    "Learn how Create Suite collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-[800px] mx-auto">
        {/* Header */}
        <div className="mb-16">
          <p className="text-[12px] font-sans font-semibold uppercase tracking-[3px] text-[#7BAFC8] mb-4">
            Legal
          </p>
          <h1 className="font-serif text-[40px] leading-tight text-[#1A2C38] mb-4">
            Privacy <em className="text-[#3D6E8A]">Policy</em>
          </h1>
          <p className="text-[15px] font-sans text-[#4A6070]">
            Effective Date: April 14, 2026
          </p>
        </div>

        {/* Introduction */}
        <div className="pb-10 mb-10 border-b border-[#D8E8EE]">
          <h2 className="font-serif text-[24px] text-[#1A2C38] mb-4">
            Introduction
          </h2>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed mb-4">
            Create Suite, Inc. (&ldquo;Create Suite,&rdquo; &ldquo;we,&rdquo;
            &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates the website
            located at createsuite.co and the Create Suite platform
            (collectively, the &ldquo;Service&rdquo;). This Privacy Policy
            explains how we collect, use, disclose, and safeguard your
            information when you visit our website or use our Service.
          </p>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed">
            By accessing or using the Service, you agree to the collection and
            use of information in accordance with this Privacy Policy. If you do
            not agree with the terms of this Privacy Policy, please do not
            access the Service.
          </p>
        </div>

        {/* Information We Collect */}
        <div className="pb-10 mb-10 border-b border-[#D8E8EE]">
          <h2 className="font-serif text-[24px] text-[#1A2C38] mb-4">
            Information We Collect
          </h2>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed mb-4">
            We collect information that you provide directly to us, information
            that is collected automatically when you use the Service, and
            information from third-party sources.
          </p>

          <h3 className="font-sans text-[17px] font-medium text-[#1A2C38] mb-2 mt-6">
            Account Information
          </h3>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed mb-4">
            When you create an account, we collect your full name, email
            address, and a hashed version of your password. If you sign up as
            part of an agency, we may also collect your agency name, role, and
            team information. You may optionally provide a profile photo,
            social media handles, and a bio.
          </p>

          <h3 className="font-sans text-[17px] font-medium text-[#1A2C38] mb-2 mt-6">
            Usage Data
          </h3>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed mb-4">
            We automatically collect information about how you interact with the
            Service, including the pages you visit, the features you use, the
            actions you take, the time and date of your visits, the time spent
            on each page, and your navigation path through the platform. We also
            collect device information such as your browser type, operating
            system, and screen resolution.
          </p>

          <h3 className="font-sans text-[17px] font-medium text-[#1A2C38] mb-2 mt-6">
            Payment Information
          </h3>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed mb-4">
            When you subscribe to a paid plan, your payment information
            (including credit card number, billing address, and related details)
            is collected and processed directly by our third-party payment
            processor, Stripe, Inc. We do not store your full credit card number
            on our servers. We receive only a tokenized reference, the last four
            digits of your card, the card brand, and the expiration date for
            display and record-keeping purposes.
          </p>

          <h3 className="font-sans text-[17px] font-medium text-[#1A2C38] mb-2 mt-6">
            Cookies and Analytics
          </h3>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed">
            We use cookies and similar tracking technologies to maintain your
            session, remember your preferences, and gather aggregate analytics
            about how the Service is used. For more details, see the
            &ldquo;Cookies&rdquo; section below.
          </p>
        </div>

        {/* How We Use Information */}
        <div className="pb-10 mb-10 border-b border-[#D8E8EE]">
          <h2 className="font-serif text-[24px] text-[#1A2C38] mb-4">
            How We Use Your Information
          </h2>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed mb-4">
            We use the information we collect for the following purposes:
          </p>
          <ul className="list-disc list-inside space-y-2 text-[15px] font-sans text-[#4A6070] leading-relaxed">
            <li>
              <span className="font-medium text-[#1A2C38]">
                To provide and maintain the Service:
              </span>{" "}
              including creating and managing your account, processing
              transactions, delivering features such as deal tracking, contract
              analysis, invoicing, and the media kit builder.
            </li>
            <li>
              <span className="font-medium text-[#1A2C38]">
                To improve our product:
              </span>{" "}
              we analyze usage patterns to understand which features are most
              valuable, identify bugs, and develop new functionality.
            </li>
            <li>
              <span className="font-medium text-[#1A2C38]">
                To communicate with you:
              </span>{" "}
              we send transactional emails (such as invoice receipts and
              contract notifications), product updates, security alerts, and
              occasional promotional messages. You can opt out of promotional
              emails at any time.
            </li>
            <li>
              <span className="font-medium text-[#1A2C38]">
                To prevent fraud and ensure security:
              </span>{" "}
              we monitor for suspicious activity, enforce our Terms of Service,
              and protect the rights and safety of our users and the public.
            </li>
          </ul>
        </div>

        {/* How We Share Information */}
        <div className="pb-10 mb-10 border-b border-[#D8E8EE]">
          <h2 className="font-serif text-[24px] text-[#1A2C38] mb-4">
            How We Share Your Information
          </h2>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed mb-4">
            We do not sell, rent, or trade your personal information to third
            parties for their marketing purposes. We share your information only
            in the following circumstances:
          </p>
          <ul className="list-disc list-inside space-y-2 text-[15px] font-sans text-[#4A6070] leading-relaxed">
            <li>
              <span className="font-medium text-[#1A2C38]">
                Payment Processing:
              </span>{" "}
              we share necessary billing information with Stripe, Inc. to
              process subscription payments and manage your billing account.
            </li>
            <li>
              <span className="font-medium text-[#1A2C38]">
                Hosting and Infrastructure:
              </span>{" "}
              our Service is hosted on Vercel, Inc., which processes requests
              and stores data on our behalf.
            </li>
            <li>
              <span className="font-medium text-[#1A2C38]">Analytics:</span> we
              use analytics services to understand how users interact with the
              Service. These services may collect anonymized usage data.
            </li>
            <li>
              <span className="font-medium text-[#1A2C38]">
                Email Communications:
              </span>{" "}
              we use a third-party email service provider to send transactional
              and promotional emails on our behalf.
            </li>
            <li>
              <span className="font-medium text-[#1A2C38]">
                Legal Requirements:
              </span>{" "}
              we may disclose your information if required to do so by law, in
              response to a valid subpoena, court order, or government request,
              or to protect our rights, property, or the safety of our users.
            </li>
            <li>
              <span className="font-medium text-[#1A2C38]">
                Business Transfers:
              </span>{" "}
              if Create Suite is involved in a merger, acquisition, or sale of
              assets, your information may be transferred as part of that
              transaction. We will notify you via email or a prominent notice on
              our website of any change in ownership.
            </li>
          </ul>
        </div>

        {/* Data Retention */}
        <div className="pb-10 mb-10 border-b border-[#D8E8EE]">
          <h2 className="font-serif text-[24px] text-[#1A2C38] mb-4">
            Data Retention
          </h2>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed mb-4">
            We retain your personal information for as long as your account is
            active or as needed to provide you the Service. If you delete your
            account, we will retain your data for an additional 30 days to allow
            for account recovery, after which it will be permanently deleted
            from our active systems.
          </p>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed">
            Certain information may be retained for longer periods where
            required by law, such as financial transaction records, which we
            retain for the period required by applicable tax and accounting
            regulations.
          </p>
        </div>

        {/* Your Rights */}
        <div className="pb-10 mb-10 border-b border-[#D8E8EE]">
          <h2 className="font-serif text-[24px] text-[#1A2C38] mb-4">
            Your Rights
          </h2>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed mb-4">
            Depending on your location, you may have the following rights
            regarding your personal information:
          </p>
          <ul className="list-disc list-inside space-y-2 text-[15px] font-sans text-[#4A6070] leading-relaxed mb-4">
            <li>
              <span className="font-medium text-[#1A2C38]">Access:</span> you
              can request a copy of the personal information we hold about you.
            </li>
            <li>
              <span className="font-medium text-[#1A2C38]">Correction:</span>{" "}
              you can update or correct inaccurate information directly through
              your account settings, or by contacting us.
            </li>
            <li>
              <span className="font-medium text-[#1A2C38]">Deletion:</span> you
              can delete your account at any time from your account settings.
              You may also request that we delete specific data by contacting
              us.
            </li>
            <li>
              <span className="font-medium text-[#1A2C38]">Export:</span> you
              can request a portable copy of your data in a commonly used,
              machine-readable format.
            </li>
          </ul>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed">
            To exercise any of these rights, please contact us at{" "}
            <a
              href="mailto:privacy@createsuite.co"
              className="text-[#3D6E8A] underline"
            >
              privacy@createsuite.co
            </a>
            . We will respond to your request within 30 days.
          </p>
        </div>

        {/* Cookies */}
        <div className="pb-10 mb-10 border-b border-[#D8E8EE]">
          <h2 className="font-serif text-[24px] text-[#1A2C38] mb-4">
            Cookies
          </h2>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed mb-4">
            Cookies are small text files placed on your device by your browser.
            We use the following types of cookies:
          </p>

          <h3 className="font-sans text-[17px] font-medium text-[#1A2C38] mb-2 mt-6">
            Essential Cookies
          </h3>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed mb-4">
            These cookies are strictly necessary for the Service to function.
            They maintain your authentication session, remember your login
            state, and enable core features like navigation and access to secure
            areas. You cannot opt out of essential cookies.
          </p>

          <h3 className="font-sans text-[17px] font-medium text-[#1A2C38] mb-2 mt-6">
            Analytics Cookies
          </h3>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed mb-4">
            These cookies help us understand how visitors interact with the
            Service by collecting information about pages visited, time spent,
            and navigation patterns. All analytics data is aggregated and
            anonymized. Analytics cookies are optional, and you may opt out at
            any time.
          </p>

          <h3 className="font-sans text-[17px] font-medium text-[#1A2C38] mb-2 mt-6">
            Cookie Preferences
          </h3>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed">
            You can manage your cookie preferences through your browser
            settings. Most browsers allow you to refuse or delete cookies. Note
            that disabling essential cookies may affect the functionality of the
            Service.
          </p>
        </div>

        {/* Children's Privacy */}
        <div className="pb-10 mb-10 border-b border-[#D8E8EE]">
          <h2 className="font-serif text-[24px] text-[#1A2C38] mb-4">
            Children&rsquo;s Privacy
          </h2>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed">
            The Service is not intended for individuals under the age of 13. We
            do not knowingly collect personal information from children under
            13. If we become aware that a child under 13 has provided us with
            personal information, we will take steps to delete such information
            promptly. If you believe that a child under 13 has provided us with
            personal information, please contact us at{" "}
            <a
              href="mailto:privacy@createsuite.co"
              className="text-[#3D6E8A] underline"
            >
              privacy@createsuite.co
            </a>
            .
          </p>
        </div>

        {/* International Users */}
        <div className="pb-10 mb-10 border-b border-[#D8E8EE]">
          <h2 className="font-serif text-[24px] text-[#1A2C38] mb-4">
            International Users
          </h2>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed">
            Our Service is hosted and operated in the United States. If you
            access the Service from outside the United States, please be aware
            that your information may be transferred to, stored, and processed
            in the United States, where data protection laws may differ from
            those in your country of residence. By using the Service, you
            consent to the transfer of your information to the United States.
          </p>
        </div>

        {/* Changes to This Policy */}
        <div className="pb-10 mb-10 border-b border-[#D8E8EE]">
          <h2 className="font-serif text-[24px] text-[#1A2C38] mb-4">
            Changes to This Privacy Policy
          </h2>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed">
            We may update this Privacy Policy from time to time to reflect
            changes in our practices or for other operational, legal, or
            regulatory reasons. If we make material changes, we will notify you
            by sending an email to the address associated with your account at
            least 15 days before the changes take effect. We encourage you to
            review this Privacy Policy periodically. Your continued use of the
            Service after any changes constitutes your acceptance of the updated
            Privacy Policy.
          </p>
        </div>

        {/* Contact */}
        <div className="pb-10">
          <h2 className="font-serif text-[24px] text-[#1A2C38] mb-4">
            Contact Us
          </h2>
          <p className="text-[15px] font-sans text-[#4A6070] leading-relaxed mb-4">
            If you have any questions or concerns about this Privacy Policy or
            our data practices, please contact us at:
          </p>
          <div className="text-[15px] font-sans text-[#4A6070] leading-relaxed">
            <p className="font-medium text-[#1A2C38]">Create Suite, Inc.</p>
            <p>
              Email:{" "}
              <a
                href="mailto:privacy@createsuite.co"
                className="text-[#3D6E8A] underline"
              >
                privacy@createsuite.co
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
