// Public API documentation. Linked from the marketing site and from
// the in-app API Keys settings panel. Lives at /docs/api.

export const metadata = {
  title: "API · CreateSuite",
  description: "Programmatic access to deals, commissions, and roster data.",
};

const sections = [
  {
    id: "auth",
    title: "Authentication",
    body: (
      <>
        <p>
          All requests require a Bearer API key in the <code>Authorization</code> header. Keys
          start with <code>cs_live_</code>, are 51 characters total, and are scoped to a single
          Agency Growth workspace.
        </p>
        <pre>
{`Authorization: Bearer cs_live_pAxmZk2T...`}
        </pre>
        <p>
          Generate a key from <strong>Settings → API Keys</strong>. The plaintext is shown
          once at creation; we only persist a SHA-256 hash. Lose it and you regenerate.
        </p>
      </>
    ),
  },
  {
    id: "deals",
    title: "GET /api/v1/deals",
    body: (
      <>
        <p>Returns deals owned by the API-key holder, newest first.</p>
        <p>
          <strong>Query parameters:</strong> <code>limit</code> (default 100, max 500),
          <code>cursor</code> (ISO timestamp from <code>next_cursor</code>).
        </p>
        <pre>
{`curl https://createsuite.co/api/v1/deals?limit=50 \\
  -H "Authorization: Bearer $CREATESUITE_API_KEY"`}
        </pre>
        <pre>
{`{
  "data": [
    {
      "id": "uuid",
      "brand_name": "Mejuri",
      "stage": "contracted",
      "value": 4200,
      "deliverables": "1 Reel + 3 Stories",
      "platform": "instagram",
      "due_date": "2026-05-15",
      "created_at": "2026-04-12T18:31:22Z",
      "notes": null
    }
  ],
  "next_cursor": "2026-04-12T18:31:22Z"
}`}
        </pre>
      </>
    ),
  },
  {
    id: "commissions",
    title: "GET /api/v1/commissions",
    body: (
      <>
        <p>Commission payouts for your agency.</p>
        <pre>
{`curl https://createsuite.co/api/v1/commissions \\
  -H "Authorization: Bearer $CREATESUITE_API_KEY"`}
        </pre>
        <pre>
{`{
  "data": [
    {
      "id": "uuid",
      "creator_id": "uuid",
      "amount": 840.00,
      "status": "paid",
      "paid_at": "2026-04-15T00:00:00Z",
      "period_start": "2026-03-01",
      "period_end": "2026-03-31"
    }
  ],
  "next_cursor": null
}`}
        </pre>
      </>
    ),
  },
  {
    id: "roster",
    title: "GET /api/v1/roster",
    body: (
      <>
        <p>Your active roster — one row per linked creator.</p>
        <pre>
{`curl https://createsuite.co/api/v1/roster \\
  -H "Authorization: Bearer $CREATESUITE_API_KEY"`}
        </pre>
      </>
    ),
  },
  {
    id: "errors",
    title: "Errors & rate limits",
    body: (
      <>
        <p>
          We return standard HTTP status codes. <code>401</code> means an invalid or missing
          key. <code>403</code> means the key exists but the workspace isn’t on Agency Growth.
          <code>500</code> means something on our side broke — retry with backoff.
        </p>
        <p>
          Rate limit: 60 requests / minute / key. Exceeded calls return <code>429</code> and a
          <code>Retry-After</code> header.
        </p>
      </>
    ),
  },
];

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#8AAABB] mb-2">
          Agency Growth
        </p>
        <h1 className="font-serif text-[44px] leading-tight text-[#0F1E28] mb-3">
          CreateSuite <em className="italic text-[#3D6E8A]">API</em>
        </h1>
        <p className="text-[15px] font-sans text-[#4A6070] max-w-prose mb-12">
          Pull deals, commissions, and roster data into your CRM, BI tool, or accounting
          system. Read-only for v1. Mutations are coming in v2 — let us know what you need.
        </p>

        <nav className="mb-10 flex flex-wrap gap-3 text-[13px] font-sans">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="text-[#3D6E8A] underline underline-offset-2 hover:text-[#0F1E28]"
            >
              {s.title}
            </a>
          ))}
        </nav>

        <div className="space-y-12">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="prose prose-sm max-w-none">
              <h2 className="font-serif text-[26px] text-[#0F1E28] mb-3">{s.title}</h2>
              <div className="text-[14px] font-sans text-[#1A2C38] leading-[1.6] [&_pre]:bg-[#0F1E28] [&_pre]:text-[#FAF8F4] [&_pre]:p-4 [&_pre]:rounded-[8px] [&_pre]:text-[12px] [&_pre]:font-mono [&_pre]:overflow-x-auto [&_pre]:my-3 [&_code]:font-mono [&_code]:text-[13px]">
                {s.body}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
