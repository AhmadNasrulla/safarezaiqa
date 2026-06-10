/**
 * Static, pre-authored analysis for Safar-e-Zaiqa's AI Marketing Intelligence
 * report (Assignment 2). This is the "submission-ready" content that renders
 * instantly; the AI panels layer live AI generation on top of it.
 *
 * Figures are internally consistent (PKR, student-led demand, PKR 200-400 AOV).
 */

export const BRAND = {
  name: "Safar-e-Zaiqa",
  tagline: "Daig Se Dil Tak",
  category: "Desi Biryani & Pulao Food Truck",
  location: "University belt, Lahore, Pakistan",
  author: "Ahmad Nasrullah · L1F22BSAI0025, Ahsan Tanveer - L1F22BSAI0038, Ameer Hamza - L1F22BSAI0041, Samrooz Ahmad - L1F22BSAI0044, Muhammad Anas - L1F22BSAI0051",
  course: "Fundamentals of Marketing — Assignment 4",
};

/* ------------------------------------------------------------------ */
/* PART 1 — AI CUSTOMER INTELLIGENCE                                    */
/* ------------------------------------------------------------------ */

export type Persona = {
  id: string;
  name: string;
  archetype: string;
  emoji: string;
  age: string;
  occupation: string;
  income: string;
  budget: string;
  quote: string;
  bio: string;
  painPoints: string[];
  triggers: string[];
  channels: string[];
  behavior: string[];
  share: number; // % of customer base
};

export const PERSONAS: Persona[] = [
  {
    id: "bilal",
    name: "Budget Bilal",
    archetype: "The Value-Seeking Student",
    emoji: "🎓",
    age: "20",
    occupation: "BS undergraduate (3rd semester)",
    income: "Pocket money: PKR 8,000–12,000 / month",
    budget: "PKR 180–300 per meal",
    quote: "I want a full plate that actually fills me up — without finishing my whole week's budget.",
    bio: "Lives in a hostel near campus, eats out 4–5 times a week, and almost always with friends. Hyper price-aware and influenced by what classmates recommend. A PKR 50 difference changes where the group eats.",
    painPoints: [
      "Biryani at nearby spots costs PKR 450+ — too expensive to eat daily",
      "Portions feel small for the price; still hungry after",
      "Inconsistent hygiene makes him anxious about getting sick before exams",
    ],
    triggers: [
      "Hunger between back-to-back classes (12–3 PM peak)",
      "Combo/student deals and 'buy 4 get 1' group offers",
      "A friend's recommendation or a viral campus Instagram reel",
    ],
    channels: ["Instagram (reels & stories)", "WhatsApp group blasts", "Campus flyers & word of mouth"],
    behavior: [
      "Impulsive, high-frequency, group-driven purchases",
      "Extremely deal-sensitive; switches brands for value",
      "Pays cash or JazzCash/Easypaisa",
    ],
    share: 58,
  },
  {
    id: "hira",
    name: "Hygiene-First Hira",
    archetype: "The Trust-Driven Professional",
    emoji: "💼",
    age: "27",
    occupation: "MPhil student / junior lecturer",
    income: "PKR 60,000–80,000 / month",
    budget: "PKR 350–500 per meal",
    quote: "I'll happily pay a little more — but I need to see gloves, clean surfaces and covered food.",
    bio: "Time-poor and standards-driven. Researches a vendor before the first order, reads Google/Instagram reviews, and becomes fiercely loyal once trust is earned. Convenience at lunch hour is non-negotiable.",
    painPoints: [
      "Open, exposed food and staff without gloves feel unsafe",
      "Long, unpredictable wait times during the lunch rush",
      "Hard to judge a new vendor's quality before buying",
    ],
    triggers: [
      "Visible cleanliness: gloves, caps, uniforms, covered serving",
      "Strong star ratings and recent positive reviews",
      "Pre-order / skip-the-queue convenience at 1 PM",
    ],
    channels: ["Google Maps reviews", "Instagram", "Facebook"],
    behavior: [
      "Researches before first purchase; deliberate, not impulsive",
      "High lifetime value once loyal; refers colleagues",
      "Prefers digital payment and pre-ordering",
    ],
    share: 27,
  },
  {
    id: "farhan",
    name: "Family-Order Farhan",
    archetype: "The Occasional Bulk Buyer",
    emoji: "👨‍👩‍👧",
    age: "35",
    occupation: "Salaried professional, father of two",
    income: "PKR 120,000+ / month (household)",
    budget: "PKR 1,500–4,000 per order (bulk)",
    quote: "For a weekend family meal or an office lunch order, I need consistent taste and easy bulk ordering.",
    bio: "Buys infrequently but in volume — weekend family dinners, office gatherings, small events. Plans ahead, values consistency and presentation, and increasingly cares about eco-friendly packaging.",
    painPoints: [
      "Taste is inconsistent batch-to-batch for large orders",
      "Plastic packaging feels wasteful and unfit for guests",
      "No easy way to place and schedule a bulk order",
    ],
    triggers: [
      "Weekend gatherings and family events",
      "Bulk/combo deals with a clear price-per-head",
      "Biodegradable, presentable eco-packaging",
    ],
    channels: ["Facebook", "WhatsApp Business catalogue", "Word of mouth / family network"],
    behavior: [
      "Planned, scheduled, high-ticket purchases",
      "Price-per-head sensitive rather than per-plate",
      "Loyal to brands that deliver reliable consistency",
    ],
    share: 15,
  },
];

