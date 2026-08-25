export type DormantBucket = "60d" | "90d" | "180d" | "365d";
export type ClosureReason = "Customer request" | "Long-term inactivity" | "Fraud / ban" | "AML / de-risking" | "Duplicate identity" | "Court order";

export interface FunnelStage {
  id: string; label: string; icon: string; count: number; rateFromPrev: number;
  desc: string; color: string;
}
export const FUNNEL: FunnelStage[] = [
  { id: "signup", label: "Signed up", icon: "bi-person-plus", count: 148_392, rateFromPrev: 100, desc: "Completed registration with phone or email", color: "#667085" },
  { id: "phone", label: "Phone verified", icon: "bi-telephone-check", count: 141_204, rateFromPrev: 95.1, desc: "OTP verified on the registered number", color: "#98a2b3" },
  { id: "kyc1", label: "KYC Tier 1", icon: "bi-patch-check", count: 124_810, rateFromPrev: 88.4, desc: "Identity verified at tier 1", color: "#2e90fa" },
  { id: "fund", label: "First funded", icon: "bi-wallet2", count: 101_506, rateFromPrev: 81.3, desc: "Received or deposited at least KES 100", color: "#16b364" },
  { id: "first", label: "First transaction", icon: "bi-arrow-left-right", count: 92_908, rateFromPrev: 91.5, desc: "Completed a send, bill pay or card transaction", color: "#12b76a" },
  { id: "d7", label: "Active at D7", icon: "bi-lightning-charge", count: 78_756, rateFromPrev: 84.8, desc: "Returned within 7 days of first transaction", color: "#0b8f52" },
  { id: "d30", label: "Active at D30", icon: "bi-calendar-check", count: 60_420, rateFromPrev: 76.7, desc: "Still transacting at day 30", color: "#0f6e45" },
  { id: "active30", label: "Active (30d)", icon: "bi-activity", count: 89_214, rateFromPrev: 0, desc: "30-day rolling window, all cohorts", color: "#12b76a" },
];

export interface MonthlyFlow {
  month: string; newSignups: number; activated: number; churned: number; reactivated: number; closed: number;
}
export const MONTHLY_FLOW: MonthlyFlow[] = [
  { month: "Sep", newSignups: 18_400, activated: 12_100, churned: 3_200, reactivated: 1_100, closed: 640 },
  { month: "Oct", newSignups: 19_800, activated: 13_400, churned: 3_500, reactivated: 1_250, closed: 705 },
  { month: "Nov", newSignups: 21_200, activated: 14_300, churned: 3_900, reactivated: 1_300, closed: 770 },
  { month: "Dec", newSignups: 23_600, activated: 15_900, churned: 4_400, reactivated: 1_420, closed: 835 },
  { month: "Jan", newSignups: 20_900, activated: 14_100, churned: 4_100, reactivated: 1_380, closed: 802 },
  { month: "Feb", newSignups: 22_300, activated: 15_200, churned: 4_300, reactivated: 1_450, closed: 818 },
  { month: "Mar", newSignups: 24_100, activated: 16_800, churned: 4_600, reactivated: 1_510, closed: 866 },
  { month: "Apr", newSignups: 25_400, activated: 17_900, churned: 4_700, reactivated: 1_580, closed: 899 },
  { month: "May", newSignups: 26_200, activated: 18_600, churned: 4_900, reactivated: 1_640, closed: 931 },
  { month: "Jun", newSignups: 27_100, activated: 19_500, churned: 5_000, reactivated: 1_700, closed: 962 },
  { month: "Jul", newSignups: 28_600, activated: 20_900, churned: 5_100, reactivated: 1_790, closed: 1_004 },
  { month: "Aug", newSignups: 15_612, activated: 11_204, churned: 2_700, reactivated: 962, closed: 517 },
];

