/* ============================================================
   Page 3 — KPI Scorecard · data layer
   ============================================================ */
import { kes as kesFull, num } from "../../../lib/format";
function kesShort(n: number) {
  if (n >= 1_000_000_000) return `KES ${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `KES ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `KES ${(n / 1_000).toFixed(1)}K`;
  return `KES ${n.toLocaleString("en-KE")}`;
}
const kes = kesFull;
export const fmt = (k: KPI) => {
  if (k.unit === "KES") return k.compact ? kesShort(k.value) : kes(k.value);
  if (k.unit === "pct" || k.unit === "bps" || k.unit === "ratio") return `${k.value.toFixed(k.decimals ?? 1)}${k.unit === "bps" ? " bps" : k.unit === "ratio" ? "×" : "%"}`;
  if (k.unit === "days" || k.unit === "minutes") return `${k.value.toFixed(k.decimals ?? 0)} ${k.unit}`;
  return num(k.value);
};

export type RAG = "green" | "amber" | "red" | "blue";
export type Period = "Q3-2026" | "Q2-2026" | "Q1-2026" | "FY2026";

export type KPI = {
  id: string; category: "Growth" | "Revenue" | "Unit economics" | "Risk" | "Operations" | "Product" | "People";
  name: string; owner: string; definition: string;
  value: number; target: number; prev: number; unit: "KES" | "num" | "pct" | "days" | "minutes" | "ratio" | "bps";
  decimals?: number; compact?: boolean; direction: "up" | "down"; // what "good" is
  frequency: "Daily" | "Weekly" | "Monthly" | "Quarterly";
  rag: RAG; trend: number[]; tier: 0 | 1; // 0 = super admin can edit target, 1 = edit requires board
};

const spark = (base: number, n = 14, vol = 0.07) =>
  Array.from({ length: n }, (_, i) => Math.round(base * (1 + Math.sin(i / 2.3) * vol + i * 0.012)));

