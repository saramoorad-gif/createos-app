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
  created_at: string;
  updated_at: string;
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
