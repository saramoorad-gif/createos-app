// Placeholder data for Brianna — 142K followers across TikTok/Instagram/YouTube

export type DealStage = "lead" | "pitched" | "negotiating" | "contracted" | "in_progress" | "delivered" | "paid";
export type DealType = "ugc" | "influencer" | "both";
export type Platform = "tiktok" | "instagram" | "youtube";
export type EmailProvider = "gmail" | "outlook";

export interface User {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  tier: "ugc_creator" | "influencer";
  platforms: { platform: Platform; handle: string; followers: number }[];
  created_at: string;
}

export interface Deal {
  id: string;
  user_id: string;
  brand_name: string;
  brand_logo: string | null;
  deal_type: DealType;
  stage: DealStage;
  value: number;
  deliverables: string;
  platform: Platform;
  due_date: string | null;
  exclusivity_days: number | null;
  exclusivity_category: string | null;
  notes: string;
  created_by_agency: boolean;
  agency_id: string | null;
  agency_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityLogEntry {
  id: string;
  actor_id: string;
  actor_name: string;
  actor_type: "creator" | "agency";
  action: string;
  action_label: string;
  target_name: string;
  created_at: string;
}

export interface AgencyCreatorLink {
  agency_id: string;
  agency_name: string;
  creator_id: string;
  creator_name: string;
  commission_rate: number;
  status: "active" | "pending" | "disconnected";
  linked_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  deal_id: string;
  brand_name: string;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue";
  due_date: string;
  paid_date: string | null;
  created_at: string;
}

export interface InboxEmail {
  id: string;
  user_id: string;
  provider: EmailProvider;
  from_name: string;
  from_email: string;
  subject: string;
  preview: string;
  is_brand_deal: boolean;
  brand_name: string | null;
  is_read: boolean;
  is_starred: boolean;
  received_at: string;
}

export interface InboundInquiry {
  id: string;
  user_id: string;
  brand_name: string;
  contact_name: string;
  contact_email: string;
  message: string;
  budget_range: string;
  platforms_requested: Platform[];
  status: "new" | "reviewed" | "added_to_pipeline" | "declined";
  created_at: string;
}

// ─── User ────────────────────────────────────────────────────────

export const currentUser: User = {
  id: "usr_brianna_001",
  full_name: "Brianna Cole",
  email: "brianna@briannacole.com",
  avatar_url: null,
  tier: "influencer",
  platforms: [
    { platform: "tiktok", handle: "@briannacole", followers: 68400 },
    { platform: "instagram", handle: "@brianna.cole", followers: 52100 },
    { platform: "youtube", handle: "@BriannaColeCreates", followers: 21500 },
  ],
  created_at: "2025-09-15T10:00:00Z",
};

// ─── Deals ───────────────────────────────────────────────────────

export const deals: Deal[] = [
  {
    id: "deal_001",
    user_id: "usr_brianna_001",
    brand_name: "Glossier",
    brand_logo: null,
    deal_type: "influencer",
    stage: "paid",
    value: 2800,
    deliverables: "2 TikTok videos + 1 Instagram Reel",
    platform: "tiktok",
    due_date: "2026-03-01",
    exclusivity_days: 30,
    exclusivity_category: "Beauty",
    notes: "Spring campaign — clean girl aesthetic",
    created_by_agency: false,
    agency_id: null,
    agency_name: null,
    created_at: "2026-01-10T09:00:00Z",
    updated_at: "2026-03-05T14:00:00Z",
  },
  {
    id: "deal_002",
    user_id: "usr_brianna_001",
    brand_name: "Ritual Vitamins",
    brand_logo: null,
    deal_type: "ugc",
    stage: "delivered",
    value: 1500,
    deliverables: "1 YouTube integration (60s)",
    platform: "youtube",
    due_date: "2026-04-05",
    exclusivity_days: null,
    exclusivity_category: null,
    notes: "Wellness routine integration, mention subscription",
    created_by_agency: false,
    agency_id: null,
    agency_name: null,
    created_at: "2026-02-20T11:00:00Z",
    updated_at: "2026-04-06T10:00:00Z",
  },
  {
    id: "deal_003",
    user_id: "usr_brianna_001",
    brand_name: "Mejuri",
    brand_logo: null,
    deal_type: "influencer",
    stage: "in_progress",
    value: 3200,
    deliverables: "3 Instagram Reels + 2 Stories",
    platform: "instagram",
    due_date: "2026-04-20",
    exclusivity_days: 14,
    exclusivity_category: "Jewelry",
    notes: "New collection launch — gold jewelry focus",
    created_by_agency: true,
    agency_id: "agency_001",
    agency_name: "Bright Talent Mgmt",
    created_at: "2026-03-01T08:00:00Z",
    updated_at: "2026-04-01T16:00:00Z",
  },
  {
    id: "deal_004",
    user_id: "usr_brianna_001",
    brand_name: "Oatly",
    brand_logo: null,
    deal_type: "ugc",
    stage: "contracted",
    value: 1800,
    deliverables: "2 TikTok videos",
    platform: "tiktok",
    due_date: "2026-05-01",
    exclusivity_days: null,
    exclusivity_category: null,
    notes: "Morning routine content, casual vibe",
    created_by_agency: false,
    agency_id: null,
    agency_name: null,
    created_at: "2026-03-15T14:00:00Z",
    updated_at: "2026-04-08T09:00:00Z",
  },
  {
    id: "deal_005",
    user_id: "usr_brianna_001",
    brand_name: "Aritzia",
    brand_logo: null,
    deal_type: "ugc",
    stage: "negotiating",
    value: 4500,
    deliverables: "UGC package — 5 videos for their paid ads",
    platform: "tiktok",
    due_date: null,
    exclusivity_days: 90,
    exclusivity_category: "Fashion",
    notes: "They want whitelisting rights for 90 days",
    created_by_agency: true,
    agency_id: "agency_001",
    agency_name: "Bright Talent Mgmt",
    created_at: "2026-04-02T10:00:00Z",
    updated_at: "2026-04-10T11:00:00Z",
  },
  {
    id: "deal_006",
    user_id: "usr_brianna_001",
    brand_name: "Notion",
    brand_logo: null,
    deal_type: "influencer",
    stage: "negotiating",
    value: 2200,
    deliverables: "1 YouTube video — creator workflow",
    platform: "youtube",
    due_date: null,
    exclusivity_days: null,
    exclusivity_category: null,
    notes: "Want authentic day-in-the-life style",
    created_by_agency: false,
    agency_id: null,
    agency_name: null,
    created_at: "2026-04-05T16:00:00Z",
    updated_at: "2026-04-11T08:00:00Z",
  },
  {
    id: "deal_007",
    user_id: "usr_brianna_001",
    brand_name: "Summer Fridays",
    brand_logo: null,
    deal_type: "influencer",
    stage: "pitched",
    value: 2000,
    deliverables: "2 Instagram Reels + 1 Story",
    platform: "instagram",
    due_date: null,
    exclusivity_days: null,
    exclusivity_category: "Skincare",
    notes: "DM'd about summer campaign, waiting on brief",
    created_by_agency: false,
    agency_id: null,
    agency_name: null,
    created_at: "2026-04-09T13:00:00Z",
    updated_at: "2026-04-09T13:00:00Z",
  },
  {
    id: "deal_008",
    user_id: "usr_brianna_001",
    brand_name: "Canva",
    brand_logo: null,
    deal_type: "ugc",
    stage: "pitched",
    value: 1800,
    deliverables: "3 TikTok videos for paid ads",
    platform: "tiktok",
    due_date: null,
    exclusivity_days: null,
    exclusivity_category: null,
    notes: "Intro from talent manager, exploratory",
    created_by_agency: true,
    agency_id: "agency_001",
    agency_name: "Bright Talent Mgmt",
    created_at: "2026-04-10T09:00:00Z",
    updated_at: "2026-04-10T09:00:00Z",
  },
];

// ─── Invoices ────────────────────────────────────────────────────

export const invoices: Invoice[] = [
  {
    id: "inv_001",
    user_id: "usr_brianna_001",
    deal_id: "deal_001",
    brand_name: "Glossier",
    amount: 2800,
    status: "paid",
    due_date: "2026-03-15",
    paid_date: "2026-03-12",
    created_at: "2026-03-02T10:00:00Z",
  },
  {
    id: "inv_002",
    user_id: "usr_brianna_001",
    deal_id: "deal_002",
    brand_name: "Ritual Vitamins",
    amount: 1500,
    status: "sent",
    due_date: "2026-04-20",
    paid_date: null,
    created_at: "2026-04-06T10:00:00Z",
  },
  {
    id: "inv_003",
    user_id: "usr_brianna_001",
    deal_id: "deal_003",
    brand_name: "Mejuri",
    amount: 1600,
    status: "draft",
    due_date: "2026-04-30",
    paid_date: null,
    created_at: "2026-04-08T14:00:00Z",
  },
  {
    id: "inv_004",
    user_id: "usr_brianna_001",
    deal_id: "deal_001",
    brand_name: "Glossier",
    amount: 1200,
    status: "overdue",
    due_date: "2026-03-30",
    paid_date: null,
    created_at: "2026-03-10T10:00:00Z",
  },
];

// ─── Inbox Emails ────────────────────────────────────────────────

export const inboxEmails: InboxEmail[] = [
  {
    id: "email_001",
    user_id: "usr_brianna_001",
    provider: "gmail",
    from_name: "Sarah Kim",
    from_email: "sarah.kim@aritzia.com",
    subject: "Re: UGC Partnership — Spring/Summer 2026",
    preview: "Hi Brianna! Thanks for sending over your updated rate card. We'd love to move forward with the 5-video package. A few questions about the whitelisting terms...",
    is_brand_deal: true,
    brand_name: "Aritzia",
    is_read: false,
    is_starred: true,
    received_at: "2026-04-12T09:15:00Z",
  },
  {
    id: "email_002",
    user_id: "usr_brianna_001",
    provider: "gmail",
    from_name: "Marcus Johnson",
    from_email: "marcus@notionpartnerships.com",
    subject: "Notion x Brianna — Campaign Brief",
    preview: "Hey Brianna, attached is the creative brief for the YouTube integration. We're thinking a day-in-the-life format where you show how you use Notion to manage...",
    is_brand_deal: true,
    brand_name: "Notion",
    is_read: false,
    is_starred: false,
    received_at: "2026-04-11T16:42:00Z",
  },
  {
    id: "email_003",
    user_id: "usr_brianna_001",
    provider: "outlook",
    from_name: "Talent Connect Pro",
    from_email: "noreply@talentconnectpro.com",
    subject: "New Brand Match: Warby Parker looking for lifestyle creators",
    preview: "You've been matched with Warby Parker for their upcoming summer eyewear campaign. Budget range: $2,000-$4,000. They're looking for authentic lifestyle...",
    is_brand_deal: true,
    brand_name: "Warby Parker",
    is_read: true,
    is_starred: false,
    received_at: "2026-04-11T11:20:00Z",
  },
  {
    id: "email_004",
    user_id: "usr_brianna_001",
    provider: "gmail",
    from_name: "Jessica Lee",
    from_email: "jessica@mejuri.com",
    subject: "Content Approval — Gold Drop Collection Reel #1",
    preview: "Love the first draft! Just a couple of small tweaks — can we make the product shot at 0:08 a bit longer? Also the music choice is perfect. The team...",
    is_brand_deal: true,
    brand_name: "Mejuri",
    is_read: true,
    is_starred: true,
    received_at: "2026-04-10T14:05:00Z",
  },
  {
    id: "email_005",
    user_id: "usr_brianna_001",
    provider: "gmail",
    from_name: "TikTok Creator Fund",
    from_email: "creatorfund@tiktok.com",
    subject: "March 2026 Earnings Summary",
    preview: "Your TikTok Creator Fund earnings for March 2026 are now available. Total earnings: $342.18. Top performing video: 'morning routine that actually works'...",
    is_brand_deal: false,
    brand_name: null,
    is_read: true,
    is_starred: false,
    received_at: "2026-04-05T08:00:00Z",
  },
  {
    id: "email_006",
    user_id: "usr_brianna_001",
    provider: "outlook",
    from_name: "Emily Chen",
    from_email: "emily.chen@summerfridays.com",
    subject: "Collab Opportunity — Summer Fridays x Summer '26",
    preview: "Hi Brianna! I'm Emily from the brand partnerships team at Summer Fridays. We've been loving your skincare content and would love to chat about a potential...",
    is_brand_deal: true,
    brand_name: "Summer Fridays",
    is_read: false,
    is_starred: false,
    received_at: "2026-04-09T10:30:00Z",
  },
  {
    id: "email_007",
    user_id: "usr_brianna_001",
    provider: "gmail",
    from_name: "Adobe Creative Cloud",
    from_email: "no-reply@adobe.com",
    subject: "Your subscription renewal is coming up",
    preview: "Your Adobe Creative Cloud subscription will renew on April 20, 2026. Your plan: Photography Plan ($9.99/mo). If you'd like to make changes...",
    is_brand_deal: false,
    brand_name: null,
    is_read: true,
    is_starred: false,
    received_at: "2026-04-08T07:00:00Z",
  },
  {
    id: "email_008",
    user_id: "usr_brianna_001",
    provider: "gmail",
    from_name: "Oatly Partnerships",
    from_email: "creators@oatly.com",
    subject: "Contract Signed — Let's Make Something Cool",
    preview: "We're so excited to work with you, Brianna! The signed contract is attached. Quick recap: 2 TikTok videos, casual morning routine vibe, due by May 1st...",
    is_brand_deal: true,
    brand_name: "Oatly",
    is_read: true,
    is_starred: true,
    received_at: "2026-04-08T12:00:00Z",
  },
];

// ─── Inbound Inquiries ──────────────────────────────────────────

export const inboundInquiries: InboundInquiry[] = [
  {
    id: "inq_001",
    user_id: "usr_brianna_001",
    brand_name: "Supergoop!",
    contact_name: "Mia Torres",
    contact_email: "mia@supergoop.com",
    message: "Hi Brianna! We love your skincare routine content and think you'd be a perfect fit for our SPF awareness campaign this summer. Would love to chat about a potential collab — are you open to Instagram Reels?",
    budget_range: "$1,500 – $3,000",
    platforms_requested: ["instagram"],
    status: "new",
    created_at: "2026-04-11T14:20:00Z",
  },
  {
    id: "inq_002",
    user_id: "usr_brianna_001",
    brand_name: "Lululemon",
    contact_name: "David Park",
    contact_email: "david.park@lululemon.com",
    message: "Hey Brianna, we're launching a new athleisure line and looking for creators who represent an active, balanced lifestyle. We'd love to discuss a multi-platform partnership.",
    budget_range: "$3,000 – $5,000",
    platforms_requested: ["tiktok", "instagram"],
    status: "new",
    created_at: "2026-04-10T09:45:00Z",
  },
  {
    id: "inq_003",
    user_id: "usr_brianna_001",
    brand_name: "Calm App",
    contact_name: "Rachel Green",
    contact_email: "rachel@calm.com",
    message: "We're putting together a creator campaign around mindfulness and morning routines. Your content is exactly the vibe we're going for. Interested in a YouTube integration?",
    budget_range: "$2,000 – $3,500",
    platforms_requested: ["youtube"],
    status: "reviewed",
    created_at: "2026-04-08T11:00:00Z",
  },
  {
    id: "inq_004",
    user_id: "usr_brianna_001",
    brand_name: "Parachute Home",
    contact_name: "Alex Rivera",
    contact_email: "alex@parachutehome.com",
    message: "Love your aesthetic, Brianna! We're looking for UGC content for our new linen collection. Would you be open to creating some lifestyle content for our social channels?",
    budget_range: "$1,000 – $2,000",
    platforms_requested: ["tiktok", "instagram"],
    status: "added_to_pipeline",
    created_at: "2026-04-05T16:30:00Z",
  },
  {
    id: "inq_005",
    user_id: "usr_brianna_001",
    brand_name: "Athletic Greens",
    contact_name: "Jordan Wu",
    contact_email: "jordan@athleticgreens.com",
    message: "Hi! AG1 is expanding our creator program and your wellness content caught our eye. We're flexible on platforms and deliverables — would love to find something that fits your style.",
    budget_range: "$2,500 – $4,000",
    platforms_requested: ["tiktok", "youtube"],
    status: "new",
    created_at: "2026-04-12T07:00:00Z",
  },
];

// ─── Computed Stats ──────────────────────────────────────────────

export const platformStats = {
  tiktok: {
    handle: "@briannacole",
    followers: 84000,
    avgViews: 24500,
    engagementRate: 4.8,
    postsThisMonth: 12,
    growth: "+2.3%",
  },
  instagram: {
    handle: "@brianna.cole",
    followers: 42000,
    avgViews: 8900,
    engagementRate: 3.2,
    postsThisMonth: 8,
    growth: "+1.1%",
  },
  youtube: {
    handle: "@BriannaColeCreates",
    followers: 16000,
    avgViews: 6200,
    engagementRate: 5.1,
    postsThisMonth: 3,
    growth: "+3.8%",
  },
};

export const totalFollowers = 142000;

export const healthScore = {
  overall: 84,
  categories: {
    "Posting Consistency": 90,
    "Engagement Rate": 78,
    "Revenue Pipeline": 85,
    "Response Time": 72,
    "Content Diversity": 88,
  },
};

export const revenueStats = {
  thisMonth: 8240,
  ugcIncome: 4800,
  influencerIncome: 3440,
  lastMonth: 6100,
  thisQuarter: 18640,
  pipeline: 16000,
  invoicesPending: 3100,
  invoicesOverdue: 1200,
};

export const dealStageLabels: Record<DealStage, string> = {
  lead: "Lead",
  pitched: "Pitched",
  negotiating: "Negotiating",
  contracted: "Contracted",
  in_progress: "In Progress",
  delivered: "Delivered",
  paid: "Paid",
};

export const dealStageColors: Record<DealStage, string> = {
  lead: "bg-gray-100 text-gray-700",
  pitched: "bg-violet-100 text-violet-700",
  negotiating: "bg-amber-100 text-amber-700",
  contracted: "bg-blue-100 text-blue-700",
  in_progress: "bg-terra-100 text-terra-700",
  delivered: "bg-purple-100 text-purple-700",
  paid: "bg-emerald-100 text-emerald-700",
};

// ─── Automations ─────────────────────────────────────────────────

export interface Automation {
  id: string;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
  last_fired: string | null;
  category: "active" | "available";
}

export const automations: Automation[] = [
  {
    id: "auto_001",
    title: "Deal delivered → generate recap",
    description: "When a deal is marked as delivered, automatically generate a campaign recap and send a rebook prompt to the brand.",
    icon: "package-check",
    enabled: true,
    last_fired: "2026-04-06T10:00:00Z",
    category: "active",
  },
  {
    id: "auto_002",
    title: "Invoice unpaid 7 days → reminder",
    description: "Send a friendly payment reminder when an invoice hasn't been paid after 7 days.",
    icon: "bell",
    enabled: true,
    last_fired: "2026-04-10T09:00:00Z",
    category: "active",
  },
  {
    id: "auto_003",
    title: "Invoice unpaid 14 days → demand letter",
    description: "Escalate to a formal demand letter when an invoice remains unpaid for 14+ days.",
    icon: "alert-triangle",
    enabled: true,
    last_fired: "2026-04-05T09:00:00Z",
    category: "active",
  },
  {
    id: "auto_004",
    title: "Brand email detected → alert",
    description: "Instantly alert you when a brand deal email is detected in your inbox with a quick-add button.",
    icon: "mail-check",
    enabled: true,
    last_fired: "2026-04-12T09:15:00Z",
    category: "active",
  },
  {
    id: "auto_005",
    title: "Inbound inquiry → notify instantly",
    description: "Push a notification the moment a new inquiry comes through your Work With Me page.",
    icon: "message-square-plus",
    enabled: true,
    last_fired: "2026-04-12T07:00:00Z",
    category: "active",
  },
  {
    id: "auto_006",
    title: "Deadline reminder",
    description: "Get reminded 48 hours before any deal deliverable is due.",
    icon: "clock",
    enabled: false,
    last_fired: null,
    category: "available",
  },
  {
    id: "auto_007",
    title: "Weekly digest",
    description: "Receive a weekly summary of pipeline changes, new inquiries, and income earned.",
    icon: "newspaper",
    enabled: false,
    last_fired: null,
    category: "available",
  },
  {
    id: "auto_008",
    title: "Exclusivity expiring alert",
    description: "Get notified when an exclusivity window on a deal is about to expire so you can pitch competing brands.",
    icon: "shield-off",
    enabled: false,
    last_fired: null,
    category: "available",
  },
];

// ─── Brand Radar ─────────────────────────────────────────────────

export interface BrandRadar {
  id: string;
  brand_name: string;
  category: string;
  fit: "great" | "good";
  ugc_rate_low: number;
  ugc_rate_high: number;
  influencer_rate_low: number;
  influencer_rate_high: number;
  pay_speed: "fast" | "average" | "slow";
  pay_speed_days: number;
  creator_ease: number; // 1-5
  description: string;
}

export const brandRadarData: BrandRadar[] = [
  { id: "br_01", brand_name: "Glossier", category: "Beauty", fit: "great", ugc_rate_low: 400, ugc_rate_high: 1200, influencer_rate_low: 1500, influencer_rate_high: 4000, pay_speed: "fast", pay_speed_days: 14, creator_ease: 5, description: "Clean beauty brand known for creator-friendly campaigns and fast payment." },
  { id: "br_02", brand_name: "The Ordinary", category: "Skincare", fit: "great", ugc_rate_low: 300, ugc_rate_high: 900, influencer_rate_low: 1000, influencer_rate_high: 3000, pay_speed: "fast", pay_speed_days: 10, creator_ease: 4, description: "Science-forward skincare with transparent briefs and quick turnarounds." },
  { id: "br_03", brand_name: "Supergoop!", category: "Skincare", fit: "great", ugc_rate_low: 500, ugc_rate_high: 1500, influencer_rate_low: 1500, influencer_rate_high: 3500, pay_speed: "fast", pay_speed_days: 12, creator_ease: 5, description: "SPF brand with high creative freedom and excellent creator relations." },
  { id: "br_04", brand_name: "Summer Fridays", category: "Skincare", fit: "good", ugc_rate_low: 400, ugc_rate_high: 1100, influencer_rate_low: 1200, influencer_rate_high: 3200, pay_speed: "average", pay_speed_days: 21, creator_ease: 4, description: "Premium skincare with aesthetic-driven campaigns." },
  { id: "br_05", brand_name: "Aritzia", category: "Fashion", fit: "great", ugc_rate_low: 600, ugc_rate_high: 2000, influencer_rate_low: 2000, influencer_rate_high: 5000, pay_speed: "average", pay_speed_days: 25, creator_ease: 4, description: "Fashion retailer with generous UGC budgets and multi-video packages." },
  { id: "br_06", brand_name: "Lululemon", category: "Fashion", fit: "great", ugc_rate_low: 800, ugc_rate_high: 2500, influencer_rate_low: 3000, influencer_rate_high: 8000, pay_speed: "average", pay_speed_days: 30, creator_ease: 3, description: "Premium athleisure with larger budgets but more revisions." },
  { id: "br_07", brand_name: "Mejuri", category: "Fashion", fit: "good", ugc_rate_low: 350, ugc_rate_high: 1000, influencer_rate_low: 1200, influencer_rate_high: 3500, pay_speed: "fast", pay_speed_days: 15, creator_ease: 5, description: "Fine jewelry brand with beautiful creative direction and fast pay." },
  { id: "br_08", brand_name: "Oatly", category: "Food", fit: "good", ugc_rate_low: 300, ugc_rate_high: 900, influencer_rate_low: 1000, influencer_rate_high: 2500, pay_speed: "fast", pay_speed_days: 14, creator_ease: 5, description: "Fun brand voice with minimal revisions and creative freedom." },
  { id: "br_09", brand_name: "Liquid Death", category: "Food", fit: "good", ugc_rate_low: 500, ugc_rate_high: 1500, influencer_rate_low: 1500, influencer_rate_high: 4000, pay_speed: "fast", pay_speed_days: 10, creator_ease: 5, description: "Edgy water brand known for creative freedom and fast payment." },
  { id: "br_10", brand_name: "Ritual Vitamins", category: "Wellness", fit: "great", ugc_rate_low: 400, ugc_rate_high: 1200, influencer_rate_low: 1200, influencer_rate_high: 3000, pay_speed: "average", pay_speed_days: 21, creator_ease: 4, description: "Subscription wellness brand with recurring partnership potential." },
  { id: "br_11", brand_name: "Athletic Greens", category: "Wellness", fit: "great", ugc_rate_low: 600, ugc_rate_high: 2000, influencer_rate_low: 2000, influencer_rate_high: 5000, pay_speed: "average", pay_speed_days: 25, creator_ease: 4, description: "Premium supplement brand with strong affiliate and sponsorship programs." },
  { id: "br_12", brand_name: "Calm App", category: "Wellness", fit: "good", ugc_rate_low: 500, ugc_rate_high: 1500, influencer_rate_low: 1500, influencer_rate_high: 4000, pay_speed: "fast", pay_speed_days: 14, creator_ease: 4, description: "Mindfulness app with authentic storytelling campaigns." },
  { id: "br_13", brand_name: "Notion", category: "Lifestyle", fit: "good", ugc_rate_low: 400, ugc_rate_high: 1200, influencer_rate_low: 1500, influencer_rate_high: 4000, pay_speed: "fast", pay_speed_days: 14, creator_ease: 5, description: "Productivity tool with day-in-the-life style campaigns." },
  { id: "br_14", brand_name: "Canva", category: "Lifestyle", fit: "good", ugc_rate_low: 500, ugc_rate_high: 1500, influencer_rate_low: 1500, influencer_rate_high: 3500, pay_speed: "fast", pay_speed_days: 12, creator_ease: 5, description: "Design platform with creator-friendly workflows." },
  { id: "br_15", brand_name: "Parachute Home", category: "Lifestyle", fit: "good", ugc_rate_low: 300, ugc_rate_high: 800, influencer_rate_low: 1000, influencer_rate_high: 2500, pay_speed: "average", pay_speed_days: 21, creator_ease: 4, description: "Home goods brand with aesthetic lifestyle campaigns." },
  { id: "br_16", brand_name: "Fenty Beauty", category: "Beauty", fit: "great", ugc_rate_low: 600, ugc_rate_high: 2000, influencer_rate_low: 2500, influencer_rate_high: 7000, pay_speed: "average", pay_speed_days: 28, creator_ease: 3, description: "Rihanna's beauty line with high-value campaigns but detailed briefs." },
  { id: "br_17", brand_name: "Rare Beauty", category: "Beauty", fit: "great", ugc_rate_low: 500, ugc_rate_high: 1800, influencer_rate_low: 2000, influencer_rate_high: 6000, pay_speed: "average", pay_speed_days: 25, creator_ease: 4, description: "Selena's brand with mental health-aligned messaging and good creative freedom." },
  { id: "br_18", brand_name: "Alo Yoga", category: "Fashion", fit: "good", ugc_rate_low: 400, ugc_rate_high: 1200, influencer_rate_low: 1500, influencer_rate_high: 4500, pay_speed: "slow", pay_speed_days: 35, creator_ease: 3, description: "Yoga apparel with aspirational content but slower payment cycles." },
  { id: "br_19", brand_name: "Olipop", category: "Food", fit: "good", ugc_rate_low: 300, ugc_rate_high: 900, influencer_rate_low: 1000, influencer_rate_high: 2500, pay_speed: "fast", pay_speed_days: 14, creator_ease: 5, description: "Healthy soda brand with fun, casual content style and quick pay." },
  { id: "br_20", brand_name: "Headspace", category: "Wellness", fit: "good", ugc_rate_low: 400, ugc_rate_high: 1200, influencer_rate_low: 1200, influencer_rate_high: 3500, pay_speed: "average", pay_speed_days: 21, creator_ease: 4, description: "Meditation app with authentic wellness storytelling campaigns." },
];

export const brandRadarCategories = ["All", "Skincare", "Beauty", "Fashion", "Food", "Wellness", "Lifestyle"];

// ─── Media Kit ───────────────────────────────────────────────────

export const mediaKitData = {
  bio: "Lifestyle creator sharing morning routines, skincare, and real talk about the creator economy. Based in LA.",
  niche_tags: ["Lifestyle", "Skincare", "Wellness", "Morning Routines"],
  content_categories: ["Get Ready With Me", "Product Reviews", "Day in the Life", "Creator Tips"],
  rate_ranges: {
    ugc_video: "$400 – $1,200",
    instagram_reel: "$800 – $2,000",
    youtube_integration: "$1,500 – $3,500",
    tiktok_video: "$600 – $1,800",
    instagram_story: "$200 – $500",
  },
  brands_worked_with: ["Glossier", "Mejuri", "Ritual Vitamins", "Oatly", "Notion"],
};

// ─── Agency System ───────────────────────────────────────────────

export const agencyLink: AgencyCreatorLink = {
  agency_id: "agency_001",
  agency_name: "Bright Talent Mgmt",
  creator_id: "usr_brianna_001",
  creator_name: "Brianna Cole",
  commission_rate: 15,
  status: "active",
  linked_at: "2025-11-01T10:00:00Z",
};

export const agencyPermissions = {
  canDo: [
    "Create and edit deals on your behalf",
    "Create invoices for your deals",
    "Upload contracts to deals",
    "Add notes to deals",
    "Move deals between pipeline stages",
  ],
  cannotDo: [
    "Edit your profile or bio",
    "Change your media kit",
    "Modify your rate card",
    "Change your subscription tier",
    "Access your email inbox",
  ],
};

export const activityLog: ActivityLogEntry[] = [
  { id: "log_01", actor_id: "agency_001", actor_name: "Bright Talent Mgmt", actor_type: "agency", action: "created_deal", action_label: "Created deal", target_name: "Canva — UGC package", created_at: "2026-04-10T09:00:00Z" },
  { id: "log_02", actor_id: "agency_001", actor_name: "Bright Talent Mgmt", actor_type: "agency", action: "created_deal", action_label: "Created deal", target_name: "Aritzia — UGC partnership", created_at: "2026-04-02T10:00:00Z" },
  { id: "log_03", actor_id: "agency_001", actor_name: "Bright Talent Mgmt", actor_type: "agency", action: "updated_deal", action_label: "Updated deal", target_name: "Mejuri — moved to In Progress", created_at: "2026-04-01T16:00:00Z" },
  { id: "log_04", actor_id: "agency_001", actor_name: "Bright Talent Mgmt", actor_type: "agency", action: "uploaded_contract", action_label: "Uploaded contract", target_name: "Aritzia — partnership agreement.pdf", created_at: "2026-04-03T14:30:00Z" },
  { id: "log_05", actor_id: "agency_001", actor_name: "Bright Talent Mgmt", actor_type: "agency", action: "created_invoice", action_label: "Created invoice", target_name: "Mejuri — $1,600", created_at: "2026-04-08T14:00:00Z" },
  { id: "log_06", actor_id: "agency_001", actor_name: "Bright Talent Mgmt", actor_type: "agency", action: "added_note", action_label: "Added note", target_name: "Aritzia — whitelisting terms discussion", created_at: "2026-04-05T11:00:00Z" },
  { id: "log_07", actor_id: "agency_001", actor_name: "Bright Talent Mgmt", actor_type: "agency", action: "moved_stage", action_label: "Moved stage", target_name: "Canva — Pitched → Negotiating", created_at: "2026-04-11T08:30:00Z" },
  { id: "log_08", actor_id: "agency_001", actor_name: "Bright Talent Mgmt", actor_type: "agency", action: "updated_deal", action_label: "Updated deal value", target_name: "Aritzia — $4,500", created_at: "2026-04-10T11:00:00Z" },
  { id: "log_09", actor_id: "agency_001", actor_name: "Bright Talent Mgmt", actor_type: "agency", action: "created_deal", action_label: "Created deal", target_name: "Mejuri — gold collection", created_at: "2026-03-01T08:00:00Z" },
  { id: "log_10", actor_id: "agency_001", actor_name: "Bright Talent Mgmt", actor_type: "agency", action: "added_note", action_label: "Added note", target_name: "Mejuri — content direction approved", created_at: "2026-03-15T10:00:00Z" },
];

// ─── Agency PM Platform Data ─────────────────────────────────────

export interface CreatorProfile {
  id: string;
  name: string;
  handle: string;
  tier: string;
  avatar: string;
  platforms: { name: string; followers: number; engagement: number }[];
  healthScore: number;
  commissionRate: number;
  joinedDate: string;
  totalEarned: number;
  avgDealValue: number;
  dealsCompleted: number;
  dealsActive: number;
  brandsWorkedWith: number;
  repeatBrandRate: number;
  monthlyEarnings: { month: string; amount: number }[];
  rateCard: { type: string; rate: string }[];
  dealHistory: { brand: string; type: string; value: number; date: string; stage: string; commission: number; outcome: string }[];
  brandRelationships: { brand: string; deals: number; totalValue: number; avgDeal: number; lastDeal: string; exclusivity: boolean; repeat: boolean }[];
  contentPerformance: { deal: string; views: number; saves: number; shares: number; engagement: number; date: string }[];
  rateHistory: { date: string; type: string; rate: number }[];
  followerGrowth: { date: string; platform: string; count: number }[];
  notes: { id: string; body: string; pinned: boolean; tag: string; date: string }[];
}

export const agencyRoster: CreatorProfile[] = [
  {
    id: "usr_brianna_001", name: "Brianna Cole", handle: "@briannacole", tier: "Influencer", avatar: "BC",
    platforms: [{ name: "TikTok", followers: 84000, engagement: 4.8 }, { name: "Instagram", followers: 42000, engagement: 3.2 }, { name: "YouTube", followers: 16000, engagement: 5.1 }],
    healthScore: 84, commissionRate: 15, joinedDate: "2025-11-01", totalEarned: 32400, avgDealValue: 2700, dealsCompleted: 12, dealsActive: 3, brandsWorkedWith: 9, repeatBrandRate: 33,
    monthlyEarnings: [{ month: "Nov", amount: 4200 }, { month: "Dec", amount: 5800 }, { month: "Jan", amount: 3400 }, { month: "Feb", amount: 6100 }, { month: "Mar", amount: 4660 }, { month: "Apr", amount: 8240 }],
    rateCard: [{ type: "UGC Video", rate: "$400–$1,200" }, { type: "IG Reel", rate: "$800–$2,000" }, { type: "YT Integration", rate: "$1,500–$3,500" }, { type: "TikTok", rate: "$600–$1,800" }],
    dealHistory: [
      { brand: "Glossier", type: "Influencer", value: 2800, date: "2026-03-01", stage: "paid", commission: 420, outcome: "completed" },
      { brand: "Ritual Vitamins", type: "UGC", value: 1500, date: "2026-04-05", stage: "delivered", commission: 225, outcome: "completed" },
      { brand: "Mejuri", type: "Influencer", value: 3200, date: "2026-04-20", stage: "in_progress", commission: 480, outcome: "active" },
    ],
    brandRelationships: [
      { brand: "Glossier", deals: 3, totalValue: 7200, avgDeal: 2400, lastDeal: "2026-03-01", exclusivity: false, repeat: true },
      { brand: "Mejuri", deals: 2, totalValue: 5400, avgDeal: 2700, lastDeal: "2026-04-01", exclusivity: true, repeat: true },
      { brand: "Aritzia", deals: 1, totalValue: 4500, avgDeal: 4500, lastDeal: "2026-04-02", exclusivity: true, repeat: false },
    ],
    contentPerformance: [
      { deal: "Glossier Spring", views: 245000, saves: 12400, shares: 3200, engagement: 6.4, date: "2026-03-05" },
      { deal: "Mejuri Gold Drop", views: 182000, saves: 9800, shares: 2100, engagement: 5.1, date: "2026-04-10" },
    ],
    rateHistory: [{ date: "2025-11", type: "UGC", rate: 350 }, { date: "2026-01", type: "UGC", rate: 400 }, { date: "2026-03", type: "UGC", rate: 500 }, { date: "2026-04", type: "Influencer", rate: 1200 }],
    followerGrowth: [{ date: "2025-11", platform: "TikTok", count: 72000 }, { date: "2026-01", platform: "TikTok", count: 78000 }, { date: "2026-03", platform: "TikTok", count: 82000 }, { date: "2026-04", platform: "TikTok", count: 84000 }],
    notes: [{ id: "n1", body: "Brianna prefers 2-week turnaround on deliverables. Don't book more than 3 active deals at once.", pinned: true, tag: "performance", date: "2026-03-10" }, { id: "n2", body: "Rate increase discussion — she wants to move to $1,500 base for influencer deals starting May.", pinned: false, tag: "rate-negotiation", date: "2026-04-05" }],
  },
  {
    id: "usr_maya_001", name: "Maya Chen", handle: "@mayacreates", tier: "UGC Creator", avatar: "MC",
    platforms: [{ name: "TikTok", followers: 52000, engagement: 5.2 }, { name: "Instagram", followers: 28000, engagement: 3.8 }],
    healthScore: 78, commissionRate: 15, joinedDate: "2026-01-15", totalEarned: 18600, avgDealValue: 2100, dealsCompleted: 8, dealsActive: 2, brandsWorkedWith: 6, repeatBrandRate: 25,
    monthlyEarnings: [{ month: "Jan", amount: 2100 }, { month: "Feb", amount: 3800 }, { month: "Mar", amount: 5100 }, { month: "Apr", amount: 4600 }],
    rateCard: [{ type: "UGC Video", rate: "$300–$900" }, { type: "IG Reel", rate: "$600–$1,500" }, { type: "TikTok", rate: "$400–$1,200" }],
    dealHistory: [{ brand: "Glossier", type: "UGC", value: 2800, date: "2026-04-28", stage: "contracted", commission: 420, outcome: "active" }],
    brandRelationships: [{ brand: "Glossier", deals: 2, totalValue: 4600, avgDeal: 2300, lastDeal: "2026-03-20", exclusivity: false, repeat: true }],
    contentPerformance: [{ deal: "Glossier Clean Girl", views: 156000, saves: 7200, shares: 1800, engagement: 5.8, date: "2026-03-25" }],
    rateHistory: [{ date: "2026-01", type: "UGC", rate: 300 }, { date: "2026-03", type: "UGC", rate: 400 }],
    followerGrowth: [{ date: "2026-01", platform: "TikTok", count: 38000 }, { date: "2026-04", platform: "TikTok", count: 52000 }],
    notes: [{ id: "n3", body: "Maya is growing fast — TikTok up 37% in 3 months. Great candidate for larger brand deals.", pinned: true, tag: "performance", date: "2026-04-01" }],
  },
  {
    id: "usr_jordan_001", name: "Jordan Ellis", handle: "@jordanfits", tier: "Influencer", avatar: "JE",
    platforms: [{ name: "TikTok", followers: 96000, engagement: 3.9 }, { name: "Instagram", followers: 61000, engagement: 2.8 }, { name: "YouTube", followers: 22000, engagement: 4.5 }],
    healthScore: 71, commissionRate: 12, joinedDate: "2025-09-01", totalEarned: 41200, avgDealValue: 3200, dealsCompleted: 13, dealsActive: 2, brandsWorkedWith: 10, repeatBrandRate: 40,
    monthlyEarnings: [{ month: "Nov", amount: 6400 }, { month: "Dec", amount: 7200 }, { month: "Jan", amount: 5100 }, { month: "Feb", amount: 4800 }, { month: "Mar", amount: 6200 }, { month: "Apr", amount: 3700 }],
    rateCard: [{ type: "UGC Video", rate: "$500–$1,500" }, { type: "IG Reel", rate: "$1,000–$2,500" }, { type: "YT Integration", rate: "$2,000–$4,500" }],
    dealHistory: [{ brand: "Oatly", type: "UGC", value: 1500, date: "2026-05-01", stage: "in_progress", commission: 180, outcome: "active" }],
    brandRelationships: [{ brand: "Nike", deals: 3, totalValue: 12000, avgDeal: 4000, lastDeal: "2026-02-15", exclusivity: false, repeat: true }],
    contentPerformance: [{ deal: "Nike Air Max Day", views: 520000, saves: 28000, shares: 9200, engagement: 7.2, date: "2026-03-26" }],
    rateHistory: [{ date: "2025-09", type: "Influencer", rate: 800 }, { date: "2026-01", type: "Influencer", rate: 1200 }, { date: "2026-04", type: "Influencer", rate: 1500 }],
    followerGrowth: [{ date: "2025-09", platform: "TikTok", count: 68000 }, { date: "2026-04", platform: "TikTok", count: 96000 }],
    notes: [{ id: "n4", body: "Jordan's engagement dipped — too many sponsored posts in March. Recommend pulling back to 2/month max.", pinned: true, tag: "performance", date: "2026-04-02" }],
  },
  {
    id: "usr_tara_001", name: "Tara Washington", handle: "@tarastyle", tier: "UGC Creator", avatar: "TW",
    platforms: [{ name: "TikTok", followers: 31000, engagement: 6.1 }, { name: "Instagram", followers: 18000, engagement: 4.2 }],
    healthScore: 62, commissionRate: 15, joinedDate: "2026-02-01", totalEarned: 4800, avgDealValue: 1200, dealsCompleted: 4, dealsActive: 0, brandsWorkedWith: 3, repeatBrandRate: 0,
    monthlyEarnings: [{ month: "Feb", amount: 1200 }, { month: "Mar", amount: 2400 }, { month: "Apr", amount: 0 }],
    rateCard: [{ type: "UGC Video", rate: "$200–$600" }, { type: "TikTok", rate: "$300–$800" }],
    dealHistory: [], brandRelationships: [], contentPerformance: [],
    rateHistory: [{ date: "2026-02", type: "UGC", rate: 200 }],
    followerGrowth: [{ date: "2026-02", platform: "TikTok", count: 24000 }, { date: "2026-04", platform: "TikTok", count: 31000 }],
    notes: [{ id: "n5", body: "Tara has been inactive for 3 weeks. Follow up about availability.", pinned: true, tag: "personal", date: "2026-04-08" }],
  },
  {
    id: "usr_camille_001", name: "Camille Reyes", handle: "@camilleeats", tier: "Influencer", avatar: "CR",
    platforms: [{ name: "TikTok", followers: 118000, engagement: 5.5 }, { name: "Instagram", followers: 67000, engagement: 3.6 }, { name: "YouTube", followers: 34000, engagement: 4.8 }],
    healthScore: 92, commissionRate: 12, joinedDate: "2025-08-01", totalEarned: 58400, avgDealValue: 3400, dealsCompleted: 17, dealsActive: 3, brandsWorkedWith: 12, repeatBrandRate: 42,
    monthlyEarnings: [{ month: "Nov", amount: 8200 }, { month: "Dec", amount: 9400 }, { month: "Jan", amount: 7800 }, { month: "Feb", amount: 10200 }, { month: "Mar", amount: 8600 }, { month: "Apr", amount: 11400 }],
    rateCard: [{ type: "UGC Video", rate: "$600–$1,800" }, { type: "IG Reel", rate: "$1,200–$3,000" }, { type: "YT Integration", rate: "$2,500–$5,000" }],
    dealHistory: [
      { brand: "Whole Foods", type: "Influencer", value: 4200, date: "2026-04-15", stage: "in_progress", commission: 504, outcome: "active" },
      { brand: "Blue Apron", type: "UGC", value: 2800, date: "2026-04-01", stage: "delivered", commission: 336, outcome: "completed" },
    ],
    brandRelationships: [{ brand: "Whole Foods", deals: 4, totalValue: 14800, avgDeal: 3700, lastDeal: "2026-04-01", exclusivity: false, repeat: true }],
    contentPerformance: [{ deal: "Blue Apron Spring", views: 340000, saves: 18000, shares: 5400, engagement: 6.9, date: "2026-04-05" }],
    rateHistory: [{ date: "2025-08", type: "UGC", rate: 400 }, { date: "2026-01", type: "Influencer", rate: 1500 }, { date: "2026-04", type: "Influencer", rate: 2000 }],
    followerGrowth: [{ date: "2025-08", platform: "TikTok", count: 78000 }, { date: "2026-04", platform: "TikTok", count: 118000 }],
    notes: [{ id: "n6", body: "Top performer. Camille is ready for $5K+ brand deals. Push for Whole Foods ambassador.", pinned: true, tag: "brand-feedback", date: "2026-04-10" }],
  },
  {
    id: "usr_jade_001", name: "Jade Park", handle: "@jadeglow", tier: "UGC Creator", avatar: "JP",
    platforms: [{ name: "TikTok", followers: 45000, engagement: 5.8 }, { name: "Instagram", followers: 22000, engagement: 4.0 }],
    healthScore: 88, commissionRate: 15, joinedDate: "2026-01-01", totalEarned: 14200, avgDealValue: 1800, dealsCompleted: 7, dealsActive: 2, brandsWorkedWith: 5, repeatBrandRate: 20,
    monthlyEarnings: [{ month: "Jan", amount: 1800 }, { month: "Feb", amount: 3200 }, { month: "Mar", amount: 4400 }, { month: "Apr", amount: 3600 }],
    rateCard: [{ type: "UGC Video", rate: "$300–$900" }, { type: "IG Reel", rate: "$500–$1,200" }],
    dealHistory: [{ brand: "Glow Recipe", type: "UGC", value: 1800, date: "2026-04-18", stage: "contracted", commission: 270, outcome: "active" }],
    brandRelationships: [{ brand: "Glow Recipe", deals: 2, totalValue: 3200, avgDeal: 1600, lastDeal: "2026-03-15", exclusivity: false, repeat: true }],
    contentPerformance: [{ deal: "Glow Recipe Dew Drops", views: 198000, saves: 11200, shares: 2800, engagement: 7.1, date: "2026-03-20" }],
    rateHistory: [{ date: "2026-01", type: "UGC", rate: 250 }, { date: "2026-04", type: "UGC", rate: 400 }],
    followerGrowth: [{ date: "2026-01", platform: "TikTok", count: 32000 }, { date: "2026-04", platform: "TikTok", count: 45000 }],
    notes: [{ id: "n7", body: "Jade's skincare content is exceptional. Glow Recipe wants to extend to a 3-month ambassador deal.", pinned: false, tag: "brand-feedback", date: "2026-04-12" }],
  },
];

// Agency pipeline (all deals across roster)
export const agencyPipeline = [
  { id: "ap_01", creator: "Brianna Cole", creatorId: "usr_brianna_001", brand: "Mejuri", type: "Influencer" as DealType, stage: "in_progress" as DealStage, value: 3200, due: "2026-04-20", commission: 480, priority: false, deliverables: ["3 IG Reels", "2 Stories"], notes: "Gold Drop Collection" },
  { id: "ap_02", creator: "Brianna Cole", creatorId: "usr_brianna_001", brand: "Aritzia", type: "ugc" as DealType, stage: "negotiating" as DealStage, value: 4500, due: null, commission: 675, priority: true, deliverables: ["5 UGC videos"], notes: "90-day whitelisting" },
  { id: "ap_03", creator: "Maya Chen", creatorId: "usr_maya_001", brand: "Glossier", type: "ugc" as DealType, stage: "contracted" as DealStage, value: 2800, due: "2026-04-28", commission: 420, priority: false, deliverables: ["2 TikTok", "1 Reel"], notes: "Clean girl campaign" },
  { id: "ap_04", creator: "Jordan Ellis", creatorId: "usr_jordan_001", brand: "Oatly", type: "ugc" as DealType, stage: "in_progress" as DealStage, value: 1500, due: "2026-05-01", commission: 180, priority: false, deliverables: ["2 TikTok videos"], notes: "Morning routine" },
  { id: "ap_05", creator: "Jordan Ellis", creatorId: "usr_jordan_001", brand: "Notion", type: "influencer" as DealType, stage: "delivered" as DealStage, value: 2200, due: "2026-04-12", commission: 264, priority: false, deliverables: ["1 YT video"], notes: "Day in the life" },
  { id: "ap_06", creator: "Camille Reyes", creatorId: "usr_camille_001", brand: "Whole Foods", type: "influencer" as DealType, stage: "in_progress" as DealStage, value: 4200, due: "2026-04-15", commission: 504, priority: true, deliverables: ["3 IG Reels", "1 YT video", "4 Stories"], notes: "Spring produce campaign" },
  { id: "ap_07", creator: "Camille Reyes", creatorId: "usr_camille_001", brand: "Blue Apron", type: "ugc" as DealType, stage: "delivered" as DealStage, value: 2800, due: "2026-04-01", commission: 336, priority: false, deliverables: ["3 UGC videos"], notes: "Meal prep series" },
  { id: "ap_08", creator: "Jade Park", creatorId: "usr_jade_001", brand: "Glow Recipe", type: "ugc" as DealType, stage: "contracted" as DealStage, value: 1800, due: "2026-04-18", commission: 270, priority: false, deliverables: ["2 TikTok", "1 Reel"], notes: "Dew Drops launch" },
  { id: "ap_09", creator: "Brianna Cole", creatorId: "usr_brianna_001", brand: "Canva", type: "ugc" as DealType, stage: "pitched" as DealStage, value: 1800, due: null, commission: 270, priority: false, deliverables: ["3 TikTok videos"], notes: "Exploratory" },
  { id: "ap_10", creator: "Jade Park", creatorId: "usr_jade_001", brand: "Summer Fridays", type: "ugc" as DealType, stage: "pitched" as DealStage, value: 1200, due: null, commission: 180, priority: false, deliverables: ["2 TikTok"], notes: "SPF campaign" },
];

// Campaigns
export interface Campaign {
  id: string;
  name: string;
  brand: string;
  brandContact: string;
  brief: string;
  budget: number;
  agencyCommission: number;
  startDate: string;
  endDate: string;
  status: "planning" | "active" | "completed" | "paused";
  creators: { creatorId: string; name: string; allocation: number; deliverables: string[]; status: string }[];
  completionPct: number;
}

export const campaigns: Campaign[] = [
  {
    id: "camp_01", name: "Glossier Clean Girl Summer", brand: "Glossier", brandContact: "sarah@glossier.com",
    brief: "Summer clean girl aesthetic campaign across TikTok and Instagram. Focus on minimal skincare routines and the new Cloud Paint shades.",
    budget: 12000, agencyCommission: 1800, startDate: "2026-04-01", endDate: "2026-05-15", status: "active", completionPct: 45,
    creators: [
      { creatorId: "usr_brianna_001", name: "Brianna Cole", allocation: 4000, deliverables: ["2 IG Reels", "1 TikTok", "3 Stories"], status: "in_progress" },
      { creatorId: "usr_maya_001", name: "Maya Chen", allocation: 3500, deliverables: ["3 TikTok", "1 IG Reel"], status: "contracted" },
      { creatorId: "usr_jade_001", name: "Jade Park", allocation: 2500, deliverables: ["2 TikTok", "2 IG Reels"], status: "not_started" },
    ],
  },
  {
    id: "camp_02", name: "Whole Foods Spring Produce", brand: "Whole Foods", brandContact: "campaigns@wholefoods.com",
    brief: "Highlight seasonal spring produce through recipe content and grocery hauls. Authentic, unscripted feel.",
    budget: 8500, agencyCommission: 1020, startDate: "2026-04-05", endDate: "2026-04-30", status: "active", completionPct: 70,
    creators: [
      { creatorId: "usr_camille_001", name: "Camille Reyes", allocation: 4200, deliverables: ["3 IG Reels", "1 YT video", "4 Stories"], status: "in_progress" },
      { creatorId: "usr_jordan_001", name: "Jordan Ellis", allocation: 2500, deliverables: ["2 TikTok", "1 IG Reel"], status: "delivered" },
    ],
  },
  {
    id: "camp_03", name: "Glow Recipe Dew Drops Launch", brand: "Glow Recipe", brandContact: "partnerships@glowrecipe.com",
    brief: "Launch campaign for the new Watermelon Glow Dew Drops. Before/after content, routine integrations.",
    budget: 6000, agencyCommission: 900, startDate: "2026-04-10", endDate: "2026-05-10", status: "planning", completionPct: 10,
    creators: [
      { creatorId: "usr_jade_001", name: "Jade Park", allocation: 2500, deliverables: ["3 TikTok", "1 IG Reel"], status: "not_started" },
      { creatorId: "usr_brianna_001", name: "Brianna Cole", allocation: 3500, deliverables: ["2 IG Reels", "1 YT Short"], status: "not_started" },
    ],
  },
];

// Contracts
export interface AgencyContract {
  id: string;
  creator: string;
  creatorId: string;
  brand: string;
  type: string;
  value: number;
  signedDate: string | null;
  expiryDate: string;
  exclusivityCategory: string | null;
  exclusivityDays: number | null;
  status: "active" | "expired" | "pending_signature" | "disputed";
  aiAnalysis: { paymentTerms: string; deliverables: string; killFee: string; revisionLimit: string; usageRights: string; redFlags: string[] } | null;
  fileName: string;
}

export const agencyContracts: AgencyContract[] = [
  { id: "con_01", creator: "Brianna Cole", creatorId: "usr_brianna_001", brand: "Aritzia", type: "UGC Partnership", value: 4500, signedDate: null, expiryDate: "2026-07-10", exclusivityCategory: "Fashion", exclusivityDays: 90, status: "pending_signature", aiAnalysis: { paymentTerms: "Net 30 after delivery", deliverables: "5 UGC videos for paid ads", killFee: "50% of total", revisionLimit: "2 rounds", usageRights: "90-day whitelisting + paid ads", redFlags: ["90-day exclusivity is broad — covers all fashion, not just Aritzia competitors", "Kill fee only 50% — industry standard is 75%"] }, fileName: "aritzia-ugc-partnership-2026.pdf" },
  { id: "con_02", creator: "Brianna Cole", creatorId: "usr_brianna_001", brand: "Mejuri", type: "Influencer", value: 3200, signedDate: "2026-03-05", expiryDate: "2026-05-20", exclusivityCategory: "Jewelry", exclusivityDays: 14, status: "active", aiAnalysis: { paymentTerms: "50% upfront, 50% on delivery", deliverables: "3 IG Reels + 2 Stories", killFee: "75% of total", revisionLimit: "1 round", usageRights: "Organic only — no paid ads", redFlags: [] }, fileName: "mejuri-influencer-2026.pdf" },
  { id: "con_03", creator: "Maya Chen", creatorId: "usr_maya_001", brand: "Glossier", type: "UGC", value: 2800, signedDate: "2026-03-20", expiryDate: "2026-05-28", exclusivityCategory: null, exclusivityDays: null, status: "active", aiAnalysis: { paymentTerms: "Net 14 after delivery", deliverables: "2 TikTok + 1 Reel", killFee: "100% of total", revisionLimit: "2 rounds", usageRights: "Organic + paid ads 30 days", redFlags: [] }, fileName: "glossier-maya-ugc.pdf" },
  { id: "con_04", creator: "Jordan Ellis", creatorId: "usr_jordan_001", brand: "Oatly", type: "UGC", value: 1500, signedDate: "2026-04-08", expiryDate: "2026-06-01", exclusivityCategory: null, exclusivityDays: null, status: "active", aiAnalysis: { paymentTerms: "Net 30", deliverables: "2 TikTok videos", killFee: "50%", revisionLimit: "2 rounds", usageRights: "Organic only", redFlags: ["Payment terms slow — Net 30 for a $1,500 deal"] }, fileName: "oatly-jordan-ugc.pdf" },
  { id: "con_05", creator: "Camille Reyes", creatorId: "usr_camille_001", brand: "Whole Foods", type: "Influencer", value: 4200, signedDate: "2026-04-02", expiryDate: "2026-05-30", exclusivityCategory: "Grocery", exclusivityDays: 30, status: "active", aiAnalysis: { paymentTerms: "Net 15", deliverables: "3 IG Reels + 1 YT + 4 Stories", killFee: "75%", revisionLimit: "2 rounds", usageRights: "Organic + paid 60 days", redFlags: [] }, fileName: "wholefoods-camille.pdf" },
  { id: "con_06", creator: "Brianna Cole", creatorId: "usr_brianna_001", brand: "Glossier", type: "Influencer", value: 2800, signedDate: "2026-01-10", expiryDate: "2026-04-10", exclusivityCategory: "Beauty", exclusivityDays: 30, status: "expired", aiAnalysis: null, fileName: "glossier-brianna-spring.pdf" },
];

// Commission payouts
export interface CommissionPayout {
  id: string;
  creator: string;
  creatorId: string;
  deal: string;
  dealValue: number;
  rate: number;
  amount: number;
  period: string;
  paidAt: string | null;
  status: "paid" | "pending" | "processing";
}

export const commissionPayouts: CommissionPayout[] = [
  { id: "cp_01", creator: "Brianna Cole", creatorId: "usr_brianna_001", deal: "Glossier Spring", dealValue: 2800, rate: 15, amount: 420, period: "2026-03", paidAt: "2026-03-20", status: "paid" },
  { id: "cp_02", creator: "Jordan Ellis", creatorId: "usr_jordan_001", deal: "Notion Creator", dealValue: 2200, rate: 12, amount: 264, period: "2026-04", paidAt: null, status: "pending" },
  { id: "cp_03", creator: "Camille Reyes", creatorId: "usr_camille_001", deal: "Blue Apron Spring", dealValue: 2800, rate: 12, amount: 336, period: "2026-04", paidAt: "2026-04-10", status: "paid" },
  { id: "cp_04", creator: "Brianna Cole", creatorId: "usr_brianna_001", deal: "Mejuri Gold Drop", dealValue: 3200, rate: 15, amount: 480, period: "2026-04", paidAt: null, status: "pending" },
  { id: "cp_05", creator: "Maya Chen", creatorId: "usr_maya_001", deal: "Glossier Clean Girl", dealValue: 2800, rate: 15, amount: 420, period: "2026-04", paidAt: null, status: "processing" },
  { id: "cp_06", creator: "Camille Reyes", creatorId: "usr_camille_001", deal: "Whole Foods Spring", dealValue: 4200, rate: 12, amount: 504, period: "2026-04", paidAt: null, status: "pending" },
];

// Messages
export interface AgencyMessage {
  id: string;
  thread: string;
  threadType: "creator" | "brand" | "internal";
  threadName: string;
  sender: string;
  senderType: "agency" | "creator" | "brand";
  body: string;
  attachmentName: string | null;
  linkedDeal: string | null;
  read: boolean;
  createdAt: string;
}

export const agencyMessages: AgencyMessage[] = [
  { id: "msg_01", thread: "t_brianna", threadType: "creator", threadName: "Brianna Cole", sender: "Brianna Cole", senderType: "creator", body: "Hey! Just finished the first Mejuri reel. Uploading to Google Drive now — should be there in 10 min.", attachmentName: null, linkedDeal: "Mejuri", read: false, createdAt: "2026-04-12T14:20:00Z" },
  { id: "msg_02", thread: "t_brianna", threadType: "creator", threadName: "Brianna Cole", sender: "Bright Talent", senderType: "agency", body: "Amazing, thanks Bri! I'll forward to Mejuri for approval. Quick note — they want the product shot at 0:08 to be a bit longer.", attachmentName: null, linkedDeal: "Mejuri", read: true, createdAt: "2026-04-12T14:35:00Z" },
  { id: "msg_03", thread: "t_jade", threadType: "creator", threadName: "Jade Park", sender: "Jade Park", senderType: "creator", body: "Got the Glow Recipe brief. Quick question — do they want the before/after at the beginning or end of the video?", attachmentName: null, linkedDeal: "Glow Recipe", read: false, createdAt: "2026-04-12T11:00:00Z" },
  { id: "msg_04", thread: "t_glossier", threadType: "brand", threadName: "Glossier", sender: "Sarah Kim", senderType: "brand", body: "Hi team! Wanted to confirm we're good for the May 15 wrap date. Also, can we get Maya's first TikTok draft by April 22?", attachmentName: "glossier-timeline-update.pdf", linkedDeal: "Glossier Clean Girl Summer", read: false, createdAt: "2026-04-11T16:00:00Z" },
  { id: "msg_05", thread: "t_wholefoods", threadType: "brand", threadName: "Whole Foods", sender: "Bright Talent", senderType: "agency", body: "Camille's first 3 Reels are live. Here are the performance numbers after 48 hours — 340K views combined, 6.9% engagement.", attachmentName: "wholefoods-48hr-report.pdf", linkedDeal: "Whole Foods Spring Produce", read: true, createdAt: "2026-04-10T09:00:00Z" },
  { id: "msg_06", thread: "t_internal", threadType: "internal", threadName: "Team Notes", sender: "Bright Talent", senderType: "agency", body: "Heads up — Aritzia contract has a 90-day fashion exclusivity clause. This conflicts with the potential Zara deal for Jordan. Need to discuss before we sign.", attachmentName: null, linkedDeal: "Aritzia", read: true, createdAt: "2026-04-09T10:00:00Z" },
  { id: "msg_07", thread: "t_internal", threadType: "internal", threadName: "Team Notes", sender: "Bright Talent", senderType: "agency", body: "Q2 commission projections look strong — on track for $4.2K if all active deals close. Camille is our top earner this quarter.", attachmentName: null, linkedDeal: null, read: true, createdAt: "2026-04-08T14:00:00Z" },
];

// Conflicts
export interface ConflictEntry {
  id: string;
  creators: string[];
  brand1: string;
  brand2: string;
  category: string;
  type: string;
  severity: "high" | "medium" | "low";
  status: "active" | "resolved" | "monitoring";
  resolution: string | null;
  detectedAt: string;
  resolvedAt: string | null;
}

export const conflicts: ConflictEntry[] = [
  { id: "cf_01", creators: ["Brianna Cole"], brand1: "Aritzia", brand2: "Mejuri", category: "Fashion / Jewelry", type: "Exclusivity overlap", severity: "high", status: "active", resolution: null, detectedAt: "2026-04-10T09:00:00Z", resolvedAt: null },
  { id: "cf_02", creators: ["Jordan Ellis"], brand1: "Oatly", brand2: "Liquid Death", category: "Beverage", type: "Category conflict", severity: "medium", status: "monitoring", resolution: "Oatly confirmed no beverage exclusivity — cleared to pitch Liquid Death", detectedAt: "2026-04-05T11:00:00Z", resolvedAt: null },
  { id: "cf_03", creators: ["Camille Reyes"], brand1: "Whole Foods", brand2: "Trader Joe's", category: "Grocery", type: "Exclusivity overlap", severity: "low", status: "resolved", resolution: "Whole Foods 30-day exclusivity expired Apr 2. Trader Joe's deal starts May 1.", detectedAt: "2026-03-28T10:00:00Z", resolvedAt: "2026-04-03T09:00:00Z" },
];

// Exclusivity map for calendar
export const exclusivityMap = [
  { creator: "Brianna Cole", category: "Fashion", brand: "Aritzia", start: "2026-04-10", end: "2026-07-10" },
  { creator: "Brianna Cole", category: "Jewelry", brand: "Mejuri", start: "2026-03-05", end: "2026-05-20" },
  { creator: "Brianna Cole", category: "Beauty", brand: "Glossier", start: "2026-01-10", end: "2026-04-10" },
  { creator: "Camille Reyes", category: "Grocery", brand: "Whole Foods", start: "2026-04-02", end: "2026-05-02" },
];