export const KPI_LIST: KPI[] = [
  { id: "kpi-mau", category: "Growth", name: "Monthly active users", owner: "Head of Growth", definition: "Users with ≥1 financial transaction in rolling 30 days.",
    value: 89_214, target: 90_000, prev: 84_720, unit: "num", frequency: "Weekly", rag: "amber", direction: "up", tier: 1,
    trend: spark(82_000) },
  { id: "kpi-new", category: "Growth", name: "New signups (MTD)", owner: "Head of Growth", definition: "Completed KYC tier 1+ in the month.",
    value: 8_412, target: 9_000, prev: 7_604, unit: "num", frequency: "Daily", rag: "amber", direction: "up", tier: 1,
    trend: spark(7_000) },
  { id: "kpi-vip", category: "Growth", name: "VIP clients", owner: "Chief Commercial", definition: "Customers on VIP tier with concierge.",
    value: 1_284, target: 1_200, prev: 1_102, unit: "num", frequency: "Weekly", rag: "green", direction: "up", tier: 1,
    trend: spark(1_050) },
  { id: "kpi-tpv", category: "Revenue", name: "Total payment volume", owner: "CFO", definition: "Gross money moved across all rails in 30 days.",
    value: 18_600_000_000, target: 18_000_000_000, prev: 15_230_000_000, unit: "KES", compact: true, frequency: "Daily", rag: "green", direction: "up", tier: 0,
    trend: spark(14_800_000_000, 14, 0.08) },
  { id: "kpi-rev", category: "Revenue", name: "Net revenue (30d)", owner: "CFO", definition: "Gross revenue less direct cost of operation.",
    value: 124_000_000, target: 118_000_000, prev: 108_500_000, unit: "KES", compact: true, frequency: "Daily", rag: "green", direction: "up", tier: 0,
    trend: spark(104_000_000) },
  { id: "kpi-mrr", category: "Revenue", name: "Monthly recurring revenue", owner: "VP Product", definition: "Subscription + VIP recurring fee run-rate.",
    value: 42_300_000, target: 41_000_000, prev: 40_800_000, unit: "KES", compact: true, frequency: "Monthly", rag: "green", direction: "up", tier: 0,
    trend: spark(38_000_000) },
  { id: "kpi-take", category: "Unit economics", name: "Average take rate", owner: "CFO", definition: "Net revenue / TPV after reversals.",
    value: 0.67, target: 0.65, prev: 0.71, unit: "pct", decimals: 2, frequency: "Monthly", rag: "green", direction: "down", tier: 0,
    trend: [0.72, 0.7, 0.7, 0.68, 0.69, 0.67, 0.66, 0.68, 0.67, 0.66, 0.67, 0.67] },
  { id: "kpi-cac", category: "Unit economics", name: "Customer acquisition cost", owner: "Head of Growth", definition: "Blended CAC across paid + organic.",
    value: 412, target: 380, prev: 426, unit: "KES", frequency: "Monthly", rag: "amber", direction: "down", tier: 1,
    trend: [440, 430, 428, 420, 430, 422, 418, 415, 420, 418, 412, 412] },
  { id: "kpi-ltv", category: "Unit economics", name: "LTV (12-month)", owner: "Head of Growth", definition: "Projected contribution profit over 12 months.",
    value: 3_840, target: 3_600, prev: 3_410, unit: "KES", frequency: "Monthly", rag: "green", direction: "up", tier: 1,
    trend: [3_100, 3_220, 3_340, 3_410, 3_500, 3_620, 3_700, 3_740, 3_790, 3_820, 3_840] },
  { id: "kpi-lc", category: "Unit economics", name: "LTV:CAC ratio", owner: "Head of Growth", definition: "Unit quality benchmark, target ≥3.0.",
    value: 9.3, target: 9.0, prev: 8.0, unit: "ratio", decimals: 1, frequency: "Monthly", rag: "green", direction: "up", tier: 1,
    trend: [7.1, 7.4, 7.8, 8.0, 8.2, 8.5, 8.8, 9.0, 9.1, 9.2, 9.3] },
  { id: "kpi-loss", category: "Risk", name: "Fraud loss rate", owner: "CRO", definition: "Fraud losses / TPV, basis points.",
    value: 4.2, target: 5.0, prev: 5.1, unit: "bps", decimals: 1, frequency: "Weekly", rag: "green", direction: "down", tier: 0,
    trend: [5.8, 5.6, 5.4, 5.3, 5.1, 4.9, 4.7, 4.6, 4.4, 4.3, 4.2] },
  { id: "kpi-sla", category: "Operations", name: "Support SLA %", owner: "Support Lead", definition: "First response within 2 minutes.",
    value: 96.4, target: 97.0, prev: 95.1, unit: "pct", decimals: 1, frequency: "Daily", rag: "amber", direction: "up", tier: 1,
    trend: [93.2, 94.0, 94.8, 95.1, 95.6, 96.0, 96.2, 96.1, 96.3, 96.4] },
  { id: "kpi-uptime", category: "Operations", name: "Platform uptime", owner: "CTO", definition: "Four-nines target measured at the API edge.",
    value: 99.97, target: 99.95, prev: 99.94, unit: "pct", decimals: 2, frequency: "Daily", rag: "green", direction: "up", tier: 0,
    trend: [99.88, 99.91, 99.93, 99.94, 99.95, 99.96, 99.95, 99.96, 99.97, 99.97] },
  { id: "kpi-mttr", category: "Operations", name: "MTTR incidents", owner: "CTO", definition: "Mean time to resolve P1/P2 incidents.",
    value: 38, target: 45, prev: 52, unit: "minutes", frequency: "Monthly", rag: "green", direction: "down", tier: 1,
    trend: [68, 62, 55, 52, 48, 44, 42, 40, 39, 38] },
  { id: "kpi-kyc", category: "Operations", name: "KYC SLA", owner: "Compliance", definition: "Median time from signup to KYC approved.",
    value: 9.2, target: 15, prev: 14.8, unit: "minutes", decimals: 1, frequency: "Daily", rag: "green", direction: "down", tier: 1,
    trend: [18, 17, 16, 15.1, 14.2, 12.4, 11, 10.2, 9.6, 9.2] },
  { id: "kpi-card", category: "Product", name: "Card activation rate", owner: "VP Cards", definition: "Cards activated within 7 days of issuance.",
    value: 74.1, target: 72.0, prev: 70.4, unit: "pct", decimals: 1, frequency: "Weekly", rag: "green", direction: "up", tier: 1,
    trend: [66, 67, 68, 69, 70, 70.4, 71, 72, 73, 73.5, 74.1] },
  { id: "kpi-nps", category: "Product", name: "Net promoter score", owner: "VP Product", definition: "30-day rolling NPS from in-app survey.",
    value: 48, target: 45, prev: 44, unit: "num", frequency: "Monthly", rag: "green", direction: "up", tier: 1,
    trend: [38, 40, 41, 42, 43, 44, 45, 46, 47, 47, 48] },
  { id: "kpi-day1", category: "Product", name: "Day-1 activation", owner: "VP Product", definition: "Users completing their first successful transaction in 24h.",
    value: 63.2, target: 65.0, prev: 61.0, unit: "pct", decimals: 1, frequency: "Weekly", rag: "amber", direction: "up", tier: 1,
    trend: [58, 59, 60, 61, 61, 62, 62, 62.8, 63, 63.2] },
  { id: "kpi-d30", category: "Product", name: "Day-30 retention", owner: "VP Product", definition: "Users still active 30 days after signup.",
    value: 54.0, target: 56.0, prev: 51.4, unit: "pct", decimals: 1, frequency: "Monthly", rag: "amber", direction: "up", tier: 1,
    trend: [48, 49, 50, 51, 51.4, 52, 52.6, 53, 53.4, 54] },
  { id: "kpi-people", category: "People", name: "eNPS", owner: "People Ops", definition: "Employee net promoter score.",
    value: 62, target: 60, prev: 58, unit: "num", frequency: "Quarterly", rag: "green", direction: "up", tier: 0,
    trend: [52, 54, 56, 58, 59, 60, 62] },
  { id: "kpi-open", category: "People", name: "Open reqs filled", owner: "People Ops", definition: "% of open roles filled within 30 days.",
    value: 71, target: 80, prev: 64, unit: "pct", frequency: "Monthly", rag: "amber", direction: "up", tier: 1,
    trend: [58, 60, 62, 64, 66, 68, 70, 71] },
];