export interface DormantUser {
  id: string; userId: string; name: string; phone: string; county: string; tier: "Basic" | "Verified" | "VIP" | "Business";
  bucket: DormantBucket; dormantDays: number; balance: number; lastTxn: string; lastLogin: string;
  lifetimeVolume: number; lifetimeTxns: number; channel: "App" | "USSD" | "Web"; reason: string; winback: boolean;
}
const first = ["Amina", "Brian", "Lucy", "David", "Fatuma", "James", "Wanjiru", "Samuel", "Naomi", "Kevin", "Esther", "Collins", "Mercy", "Patrick", "Zainab", "Joseph", "Beatrice", "Dennis", "Sharon", "Felix", "Caroline", "Anthony", "Rose", "Vincent"];
const last = ["Hassan", "Otieno", "Muthoni", "Kimani", "Abdalla", "Mutua", "Karanja", "Okello", "Chemtai", "Barasa", "Njeri", "Ouma", "Akinyi", "Kiptoo", "Ali", "Maina", "Wairimu", "Mwangi", "Adhiambo", "Mutiso", "Nyambura", "Wafula", "Atieno", "Kariuki"];
const counties = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Uasin Gishu", "Kiambu", "Machakos", "Nyeri"];
const dormReasons = ["SMS-only user, no app push opt-in", "Left for job, account unused", "Migration to another provider", "Seasonal remittance pattern", "Card expired, app rarely opened", "Business relocated out of county", "Lost phone, re-KYC pending", "Price-sensitive, fees raised"];
export const DORMANT_USERS: DormantUser[] = first.map((f, i) => {
  const bucketIdx = i % 4;
  const days = [70 + i, 112 + i * 2, 214 + i * 3, 402 + i * 5][bucketIdx];
  const tier = (["Basic", "Verified", "VIP", "Business"] as const)[i % 4];
  return {
    id: `DRM-${3100 + i}`, userId: `USR-${14200 + i * 653}`, name: `${f} ${last[i]}`,
    phone: `+2547${String(11 + (i % 79)).padStart(2, "0")} ${String(140 + i * 9).slice(0, 3)} ${String(330 + i * 11).slice(0, 3)}`,
    county: counties[i % counties.length], tier, bucket: (["60d", "90d", "180d", "365d"] as DormantBucket[])[bucketIdx],
    dormantDays: days, balance: tier === "VIP" ? 8_400 + ((i * 91_337) % 140_000) : tier === "Business" ? 4_100 + ((i * 47_311) % 82_000) : 240 + ((i * 23_117) % 9_600),
    lastTxn: `${days} days ago`, lastLogin: `${Math.max(3, days - (i % 9))} days ago`,
    lifetimeVolume: 12_400 + ((i * 91_337) % 1_400_000), lifetimeTxns: 4 + ((i * 7) % 240),
    channel: (["App", "USSD", "Web"] as const)[i % 3], reason: dormReasons[i % dormReasons.length], winback: i % 3 === 0,
  };
});

export interface ClosureRequest {
  id: string; userId: string; name: string; phone: string; requested: string; reason: ClosureReason;
  balance: number; loans: number; standingOrders: number; cards: number; vip: boolean; status: "Pending" | "In review" | "Cooling off" | "Approved" | "Denied";
  reviewer: string; note: string;
}
const closureReasons: ClosureReason[] = ["Customer request", "Long-term inactivity", "Fraud / ban", "AML / de-risking", "Duplicate identity", "Court order"];
export const CLOSURE_REQUESTS: ClosureRequest[] = first.slice(0, 14).map((f, i) => {
  const status = (["Pending", "In review", "Cooling off", "Pending", "Approved", "Denied", "Pending", "In review", "Cooling off", "Pending", "Approved", "Pending", "In review", "Pending"] as const)[i];
  return {
    id: `CLS-${4400 + i}`, userId: `USR-${22100 + i * 811}`, name: `${f} ${last[i + 4]}`,
    phone: `+2547${String(12 + (i % 77)).padStart(2, "0")} ${String(160 + i * 8).slice(0, 3)} ${String(350 + i * 13).slice(0, 3)}`,
    requested: `${3 + (i % 18)} Aug 2026`, reason: closureReasons[i % closureReasons.length],
    balance: 480 + ((i * 41_221) % 340_000), loans: i % 5 === 0 ? 1 : 0, standingOrders: i % 4 === 0 ? 2 : 0, cards: i % 3 === 0 ? 1 : 0, vip: i === 2,
    status, reviewer: i % 3 === 0 ? "Unassigned" : ["David Kiplagat", "Mary Wanjiku", "Jeckonia Kwasa"][i % 3],
    note: ["Requested twice via in-app form and WhatsApp.", "Dormant 412 days with residual balance.", "Confirmed fraud ring, funds retained 90 days.", "Sanctions match confirmed by compliance.", "Second profile sharing the same device cluster.", "CBK instruction reference CBN/2026/1142."][i % 6],
  };
});