export type ComparisonRow = {
  dimension: string;
  assignment1: string;
  aiInsight: string;
  verdict: "Confirms" | "Deepens" | "New";
};

export const A1_COMPARISON: ComparisonRow[] = [
  {
    dimension: "Core segments",
    assignment1: "Budget Student, Working Individual, Family Buyer",
    aiInsight: "Same three segments emerge as Bilal, Hira and Farhan — validating the field research",
    verdict: "Confirms",
  },
  {
    dimension: "Primary pain point",
    assignment1: "High prices & small portions",
    aiInsight: "Confirmed, but AI elevates hygiene to a trust gate that unlocks higher willingness-to-pay",
    verdict: "Deepens",
  },
  {
    dimension: "Communication channels",
    assignment1: "Not detailed in A1",
    aiInsight: "AI maps specific channels per persona (Instagram reels, Google reviews, WhatsApp Business)",
    verdict: "New",
  },
  {
    dimension: "Purchase triggers",
    assignment1: "Affordability & taste",
    aiInsight: "AI adds emotional & social triggers: peer recommendation, viral reels, group deals",
    verdict: "Deepens",
  },
  {
    dimension: "Buying behaviour",
    assignment1: "Frequent, price-sensitive eating",
    aiInsight: "AI separates impulse (Bilal) from researched (Hira) from planned-bulk (Farhan) journeys",
    verdict: "New",
  },
];

/* ------------------------------------------------------------------ */
/* PART 2 — PREDICTIVE SALES FORECASTING                               */
/* ------------------------------------------------------------------ */

export const AOV = 280; // PKR, blended average order value (Student Special 180 → combos 300–550)

export type DayForecast = {
  day: string;
  orders: number;
  note: string;
};

// Truck operates 6 days/week (closed Mondays). Orders × AOV (PKR 280).
export const DAILY_FORECAST: DayForecast[] = [
  { day: "Tue", orders: 55, note: "Quiet weekday" },
  { day: "Wed", orders: 60, note: "Steady" },
  { day: "Thu", orders: 68, note: "Pre-weekend lift" },
  { day: "Fri", orders: 92, note: "Jumma + payday peak" },
  { day: "Sat", orders: 98, note: "Weekend high" },
  { day: "Sun", orders: 78, note: "Family orders" },
];

export const WEEKLY_FORECAST = [
  { week: "Week 1", orders: 330, revenue: 92400 },
  { week: "Week 2", orders: 360, revenue: 100800 },
  { week: "Week 3", orders: 390, revenue: 109200 },
  { week: "Week 4", orders: 420, revenue: 117600 },
];

export const MONTHLY_FORECAST = [
  { month: "Month 1", orders: 1500, revenue: 420000, label: "Launch & trial" },
  { month: "Month 2", orders: 1700, revenue: 476000, label: "Word of mouth" },
  { month: "Month 3", orders: 1850, revenue: 518000, label: "Steady state" },
  { month: "Month 4", orders: 2000, revenue: 560000, label: "Loyalty kicks in" },
  { month: "Month 5", orders: 2150, revenue: 602000, label: "Bulk orders grow" },
  { month: "Month 6", orders: 2300, revenue: 644000, label: "Expansion ready" },
];