export type Department = {
  id: string; name: string; lead: string; color: string; okrs: number; onTrack: number; health: RAG; budget: number; spend: number; headcount: number;
};
export const DEPARTMENTS: Department[] = [
  { id: "growth", name: "Growth", lead: "Head of Growth", color: "#12b76a", okrs: 5, onTrack: 4, health: "green", budget: 124_000_000, spend: 96_400_000, headcount: 22 },
  { id: "product", name: "Product & Engineering", lead: "CTO / VP Product", color: "#2e90fa", okrs: 7, onTrack: 5, health: "amber", budget: 486_000_000, spend: 342_000_000, headcount: 84 },
  { id: "risk", name: "Risk & Compliance", lead: "CRO / CCO", color: "#f79009", okrs: 6, onTrack: 6, health: "green", budget: 58_000_000, spend: 41_200_000, headcount: 18 },
  { id: "finance", name: "Finance & Treasury", lead: "CFO", color: "#7a5af8", okrs: 4, onTrack: 3, health: "green", budget: 92_000_000, spend: 68_400_000, headcount: 14 },
  { id: "ops", name: "Operations & Support", lead: "COO", color: "#0ba5ec", okrs: 5, onTrack: 3, health: "amber", budget: 148_000_000, spend: 118_000_000, headcount: 46 },
  { id: "people", name: "People & Culture", lead: "CPO", color: "#ee46bc", okrs: 3, onTrack: 2, health: "green", budget: 28_000_000, spend: 19_400_000, headcount: 8 },
];

