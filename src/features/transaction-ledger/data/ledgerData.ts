/* ============================================================
   Page 9 — Transaction Ledger · data layer
   Immutable double-entry ledger across every rail.
   ============================================================ */

export type LedgerStatus = "Posted" | "Pending" | "Held" | "Reversed" | "Failed" | "Settling";
export type LedgerType = "Transfer" | "Deposit" | "Withdrawal" | "Payment" | "Fee" | "Reversal" | "FX" | "Settlement" | "Refund" | "Interest" | "Adjustment";
export type LedgerRail = "M-Pesa" | "Card (Visa)" | "Card (MC)" | "PesaLink" | "Internal" | "Bank" | "ATM" | "PayPal";

export interface LedgerEntry {
  id: string;
  journalId: string;
  time: string;
  type: LedgerType;
  rail: LedgerRail;
  debitAccount: string;
  creditAccount: string;
  userId: string;
  userName: string;
  counterparty: string;
  amount: number;
  fee: number;
  currency: "KES" | "USD" | "EUR";
  status: LedgerStatus;
  ref: string;
  narrative: string;
  county: string;
  fraudScore: number;
  batchId?: string;
  reversedBy?: string;
  holdReason?: string;
}

export interface JournalAccount {
  code: string;
  name: string;
  type: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
  balance: number;
  entries30d: number;
}

export interface HoldRecord {
  id: string;
  txnId: string;
  userName: string;
  amount: number;
  reason: string;
  heldBy: string;
  heldAt: string;
  expiresAt: string;
  status: "Active" | "Released" | "Converted";
}

export interface BatchJob {
  id: string;
  name: string;
  type: "Payroll" | "Settlement" | "Fee collection" | "Interest" | "Reversal batch" | "Partner payout";
  status: "Queued" | "Running" | "Completed" | "Failed" | "Paused";
  total: number;
  processed: number;
  failed: number;
  amount: number;
  started: string;
  owner: string;
}

export interface LedgerAudit {
  id: string;
  time: string;
  admin: string;
  action: string;
  target: string;
  detail: string;
  ip: string;
}

const NAMES = [
  "Amina Hassan", "Brian Otieno", "Lucy Muthoni", "David Kimani", "Fatuma Abdalla", "James Mutua",
  "Wanjiru Karanja", "Samuel Okello", "Naomi Chemtai", "Kevin Barasa", "Esther Njeri", "Collins Ouma",
  "Mercy Akinyi", "Patrick Kiptoo", "Zainab Ali", "Joseph Maina", "Beatrice Wairimu", "Dennis Mwangi",
  "Sharon Adhiambo", "Felix Mutiso", "Caroline Nyambura", "Anthony Wafula", "Rose Atieno", "Vincent Kariuki",
  "Grace Wanjiru", "Peter Njoroge", "Faith Chebet", "Michael Omondi", "Alice Wambui", "Tom Kiprono",
  "Mary Kamau", "Daniel Kibet", "Joyce Moraa", "Martin Muli", "Irene Jepkorir", "George Odhiambo",
  "Susan Chebet", "Henry Mutiso", "Pauline Achieng", "Isaac Kiprono",
];
const COUNTIES = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Uasin Gishu", "Kiambu", "Machakos", "Nyeri", "Kakamega", "Kilifi"];
const MERCHANTS = ["Naivas Supermarket", "Java House", "Total Kenya", "KPLC Prepaid", "DStv Kenya", "Jumia Kenya", "Carrefour", "Safaricom Airtime", "Nairobi Water", "Quickmart"];
const TYPES: LedgerType[] = ["Transfer", "Deposit", "Withdrawal", "Payment", "Fee", "FX", "Settlement", "Refund", "Interest", "Adjustment"];
const RAILS: LedgerRail[] = ["M-Pesa", "Card (Visa)", "Card (MC)", "PesaLink", "Internal", "Bank", "ATM", "PayPal"];
const STATUSES: LedgerStatus[] = ["Posted", "Posted", "Posted", "Posted", "Posted", "Pending", "Held", "Reversed", "Failed", "Settling", "Posted", "Posted"];
const ACCOUNTS = [
  "1000 Customer Wallets", "1100 M-Pesa Float", "1200 Card Settlement Pool", "1300 Bank Operating",
  "2000 Partner Payables", "2100 Tax Payable (KRA)", "3000 Equity", "4000 Fee Revenue",
  "4100 FX Margin Revenue", "5000 Cost of Rails", "5100 Operating Expense", "6000 Suspense",
];

