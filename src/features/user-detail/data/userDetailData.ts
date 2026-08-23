/* ============================================================
   Page 5 — User Detail & Actions · data layer
   Seeded generators so each user has a distinct, realistic profile.
   ============================================================ */

export type Tier = "Basic" | "Verified" | "VIP" | "Business" | "Agent";
export type KycStatus = "Verified" | "Pending" | "Rejected" | "Expired" | "Under review";
export type AccountStatus = "Active" | "Frozen" | "Dormant" | "Suspended" | "Closed";

export type FeaturedUser = {
  id: string; name: string; email: string; phone: string; county: string; tier: Tier;
  kyc: KycStatus; status: AccountStatus; balance: number; risk: number; joined: string;
  lastActive: string; occupation: string; age: number; gender: "M" | "F"; referrals: number;
  tags: string[]; rm: string;
};

export const FEATURED_USERS: FeaturedUser[] = [
  { id: "USR-89234", name: "Amina Hassan", email: "amina.hassan@gmail.com", phone: "+254722 445 118", county: "Nairobi", tier: "VIP", kyc: "Verified", status: "Active", balance: 2_412_600, risk: 12, joined: "14 Mar 2023", lastActive: "2 minutes ago", occupation: "Business Owner", age: 38, gender: "F", referrals: 14, tags: ["high-value", "merchant", "card-active"], rm: "Grace Wanjiru" },
  { id: "USR-45120", name: "Brian Otieno", email: "b.otieno@outlook.com", phone: "+254733 812 990", county: "Kisumu", tier: "Business", kyc: "Verified", status: "Active", balance: 1_182_400, risk: 88, joined: "02 Jul 2023", lastActive: "18 minutes ago", occupation: "Trader", age: 44, gender: "M", referrals: 6, tags: ["merchant", "loan-default"], rm: "Peter Njoroge" },
  { id: "USR-77812", name: "Lucy Muthoni", email: "lucy.m@gmail.com", phone: "+254798 441 226", county: "Nyeri", tier: "Verified", kyc: "Verified", status: "Active", balance: 96_400, risk: 41, joined: "19 Jan 2024", lastActive: "1 hour ago", occupation: "Teacher", age: 29, gender: "F", referrals: 3, tags: ["early-adopter"], rm: "Unassigned" },
  { id: "USR-11223", name: "David Kimani", email: "dkimani@yahoo.com", phone: "+254726 663 441", county: "Nakuru", tier: "Verified", kyc: "Under review", status: "Frozen", balance: 312_000, risk: 96, joined: "08 Nov 2023", lastActive: "3 days ago", occupation: "Driver", age: 35, gender: "M", referrals: 0, tags: ["dormant-risk", "loan-default"], rm: "Unassigned" },
  { id: "USR-33456", name: "Fatuma Abdalla", email: "fatuma.a@gmail.com", phone: "+254739 204 885", county: "Malindi", tier: "Basic", kyc: "Pending", status: "Active", balance: 45_200, risk: 22, joined: "11 Aug 2026", lastActive: "32 minutes ago", occupation: "Student", age: 22, gender: "F", referrals: 1, tags: ["student"], rm: "Unassigned" },
  { id: "USR-4512", name: "James Mutua", email: "j.mutua@paymo.co.ke", phone: "+254701 864 532", county: "Nairobi", tier: "VIP", kyc: "Verified", status: "Active", balance: 4_862_100, risk: 8, joined: "27 Feb 2023", lastActive: "5 minutes ago", occupation: "Accountant", age: 41, gender: "M", referrals: 17, tags: ["high-value", "card-active", "sacco-member"], rm: "Grace Wanjiru" },
  { id: "USR-67890", name: "Wanjiru Karanja", email: "w.karanja@hotmail.com", phone: "+254715 034 672", county: "Kisumu", tier: "Business", kyc: "Under review", status: "Dormant", balance: 12_100, risk: 54, joined: "30 May 2024", lastActive: "94 days ago", occupation: "Nurse", age: 33, gender: "F", referrals: 2, tags: ["dormant-risk"], rm: "Faith Chebet" },
  { id: "USR-90881", name: "Kevin Barasa", email: "kevin.barasa@gmail.com", phone: "+254708 221 340", county: "Bungoma", tier: "Verified", kyc: "Expired", status: "Suspended", balance: 8_900, risk: 67, joined: "16 Sep 2023", lastActive: "12 days ago", occupation: "Mechanic", age: 27, gender: "M", referrals: 0, tags: ["card-active"], rm: "Unassigned" },
];