export interface Campaign {
  id: string; name: string; audience: string; recipients: number; status: "Live" | "Scheduled" | "Completed" | "Paused";
  sent: number; delivered: number; opened: number; converted: number; spend: number; offer: string;
  channels: string[]; started: string; ends: string; owner: string;
}
export const CAMPAIGNS: Campaign[] = [
  { id: "CMP-2210", name: "Win back 90d sleepers", audience: "Dormant 90d, tier 1+", recipients: 9_412, status: "Live", sent: 8_900, delivered: 8_420, opened: 2_300, converted: 612, spend: 148_600, offer: "KES 50 fee credit for 30 days", channels: ["Push", "SMS"], started: "12 Aug", ends: "26 Aug", owner: "Head of Growth" },
  { id: "CMP-2209", name: "USSD-to-app migration", audience: "USSD-only users 60d dormant", recipients: 6_204, status: "Live", sent: 6_204, delivered: 5_810, opened: 1_420, converted: 233, spend: 97_400, offer: "Free card on app activation", channels: ["SMS"], started: "10 Aug", ends: "24 Aug", owner: "Head of Growth" },
  { id: "CMP-2208", name: "180d lapsed business", audience: "Business tier dormant 180d", recipients: 1_832, status: "Live", sent: 1_832, delivered: 1_740, opened: 486, converted: 141, spend: 210_300, offer: "0% merchant fees for 60 days", channels: ["Push", "Email"], started: "08 Aug", ends: "29 Aug", owner: "VP Product" },
  { id: "CMP-2207", name: "Reactivation nudge — KPLC", audience: "60d dormant with bill pay history", recipients: 4_912, status: "Completed", sent: 4_912, delivered: 4_610, opened: 1_180, converted: 198, spend: 74_200, offer: "KES 20 off next bill pay", channels: ["Push"], started: "18 Jul", ends: "28 Jul", owner: "Head of Growth" },
  { id: "CMP-2206", name: "VIP re-engagement call list", audience: "VIP dormant 30d", recipients: 312, status: "Completed", sent: 312, delivered: 312, opened: 204, converted: 118, spend: 186_400, offer: "Concierge re-onboarding call", channels: ["Call"], started: "15 Jul", ends: "22 Jul", owner: "Grace Wanjiru" },
  { id: "CMP-2205", name: "365d dormant sweep notice", audience: "Dormant 365d, balance > KES 100", recipients: 2_140, status: "Completed", sent: 2_140, delivered: 1_980, opened: 512, converted: 96, spend: 41_800, offer: "Claim your balance before closure", channels: ["SMS", "Email"], started: "02 Jul", ends: "15 Jul", owner: "Compliance" },
  { id: "CMP-2204", name: "Payroll season returner", audience: "90d dormant, salary credited monthly", recipients: 7_402, status: "Scheduled", sent: 0, delivered: 0, opened: 0, converted: 0, spend: 128_000, offer: "Extra 1% savings boost for September", channels: ["Push", "In-app"], started: "01 Sep", ends: "10 Sep", owner: "VP Product" },
  { id: "CMP-2203", name: "Lost-card recovery push", audience: "Card expired or reported lost 30d+", recipients: 3_204, status: "Paused", sent: 1_204, delivered: 1_112, opened: 302, converted: 54, spend: 38_600, offer: "Instant replacement, no fee", channels: ["Push"], started: "28 Jul", ends: "paused", owner: "VP Cards" },
];