const t0 = 14 * 3600 + 42 * 60;
const fmt = (sec: number) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export const LEDGER_ENTRIES: LedgerEntry[] = Array.from({ length: 40 }, (_, i) => {
  const type = TYPES[i % TYPES.length];
  const rail = RAILS[i % RAILS.length];
  const status = STATUSES[i % STATUSES.length];
  const amount = Math.round((1_200 + ((i * 47_311) % 940_000)) / 10) * 10;
  const fee = type === "Fee" ? amount : Math.max(0, Math.round(amount * 0.0045));
  const userName = NAMES[i % NAMES.length];
  const isMerchant = type === "Payment" || type === "Settlement";
  return {
    id: `TXN-${882900 - i * 11}`,
    journalId: `JRN-${20260800 + i}`,
    time: fmt(t0 - i * 47),
    type,
    rail,
    debitAccount: ACCOUNTS[i % 6],
    creditAccount: ACCOUNTS[(i + 3) % ACCOUNTS.length],
    userId: `USR-${(10000 + i * 733) % 99999}`,
    userName,
    counterparty: isMerchant ? MERCHANTS[i % MERCHANTS.length] : NAMES[(i + 7) % NAMES.length],
    amount: type === "Fee" ? fee : amount,
    fee: type === "Fee" ? 0 : fee,
    currency: i % 17 === 0 ? "USD" : i % 23 === 0 ? "EUR" : "KES",
    status,
    ref: `${rail.slice(0, 2).toUpperCase()}${748291 + i * 19}`,
    narrative: [
      "Customer wallet transfer via mobile app",
      "Merchant collection — POS checkout",
      "ATM cash withdrawal",
      "Bank deposit via PesaLink IPS",
      "Platform fee accrual",
      "FX conversion USD → KES",
      "Daily partner settlement file",
      "Customer refund — dispute upheld",
      "Savings interest credit",
      "Admin balance adjustment",
    ][i % 10],
    county: COUNTIES[i % COUNTIES.length],
    fraudScore: [4, 8, 12, 3, 22, 5, 63, 11, 9, 41, 6, 88, 14, 2, 31, 17, 55, 7, 13, 76][i % 20],
    batchId: i % 8 === 0 ? `BAT-${2200 + Math.floor(i / 8)}` : undefined,
    reversedBy: status === "Reversed" ? `REV-${8800 + i}` : undefined,
    holdReason: status === "Held" ? ["Velocity breach", "AML review", "New beneficiary", "Manual investigation"][i % 4] : undefined,
  };
});

export const JOURNAL_ACCOUNTS: JournalAccount[] = [
  { code: "1000", name: "Customer Wallets", type: "Liability", balance: 1_284_000_000, entries30d: 892_410 },
  { code: "1100", name: "M-Pesa Float (Safaricom)", type: "Asset", balance: 412_000_000, entries30d: 653_896 },
  { code: "1200", name: "Card Settlement Pool", type: "Asset", balance: 186_000_000, entries30d: 287_850 },
  { code: "1300", name: "Bank Operating — i&M", type: "Asset", balance: 98_000_000, entries30d: 12_440 },
  { code: "1310", name: "Bank Operating — KCB", type: "Asset", balance: 74_000_000, entries30d: 9_820 },
  { code: "2000", name: "Partner Payables", type: "Liability", balance: 42_300_000, entries30d: 18_442 },
  { code: "2100", name: "Tax Payable (KRA Excise)", type: "Liability", balance: 8_420_000, entries30d: 1_204 },
  { code: "2200", name: "Suspense — Unmatched", type: "Liability", balance: 1_840_000, entries30d: 148 },
  { code: "4000", name: "Transaction Fee Revenue", type: "Revenue", balance: 142_000_000, entries30d: 1_120_000 },
  { code: "4100", name: "FX Margin Revenue", type: "Revenue", balance: 4_500_000, entries30d: 12_400 },
  { code: "4200", name: "Card Interchange Revenue", type: "Revenue", balance: 18_500_000, entries30d: 287_850 },
  { code: "5000", name: "Rail Cost of Goods", type: "Expense", balance: 38_200_000, entries30d: 980_000 },
  { code: "5100", name: "Operating Expenses", type: "Expense", balance: 23_800_000, entries30d: 4_210 },
  { code: "6000", name: "Reversal Contra", type: "Expense", balance: 2_140_000, entries30d: 1_842 },
];

