/**
 * Server-side prompt library for the AI-powered AI panels.
 * Brand context is injected into every request so the model stays grounded
 * in the Safar-e-Zaiqa business reality established in Assignment 1.
 */

export const BRAND_CONTEXT = `
BUSINESS: Safar-e-Zaiqa — a desi food truck startup.
TAGLINE: "Daig Se Dil Tak" (From the cooking pot to the heart).
PRODUCT: Authentic biryani & pulao. Menu: Zaiqa-e-Khas Biryani (chicken PKR 210 / beef PKR 290 / mutton PKR 380), Heritage Yakhni Pulao (chicken PKR 210 / beef PKR 290), Student Special combo PKR 180, Solo Traveler combo PKR 300, Caravan Deal PKR 550, plus sides, desserts and drinks.
MARKET: University areas in Lahore, Pakistan (e.g. University of Central Punjab) and nearby student hotspots.
PRIMARY CUSTOMER: Budget-conscious students aged 18-25 (≈70% of demand); secondary: working professionals (25-40) and occasional family/bulk buyers.
PRICE POINT: Student-friendly, PKR 180-380 per plate; blended average order value ≈ PKR 280. Very few will pay above PKR 500 regularly. Currency is PKR (Pakistani Rupees).
SCALE: Single food truck, ~75 plates/day at steady state, ~PKR 518,000 monthly revenue at steady state.
POSITIONING: Affordable, hygienic and eco-friendly desi food.
KEY DIFFERENTIATORS: Visible cleanliness (gloves, caps, uniforms, covered serving), large filling portions, biodegradable/eco packaging, strong traditional desi taste.
DIRECT COMPETITORS: Biryani Master, Master Biryani (both seen as too expensive, inconsistent hygiene, small portions).
DEMAND PEAKS: Lunch 12-3 PM and evening 5-8 PM.
`.trim();

const STYLE_RULES = `
Respond in clean, concise markdown suitable for a professional business report.
Use ## and ### headings, **bold** for key terms, and "- " bullet lists.
Be specific and quantitative where possible (use PKR for money).
Do NOT include a preamble like "Sure" or "Here is" — start directly with content.
Keep the whole response focused and under ~450 words.
`.trim();

type PartConfig = {
  system: string;
  prompt: string;
};

export const PART_PROMPTS: Record<string, PartConfig> = {
  "customer-intelligence": {
    system: `You are a senior AI customer-intelligence analyst building marketing personas for a food brand. ${STYLE_RULES}`,
    prompt: `Using the business context below, generate ONE additional, fresh, detailed customer persona for Safar-e-Zaiqa that we may have missed. Include: a memorable name + archetype, demographics, a short narrative, top 3 pain points, top 3 purchase triggers, preferred communication channels, and buying behaviour. End with one sharp marketing recommendation to win this persona.\n\nCONTEXT:\n${BRAND_CONTEXT}`,
  },
  "sales-forecasting": {
    system: `You are an AI revenue-forecasting analyst for an early-stage food truck. ${STYLE_RULES}`,
    prompt: `Using the business context below, produce a concise forecasting narrative. Cover: (1) the key assumptions a daily/weekly/monthly forecast should rest on, (2) one realistic upside scenario and one downside scenario with rough PKR revenue impact, and (3) the 3 leading indicators we should track weekly to know if the forecast is holding. Keep numbers consistent with PKR 200-400 per plate and a student-heavy customer base.\n\nCONTEXT:\n${BRAND_CONTEXT}`,
  },
  "competitive-intelligence": {
    system: `You are an AI competitive-intelligence strategist. ${STYLE_RULES}`,
    prompt: `Using the business context below, deliver a sharp competitive read for Safar-e-Zaiqa. Cover: (1) the single biggest competitive threat and why, (2) an underexploited gap in the market the brand should own, (3) a recommended pricing/positioning move versus Biryani Master and Master Biryani, and (4) one defensible USP to lean into. Be decisive.\n\nCONTEXT:\n${BRAND_CONTEXT}`,
  },
  "marketing-automation": {
    system: `You are an AI marketing-automation architect designing journeys, chatbots and loyalty mechanics. ${STYLE_RULES}`,
    prompt: `Using the business context below, design ideas for Safar-e-Zaiqa's AI marketing automation. Cover: (1) a WhatsApp chatbot conversation flow (greeting → menu → customise → order → pickup/location → payment → feedback) as a short step list, (2) two automated re-engagement triggers (e.g. cart abandonment, win-back), and (3) a loyalty program concept with tiers and a clear reward ladder in PKR. Map each idea to an AARRR stage (Awareness, Acquisition, Activation/Purchase, Retention, Referral/Advocacy).\n\nCONTEXT:\n${BRAND_CONTEXT}`,
  },
  "executive-challenge": {
    system: `You are an AI strategy advisor running an executive war-room for the founder of a food truck. Be clear, decisive and practical. ${STYLE_RULES}`,
    prompt: `A situation has occurred at Safar-e-Zaiqa, described by the founder in the analyst focus below. Using the business context, respond as a board-level decision memo with these sections:\n## Situation Read — restate the problem and its likely scale\n## Root Causes — the most probable internal & external drivers\n## 30/60/90-Day Action Plan — prioritised, specific steps for each window\n## Expected Outcomes & Metrics — what success looks like and how we'll measure it\nIf the situation is vague, state the assumptions you are making.\n\nCONTEXT:\n${BRAND_CONTEXT}`,
  },
  "competitor-swot": {
    system: `You are an AI competitive-intelligence analyst. Produce tight, decision-ready SWOT analyses. ${STYLE_RULES}`,
    prompt: `Produce a focused SWOT analysis of the competitor described in the analyst focus below, specifically relative to Safar-e-Zaiqa. Output EXACTLY these four sections, each with 3 short bullet points:\n## Strengths\n## Weaknesses\n## Opportunities\n## Threats\nKeep each bullet under 14 words and concrete.\n\nCONTEXT:\n${BRAND_CONTEXT}`,
  },
  "competitor-insights": {
    system: `You are an AI competitive strategist advising Safar-e-Zaiqa. ${STYLE_RULES}`,
    prompt: `For the competitor described in the analyst focus below, give Safar-e-Zaiqa a sharp playbook:\n## How They Win — what makes this competitor strong\n## Our Counter-Move — 3 specific actions to win share from them\n## Watch-Outs — what they might do to us and how to pre-empt it\nBe decisive and specific to a student-focused biryani/pulao food truck.\n\nCONTEXT:\n${BRAND_CONTEXT}`,
  },
  assumptions: {
    system: `You are an AI analyst pressure-testing the assumptions behind a business plan. ${STYLE_RULES}`,
    prompt: `Using the business context below, list the riskiest assumptions behind Safar-e-Zaiqa's plan (customer, pricing, demand, cost, competitive). For each, rate the risk (High/Medium/Low), state how it could break the forecast, and give one cheap way to validate it before scaling. Be brutally honest.\n\nCONTEXT:\n${BRAND_CONTEXT}`,
  },
};