/* ---------------- seeded rng ---------------- */
const seedOf = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};
const rng = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = <T,>(r: () => number, arr: T[]) => arr[Math.floor(r() * arr.length)];

/* ---------------- pools ---------------- */
const MERCHANTS = ["Naivas Supermarket", "Java House", "Total Kenya", "KPLC Prepaid", "Nairobi Water", "DStv Kenya", "Jumia Kenya", "Chandarana", "Carrefour", "Bingwa", "Safaricom Airtime", "M-KOPA"];
const RAILS = ["M-Pesa", "Card (Visa)", "Card (Mastercard)", "PesaLink", "Internal", "Bank"];
const COUNTRIES = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Uasin Gishu", "Machakos", "Nyeri", "Kakamega", "Kiambu", "Kilifi"];
const METHODS = ["Passkey", "PIN", "Biometric", "OTP", "Fingerprint"];
const DEVICE_MODELS = ["iPhone 15 Pro · iOS 18", "Samsung A54 · Android 14", "Tecno Spark 20 · Android 13", "Xiaomi Redmi Note 12 · Android 14", "iPhone 14 · iOS 17", "Infinix Note 40 · Android 14"];
const ADMINS = ["Joseph Mwangi", "Sarah Kamau", "Mary Wanjiku", "David Kiplagat", "James Odhiambo"];
const AUDIT_ACTIONS = [
  ["Viewed profile", "Opened 360° profile from User Directory."],
  ["Viewed transactions", "Exported a 30-day transaction history."],
  ["Adjusted limits", "Daily withdrawal raised KES 150,000 → KES 300,000."],
  ["Added note", "VIP merchant — pays supplier invoices on Fridays."],
  ["Reviewed KYC document", "Re-checked proof of address."],
  ["Granted fee exemption", "Exempt from mobile money fees for 6 months."],
  ["Changed tier", "Upgraded Basic → Verified after payroll verification."],
  ["Flagged for review", "Unusual bill-pay volume on a Saturday."],
  ["Sent reminder", "KYC document expiry reminder dispatched."],
  ["Approved card", "Approved Visa card issuance, last4 4821."],
];