export const HOLDS: HoldRecord[] = [
  { id: "HLD-4412", txnId: "TXN-882812", userName: "David Kimani", amount: 610_000, reason: "Velocity multi-device breach", heldBy: "Fraud Engine v4.2", heldAt: "Today 14:28", expiresAt: "Today 18:28", status: "Active" },
  { id: "HLD-4411", txnId: "TXN-882790", userName: "Lucy Muthoni", amount: 1_250_000, reason: "AML structuring pattern", heldBy: "David Kiplagat", heldAt: "Today 13:15", expiresAt: "Tomorrow 13:15", status: "Active" },
  { id: "HLD-4410", txnId: "TXN-882745", userName: "Brian Otieno", amount: 340_000, reason: "New high-value beneficiary", heldBy: "Risk Engine", heldAt: "Today 11:42", expiresAt: "Today 17:42", status: "Active" },
  { id: "HLD-4409", txnId: "TXN-882701", userName: "Fatuma Abdalla", amount: 96_000, reason: "Impossible travel geo-velocity", heldBy: "Mary Wanjiku", heldAt: "Today 09:20", expiresAt: "Today 15:20", status: "Active" },
  { id: "HLD-4408", txnId: "TXN-882650", userName: "Kevin Barasa", amount: 145_000, reason: "Mule network graph hit", heldBy: "Fraud Ops", heldAt: "Yesterday 18:40", expiresAt: "Today 18:40", status: "Active" },
  { id: "HLD-4407", txnId: "TXN-882600", userName: "Samuel Okello", amount: 88_000, reason: "Manual investigation", heldBy: "James Odhiambo", heldAt: "Yesterday 14:10", expiresAt: "Released", status: "Released" },
  { id: "HLD-4406", txnId: "TXN-882550", userName: "Naomi Chemtai", amount: 210_000, reason: "Sanctions fuzzy match", heldBy: "Compliance", heldAt: "Yesterday 10:05", expiresAt: "Released", status: "Released" },
  { id: "HLD-4405", txnId: "TXN-882500", userName: "Collins Ouma", amount: 54_000, reason: "Rooted device emulator", heldBy: "Fraud Engine", heldAt: "2 days ago", expiresAt: "Converted", status: "Converted" },
];

export const BATCHES: BatchJob[] = [
  { id: "BAT-2210", name: "August payroll — Apex Capital", type: "Payroll", status: "Running", total: 1_240, processed: 892, failed: 3, amount: 48_200_000, started: "Today 14:00", owner: "Sarah Kamau" },
  { id: "BAT-2209", name: "Safaricom daily settlement", type: "Settlement", status: "Completed", total: 48_210, processed: 48_210, failed: 0, amount: 780_000_000, started: "Today 06:00", owner: "System" },
  { id: "BAT-2208", name: "Card fee collection T+2", type: "Fee collection", status: "Completed", total: 12_840, processed: 12_838, failed: 2, amount: 4_210_000, started: "Today 05:30", owner: "System" },
  { id: "BAT-2207", name: "QuickLend partner payout", type: "Partner payout", status: "Queued", total: 340, processed: 0, failed: 0, amount: 12_400_000, started: "—", owner: "James Odhiambo" },
  { id: "BAT-2206", name: "Savings interest credit Aug", type: "Interest", status: "Completed", total: 89_214, processed: 89_214, failed: 0, amount: 2_840_000, started: "01 Aug 02:00", owner: "System" },
  { id: "BAT-2205", name: "Duplicate charge reversals", type: "Reversal batch", status: "Paused", total: 48, processed: 22, failed: 1, amount: 1_240_000, started: "Yesterday 16:00", owner: "Mary Wanjiku" },
  { id: "BAT-2204", name: "Visa scheme settlement file", type: "Settlement", status: "Completed", total: 8_420, processed: 8_420, failed: 0, amount: 312_000_000, started: "Yesterday 04:00", owner: "System" },
  { id: "BAT-2203", name: "KRA excise remittance batch", type: "Fee collection", status: "Failed", total: 1, processed: 0, failed: 1, amount: 8_420_000, started: "22 Aug 10:00", owner: "Sarah Kamau" },
];