export const FORECAST_ASSUMPTIONS = [
  "Blended average order value (AOV) of PKR 280 — a student mix of the PKR 180 Student Special, PKR 210 single daigs and PKR 300–550 combos.",
  "Single truck operating 6 days/week (closed Mondays) across the 12–3 PM lunch and 5–8 PM evening peaks.",
  "Realistic steady-state throughput of ~75 plates/day (peak capacity ~120/day).",
  "Gross food-cost ratio of ~50%, leaving ~50% contribution margin before fixed costs.",
  "Conservative organic growth of ~5–6% per month from word of mouth and loyalty.",
  "University calendar is in session; exam breaks and summer vacation reduce demand ~30%.",
];

export const REVENUE_PROJECTION = {
  dailyAvg: 21000,
  weeklyAvg: 126000,
  monthlySteady: 518000,
  sixMonthTotal: 3220000,
  grossMarginPct: 50,
  estMonthlyProfit: 150000,
};

/* ------------------------------------------------------------------ */
/* PART 3 — AI COMPETITIVE INTELLIGENCE                                */
/* ------------------------------------------------------------------ */

export type Competitor = {
  name: string;
  type: "Direct" | "Indirect";
  price: string;
  rating: number;
  engagement: "High" | "Medium" | "Low";
  usp: string;
};

export const COMPETITORS: Competitor[] = [
  { name: "Biryani Master", type: "Direct", price: "PKR 450–600", rating: 3.6, engagement: "Medium", usp: "Established name, large menu" },
  { name: "Master Biryani", type: "Direct", price: "PKR 420–580", rating: 3.4, engagement: "Low", usp: "Familiar brand, central location" },
  { name: "Student Biryani (chain)", type: "Direct", price: "PKR 400–700", rating: 3.9, engagement: "High", usp: "National brand trust & delivery apps" },
  { name: "Hot & Spicy", type: "Direct", price: "PKR 380–650", rating: 3.7, engagement: "Medium", usp: "Variety + sit-down option" },
  { name: "Campus Dhaba / cart", type: "Direct", price: "PKR 180–300", rating: 3.0, engagement: "Low", usp: "Cheapest, closest to gate" },
  { name: "University Cafeteria", type: "Indirect", price: "PKR 150–300", rating: 2.9, engagement: "Low", usp: "On-campus convenience" },
  { name: "Burger/Shawarma stalls", type: "Indirect", price: "PKR 200–400", rating: 3.5, engagement: "Medium", usp: "Fast, trendy, grab-and-go" },
  { name: "Home tiffin services", type: "Indirect", price: "PKR 6,000–9,000/mo", rating: 4.1, engagement: "Low", usp: "Daily home-style subscription" },
];

export type BenchmarkRow = {
  brand: string;
  affordability: number;
  hygiene: number;
  taste: number;
  portion: number;
  digital: number;
};

// Scored 1–5; Safar-e-Zaiqa first as the benchmark anchor.
export const BENCHMARK: BenchmarkRow[] = [
  { brand: "Safar-e-Zaiqa", affordability: 5, hygiene: 5, taste: 4, portion: 5, digital: 4 },
  { brand: "Biryani Master", affordability: 2, hygiene: 3, taste: 4, portion: 3, digital: 3 },
  { brand: "Master Biryani", affordability: 2, hygiene: 2, taste: 4, portion: 3, digital: 2 },
  { brand: "Student Biryani", affordability: 2, hygiene: 4, taste: 4, portion: 3, digital: 5 },
  { brand: "Campus Dhaba", affordability: 5, hygiene: 1, taste: 3, portion: 4, digital: 1 },
];

export const SWOT = {
  strengths: [
    "Lowest student-friendly price point (PKR 180–380) with large portions",
    "Visible-hygiene system (gloves, caps, covered serving) as a trust signal",
    "Eco-friendly biodegradable packaging — a category-first differentiator",
    "Mobile model: follows demand to campus gates and hostels",
  ],
  weaknesses: [
    "New, unproven brand with no awareness or review base yet",
    "Single truck = limited capacity and geographic reach",
    "Tight margins leave little room for heavy discounting",
    "Dependent on the university calendar (exam/vacation dips)",
  ],
  opportunities: [
    "No incumbent owns the 'affordable + hygienic + eco' position",
    "High social-media virality potential among Gen-Z students",
    "Loyalty + pre-order automation to lock in repeat demand",
    "Bulk/family & office-catering revenue stream is underserved",
  ],
  threats: [
    "Price war from cheap campus dhabas and cafeterias",
    "Established chains (Student Biryani) with delivery-app reach",
    "Rising food-input and fuel costs squeezing margins",
    "Easy menu imitation by nearby competitors",
  ],
};

