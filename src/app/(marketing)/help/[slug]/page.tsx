import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

/* ------------------------------------------------------------------ */
/*  Article data                                                       */
/* ------------------------------------------------------------------ */

type Article = {
  title: string;
  category: string;
  related: string[];
  content: React.ReactNode;
};

const articles: Record<string, Article> = {
  /* ==================== Getting Started ==================== */

  "getting-started": {
    title: "Welcome to Create Suite",
    category: "Getting Started",
    related: ["connect-platforms", "choosing-your-plan", "creator-onboarding"],
    content: (
      <>
        <p>
          Create Suite is the all-in-one business operating system built
          specifically for UGC creators, influencers, and talent agencies. Whether
          you are managing your first brand deal or running a roster of fifty
          creators, Create Suite gives you the tools to stay organized, get paid
          faster, and grow your business with confidence.
        </p>
        <h2>What you can do with Create Suite</h2>
        <p>
          At its core, Create Suite replaces the patchwork of spreadsheets, shared
          docs, and scattered DMs that most creators rely on. Here is what is
          included out of the box:
        </p>
        <ul>
          <li>
            <strong>Deal Pipeline</strong> &mdash; Track every brand partnership
            from first contact through delivery and final payment. Add notes,
            attach files, and move deals through customizable stages.
          </li>
          <li>
            <strong>AI Contract Analysis</strong> &mdash; Upload any contract PDF
            and receive an instant breakdown of key terms, red flags, and
            suggested counter-clauses powered by machine learning.
          </li>
          <li>
            <strong>Invoicing</strong> &mdash; Generate professional invoices,
            send them directly to brands, and enable automatic payment reminders
            so you never have to chase money again.
          </li>
          <li>
            <strong>Rate Calculator</strong> &mdash; Get market-benchmarked rate
            recommendations based on your niche, audience size, and engagement
            metrics.
          </li>
          <li>
            <strong>Media Kit Builder</strong> &mdash; Auto-generate a polished
            media kit with live audience stats and a shareable public link.
          </li>
        </ul>
        <h2>Navigating the dashboard</h2>
        <p>
          After signing in you will land on the Dashboard, which shows a snapshot
          of your active deals, upcoming deadlines, recent payments, and any
          action items. The left sidebar provides quick access to every major
          section. Click the module name to jump straight in, or use the
          Command+K shortcut to search across the entire app.
        </p>
        <h2>Getting help</h2>
        <p>
          If you ever get stuck, the in-app help widget (bottom-right corner) has
          contextual tips for the page you are on. You can also email our support
          team directly at support@createsuite.co and we will respond within 24
          hours on business days.
        </p>
      </>
    ),
  },

  "connect-platforms": {
    title: "How to set up your creator profile",
    category: "Getting Started",
    related: ["getting-started", "creator-onboarding", "choosing-your-plan"],
    content: (
      <>
        <p>
          Your creator profile is the foundation of everything in Create Suite.
          It powers your media kit, informs rate recommendations, and provides
          context for AI contract analysis. Setting it up takes just a few
          minutes.
        </p>
        <h2>Step 1: Basic information</h2>
        <p>
          Navigate to Settings and fill in your display name, profile photo, bio,
          and primary content niche. This information appears on your public media
          kit page and helps brands understand who you are at a glance.
        </p>
        <h2>Step 2: Connect your social platforms</h2>
        <p>
          Go to Integrations and click Connect next to each platform you are
          active on. Create Suite currently supports Instagram, TikTok, YouTube,
          X (Twitter), and Pinterest. Once connected, your follower counts,
          engagement rates, and recent post performance will sync automatically
          every 24 hours.
        </p>
        <ul>
          <li>Make sure you are logged in to the platform before connecting.</li>
          <li>Grant the requested read-only permissions so Create Suite can pull your public analytics.</li>
          <li>If a connection fails, disconnect and re-authorize from the Integrations page.</li>
        </ul>
        <h2>Step 3: Set your rate card</h2>
        <p>
          Head to the Rate Calculator and review the suggested rates for each
          deliverable type (Reel, TikTok, YouTube integration, static post,
          etc.). You can accept the recommendations or override them with your
          own pricing. These rates will auto-populate when you create new deals.
        </p>
        <h2>Step 4: Publish your media kit</h2>
        <p>
          Once your profile and platforms are connected, visit Media Kit and
          toggle it to Public. You will receive a shareable link like
          createsuite.co/kit/yourname that you can drop into your link-in-bio or
          email signature.
        </p>
      </>
    ),
  },

  "invite-team": {
    title: "Inviting creators to your agency",
    category: "Getting Started",
    related: ["roster-overview", "agency-deal-management", "agency-vs-creator"],
    content: (
      <>
        <p>
          If you are running a talent agency or management company, Create Suite
          lets you invite creators to join your roster so you can manage their
          deals, contracts, and payments from a single dashboard.
        </p>
        <h2>Sending an invitation</h2>
        <p>
          Open the Roster tab and click Invite Creator. Enter the creator&apos;s
          email address and, optionally, their name and primary platform. Create
          Suite will send them an email invitation with a link to accept and
          create their account. If they already have a Create Suite account, the
          invitation will link to their existing profile.
        </p>
        <h2>What creators see</h2>
        <p>
          Once a creator accepts your invitation they will see a new Agency
          banner in their dashboard confirming the relationship. They retain full
          access to their own account and can continue to use all features
          independently. The only difference is that their deals and contracts
          are now also visible to your agency team.
        </p>
        <h2>Managing permissions</h2>
        <ul>
          <li>
            <strong>View only</strong> &mdash; Agency can see deals and
            contracts but cannot edit them.
          </li>
          <li>
            <strong>Manage</strong> &mdash; Agency can create, edit, and close
            deals on the creator&apos;s behalf.
          </li>
          <li>
            <strong>Full access</strong> &mdash; Agency can also send invoices
            and manage billing on behalf of the creator.
          </li>
        </ul>
        <p>
          Permission levels can be changed at any time from the Roster settings.
          Creators can also leave an agency at any time from their own account
          settings.
        </p>
      </>
    ),
  },

  "choosing-your-plan": {
    title: "Which plan is right for you?",
    category: "Getting Started",
    related: ["manage-subscription", "billing-faq", "agency-vs-creator"],
    content: (
      <>
        <p>
          Create Suite offers plans designed for solo creators and agencies at
          every stage of growth. Here is a quick comparison to help you decide
          which tier fits your needs.
        </p>
        <h2>Free plan</h2>
        <p>
          Perfect for creators just starting out. The Free plan includes up to
          five active deals, basic invoicing, and access to the Rate Calculator.
          You get one AI contract analysis per month and a public media kit page.
        </p>
        <h2>Pro plan</h2>
        <p>
          Ideal for working creators with a steady flow of brand partnerships.
          Pro removes deal limits, adds unlimited AI contract scans, automatic
          invoice reminders, exclusivity tracking, and priority support. You also
          unlock advanced media kit customization and the Brand Radar feature.
        </p>
        <h2>Agency plan</h2>
        <p>
          Built for talent managers and agencies. Everything in Pro, plus the
          full roster dashboard, campaign builder, conflict detection, commission
          tracking, internal messaging, and brand reporting tools. You can manage
          an unlimited number of creators and invite additional team members with
          role-based permissions.
        </p>
        <h2>Switching plans</h2>
        <p>
          You can upgrade or downgrade at any time from Settings. When upgrading
          the new features are available immediately and you will be charged a
          prorated amount for the remainder of the billing cycle. When
          downgrading, your current plan stays active until the end of the period.
        </p>
      </>
    ),
  },

  "creator-onboarding": {
    title: "Creator onboarding checklist",
    category: "Getting Started",
    related: ["getting-started", "connect-platforms", "create-a-deal"],
    content: (
      <>
        <p>
          Use this checklist to make sure you are getting the most out of Create
          Suite from day one. Each step takes just a few minutes and sets you up
          for a smoother workflow down the road.
        </p>
        <h2>Your first-day checklist</h2>
        <ul>
          <li>Create your account and confirm your email address.</li>
          <li>Fill in your creator profile with a photo, bio, and niche.</li>
          <li>Connect at least one social platform under Integrations.</li>
          <li>Review your suggested rates in the Rate Calculator.</li>
          <li>Publish your media kit and copy the shareable link.</li>
        </ul>
        <h2>Your first-week checklist</h2>
        <ul>
          <li>Log your current active brand deals into the Deal Pipeline.</li>
          <li>Upload any existing contracts for AI analysis.</li>
          <li>Create an invoice for your next upcoming payment.</li>
          <li>Explore Brand Radar to discover new partnership opportunities.</li>
          <li>Set up your notification preferences in Settings.</li>
        </ul>
        <h2>Tips for success</h2>
        <p>
          The creators who get the most value from Create Suite are the ones who
          log deals as soon as a brand reaches out, not after the contract is
          signed. This gives you a clear picture of your pipeline and helps you
          forecast income more accurately. Think of your Deal Pipeline like a
          CRM for your creator business.
        </p>
      </>
    ),
  },

  /* ==================== Deal Pipeline ==================== */

  "create-a-deal": {
    title: "How to log your first brand deal",
    category: "Deal Pipeline",
    related: ["deal-stages", "deal-slide-over", "create-invoice"],
    content: (
      <>
        <p>
          The Deal Pipeline is where you track every brand partnership from the
          moment a brand reaches out to the day you receive payment. Logging a
          deal takes under a minute and gives you a single source of truth for
          the entire relationship.
        </p>
        <h2>Creating a new deal</h2>
        <p>
          Click the New Deal button in the top-right corner of the Deals page.
          Fill in the brand name, deal value, deliverable type, and expected
          timeline. You can also add a brief description and attach any relevant
          files such as a brief document or creative guidelines.
        </p>
        <h2>Required fields</h2>
        <ul>
          <li><strong>Brand name</strong> &mdash; The company or brand you are partnering with.</li>
          <li><strong>Deal value</strong> &mdash; The agreed-upon compensation for this partnership.</li>
          <li><strong>Deliverable type</strong> &mdash; Reel, TikTok, YouTube integration, story set, or custom.</li>
          <li><strong>Stage</strong> &mdash; Where the deal currently stands (defaults to Lead).</li>
        </ul>
        <h2>Optional but recommended</h2>
        <p>
          Adding a due date, linking a contract, and noting the brand contact
          makes it much easier to stay on top of things as your pipeline grows.
          You can always add these details later by opening the deal detail
          panel.
        </p>
        <h2>After creating</h2>
        <p>
          Your new deal will appear on the Pipeline board in the appropriate
          stage column. You can drag and drop it between stages as the deal
          progresses, or click into it to update details, add notes, or generate
          an invoice.
        </p>
      </>
    ),
  },

  "deal-stages": {
    title: "Understanding deal stages",
    category: "Deal Pipeline",
    related: ["create-a-deal", "deal-slide-over", "exclusivity-tracking"],
    content: (
      <>
        <p>
          Every deal in Create Suite moves through a series of stages that
          represent its lifecycle. Understanding these stages helps you manage
          your workflow and forecast upcoming income.
        </p>
        <h2>Default stages</h2>
        <ul>
          <li>
            <strong>Lead</strong> &mdash; A brand has reached out or you have
            pitched them, but nothing is confirmed yet.
          </li>
          <li>
            <strong>Negotiation</strong> &mdash; Terms are being discussed.
            Rates, deliverables, usage rights, and timelines are still in flux.
          </li>
          <li>
            <strong>Contracted</strong> &mdash; Both parties have agreed to
            terms and a contract has been signed or verbally confirmed.
          </li>
          <li>
            <strong>In Progress</strong> &mdash; Content creation and delivery
            is underway.
          </li>
          <li>
            <strong>Delivered</strong> &mdash; All deliverables have been
            submitted to the brand for review.
          </li>
          <li>
            <strong>Invoiced</strong> &mdash; An invoice has been sent and you
            are awaiting payment.
          </li>
          <li>
            <strong>Paid</strong> &mdash; Payment has been received and the deal
            is complete.
          </li>
          <li>
            <strong>Lost</strong> &mdash; The deal did not move forward.
          </li>
        </ul>
        <h2>Moving between stages</h2>
        <p>
          Drag and drop deal cards on the Pipeline board to move them between
          stages. You can also change the stage from within the deal detail
          panel. Every stage change is logged in the deal&apos;s activity history
          so you always have a record of when transitions happened.
        </p>
        <h2>Filtering and sorting</h2>
        <p>
          Use the filter bar at the top of the Pipeline to view deals by stage,
          brand, value range, or date. This is especially useful when you want
          to see only your active work or check which deals are awaiting payment.
        </p>
      </>
    ),
  },

  "deal-slide-over": {
    title: "Using the deal detail panel",
    category: "Deal Pipeline",
    related: ["create-a-deal", "deal-stages", "upload-contract"],
    content: (
      <>
        <p>
          The deal detail panel (sometimes called the slide-over) gives you a
          full view of everything related to a single deal without leaving the
          Pipeline board. Click any deal card to open it.
        </p>
        <h2>What is inside the panel</h2>
        <p>
          The panel is divided into several sections. At the top you will see the
          brand name, deal value, current stage, and key dates. Below that you
          will find tabs for:
        </p>
        <ul>
          <li><strong>Overview</strong> &mdash; Deal summary, description, deliverables, and linked contacts.</li>
          <li><strong>Activity</strong> &mdash; A chronological log of every change, note, and stage transition.</li>
          <li><strong>Files</strong> &mdash; Attached briefs, contracts, creative assets, and screenshots.</li>
          <li><strong>Invoice</strong> &mdash; Linked invoice status and payment history.</li>
        </ul>
        <h2>Adding notes</h2>
        <p>
          Use the notes field in the Activity tab to record important details
          like call summaries, feedback from the brand, or internal reminders.
          Notes are timestamped and visible to anyone on your team with access to
          the deal.
        </p>
        <h2>Quick actions</h2>
        <p>
          From the panel you can generate an invoice, upload a contract for AI
          analysis, change the deal stage, or mark the deal as lost. These
          actions are available in the top-right menu of the panel so you can
          move quickly without navigating away.
        </p>
      </>
    ),
  },

  "exclusivity-tracking": {
    title: "How exclusivity is tracked",
    category: "Deal Pipeline",
    related: ["conflict-detection", "deal-stages", "red-flags"],
    content: (
      <>
        <p>
          Many brand deals include exclusivity clauses that prevent you from
          working with competing brands for a set period. Create Suite tracks
          these automatically so you never accidentally violate a contract.
        </p>
        <h2>How it works</h2>
        <p>
          When you upload a contract for AI analysis, Create Suite extracts any
          exclusivity or non-compete clauses and records the category, competing
          brands, and duration. This information is attached to the deal and
          appears as a badge on the Pipeline board.
        </p>
        <h2>Conflict warnings</h2>
        <p>
          If you try to create a new deal in a category that overlaps with an
          active exclusivity window, Create Suite will display a warning before
          you proceed. The warning includes the conflicting deal, the clause
          details, and the date the exclusivity period ends. You can still
          proceed if you believe there is no true conflict, but the warning
          ensures you make an informed decision.
        </p>
        <h2>Viewing active exclusivities</h2>
        <p>
          Visit the Exclusivity page from the sidebar to see a consolidated view
          of all your active and upcoming exclusivity windows. Each entry shows
          the brand, category, date range, and which deal it is tied to. Expired
          exclusivities are automatically archived.
        </p>
        <h2>For agencies</h2>
        <p>
          Agency accounts can view exclusivities across their entire roster,
          making it easy to spot potential conflicts before assigning a creator
          to a new campaign. The Conflict Detection tool also cross-references
          exclusivities in real time.
        </p>
      </>
    ),
  },

  "agency-deal-management": {
    title: "How agencies manage creator deals",
    category: "Deal Pipeline",
    related: ["invite-team", "roster-overview", "commission-invoices"],
    content: (
      <>
        <p>
          Agency accounts in Create Suite provide a centralized view of every
          deal across your roster. You can create deals on behalf of creators,
          track commissions automatically, and keep brands and creators aligned
          from a single workspace.
        </p>
        <h2>Creating deals for creators</h2>
        <p>
          From the Agency Pipeline view, click New Deal and select the creator
          from the roster dropdown. Fill in the brand, value, and deliverables
          just like a standard deal. The deal will appear in both the agency
          pipeline and the creator&apos;s personal pipeline.
        </p>
        <h2>Commission tracking</h2>
        <p>
          When creating a deal, set the commission percentage or flat fee. Create
          Suite will automatically calculate the agency&apos;s share and the
          creator&apos;s net amount. These figures update in real time as the deal
          value changes. When the creator is paid, a commission invoice can be
          generated with one click.
        </p>
        <h2>Oversight tools</h2>
        <ul>
          <li>Filter the pipeline by creator, brand, stage, or date range.</li>
          <li>View aggregated metrics: total pipeline value, average deal size, close rate.</li>
          <li>Export deal data to CSV for accounting or reporting purposes.</li>
        </ul>
        <h2>Communication</h2>
        <p>
          Use the internal messaging feature to discuss deals with creators
          directly inside the deal detail panel. This keeps all communication
          centralized and creates an audit trail that can be referenced later.
        </p>
      </>
    ),
  },

  /* ==================== Invoicing & Payments ==================== */

  "create-invoice": {
    title: "Creating and sending an invoice",
    category: "Invoicing & Payments",
    related: ["invoice-reminders", "payment-methods", "create-a-deal"],
    content: (
      <>
        <p>
          Create Suite makes it easy to invoice brands directly from your
          dashboard. You can create a standalone invoice or generate one from an
          existing deal with pre-filled information.
        </p>
        <h2>Creating from a deal</h2>
        <p>
          Open any deal in the Pipeline and click Generate Invoice. The brand
          name, deal value, and deliverables will be pre-filled. Review the
          details, set a due date, and add any additional line items or notes.
          Click Send and the invoice will be emailed to the brand contact on
          file.
        </p>
        <h2>Creating from scratch</h2>
        <p>
          Navigate to Invoices and click New Invoice. Enter the brand or client
          name, your line items with descriptions and amounts, the payment due
          date, and any applicable tax information. You can also add your logo
          and custom payment instructions.
        </p>
        <h2>What the brand receives</h2>
        <p>
          The brand gets a professional email with a link to view and download
          the invoice as a PDF. The page also includes your preferred payment
          methods so they know exactly how to pay you. Once they pay, you can
          mark the invoice as paid in Create Suite and the linked deal will
          automatically move to the Paid stage.
        </p>
        <h2>Invoice numbering</h2>
        <p>
          Create Suite auto-generates sequential invoice numbers (INV-001,
          INV-002, etc.) for your records. You can customize the prefix in
          Settings if you prefer a different format.
        </p>
      </>
    ),
  },

  "invoice-reminders": {
    title: "Automatic payment reminders",
    category: "Invoicing & Payments",
    related: ["create-invoice", "payment-methods", "billing-faq"],
    content: (
      <>
        <p>
          Late payments are one of the biggest headaches for creators. Create
          Suite&apos;s automatic reminder system sends polite follow-ups on your
          behalf so you do not have to chase brands manually.
        </p>
        <h2>How reminders work</h2>
        <p>
          When you enable automatic reminders on an invoice, Create Suite will
          send an email to the brand contact at intervals you configure. The
          default schedule is:
        </p>
        <ul>
          <li>3 days before the due date &mdash; a friendly heads-up.</li>
          <li>On the due date &mdash; a reminder that payment is due today.</li>
          <li>3 days after the due date &mdash; a follow-up noting the payment is overdue.</li>
          <li>7 days after the due date &mdash; a final reminder with a firmer tone.</li>
        </ul>
        <h2>Customizing the schedule</h2>
        <p>
          You can adjust the timing and number of reminders from the invoice
          detail page. Some creators prefer a single reminder on the due date,
          while others want multiple touchpoints. You can also customize the
          email copy for each reminder stage.
        </p>
        <h2>Disabling reminders</h2>
        <p>
          If you prefer to handle follow-ups manually, or if the brand has
          already confirmed a delayed payment date, you can turn off reminders
          for individual invoices without affecting your global settings.
        </p>
        <h2>Tracking status</h2>
        <p>
          The Invoices page shows a status badge for each invoice: Draft, Sent,
          Viewed, Overdue, or Paid. You can also see when the last reminder was
          sent and whether the brand has opened the invoice link.
        </p>
      </>
    ),
  },

  "payment-methods": {
    title: "How creators receive payment",
    category: "Invoicing & Payments",
    related: ["create-invoice", "commission-invoices", "billing-faq"],
    content: (
      <>
        <p>
          Create Suite does not process payments directly, but it makes it simple
          to communicate your preferred payment methods to brands and track when
          payments arrive.
        </p>
        <h2>Setting up payment methods</h2>
        <p>
          Go to Settings and scroll to Payment Methods. Here you can add one or
          more methods such as PayPal, direct bank transfer (ACH), Wise, or
          check. For each method, provide the relevant details (email address,
          account info, etc.) that brands need to send payment.
        </p>
        <h2>Displaying on invoices</h2>
        <p>
          When you create an invoice, your preferred payment methods are
          automatically included at the bottom. Brands can see exactly how to
          pay you without needing to ask. You can reorder or exclude specific
          methods on a per-invoice basis if needed.
        </p>
        <h2>Marking invoices as paid</h2>
        <p>
          When payment arrives in your bank or PayPal account, open the invoice
          in Create Suite and click Mark as Paid. Enter the date received and
          optionally the transaction reference. The linked deal will
          automatically move to the Paid stage, and the payment will appear in
          your earnings dashboard.
        </p>
        <h2>International payments</h2>
        <p>
          If you work with international brands, we recommend adding Wise or
          PayPal as a payment option since they handle currency conversion and
          tend to have lower fees than traditional wire transfers. Always
          confirm the currency with the brand before sending the invoice.
        </p>
      </>
    ),
  },

  "commission-invoices": {
    title: "How agency commissions work",
    category: "Invoicing & Payments",
    related: ["agency-deal-management", "create-invoice", "roster-overview"],
    content: (
      <>
        <p>
          For agency accounts, Create Suite automatically calculates commissions
          on every deal and makes it easy to generate commission invoices that
          keep your finances transparent and organized.
        </p>
        <h2>Setting commission rates</h2>
        <p>
          You can set a default commission rate for your agency in Settings
          (for example, 15% or 20%). This rate is automatically applied to new
          deals. You can also override the rate on individual deals if a
          specific creator or brand has a different arrangement.
        </p>
        <h2>How commissions are calculated</h2>
        <p>
          When a deal is created with a total value, Create Suite splits the
          amount into the creator&apos;s net payment and the agency commission.
          These figures update automatically if the deal value changes during
          negotiation. Both the creator and the agency can see the breakdown at
          all times.
        </p>
        <h2>Generating commission invoices</h2>
        <p>
          Once a deal moves to the Paid stage, you can generate a commission
          invoice from the Commissions tab. This invoice documents the agency
          fee for that specific deal and can be sent to the creator for their
          records or used internally for accounting.
        </p>
        <h2>Monthly commission reports</h2>
        <p>
          The Commissions tab also includes a monthly summary showing total
          commissions earned, broken down by creator. You can export this data
          to CSV for your accountant or bookkeeping software.
        </p>
      </>
    ),
  },

  /* ==================== Contracts & AI Analysis ==================== */

  "upload-contract": {
    title: "Uploading a contract for AI analysis",
    category: "Contracts & AI Analysis",
    related: ["reading-ai-analysis", "red-flags", "contract-templates"],
    content: (
      <>
        <p>
          One of Create Suite&apos;s most powerful features is AI-powered
          contract analysis. Upload any brand contract and receive a detailed
          breakdown of key terms, potential risks, and suggested improvements
          within seconds.
        </p>
        <h2>How to upload</h2>
        <p>
          Navigate to Contracts and click Upload Contract. You can drag and drop
          a PDF, DOCX, or image file, or click to browse your files. You can
          also upload directly from a deal&apos;s detail panel by clicking
          Attach Contract. The file is securely processed and never shared with
          third parties.
        </p>
        <h2>Supported file types</h2>
        <ul>
          <li>PDF (recommended for best results)</li>
          <li>DOCX (Microsoft Word)</li>
          <li>PNG or JPG (scanned contracts &mdash; OCR is applied automatically)</li>
        </ul>
        <h2>What happens next</h2>
        <p>
          Once uploaded, the AI engine reads the full contract and generates an
          analysis report. This typically takes ten to thirty seconds depending
          on the document length. You will see a progress indicator while the
          analysis runs. When complete, the report opens automatically and is
          saved to your contract library for future reference.
        </p>
        <h2>Linking to a deal</h2>
        <p>
          After analysis, you can link the contract to an existing deal in your
          Pipeline. This keeps everything connected and lets you reference the
          analysis directly from the deal detail panel.
        </p>
      </>
    ),
  },

  "reading-ai-analysis": {
    title: "How to read your analysis report",
    category: "Contracts & AI Analysis",
    related: ["upload-contract", "red-flags", "contract-templates"],
    content: (
      <>
        <p>
          After uploading a contract, Create Suite generates a structured
          analysis report that breaks the document into easy-to-understand
          sections. Here is what each part means.
        </p>
        <h2>Summary</h2>
        <p>
          The top of the report shows a plain-language summary of the deal: who
          the parties are, the deliverables, compensation, and timeline. This
          gives you a quick snapshot without needing to read the full legal text.
        </p>
        <h2>Key terms</h2>
        <p>
          Below the summary you will find a table of extracted key terms
          including payment amount, payment schedule, usage rights, exclusivity
          period, termination clauses, and revision limits. Each term is
          displayed alongside the original contract language so you can verify
          accuracy.
        </p>
        <h2>Red flags</h2>
        <p>
          The AI highlights any clauses that may be unfavorable or unusual. Red
          flags appear with a severity rating (low, medium, high) and a brief
          explanation of why the clause is flagged. Common examples include
          perpetual usage rights, unreasonable revision counts, and vague
          payment timelines.
        </p>
        <h2>Suggestions</h2>
        <p>
          For each red flag, the report includes a suggested counter-clause or
          negotiation talking point. These suggestions are based on industry
          standards and common creator-friendly terms. You can copy them
          directly into your reply to the brand.
        </p>
        <h2>Overall score</h2>
        <p>
          At the bottom, the report assigns an overall fairness score from 1 to
          10, with 10 being the most creator-friendly. This score considers
          compensation, usage rights, exclusivity, revision limits, and
          termination flexibility.
        </p>
      </>
    ),
  },

  "red-flags": {
    title: "What red flags does the AI look for?",
    category: "Contracts & AI Analysis",
    related: ["reading-ai-analysis", "upload-contract", "exclusivity-tracking"],
    content: (
      <>
        <p>
          Create Suite&apos;s AI contract analyzer is trained to spot clauses
          that are commonly problematic for creators. Here are the major
          categories of red flags it detects.
        </p>
        <h2>Perpetual usage rights</h2>
        <p>
          Some contracts grant the brand the right to use your content forever
          across any medium. The AI flags these clauses because they can
          significantly devalue your work over time. A fair alternative is
          time-limited usage tied to specific platforms.
        </p>
        <h2>Unreasonable revision limits</h2>
        <p>
          Contracts that allow unlimited revisions or do not specify a cap can
          lead to scope creep. The AI recommends negotiating a clear revision
          count (typically two to three rounds) with additional revisions billed
          at an hourly rate.
        </p>
        <h2>Late or vague payment terms</h2>
        <p>
          The AI flags payment terms longer than Net 60 or contracts that do not
          specify a payment timeline at all. Industry standard for creator
          partnerships is typically Net 30 from deliverable approval.
        </p>
        <h2>Broad exclusivity</h2>
        <p>
          Exclusivity clauses that cover an entire industry (for example, all
          food and beverage brands) rather than a specific competitor set are
          flagged as they can severely limit your earning potential.
        </p>
        <h2>Other common flags</h2>
        <ul>
          <li>Automatic renewal clauses without opt-out windows.</li>
          <li>Penalty clauses for late delivery without force majeure provisions.</li>
          <li>Requirements to assign intellectual property ownership rather than licensing it.</li>
          <li>Indemnification clauses that place disproportionate liability on the creator.</li>
          <li>Non-disparagement clauses that restrict your ability to share honest opinions.</li>
        </ul>
      </>
    ),
  },

  "contract-templates": {
    title: "Using contract templates",
    category: "Contracts & AI Analysis",
    related: ["upload-contract", "reading-ai-analysis", "create-a-deal"],
    content: (
      <>
        <p>
          Create Suite includes a library of creator-friendly contract templates
          that you can use as a starting point when a brand does not provide
          their own agreement. Templates are reviewed by legal professionals and
          updated regularly.
        </p>
        <h2>Available templates</h2>
        <ul>
          <li><strong>Standard brand partnership</strong> &mdash; A general-purpose agreement covering deliverables, payment, usage rights, and timelines.</li>
          <li><strong>UGC content license</strong> &mdash; For deals where you produce content but the brand handles distribution.</li>
          <li><strong>Ambassador agreement</strong> &mdash; Long-term partnership terms with monthly deliverables and performance bonuses.</li>
          <li><strong>Event appearance</strong> &mdash; Terms for in-person brand activations, appearances, and hosting gigs.</li>
        </ul>
        <h2>Customizing a template</h2>
        <p>
          Open any template from the Contracts page and click Use Template.
          Fill in the specific details for your deal: brand name, deliverables,
          compensation, dates, and any custom clauses. The template adapts to
          your input and generates a clean document you can download as a PDF or
          share directly with the brand.
        </p>
        <h2>Important note</h2>
        <p>
          Templates are provided as a helpful starting point but are not a
          substitute for professional legal advice. For high-value deals or
          complex terms, we recommend having an entertainment or contract
          attorney review the final document.
        </p>
      </>
    ),
  },

  /* ==================== Agency Tools ==================== */

  "roster-overview": {
    title: "Understanding the roster dashboard",
    category: "Agency Tools",
    related: ["invite-team", "agency-deal-management", "campaign-builder"],
    content: (
      <>
        <p>
          The Roster Dashboard is the command center for talent agencies using
          Create Suite. It gives you a high-level view of every creator in your
          roster along with key performance indicators and quick access to their
          deals, contracts, and earnings.
        </p>
        <h2>What you see at a glance</h2>
        <p>
          Each creator card on the roster displays their name, profile photo,
          primary platform, total earnings (lifetime and current period), active
          deal count, and a health score. The health score is calculated based
          on deal pipeline activity, overdue invoices, and upcoming deadlines.
        </p>
        <h2>Sorting and filtering</h2>
        <ul>
          <li>Sort by earnings, deal count, health score, or name.</li>
          <li>Filter by platform, niche, or deal stage.</li>
          <li>Search for a specific creator by name or handle.</li>
        </ul>
        <h2>Creator detail view</h2>
        <p>
          Click any creator card to open a detailed view showing their full
          deal history, contract library, invoice status, and connected
          platforms. From here you can create deals on their behalf, upload
          contracts, or send messages.
        </p>
        <h2>Roster metrics</h2>
        <p>
          Above the creator cards, a summary bar shows aggregate metrics: total
          roster earnings, average deal size, total active deals, and overall
          roster health. These metrics update in real time as deals progress.
        </p>
      </>
    ),
  },

  "campaign-builder": {
    title: "Building multi-creator campaigns",
    category: "Agency Tools",
    related: ["roster-overview", "brand-reports", "agency-deal-management"],
    content: (
      <>
        <p>
          The Campaign Builder lets agencies organize multi-creator brand
          activations into a single, trackable campaign. Instead of managing
          each creator&apos;s deal separately, you can group them under one
          campaign with shared timelines, deliverable tracking, and brand
          reporting.
        </p>
        <h2>Creating a campaign</h2>
        <p>
          Go to the Campaigns tab and click New Campaign. Give it a name, select
          the brand, set the campaign dates, and add creators from your roster.
          For each creator, define their specific deliverables, rates, and
          deadlines.
        </p>
        <h2>Deliverable board</h2>
        <p>
          Each campaign has a kanban-style deliverable board where you can track
          every piece of content across all creators. Columns represent status:
          Assigned, In Progress, Submitted, Approved, and Published. Drag and
          drop cards as deliverables move through the workflow.
        </p>
        <h2>Brand collaboration</h2>
        <p>
          You can generate a read-only campaign link to share with the brand.
          This gives them visibility into deliverable status, timelines, and
          published content without accessing your full Create Suite account.
        </p>
        <h2>Post-campaign reporting</h2>
        <p>
          Once the campaign wraps, use the Brand Reports feature to generate a
          comprehensive performance summary including reach, engagement, click-
          through rates, and earned media value. This report can be exported as
          a PDF and shared with the brand.
        </p>
      </>
    ),
  },

  "conflict-detection": {
    title: "How conflict detection works",
    category: "Agency Tools",
    related: ["exclusivity-tracking", "roster-overview", "agency-deal-management"],
    content: (
      <>
        <p>
          Conflict Detection is an agency-level feature that automatically scans
          your entire roster for potential exclusivity violations before they
          become a problem. It runs in real time whenever a new deal is created
          or a contract is uploaded.
        </p>
        <h2>How scanning works</h2>
        <p>
          When a new deal is added for any creator on your roster, the system
          checks the deal&apos;s brand category against all active exclusivity
          clauses for that creator. If an overlap is found, a conflict alert is
          generated immediately and displayed in the Conflicts tab.
        </p>
        <h2>Cross-roster scanning</h2>
        <p>
          Beyond individual creator exclusivities, Conflict Detection also
          checks across your entire roster. If Brand A has an exclusivity deal
          with one of your creators, and Brand B (a direct competitor) is
          pitching another creator on your roster, the system flags this as a
          potential agency-level conflict.
        </p>
        <h2>Resolving conflicts</h2>
        <ul>
          <li>Review the conflicting deals and clauses side by side.</li>
          <li>Mark a conflict as Resolved if you determine there is no actual overlap.</li>
          <li>Add notes explaining the resolution for your team&apos;s records.</li>
          <li>Decline the new deal if the exclusivity truly prevents it.</li>
        </ul>
        <h2>Conflict dashboard</h2>
        <p>
          The Conflicts tab shows all active and resolved conflicts with
          severity levels, affected creators, and relevant contract clauses.
          This gives you a clear audit trail for brand relationship management.
        </p>
      </>
    ),
  },

  "messaging-system": {
    title: "Using internal messaging",
    category: "Agency Tools",
    related: ["roster-overview", "campaign-builder", "agency-deal-management"],
    content: (
      <>
        <p>
          Create Suite&apos;s internal messaging system lets agencies
          communicate with creators directly inside the platform. This replaces
          scattered Slack threads, emails, and DMs with a centralized
          communication hub tied to your deals and campaigns.
        </p>
        <h2>Starting a conversation</h2>
        <p>
          You can start a new message thread from the Inbox tab, from a
          creator&apos;s profile on the roster, or from within a specific deal
          or campaign. Messages sent from a deal are automatically tagged with
          the deal name for easy reference.
        </p>
        <h2>Thread features</h2>
        <ul>
          <li>Reply in threads to keep conversations organized.</li>
          <li>Attach files, images, and links directly in messages.</li>
          <li>Tag deals or campaigns using @-mentions to cross-reference.</li>
          <li>Pin important messages to the top of a thread.</li>
        </ul>
        <h2>Notifications</h2>
        <p>
          Creators receive email and in-app notifications for new messages. You
          can configure notification preferences in Settings to control
          frequency and delivery channels. Urgent messages can be flagged to
          trigger an immediate push notification.
        </p>
        <h2>Communication log</h2>
        <p>
          Every message is archived and searchable. This creates an audit trail
          that can be valuable during disputes, contract reviews, or when
          onboarding new team members who need context on past discussions.
        </p>
      </>
    ),
  },

  "brand-reports": {
    title: "Generating brand reports",
    category: "Agency Tools",
    related: ["campaign-builder", "roster-overview", "agency-deal-management"],
    content: (
      <>
        <p>
          Brand Reports let you package campaign results into polished,
          shareable documents that demonstrate the value of your creators and
          help secure repeat partnerships.
        </p>
        <h2>Creating a report</h2>
        <p>
          Navigate to the Reports tab and click New Report. Select the campaign
          or deals you want to include, then choose a date range. Create Suite
          pulls in performance data automatically from connected platforms.
        </p>
        <h2>What is included</h2>
        <ul>
          <li>Campaign overview: brand, dates, creators involved, total investment.</li>
          <li>Content performance: impressions, reach, engagement rate, clicks, saves, and shares for each deliverable.</li>
          <li>Audience demographics: age, gender, and location breakdown of reached audiences.</li>
          <li>Earned media value: an estimated dollar value of the organic exposure generated.</li>
          <li>Key takeaways: auto-generated insights highlighting top-performing content and recommendations for future campaigns.</li>
        </ul>
        <h2>Customization</h2>
        <p>
          You can add your agency logo, a custom intro section, and manually
          entered notes or learnings. Reorder sections and hide any metrics that
          are not relevant to the specific brand.
        </p>
        <h2>Exporting and sharing</h2>
        <p>
          Export the finished report as a PDF or share it via a branded link
          that the brand can view in their browser. Reports generated through
          Create Suite reflect your agency&apos;s professionalism and make it
          easy to demonstrate ROI.
        </p>
      </>
    ),
  },

  /* ==================== Account & Billing ==================== */

  "manage-subscription": {
    title: "Managing your subscription",
    category: "Account & Billing",
    related: ["choosing-your-plan", "billing-faq", "agency-vs-creator"],
    content: (
      <>
        <p>
          You can view and manage your Create Suite subscription at any time from
          the Settings page. Here is how to handle common subscription tasks.
        </p>
        <h2>Viewing your current plan</h2>
        <p>
          Go to Settings and click on Subscription. You will see your current
          plan name, billing cycle (monthly or annual), next renewal date, and
          payment method on file. Annual plans include a discount compared to
          monthly billing.
        </p>
        <h2>Upgrading</h2>
        <p>
          Click Upgrade to see available plans. When you upgrade, the new
          features become available immediately. You are charged a prorated
          amount for the remainder of your current billing cycle. For example,
          if you upgrade halfway through the month, you pay half the price
          difference.
        </p>
        <h2>Downgrading</h2>
        <p>
          If you downgrade, your current plan remains active until the end of the
          billing period. After that, you will transition to the lower plan. Any
          features not included in the new plan will become read-only, meaning
          you can still view existing data but cannot create new items that
          require the higher tier.
        </p>
        <h2>Cancelling</h2>
        <p>
          You can cancel your subscription at any time. Your account remains
          active until the end of the paid period, and your data is preserved
          for 90 days after cancellation. You can reactivate at any point during
          that window to pick up right where you left off.
        </p>
      </>
    ),
  },

  "billing-faq": {
    title: "Billing frequently asked questions",
    category: "Account & Billing",
    related: ["manage-subscription", "choosing-your-plan", "agency-vs-creator"],
    content: (
      <>
        <p>
          Here are answers to the most common billing questions we receive from
          Create Suite users.
        </p>
        <h2>When am I charged?</h2>
        <p>
          Subscriptions are billed on the same date each month (or year for
          annual plans). If you signed up on March 15th, you will be charged on
          the 15th of each subsequent month.
        </p>
        <h2>What payment methods do you accept?</h2>
        <p>
          We accept all major credit and debit cards (Visa, Mastercard, Amex).
          Annual plans can also be paid via bank transfer by contacting our
          support team.
        </p>
        <h2>Can I get a refund?</h2>
        <p>
          We offer a full refund within the first 14 days of a new subscription
          or upgrade. After that, we do not issue partial refunds, but you can
          cancel at any time and retain access until the end of your paid period.
        </p>
        <h2>Will I lose data if I downgrade?</h2>
        <p>
          No. All your existing data is preserved when you downgrade. However,
          features exclusive to higher plans (like AI contract analysis or
          agency tools) will become read-only. You can still view and export
          that data, but you will not be able to create new items using those
          features.
        </p>
        <h2>Do you offer discounts?</h2>
        <p>
          Annual plans save roughly 20% compared to monthly billing. We also
          occasionally offer promotional discounts for new users. If you manage
          a large agency roster, contact sales for volume pricing.
        </p>
      </>
    ),
  },

  "agency-vs-creator": {
    title: "Agency vs creator accounts",
    category: "Account & Billing",
    related: ["choosing-your-plan", "invite-team", "roster-overview"],
    content: (
      <>
        <p>
          Create Suite offers two account types designed for different users.
          Understanding the difference helps you pick the right setup from the
          start.
        </p>
        <h2>Creator accounts</h2>
        <p>
          A creator account is for individual UGC creators, influencers, and
          freelancers. It includes the Deal Pipeline, invoicing, AI contract
          analysis, Rate Calculator, Media Kit Builder, and Brand Radar. You
          manage your own deals, contracts, and payments independently.
        </p>
        <h2>Agency accounts</h2>
        <p>
          An agency account is for talent managers, management companies, and
          multi-creator teams. It includes everything in the creator account
          plus the Roster Dashboard, Campaign Builder, Conflict Detection,
          Commission Tracking, Internal Messaging, and Brand Reports. You can
          invite creators to your roster and manage their business alongside
          your own.
        </p>
        <h2>Can I switch account types?</h2>
        <p>
          Yes. If you start as a creator and later want agency features, you can
          upgrade to an agency plan from Settings. Your existing data carries
          over. Going from agency to creator is also possible, though agency-
          specific features will become read-only and your roster connections
          will be archived.
        </p>
        <h2>Do creators need their own accounts?</h2>
        <p>
          Yes. Each creator on your agency roster has their own Create Suite
          account. They can log in independently to view their deals, download
          contracts, and track payments. The agency relationship adds a layer of
          shared visibility and management tools on top of their personal
          account.
        </p>
      </>
    ),
  },

  "delete-account": {
    title: "How to delete your account",
    category: "Account & Billing",
    related: ["manage-subscription", "billing-faq", "agency-vs-creator"],
    content: (
      <>
        <p>
          If you decide to leave Create Suite, you can permanently delete your
          account from the Settings page. Here is what to know before you
          proceed.
        </p>
        <h2>Before deleting</h2>
        <ul>
          <li>
            Export any data you want to keep. Go to Settings, then Data Export,
            and download your deals, invoices, contracts, and analytics as CSV
            and PDF files.
          </li>
          <li>
            Cancel your subscription first if you are on a paid plan. This
            ensures you are not charged after deletion.
          </li>
          <li>
            If you are part of an agency roster, notify your agency manager so
            they can reassign any active deals.
          </li>
        </ul>
        <h2>Deleting your account</h2>
        <p>
          Go to Settings, scroll to the bottom, and click Delete Account. You
          will be asked to confirm by typing your email address. Once confirmed,
          your account enters a 30-day grace period during which you can
          reactivate by logging back in.
        </p>
        <h2>What gets deleted</h2>
        <p>
          After the 30-day grace period, the following data is permanently
          removed: your profile, connected platforms, deal history, contracts,
          invoices, messages, and media kit. Any data shared with an agency
          (like deal records) may be retained in their account as part of their
          business records.
        </p>
        <h2>Reactivating</h2>
        <p>
          During the 30-day grace period, simply log in with your email and
          password to reactivate your account. All data will be restored exactly
          as you left it. After 30 days, reactivation is no longer possible and
          you would need to create a new account.
        </p>
      </>
    ),
  },
};