export const LEDGER_AUDIT: LedgerAudit[] = Array.from({ length: 20 }, (_, i) => ({
  id: `AUD-${88450 - i}`,
  time: i < 3 ? `${2 + i * 4} min ago` : i < 10 ? `${15 + i * 6} min ago` : `${1 + Math.floor(i / 5)}h ago`,
  admin: ["Joseph Mwangi", "Sarah Kamau", "Mary Wanjiku", "David Kiplagat", "James Odhiambo"][i % 5],
  action: ["Reversed transaction", "Placed hold", "Released hold", "Approved batch", "Exported journal", "Adjusted entry", "Flagged for SAR", "Settled break"][i % 8],
  target: `TXN-${882900 - i * 11}`,
  detail: [
    "Duplicate charge KES 12,400 corrected and refunded.",
    "Velocity multi-device — 4 fingerprints in 90s.",
    "Customer verified via registered number OTP.",
    "Payroll BAT-2210 approved — 1,240 disbursements.",
    "CSV export of 40,000 ledger rows — watermarked.",
    "Admin credit KES 5,000 — support goodwill.",
    "Structuring pattern — 14 deposits under threshold.",
    "KCB break KES 184,200 matched to late file.",
  ][i % 8],
  ip: `197.232.14.${40 + i}`,
}));

export const LEDGER_KPI = [
  { label: "Posted (24h)", value: "48,210", note: "KES 780M volume", icon: "bi-check2-circle", tone: "green" },
  { label: "Pending", value: "342", note: "awaiting rail callback", icon: "bi-hourglass-split", tone: "amber" },
  { label: "On hold", value: "5", note: "KES 2.44M locked", icon: "bi-pause-circle", tone: "blue" },
  { label: "Reversed (30d)", value: "1,842", note: "KES 2.14M refunded", icon: "bi-arrow-counterclockwise", tone: "violet" },
  { label: "Failed (24h)", value: "128", note: "0.27% of volume", icon: "bi-x-octagon", tone: "red" },
  { label: "Batches running", value: "1", note: "3 queued · 1 paused", icon: "bi-layers", tone: "blue" },
  { label: "Suspense balance", value: "KES 1.84M", note: "148 unmatched", icon: "bi-exclamation-diamond", tone: "amber" },
  { label: "Journal accounts", value: "14", note: "double-entry balanced", icon: "bi-journal-bookmark", tone: "green" },
];

export const RAIL_BREAKDOWN = [
  { rail: "M-Pesa", count: 24_120, volume: 420_000_000, success: 99.2, color: "#12b76a" },
  { rail: "Card (Visa)", count: 8_420, volume: 148_000_000, success: 99.8, color: "#2e90fa" },
  { rail: "Internal", count: 7_840, volume: 62_000_000, success: 99.9, color: "#16b364" },
  { rail: "PesaLink", count: 3_210, volume: 84_000_000, success: 99.1, color: "#0ba5ec" },
  { rail: "Card (MC)", count: 2_840, volume: 41_000_000, success: 99.7, color: "#f79009" },
  { rail: "Bank", count: 1_240, volume: 18_000_000, success: 98.5, color: "#7a5af8" },
  { rail: "ATM", count: 420, volume: 6_200_000, success: 97.8, color: "#98a2b3" },
  { rail: "PayPal", count: 120, volume: 800_000, success: 99.4, color: "#ee46bc" },
];