/* ------------------------------------------------------------------ */
/* PART 4 — AI MARKETING AUTOMATION DESIGN                             */
/* ------------------------------------------------------------------ */

export type JourneyStage = {
  stage: string;
  emoji: string;
  goal: string;
  aiActions: string[];
  kpi: string;
};

export const JOURNEY: JourneyStage[] = [
  {
    stage: "Awareness",
    emoji: "👀",
    goal: "Get on the student radar",
    aiActions: [
      "AI-generated Instagram reels & captions tuned to campus trends",
      "Geo-targeted ads around the university belt",
      "AI optimises posting times to lunch/evening peaks",
    ],
    kpi: "Reach, impressions, profile visits",
  },
  {
    stage: "Consideration",
    emoji: "🤔",
    goal: "Build trust & appetite",
    aiActions: [
      "WhatsApp chatbot answers menu, price & hygiene questions instantly",
      "AI surfaces social proof: reviews, hygiene photos, portion shots",
      "Personalised first-order discount via chatbot",
    ],
    kpi: "Chatbot engagement, menu views, saves",
  },
  {
    stage: "Purchase",
    emoji: "🛒",
    goal: "Frictionless first order",
    aiActions: [
      "Chatbot takes & customises the order end-to-end",
      "AI suggests the best-value combo (upsell)",
      "Digital payment + skip-the-queue pickup slot",
    ],
    kpi: "Conversion rate, AOV, first-order count",
  },
  {
    stage: "Retention",
    emoji: "🔁",
    goal: "Turn one order into a habit",
    aiActions: [
      "Zaiqa Points loyalty auto-tracked per order",
      "AI win-back message after 10 days of inactivity",
      "Personalised 'your usual?' re-order nudges",
    ],
    kpi: "Repeat rate, 30-day retention, points redeemed",
  },
  {
    stage: "Advocacy",
    emoji: "📣",
    goal: "Make fans sell for us",
    aiActions: [
      "Refer-a-friend reward auto-issued via chatbot",
      "AI requests a review at the peak-happiness moment",
      "User-generated content contests with AI judging",
    ],
    kpi: "Referrals, review volume, UGC shares",
  },
];

export type ChatNode = {
  speaker: "bot" | "user";
  text: string;
  branch?: string;
};

export const CHATBOT_FLOW: ChatNode[] = [
  { speaker: "bot", text: "👋 Assalam-o-Alaikum! Welcome to Safar-e-Zaiqa — Daig Se Dil Tak. What can I get you today?", branch: "Greeting" },
  { speaker: "user", text: "Show me the menu", branch: "Intent" },
  { speaker: "bot", text: "🍛 Chicken Biryani – PKR 320\n🍚 Beef Pulao – PKR 350\n🎓 Student Combo (Biryani + drink) – PKR 380\nReply with a dish to order 👇", branch: "Menu" },
  { speaker: "user", text: "Student Combo", branch: "Select" },
  { speaker: "bot", text: "Great choice! Spice level? 🌶️ Mild / Medium / Hot", branch: "Customise" },
  { speaker: "user", text: "Medium", branch: "Customise" },
  { speaker: "bot", text: "📍 Pickup at UCP Gate 2 (ready in 12 min) or share live location for delivery?", branch: "Fulfilment" },
  { speaker: "user", text: "Pickup at Gate 2", branch: "Fulfilment" },
  { speaker: "bot", text: "💳 Pay via JazzCash / Easypaisa / Cash. You'll earn ⭐ 4 Zaiqa Points on this order!", branch: "Payment" },
  { speaker: "bot", text: "✅ Order confirmed! Token #A-117. After pickup, rate us 1–5 ⭐ to help fellow students.", branch: "Feedback" },
];