const MONTHS = ["Aug", "Jul", "Jun", "May", "Apr", "Mar"];
const dayLabel = (daysAgo: number, hour: number, min: number) => {
  if (daysAgo === 0) return `Today ${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  return `${MONTHS[Math.floor(daysAgo / 30) % MONTHS.length]} ${28 - (daysAgo % 28)} ${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
};

/* ---------------- types ---------------- */
export type Wallet = { name: string; balance: number; desc: string; icon: string };
export type BalancePoint = { d: string; main: number; float: number; escrow: number };
export type TxnRec = {
  id: string; time: string; type: string; counterparty: string; cpId: string;
  amount: number; fee: number; rail: string; status: "Complete" | "Pending" | "Failed" | "Held" | "Refunded" | "Blocked"; ref: string; direction: "in" | "out";
};
export type LoginRec = {
  id: string; time: string; device: string; ip: string; location: string; method: string;
  status: "Success" | "Failed" | "Challenged"; risk: "Low" | "Medium" | "High"; active: boolean;
};
export type DeviceRec = {
  id: string; fp: string; model: string; firstSeen: string; lastSeen: string; location: string;
  trust: "Trusted" | "Untrusted" | "Blacklisted"; sessions30d: number; current: boolean;
};
export type LoanRec = {
  id: string; product: string; principal: number; balance: number; rate: number; due: string;
  status: "Repaying" | "Overdue" | "Settled" | "Restructured"; nextDue: number; daysDue: string; overdueDays?: number;
};
export type CardRec = {
  id: string; brand: string; last4: string; status: "Active" | "Frozen" | "Lost" | "Expired";
  issued: string; expires: string; dailyLimit: number; usage30d: number;
};
export type AuditRec = { id: string; time: string; admin: string; action: string; details: string; ip: string };
export type KycStage = { name: string; status: "Verified" | "Pending" | "Rejected" | "Expired" | "Not started"; date: string; score: number };
export type KycDoc = { name: string; status: "Verified" | "Pending" | "Rejected" | "Expired" | "Not started"; uploaded: string; onfido: number };
export type RiskSignal = { name: string; value: string; weight: number; bad: boolean };
export type UserAlert = { id: string; rule: string; time: string; score: number; action: string; note: string };
export type Limits = { key: string; label: string; current: number; tierDefault: number; cbkCeiling: number };

/* ---------------- generators ---------------- */
export function buildDetail(u: FeaturedUser) {
  const r = rng(seedOf(u.id + u.name));

  /* wallets */
  const main = Math.round(u.balance * (0.62 + r() * 0.1));
  const float = Math.round(u.balance * (0.18 + r() * 0.1));
  const escrow = Math.round(u.balance * (0.06 + r() * 0.05));
  const savings = Math.max(0, u.balance - main - float - escrow);
  const wallets: Wallet[] = [
    { name: "Main wallet", balance: main, desc: "Everyday transactions", icon: "bi-wallet2" },
    { name: "Merchant float", balance: float, desc: "Settlement & payout buffer", icon: "bi-shop" },
    { name: "Escrow", balance: escrow, desc: "Held against pending orders", icon: "bi-box" },
    { name: "Savings lock", balance: savings, desc: "7-day lock · 4.5% p.a.", icon: "bi-safe" },
  ];

  /* balance trend (30d) */
  const balances: BalancePoint[] = Array.from({ length: 30 }, (_, i) => {
    const base = u.balance * (0.55 + (i / 30) * 0.45 + Math.sin(i / 3.2) * 0.06);
    return {
      d: `${30 - i} Aug`.replace("31 Aug", "24 Aug"),
      main: Math.round(base * 0.68),
      float: Math.round(base * 0.2),
      escrow: Math.round(base * 0.09),
    };
  });

  /* transactions */
  const types: [string, "in" | "out"][] = [
    ["M-Pesa receive", "in"], ["M-Pesa send", "out"], ["Card payment", "out"], ["Card cash-out", "out"],
    ["Bill pay", "out"], ["Airtime", "out"], ["Loan repayment", "out"], ["PesaLink receive", "in"],
    ["PesaLink send", "out"], ["Deposit", "in"], ["Internal transfer", "out"], ["Refund received", "in"],
  ];
  const txStatuses: TxnRec["status"][] = ["Complete", "Complete", "Complete", "Complete", "Complete", "Complete", "Complete", "Pending", "Complete", "Failed", "Complete", "Held", "Complete", "Refunded", "Complete", "Complete", "Blocked", "Complete", "Complete", "Pending", "Complete", "Complete"];
  const txns: TxnRec[] = Array.from({ length: 22 }, (_, i) => {
    const [type, direction] = pick(r, types);
    const merchant = type.startsWith("Card") || type === "Bill pay" || type === "Airtime";
    const amount = Math.round((direction === "in" ? 4_000 + r() * 480_000 : 800 + r() * 220_000) / 10) * 10;
    return {
      id: `TXN-${900210 - i * 7}`,
      time: dayLabel(Math.floor(r() * 14), 6 + Math.floor(r() * 16), Math.floor(r() * 60)),
      type, direction,
      counterparty: merchant ? pick(r, MERCHANTS) : pick(r, ["Brian Otieno", "Grace Wanjiru", "Peter Njoroge", "Faith Chebet", "Sacco — Stima", "Kevin Barasa", "Naomi Chemtai", "Collins Ouma"]),
      cpId: `#${Math.floor(10000 + r() * 89999)}`,
      amount, fee: Math.max(0, Math.round(amount * 0.0045)), rail: pick(r, RAILS),
      status: txStatuses[i], ref: `REF${Math.floor(100000 + r() * 899999)}`,
    };
  });

  /* logins */
  const logins: LoginRec[] = Array.from({ length: 20 }, (_, i) => {
    const riskRoll = r();
    const risk: LoginRec["risk"] = u.risk > 70 && i < 3 ? "High" : riskRoll > 0.9 ? "High" : riskRoll > 0.65 ? "Medium" : "Low";
    const status: LoginRec["status"] = risk === "High" ? (i % 2 === 0 ? "Failed" : "Challenged") : "Success";
    return {
      id: `LGN-${44820 - i * 3}`,
      time: dayLabel(Math.floor(r() * 20), 5 + Math.floor(r() * 19), Math.floor(r() * 60)),
      device: pick(r, DEVICE_MODELS),
      ip: `${[41, 197, 102, 105, 196][Math.floor(r() * 5)]}.${Math.floor(r() * 255)}.${Math.floor(r() * 255)}.${Math.floor(r() * 255)}`,
      location: risk === "High" && i % 2 === 1 ? "Unknown (VPN)" : pick(r, COUNTRIES),
      method: pick(r, METHODS), status, risk, active: i < 2,
    };
  });

  /* devices */
  const devices: DeviceRec[] = Array.from({ length: 6 }, (_, i) => ({
    id: `DEV-${710 + i}`,
    fp: `fp_${Math.floor(r() * 0xffff).toString(16).padStart(4, "0")}${u.id.slice(-4)}`,
    model: DEVICE_MODELS[i],
    firstSeen: `${pick(r, MONTHS)} ${2 + Math.floor(r() * 26)} ${2023 + (i % 3)}`,
    lastSeen: dayLabel(Math.floor(r() * 21), 8 + Math.floor(r() * 12), 12),
    location: i === 3 ? "Kisumu, Kenya" : i === 5 ? "Unknown" : u.county,
    trust: i === 5 ? (u.risk > 70 ? "Blacklisted" : "Untrusted") : i === 3 ? "Untrusted" : "Trusted",
    sessions30d: Math.floor(2 + r() * 40),
    current: i === 0,
  }));

  /* loans */
  const loanProducts = ["Boost Loan", "Salary Advance", "Merchant Float"];
  const loans: LoanRec[] = Array.from({ length: 3 }, (_, i) => {
    const principal = Math.round((40_000 + r() * 900_000) / 1000) * 1000;
    const repaid = r();
    const overdue = u.id === "USR-45120" ? i === 0 : u.id === "USR-11223" ? i === 1 : false;
    const settled = !overdue && (i === 2 || (u.risk < 20 && r() > 0.5));
    return {
      id: `LN-${5501 + i}`,
      product: loanProducts[i],
      principal,
      balance: settled ? 0 : Math.round(principal * (1 - repaid * 0.85)),
      rate: 1.5 + Math.round(r() * 30) / 10,
      due: `Nov ${5 + i * 9} 2026`,
      status: settled ? "Settled" : overdue ? "Overdue" : i === 1 && u.risk > 80 ? "Restructured" : "Repaying",
      nextDue: Math.round(principal / 6 * (1 - repaid * 0.6)),
      daysDue: settled ? "Settled" : overdue ? `${20 + i * 14} days overdue` : `due in ${9 + i * 12} days`,
      overdueDays: overdue ? 20 + i * 14 : undefined,
    };
  });

  /* cards */
  const cards: CardRec[] = u.tier === "VIP" || u.tier === "Business" || u.tags.includes("card-active") ? [
    {
      id: "CRD-2214", brand: "Visa", last4: "4821", status: u.status === "Frozen" ? "Frozen" : "Active",
      issued: "03 Mar 2025", expires: "03/2028", dailyLimit: 500_000, usage30d: Math.round(120_000 + r() * 400_000),
    },
    {
      id: "CRD-2215", brand: "Mastercard", last4: "9902", status: "Active",
      issued: "18 Jun 2025", expires: "06/2029", dailyLimit: 300_000, usage30d: Math.round(40_000 + r() * 160_000),
    },
  ] : [];

  /* audit trail */
  const audit: AuditRec[] = AUDIT_ACTIONS.map(([action, details], i) => ({
    id: `AUD-${88100 - i * 6}`,
    time: dayLabel(Math.floor(r() * 12), 9 + Math.floor(r() * 9), Math.floor(r() * 60)),
    admin: ADMINS[i % ADMINS.length],
    action, details,
    ip: `197.232.14.${40 + i}`,
  }));

  /* KYC */
  const stageStatus = (base: KycStatus, i: number): KycStage["status"] => {
    if (base === "Verified") return "Verified";
    if (base === "Pending") return i < 2 ? "Verified" : i === 2 ? "Pending" : "Not started";
    if (base === "Rejected") return i < 2 ? "Verified" : i === 2 ? "Rejected" : "Not started";
    if (base === "Expired") return i < 2 ? "Expired" : i === 2 ? "Verified" : "Not started";
    return i < 2 ? "Verified" : i === 2 ? "Pending" : "Not started";
  };
  const kycStages: KycStage[] = [
    { name: "Identity document", status: stageStatus(u.kyc, 0), date: u.joined, score: 97 },
    { name: "Selfie & liveness", status: stageStatus(u.kyc, 0), date: u.joined, score: 94 },
    { name: "Proof of address", status: stageStatus(u.kyc, 2), date: "12 Apr 2024", score: 88 },
    { name: "Source of income", status: stageStatus(u.kyc, 3), date: u.tier === "VIP" || u.tier === "Business" ? "20 Apr 2024" : "—", score: u.tier === "VIP" || u.tier === "Business" ? 91 : 0 },
  ];
  const kycDocs: KycDoc[] = [
    { name: "National ID — front & back", status: stageStatus(u.kyc, 0), uploaded: u.joined, onfido: 97 },
    { name: "Selfie video (liveness)", status: stageStatus(u.kyc, 0), uploaded: u.joined, onfido: 94 },
    { name: "Utility bill — KPLC (address)", status: stageStatus(u.kyc, 2), uploaded: "12 Apr 2024", onfido: 88 },
    { name: u.tier === "Business" ? "Business permit + CR12" : "Payslip — March 2026", status: stageStatus(u.kyc, 3), uploaded: "20 Apr 2024", onfido: 91 },
  ];

  /* risk signals */
  const signals: RiskSignal[] = [
    { name: "Device count (24h)", value: u.risk > 70 ? "4 unique devices" : "1–2 devices", weight: u.risk > 70 ? 32 : 8, bad: u.risk > 70 },
    { name: "Geo-velocity", value: u.risk > 90 ? "Impossible travel detected" : "Consistent with history", weight: u.risk > 90 ? 28 : 6, bad: u.risk > 90 },
    { name: "Amount vs 90-day profile", value: u.risk > 60 ? `${(3 + r() * 4).toFixed(1)}× above mean` : "Within normal band", weight: u.risk > 60 ? 22 : 9, bad: u.risk > 60 },
    { name: "Beneficiary novelty", value: `${Math.floor(r() * 8)} new counterparties (30d)`, weight: 12, bad: false },
    { name: "Device reputation", value: devices.find((d) => d.trust === "Blacklisted") ? "1 blacklisted device" : "All devices trusted", weight: devices.find((d) => d.trust === "Blacklisted") ? 24 : 4, bad: !!devices.find((d) => d.trust === "Blacklisted") },
    { name: "SIM swap history", value: "No change in 90 days", weight: 5, bad: false },
  ];

  const alerts: UserAlert[] = u.risk > 40 ? [
    { id: "FRD-7731", rule: u.risk > 90 ? "at.device_takeover_v2" : "velocity.amount_ramp", time: "Today 09:12", score: u.risk, action: u.risk > 90 ? "Auto-blocked" : "Flagged", note: u.risk > 90 ? "4 failed passkey challenges from 3 devices" : "Amounts ramping above the 90-day profile" },
    { id: "FRD-7719", rule: "behaviour.new_beneficiary", time: "Yesterday 18:40", score: Math.max(20, u.risk - 18), action: "Cleared", note: "First transfer to a new beneficiary — verified by OTP" },
    { id: "FRD-7702", rule: "sim.swap_recent", time: "6 days ago", score: Math.max(15, u.risk - 30), action: "Cleared", note: "SIM changed but customer re-authenticated" },
  ] : [
    { id: "FRD-7690", rule: "baseline.healthy", time: "3 days ago", score: u.risk, action: "Cleared", note: "Routine scan — no anomalies" },
  ];

  const limits: Limits[] = [
    { key: "dailyWithdraw", label: "Daily withdrawal", current: u.tier === "VIP" ? 500_000 : u.tier === "Business" ? 1_000_000 : 150_000, tierDefault: u.tier === "VIP" ? 500_000 : 150_000, cbkCeiling: 500_000 },
    { key: "dailyTransfer", label: "Daily transfer", current: u.tier === "VIP" ? 1_000_000 : 300_000, tierDefault: 300_000, cbkCeiling: 1_000_000 },
    { key: "monthlyVolume", label: "Monthly volume", current: u.tier === "VIP" ? 10_000_000 : u.tier === "Business" ? 20_000_000 : 1_500_000, tierDefault: 1_500_000, cbkCeiling: 50_000_000 },
    { key: "singleTx", label: "Single transaction", current: 500_000, tierDefault: 250_000, cbkCeiling: 500_000 },
  ];

  return { wallets, balances, txns, logins, devices, loans, cards, audit, kycStages, kycDocs, signals, alerts, limits };
}

export type Detail = ReturnType<typeof buildDetail>;