export type OKR = {
  id: string; title: string; owner: string; dept: string; objective: string;
  kr: { text: string; current: number; target: number; unit: string }[];
  status: "On track" | "At risk" | "Off track" | "Done"; priority: "High" | "Medium" | "Low"; due: string; progress: number;
};
export const OKRS: OKR[] = [
  { id: "OKR-01", title: "Reach 100K MAU in Q3", owner: "Head of Growth", dept: "Growth", objective: "Scale monthly active users past the Q3 target.",
    kr: [{ text: "Add 27,000 new activated users", current: 8412, target: 27000, unit: "users" },
        { text: "Increase activation rate to 65%", current: 63.2, target: 65, unit: "%" },
        { text: "Reduce blended CAC to KES 380", current: 412, target: 380, unit: "KES" }],
    status: "At risk", priority: "High", due: "30 Sep 2026", progress: 31 },
  { id: "OKR-02", title: "Deliver four-nines uptime", owner: "CTO", dept: "Product & Engineering", objective: "Harden platform reliability for CBK audit.",
    kr: [{ text: "Monthly uptime", current: 99.97, target: 99.95, unit: "%" },
        { text: "P1 MTTR under 30 minutes", current: 38, target: 30, unit: "min" },
        { text: "Zero Sev-A security findings", current: 2, target: 0, unit: "findings" }],
    status: "On track", priority: "High", due: "30 Sep 2026", progress: 78 },
  { id: "OKR-03", title: "Launch Visa commercial cards", owner: "VP Cards", dept: "Product & Engineering", objective: "Ship BIN 489712 for SME customers.",
    kr: [{ text: "Scheme certification", current: 85, target: 100, unit: "%" },
        { text: "10 pilot merchants live", current: 4, target: 10, unit: "merchants" },
        { text: "Activate 2,500 cards", current: 820, target: 2500, unit: "cards" }],
    status: "At risk", priority: "High", due: "28 Aug 2026", progress: 42 },
  { id: "OKR-04", title: "Cut fraud losses to <4 bps", owner: "CRO", dept: "Risk & Compliance", objective: "Meet board-approved risk appetite.",
    kr: [{ text: "Fraud loss rate", current: 4.2, target: 4.0, unit: "bps" },
        { text: "Auto-block precision ≥ 92%", current: 93.1, target: 92, unit: "%" },
        { text: "SAR filings within 7-day SLA", current: 100, target: 100, unit: "%" }],
    status: "On track", priority: "High", due: "30 Sep 2026", progress: 88 },
  { id: "OKR-05", title: "Raise pre-Series C", owner: "CFO", dept: "Finance & Treasury", objective: "Close KES 1.4B round for expansion.",
    kr: [{ text: "Data room 100% ready", current: 92, target: 100, unit: "%" },
        { text: "Term sheets received", current: 2, target: 3, unit: "sheets" },
        { text: "Close by 31 Oct", current: 0, target: 1, unit: "closed" }],
    status: "On track", priority: "High", due: "31 Oct 2026", progress: 55 },
  { id: "OKR-06", title: "SLA first response 97%", owner: "COO", dept: "Operations & Support", objective: "Maintain sub-2-minute first response.",
    kr: [{ text: "First response SLA", current: 96.4, target: 97, unit: "%" },
        { text: "CSAT ≥ 4.7", current: 4.6, target: 4.7, unit: "/ 5" },
        { text: "Backlog under 50 tickets", current: 38, target: 50, unit: "tickets" }],
    status: "At risk", priority: "Medium", due: "30 Sep 2026", progress: 62 },
  { id: "OKR-07", title: "Day-30 retention 56%", owner: "VP Product", dept: "Product & Engineering", objective: "Improve retention of new signups.",
    kr: [{ text: "Day-30 retention", current: 54.0, target: 56, unit: "%" },
        { text: "Re-engagement campaign sent", current: 1, target: 3, unit: "campaigns" },
        { text: "Onboarding completion 85%", current: 81.2, target: 85, unit: "%" }],
    status: "At risk", priority: "Medium", due: "30 Sep 2026", progress: 48 },
  { id: "OKR-08", title: "SOC 2 Type II attestation", owner: "CTO", dept: "Product & Engineering", objective: "Pass the audit with zero material exceptions.",
    kr: [{ text: "Controls documented", current: 100, target: 100, unit: "%" },
        { text: "Evidence collected", current: 78, target: 100, unit: "%" },
        { text: "Auditor fieldwork", current: 40, target: 100, unit: "%" }],
    status: "On track", priority: "High", due: "15 Nov 2026", progress: 72 },
  { id: "OKR-09", title: "Close 3 new partner integrations", owner: "VP Partnerships", dept: "Growth", objective: "Onboard 2 lenders + 1 insurer.",
    kr: [{ text: "Due diligence complete", current: 2, target: 3, unit: "partners" },
        { text: "Sandbox keys issued", current: 2, target: 3, unit: "keys" },
        { text: "Live in production", current: 0, target: 3, unit: "partners" }],
    status: "Off track", priority: "Medium", due: "30 Oct 2026", progress: 28 },
  { id: "OKR-10", title: "Internal promotion rate ≥ 25%", owner: "CPO", dept: "People & Culture", objective: "Grow leadership from within.",
    kr: [{ text: "Promotions", current: 11, target: 18, unit: "promotions" },
        { text: "Career ladders published", current: 100, target: 100, unit: "%" },
        { text: "Manager training", current: 88, target: 100, unit: "%" }],
    status: "On track", priority: "Low", due: "31 Dec 2026", progress: 64 },
  { id: "OKR-11", title: "Achieve 67% recovery rate", owner: "CRO", dept: "Risk & Compliance", objective: "Continue reducing net credit losses.",
    kr: [{ text: "Overall recovery", current: 67, target: 67, unit: "%" },
        { text: "Agents hitting quota", current: 3, target: 4, unit: "agents" },
        { text: "90d+ arrears under 100", current: 78, target: 100, unit: "accounts" }],
    status: "Done", priority: "Medium", due: "31 Aug 2026", progress: 100 },
  { id: "OKR-12", title: "Localize for 2 new markets", owner: "VP Product", dept: "Product & Engineering", objective: "Prepare UGX and TZS rails.",
    kr: [{ text: "Currency abstraction shipped", current: 100, target: 100, unit: "%" },
        { text: "UGX mobile money adapter", current: 68, target: 100, unit: "%" },
        { text: "TZS mobile money adapter", current: 22, target: 100, unit: "%" }],
    status: "On track", priority: "Medium", due: "15 Dec 2026", progress: 63 },
];