export interface LifecycleEvent {
  id: string; time: string; type: "Signup" | "First fund" | "First txn" | "Dormant" | "Reactivated" | "Closed" | "Tier change";
  user: string; userId: string; detail: string; county: string;
}
const eventTypes: LifecycleEvent["type"][] = ["Signup", "First fund", "First txn", "Dormant", "Reactivated", "Closed", "Tier change", "Signup", "First fund", "Reactivated"];
export const LIFECYCLE_EVENTS: LifecycleEvent[] = Array.from({ length: 24 }, (_, i) => ({
  id: `LCE-${9900 - i}`,
  time: i < 3 ? `${(i + 1) * 6} min ago` : i < 10 ? `${22 + i * 5} min ago` : `${1 + Math.floor(i / 6)}h ago`,
  type: eventTypes[i % eventTypes.length],
  user: `${first[i % 24]} ${last[(i + 9) % 24]}`,
  userId: `USR-${31000 + i * 517}`,
  detail: ["Completed registration from the Google Play listing.", "First deposit KES " + (400 + (i * 991) % 14_000) + " via M-Pesa STK.", "First send KES " + (180 + (i * 557) % 4_200) + " to a new beneficiary.", "Crossed 90 days without a transaction.", "Returned after " + (120 + (i * 13) % 280) + " days, completed " + (1 + i % 4) + " transactions.", "Account closed, balance swept to registered number.", "Upgraded Tier 1 to Tier 2 after payslip verification.", "Completed registration from app referral link.", "First bill pay to KPLC prepaid.", "Re-activated via USSD migration campaign."][i % 10],
  county: counties[i % counties.length],
}));

export interface CohortRow {
  cohort: string; size: number; d1: number; d7: number; d30: number; d60: number; d90: number; d180: number;
}
export const COHORT_RETENTION: CohortRow[] = [
  { cohort: "Mar 2026", size: 12_400, d1: 68, d7: 52, d30: 44, d60: 40, d90: 36, d180: 0 },
  { cohort: "Apr 2026", size: 11_840, d1: 67, d7: 51, d30: 43, d60: 39, d90: 35, d180: 0 },
  { cohort: "May 2026", size: 13_210, d1: 69, d7: 54, d30: 46, d60: 42, d90: 0, d180: 0 },
  { cohort: "Jun 2026", size: 14_108, d1: 70, d7: 55, d30: 47, d60: 0, d90: 0, d180: 0 },
  { cohort: "Jul 2026", size: 15_420, d1: 71, d7: 56, d30: 0, d60: 0, d90: 0, d180: 0 },
  { cohort: "Aug 2026", size: 15_612, d1: 72, d7: 0, d30: 0, d60: 0, d90: 0, d180: 0 },
];

export const LIFECYCLE_KPI = [
  { label: "Total accounts", value: "148,392", note: "+8,412 this month", icon: "bi-people" },
  { label: "Active (30d)", value: "89,214", note: "60.1% of all accounts", icon: "bi-activity" },
  { label: "Dormant 90d+", value: "21,430", note: "14.4% · watch", icon: "bi-moon" },
  { label: "Closed (30d)", value: "1,004", note: "36% by inactivity", icon: "bi-box-x" },
  { label: "M1 retention", value: "48.0%", note: "+3.2 pts vs Jul", icon: "bi-calendar-check" },
  { label: "Avg activation time", value: "2.1 days", note: "signup to first txn", icon: "bi-stopwatch" },
  { label: "Win-back conversion", value: "3.4%", note: "last 90 days", icon: "bi-arrow-counterclockwise" },
  { label: "Reactivation ROI", value: "2.8x", note: "revenue vs spend", icon: "bi-graph-up-arrow" },
];