export type LoyaltyTier = {
  tier: string;
  threshold: string;
  perks: string[];
  color: string;
};

export const LOYALTY_TIERS: LoyaltyTier[] = [
  {
    tier: "Bronze · Naya Safari",
    threshold: "0–199 points",
    perks: ["1 point per PKR 100 spent", "Birthday free drink", "Member-only deal alerts"],
    color: "#cd7f32",
  },
  {
    tier: "Silver · Zaiqa Lover",
    threshold: "200–499 points",
    perks: ["Free drink every 50 points", "Skip-the-queue priority", "Early access to new items"],
    color: "#c0c0c0",
  },
  {
    tier: "Gold · Daig Se Dil Tak",
    threshold: "500+ points",
    perks: ["Free plate every 100 points", "Exclusive Gold combos", "Refer-a-friend bonus x2"],
    color: "#d4af37",
  },
];

/* ------------------------------------------------------------------ */
/* PART 5 — EXECUTIVE DECISION CHALLENGE                               */
/* ------------------------------------------------------------------ */

export const CRISIS = {
  baselineMonthly: 518000,
  droppedMonthly: 388500, // -25%
  dropPct: 25,
  lostRevenue: 129500,
};

export type Cause = {
  category: "Internal" | "External" | "Market";
  cause: string;
  likelihood: "High" | "Medium" | "Low";
  evidence: string;
};

export const DIAGNOSED_CAUSES: Cause[] = [
  { category: "External", cause: "University exam break / vacation reduced student footfall", likelihood: "High", evidence: "Drop aligns with academic calendar; weekday orders fell faster than weekend" },
  { category: "Internal", cause: "Hygiene/quality slippage as volume grew", likelihood: "Medium", evidence: "Recent reviews mention longer waits and inconsistent taste" },
  { category: "Market", cause: "Competitor launched aggressive student discounts", likelihood: "Medium", evidence: "Biryani Master ran a 'PKR 299 combo' promo nearby" },
  { category: "Internal", cause: "Loyalty/retention engine not yet activated", likelihood: "High", evidence: "Repeat-order rate below 30%; no win-back automation live" },
  { category: "External", cause: "Rising input costs forced a quiet price increase", likelihood: "Low", evidence: "Margin pressure may have nudged AOV up, denting value perception" },
];

export type RecoveryAction = {
  horizon: "0–30 days" | "30–60 days" | "60–90 days";
  title: string;
  actions: string[];
  expected: string;
};

export const RECOVERY_PLAN: RecoveryAction[] = [
  {
    horizon: "0–30 days",
    title: "Stop the bleed & re-activate demand",
    actions: [
      "Launch a 'Wapsi' win-back blast via WhatsApp to all past customers",
      "Reinstate the value perception: limited-time PKR 299 student combo",
      "Visible hygiene & speed reset; fix the top review complaints",
      "Relocate truck to wherever students still gather during the break",
    ],
    expected: "Halt the decline; recover ~10–12% of lost volume",
  },
  {
    horizon: "30–60 days",
    title: "Rebuild loyalty & retention",
    actions: [
      "Activate Zaiqa Points loyalty + automated re-order nudges",
      "Counter competitor promo with a superior, stickier loyalty offer",
      "Push UGC + review campaign to rebuild social proof",
      "Introduce bulk/family & office catering to diversify revenue",
    ],
    expected: "Repeat rate 30% → 45%; recover to ~92% of baseline",
  },
  {
    horizon: "60–90 days",
    title: "Return to growth & de-risk",
    actions: [
      "Add a second peak location or limited evening menu",
      "Lock input costs with supplier agreements to protect margin",
      "Data-driven menu: cut low-margin items, promote winners",
      "Build a demand calendar to pre-empt the next academic dip",
    ],
    expected: "Surpass pre-drop baseline by ~5–8%; smoother seasonality",
  },
];

export const EXPECTED_OUTCOMES = [
  { metric: "Monthly revenue", from: "PKR 388,500", to: "PKR 560,000+", window: "by day 90" },
  { metric: "Repeat-order rate", from: "<30%", to: "45%+", window: "by day 60" },
  { metric: "Avg. review rating", from: "3.6★", to: "4.4★", window: "by day 90" },
  { metric: "Revenue concentration", from: "100% walk-up", to: "75% walk-up / 25% bulk", window: "by day 90" },
];