export type CohortRow = {
  cohort: string; signups: number; d1: number; d7: number; d14: number; d30: number; d60: number; d90: number;
};
export const COHORT: CohortRow[] = [
  { cohort: "Mar 2026", signups: 12400, d1: 68.2, d7: 52.1, d14: 48.4, d30: 44.0, d60: 40.2, d90: 36.4 },
  { cohort: "Apr 2026", signups: 11840, d1: 66.9, d7: 51.4, d14: 47.8, d30: 43.2, d60: 39.1, d90: 35.0 },
  { cohort: "May 2026", signups: 13210, d1: 69.1, d7: 53.8, d14: 50.2, d30: 46.1, d60: 42.0, d90: 0 },
  { cohort: "Jun 2026", signups: 14108, d1: 70.0, d7: 54.7, d14: 51.0, d30: 47.2, d60: 0, d90: 0 },
  { cohort: "Jul 2026", signups: 15420, d1: 70.8, d7: 55.4, d14: 51.8, d30: 48.0, d60: 0, d90: 0 },
  { cohort: "Aug 2026", signups: 8412, d1: 72.1, d7: 57.2, d14: 0, d30: 0, d60: 0, d90: 0 },
];

export type TargetChange = { id: string; when: string; who: string; field: string; from: string; to: string; reason: string };
export const TARGET_HISTORY: TargetChange[] = [
  { id: "TH-01", when: "03 Aug 2026", who: "Board", field: "Platform uptime target", from: "99.9%", to: "99.95%", reason: "Tightened as part of CBK annual licence renewal." },
  { id: "TH-02", when: "18 Jul 2026", who: "CFO", field: "Net revenue target Q3", from: "KES 112M", to: "KES 118M", reason: "Strong M-Pesa performance in H1 revised upwards." },
  { id: "TH-03", when: "02 Jul 2026", who: "Head of Growth", field: "CAC ceiling", from: "KES 450", to: "KES 380", reason: "Marketing spend shift toward referrals." },
  { id: "TH-04", when: "14 Jun 2026", who: "CRO", field: "Fraud loss ceiling", from: "6 bps", to: "5 bps", reason: "After model v4.2.1 beat expectation in shadow." },
  { id: "TH-05", when: "22 May 2026", who: "CTO", field: "P1 MTTR target", from: "60 min", to: "30 min", reason: "New on-call rota and war-room automation landed." },
];

export type BoardPack = { period: string; status: "Draft" | "In review" | "Published" | "Presented"; due: string; pages: number; owner: string };
export const BOARD_PACKS: BoardPack[] = [
  { period: "August 2026 monthly", status: "Draft", due: "31 Aug 2026", pages: 48, owner: "Joseph Mwangi" },
  { period: "Q2-2026 results", status: "Presented", due: "12 Aug 2026", pages: 86, owner: "Sarah Kamau" },
  { period: "Q3-2026 forecast", status: "In review", due: "05 Sep 2026", pages: 54, owner: "Sarah Kamau" },
  { period: "FY2026 planning", status: "Published", due: "15 Jul 2026", pages: 112, owner: "Joseph Mwangi" },
  { period: "Risk committee — July", status: "Presented", due: "28 Jul 2026", pages: 38, owner: "David Kiplagat" },
];

export const Q_QUARTER = "Q3-2026";

export const RAG_COUNTS = {
  green: KPI_LIST.filter((k) => k.rag === "green").length,
  amber: KPI_LIST.filter((k) => k.rag === "amber").length,
  red: KPI_LIST.filter((k) => k.rag === "red").length,
  blue: KPI_LIST.filter((k) => k.rag === "blue").length,
};

export const QUARTER_HISTORY = [
  { q: "Q3-25", actual: 58, target: 65, rag: "red" },
  { q: "Q4-25", actual: 66, target: 68, rag: "amber" },
  { q: "Q1-26", actual: 72, target: 70, rag: "green" },
  { q: "Q2-26", actual: 76, target: 74, rag: "green" },
  { q: "Q3-26", actual: 81, target: 82, rag: "amber" },
] as const;