/* ------------------------------------------------------------------ */
/*  Static params                                                      */
/* ------------------------------------------------------------------ */

export function generateStaticParams() {
  return Object.keys(articles).map((slug) => ({ slug }));
}

/* ------------------------------------------------------------------ */
/*  Metadata                                                           */
/* ------------------------------------------------------------------ */

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const article = articles[params.slug];
  if (!article) return { title: "Article Not Found — Create Suite Help" };
  return {
    title: `${article.title} — Create Suite Help`,
    description: `Learn about ${article.title.toLowerCase()} in the Create Suite Help Center.`,
  };
}

/* ------------------------------------------------------------------ */
/*  Helper: article title lookup by slug                               */
/* ------------------------------------------------------------------ */

function articleTitle(slug: string): string {
  return articles[slug]?.title ?? slug;
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function HelpArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = articles[params.slug];
  if (!article) notFound();

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      <div className="max-w-[700px] mx-auto px-6 pt-32 pb-32">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[13px] font-sans text-[#8AAABB] mb-8 flex-wrap">
          <Link href="/help" className="hover:text-[#3D6E8A] transition-colors">
            Help Center
          </Link>
          <span>/</span>
          <span>{article.category}</span>
          <span>/</span>
          <span className="text-[#4A6070]">{article.title}</span>
        </nav>

        {/* Category badge */}
        <span className="inline-block text-[12px] font-sans font-semibold uppercase tracking-[3px] text-[#7BAFC8] mb-4">
          {article.category}
        </span>

        {/* Title */}
        <h1 className="text-[28px] font-serif text-[#1A2C38] leading-snug mb-10">
          {article.title}
        </h1>

        {/* Article content */}
        <div className="prose-custom text-[15px] font-sans text-[#4A6070] leading-relaxed space-y-5 [&_h2]:text-[20px] [&_h2]:font-serif [&_h2]:text-[#1A2C38] [&_h2]:mt-10 [&_h2]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_li]:text-[15px] [&_li]:text-[#4A6070] [&_strong]:text-[#1A2C38] [&_strong]:font-semibold">
          {article.content}
        </div>

        {/* Was this helpful */}
        <div className="mt-16 pt-8 border-t border-[#D8E8EE]">
          <p className="text-[14px] font-sans text-[#4A6070] mb-4">
            Was this article helpful?
          </p>
          <div className="flex gap-3">
            <button className="px-5 py-2 text-[14px] font-sans font-medium text-[#3D6E8A] bg-white border border-[#D8E8EE] rounded-[10px] hover:border-[#7BAFC8] transition-colors">
              Yes
            </button>
            <button className="px-5 py-2 text-[14px] font-sans font-medium text-[#3D6E8A] bg-white border border-[#D8E8EE] rounded-[10px] hover:border-[#7BAFC8] transition-colors">
              No
            </button>
          </div>
        </div>

        {/* Related articles */}
        <div className="mt-14">
          <p className="text-[12px] font-sans font-semibold uppercase tracking-[3px] text-[#7BAFC8] mb-5">
            Related Articles
          </p>
          <ul className="space-y-3">
            {article.related.map((slug) => (
              <li key={slug}>
                <Link
                  href={`/help/${slug}`}
                  className="text-[14px] font-sans font-medium text-[#3D6E8A] hover:underline"
                >
                  {articleTitle(slug)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Back link */}
        <div className="mt-14">
          <Link
            href="/help"
            className="text-[14px] font-sans font-medium text-[#8AAABB] hover:text-[#3D6E8A] transition-colors"
          >
            &larr; Back to Help Center
          </Link>
        </div>
      </div>
    </div>
  );
}
