/* ============================================================
   Page 11 — Settlement & Reconciliation · data layer
   Partner settlement runs, daily reconciliation, breaks,
   suspense ledger, statements, config and history.
   ============================================================ */

import { kes } from "../../../lib/format";

export type RunStatus = "Scheduled" | "Processing" | "In transit" | "Completed" | "Overdue" | "Failed" | "On hold";
export type RunType = "Pay-in" | "Pay-out" | "Card clearing" | "Bill commission" | "Loan settlement" | "Scheme fees" | "Partner payout";

export interface SettlementRun {
  id: string;
  partner: string;
  type: RunType;
  amount: number;
  txnCount: number;
  due: string;
  method: "M-Pesa B2C" | "RTGS" | "SWIFT" | "PesaLink" | "Internal journal" | "Visa netting" | "MC netting";
  pool: string;
  status: RunStatus;
  auto: boolean;
  reference?: string;
  preparedBy: string;
  variance?: number;
}

export const SETTLEMENT_RUNS: SettlementRun[] = [
  { id: "STR-8826", partner: "Safaricom (M-Pesa)", type: "Pay-in", amount: 12_400_000, txnCount: 23_456, due: "Today 16:00", method: "M-Pesa B2C", pool: "M-Pesa Float", status: "Scheduled", auto: true, preparedBy: "System" },
  { id: "STR-8825", partner: "KCB Bank", type: "Pay-out", amount: 8_700_000, txnCount: 3_456, due: "Today 16:00", method: "RTGS", pool: "Bank Operating — KCB", status: "Scheduled", auto: true, preparedBy: "System" },
  { id: "STR-8824", partner: "Visa Kenya", type: "Card clearing", amount: 4_200_000, txnCount: 8_901, due: "Tomorrow 10:00", method: "Visa netting", pool: "Card Settlement Pool", status: "Processing", auto: true, preparedBy: "System" },
  { id: "STR-8823", partner: "Mastercard EA", type: "Card clearing", amount: 2_800_000, txnCount: 5_670, due: "Tomorrow 10:00", method: "MC netting", pool: "Card Settlement Pool", status: "Scheduled", auto: true, preparedBy: "System" },
  { id: "STR-8822", partner: "QuickLend", type: "Loan settlement", amount: 2_100_000, txnCount: 1_234, due: "2 days ago 12:00", method: "Internal journal", pool: "Partner Settlement Pool", status: "Overdue", auto: false, preparedBy: "Sarah Kamau", variance: -45_000 },
  { id: "STR-8821", partner: "KPLC", type: "Bill commission", amount: 1_800_000, txnCount: 12_345, due: "25 Aug 10:00", method: "PesaLink", pool: "Partner Settlement Pool", status: "Scheduled", auto: true, preparedBy: "System" },
  { id: "STR-8820", partner: "Airtel Money", type: "Pay-in", amount: 940_000, txnCount: 3_890, due: "Today 17:30", method: "Internal journal", pool: "Main Operating", status: "On hold", auto: false, preparedBy: "David Kiplagat" },
  { id: "STR-8819", partner: "Equity Bank", type: "Pay-out", amount: 3_150_000, txnCount: 1_067, due: "Today 11:00", method: "RTGS", pool: "Bank Operating — i&M", status: "Completed", auto: true, reference: "EQY-RTG-77120", preparedBy: "System" },
  { id: "STR-8818", partner: "Co-op Bank", type: "Pay-out", amount: 1_620_000, txnCount: 812, due: "Today 11:00", method: "PesaLink", pool: "Bank Operating — KCB", status: "Completed", auto: true, reference: "COOP-EFT-33881", preparedBy: "System" },
  { id: "STR-8817", partner: "Safaricom (M-Pesa)", type: "Pay-out", amount: 14_200_000, txnCount: 28_900, due: "Yesterday 16:00", method: "M-Pesa B2C", pool: "M-Pesa Float", status: "Completed", auto: true, reference: "SFK-882341", preparedBy: "System" },
  { id: "STR-8816", partner: "Visa Kenya", type: "Scheme fees", amount: 620_000, txnCount: 1, due: "Yesterday 18:00", method: "Visa netting", pool: "Card Settlement Pool", status: "Completed", auto: true, reference: "VISA-SCM-5510", preparedBy: "System" },
  { id: "STR-8815", partner: "Nairobi Water", type: "Bill commission", amount: 420_000, txnCount: 5_210, due: "Yesterday 10:00", method: "PesaLink", pool: "Partner Settlement Pool", status: "Completed", auto: true, reference: "NWC-8842", preparedBy: "System" },
  { id: "STR-8814", partner: "DStv Kenya", type: "Bill commission", amount: 380_000, txnCount: 3_120, due: "22 Aug 10:00", method: "PesaLink", pool: "Partner Settlement Pool", status: "Failed", auto: true, preparedBy: "System" },
  { id: "STR-8813", partner: "Jumia Kenya", type: "Partner payout", amount: 2_340_000, txnCount: 486, due: "22 Aug 14:00", method: "RTGS", pool: "Partner Settlement Pool", status: "Completed", auto: false, reference: "JUM-PPO-9910", preparedBy: "James Odhiambo" },
  { id: "STR-8812", partner: "KCB Bank", type: "Pay-in", amount: 6_300_000, txnCount: 2_100, due: "22 Aug 16:00", method: "RTGS", pool: "Bank Operating — KCB", status: "Completed", auto: true, reference: "KCB-RTG-4451", preparedBy: "System" },
  { id: "STR-8811", partner: "QuickLend", type: "Loan settlement", amount: 1_980_000, txnCount: 1_102, due: "20 Aug 12:00", method: "Internal journal", pool: "Partner Settlement Pool", status: "Completed", auto: false, reference: "QLS-2026-118", preparedBy: "Sarah Kamau" },
];

/* ---------------- Daily reconciliation ---------------- */
export type ReconStatus = "Matched" | "Minor" | "Major" | "Investigating";
export interface ReconDay {
  date: string;
  expected: number;
  actual: number;
  variance: number;
  status: ReconStatus;
  channels: number;
  breaks: number;
  operator: string;
}
export const RECON_DAYS: ReconDay[] = [
  { date: "23 Aug 2026", expected: 186_400_000, actual: 186_200_000, variance: -200_000, status: "Investigating", channels: 7, breaks: 5, operator: "Auto" },
  { date: "22 Aug 2026", expected: 172_100_000, actual: 172_100_000, variance: 0, status: "Matched", channels: 7, breaks: 0, operator: "Auto" },
  { date: "21 Aug 2026", expected: 168_500_000, actual: 168_500_000, variance: 0, status: "Matched", channels: 7, breaks: 0, operator: "Auto" },
  { date: "20 Aug 2026", expected: 155_300_000, actual: 155_800_000, variance: 500_000, status: "Minor", channels: 7, breaks: 2, operator: "Sarah Kamau" },
  { date: "19 Aug 2026", expected: 149_200_000, actual: 149_200_000, variance: 0, status: "Matched", channels: 7, breaks: 0, operator: "Auto" },
  { date: "18 Aug 2026", expected: 151_800_000, actual: 151_100_000, variance: -700_000, status: "Major", channels: 7, breaks: 6, operator: "David Kiplagat" },
  { date: "17 Aug 2026", expected: 143_600_000, actual: 143_600_000, variance: 0, status: "Matched", channels: 7, breaks: 0, operator: "Auto" },
  { date: "16 Aug 2026", expected: 138_900_000, actual: 139_000_000, variance: 100_000, status: "Minor", channels: 7, breaks: 1, operator: "Auto" },
  { date: "15 Aug 2026", expected: 141_200_000, actual: 141_200_000, variance: 0, status: "Matched", channels: 7, breaks: 0, operator: "Auto" },
  { date: "14 Aug 2026", expected: 132_800_000, actual: 132_790_000, variance: -10_000, status: "Matched", channels: 7, breaks: 0, operator: "Auto" },
  { date: "13 Aug 2026", expected: 128_400_000, actual: 127_900_000, variance: -500_000, status: "Minor", channels: 7, breaks: 3, operator: "Sarah Kamau" },
  { date: "12 Aug 2026", expected: 125_100_000, actual: 125_100_000, variance: 0, status: "Matched", channels: 7, breaks: 0, operator: "Auto" },
  { date: "11 Aug 2026", expected: 122_600_000, actual: 122_600_000, variance: 0, status: "Matched", channels: 7, breaks: 0, operator: "Auto" },
  { date: "10 Aug 2026", expected: 119_800_000, actual: 119_750_000, variance: -50_000, status: "Minor", channels: 7, breaks: 1, operator: "Auto" },
];

export interface ReconChannel {
  channel: string;
  expected: number;
  actual: number;
  variance: number;
  txns: number;
  matchRate: number;
  color: string;
}
export const RECON_CHANNELS: ReconChannel[] = [
  { channel: "M-Pesa", expected: 82_300_000, actual: 82_200_000, variance: -100_000, txns: 45_670, matchRate: 99.88, color: "#12b76a" },
  { channel: "Cards (Visa)", expected: 28_400_000, actual: 28_400_000, variance: 0, txns: 12_340, matchRate: 100, color: "#2e90fa" },
  { channel: "Cards (MC)", expected: 18_200_000, actual: 18_200_000, variance: 0, txns: 8_900, matchRate: 100, color: "#f79009" },
  { channel: "Bank transfer", expected: 18_700_000, actual: 18_600_000, variance: -100_000, txns: 2_340, matchRate: 99.46, color: "#7a5af8" },
  { channel: "Internal", expected: 31_500_000, actual: 31_500_000, variance: 0, txns: 89_120, matchRate: 100, color: "#16b364" },
  { channel: "ATM", expected: 4_800_000, actual: 4_800_000, variance: 0, txns: 4_560, matchRate: 100, color: "#98a2b3" },
  { channel: "PesaLink", expected: 2_500_000, actual: 2_500_000, variance: 0, txns: 2_890, matchRate: 100, color: "#0ba5ec" },
];

/* ---------------- Breaks ---------------- */
export type BreakType = "Unmatched internal" | "Orphan partner record" | "Timing difference" | "Amount mismatch" | "Duplicate posting";
export type BreakStatus = "Open" | "Investigating" | "Escalated" | "Resolved";
export interface ReconBreak {
  id: string;
  date: string;
  channel: string;
  type: BreakType;
  txnRef: string;
  partnerRef: string;
  amount: number;
  ageDays: number;
  status: BreakStatus;
  assignedTo: string;
  suggestion: string;
}
export const BREAKS: ReconBreak[] = [
  { id: "BRK-4412", date: "23 Aug", channel: "M-Pesa", type: "Timing difference", txnRef: "TXN-882912", partnerRef: "SFK-882470", amount: 48_200, ageDays: 0, status: "Investigating", assignedTo: "Auto-retry 2/3", suggestion: "Wait for Safaricom EOD callback — retry at 18:30" },
  { id: "BRK-4411", date: "23 Aug", channel: "Bank transfer", type: "Amount mismatch", txnRef: "TXN-882877", partnerRef: "KCB-RTG-4451", amount: 100_000, ageDays: 0, status: "Open", assignedTo: "Unassigned", suggestion: "KCB fee deducted at source — post KES 100K adjustment" },
  { id: "BRK-4410", date: "23 Aug", channel: "M-Pesa", type: "Unmatched internal", txnRef: "TXN-882801", partnerRef: "—", amount: 36_500, ageDays: 0, status: "Open", assignedTo: "Unassigned", suggestion: "Create suspense — callback never arrived" },
  { id: "BRK-4409", date: "23 Aug", channel: "Card (Visa)", type: "Orphan partner record", txnRef: "—", partnerRef: "VISA-CLR-91022", amount: 12_400, ageDays: 0, status: "Open", assignedTo: "Unassigned", suggestion: "Match to auth-only TXN-882799 (not captured)" },
  { id: "BRK-4408", date: "23 Aug", channel: "M-Pesa", type: "Timing difference", txnRef: "TXN-882744", partnerRef: "SFK-882401", amount: 2_900, ageDays: 0, status: "Open", assignedTo: "Auto-retry 1/3", suggestion: "Batch cut-off straddle — expected by 20:00" },
  { id: "BRK-4407", date: "22 Aug", channel: "DStv", type: "Orphan partner record", txnRef: "—", partnerRef: "DTV-88110", amount: 380_000, ageDays: 1, status: "Escalated", assignedTo: "James Odhiambo", suggestion: "Biller API rejected batch STR-8814 — resettle" },
  { id: "BRK-4406", date: "22 Aug", channel: "QuickLend", type: "Amount mismatch", txnRef: "TXN-882650", partnerRef: "QLS-2026-117", amount: 45_000, ageDays: 1, status: "Escalated", assignedTo: "Sarah Kamau", suggestion: "Partner deducted buffer — finance approval needed" },
  { id: "BRK-4405", date: "21 Aug", channel: "Bank transfer", type: "Duplicate posting", txnRef: "TXN-882401", partnerRef: "EQY-RTG-77118/9", amount: 250_000, ageDays: 2, status: "Resolved", assignedTo: "David Kiplagat", suggestion: "Duplicate reversed via REV-2026-0451" },
  { id: "BRK-4404", date: "20 Aug", channel: "M-Pesa", type: "Unmatched internal", txnRef: "TXN-882300", partnerRef: "—", amount: 84_000, ageDays: 3, status: "Resolved", assignedTo: "Auto-retry 3/3", suggestion: "Callback received 3rd retry — auto-matched" },
  { id: "BRK-4403", date: "19 Aug", channel: "Card (MC)", type: "Amount mismatch", txnRef: "TXN-882150", partnerRef: "MC-CLR-88011", amount: 3_200, ageDays: 4, status: "Resolved", assignedTo: "Auto", suggestion: "FX rounding — auto-adjusted under threshold" },
  { id: "BRK-4402", date: "18 Aug", channel: "Bank transfer", type: "Orphan partner record", txnRef: "—", partnerRef: "KCB-RTG-4438", amount: 520_000, ageDays: 5, status: "Resolved", assignedTo: "David Kiplagat", suggestion: "Late file import — matched after statement upload" },
  { id: "BRK-4401", date: "18 Aug", channel: "M-Pesa", type: "Timing difference", txnRef: "TXN-882001", partnerRef: "SFK-881870", amount: 118_000, ageDays: 5, status: "Resolved", assignedTo: "Auto-retry 2/3", suggestion: "Matched on retry" },
  { id: "BRK-4400", date: "18 Aug", channel: "Internal", type: "Duplicate posting", txnRef: "TXN-881990", partnerRef: "INT-77120", amount: 62_000, ageDays: 5, status: "Resolved", assignedTo: "Auto", suggestion: "Idempotency key collision — reversed" },
];

/* ---------------- Suspense ledger ---------------- */
export interface SuspenseEntry {
  id: string;
  date: string;
  amount: number;
  reason: string;
  status: "Pending" | "Under review" | "Resolved";
  ageDays: number;
  resolution: string;
  createdBy: string;
}
export const SUSPENSE: SuspenseEntry[] = [
  { id: "SUS-1012", date: "23 Aug", amount: 100_000, reason: "M-Pesa timing difference — BRK-4412 group", status: "Pending", ageDays: 0, resolution: "Awaiting callback", createdBy: "Auto-recon" },
  { id: "SUS-1011", date: "23 Aug", amount: 36_500, reason: "Unmatched internal credit — BRK-4410", status: "Pending", ageDays: 0, resolution: "Investigation opened", createdBy: "Auto-recon" },
  { id: "SUS-1010", date: "19 Aug", amount: 500_000, reason: "Bank transfer mismatch — BRK-4402 group", status: "Under review", ageDays: 4, resolution: "Statement requested from KCB", createdBy: "Auto-recon" },
  { id: "SUS-1009", date: "18 Aug", amount: 84_000, reason: "M-Pesa batch straddle", status: "Resolved", ageDays: 5, resolution: "Released to settlement after retry", createdBy: "Auto-recon" },
  { id: "SUS-1008", date: "15 Aug", amount: 50_000, reason: "Card chargeback timing", status: "Resolved", ageDays: 8, resolution: "Reversed to card pool", createdBy: "Mary Wanjiku" },
  { id: "SUS-1007", date: "10 Aug", amount: 200_000, reason: "Duplicate M-Pesa credit", status: "Resolved", ageDays: 13, resolution: "Reversed — REV-2026-0431", createdBy: "Auto-recon" },
  { id: "SUS-1006", date: "08 Aug", amount: 12_400, reason: "Visa orphan auth record", status: "Resolved", ageDays: 15, resolution: "Matched and posted", createdBy: "David Kiplagat" },
  { id: "SUS-1005", date: "05 Aug", amount: 420_000, reason: "KPLC commission shortfall", status: "Resolved", ageDays: 18, resolution: "Biller credited shortfall", createdBy: "James Odhiambo" },
];
export const SUSPENSE_BALANCE = SUSPENSE.filter((s) => s.status !== "Resolved").reduce((sum, s) => sum + s.amount, 0);

/* ---------------- Bank statements ---------------- */
export interface StatementFile {
  id: string;
  bank: string;
  date: string;
  format: "MT940" | "CSV" | "OFX";
  entries: number;
  importedAt: string;
  status: "Imported" | "Processing" | "Failed" | "Awaiting";
  matched: number;
}
export const STATEMENTS: StatementFile[] = [
  { id: "STMT-3391", bank: "I&M Bank", date: "23 Aug 2026", format: "MT940", entries: 412, importedAt: "Today 13:40", status: "Imported", matched: 409 },
  { id: "STMT-3390", bank: "KCB", date: "23 Aug 2026", format: "MT940", entries: 288, importedAt: "Today 13:38", status: "Imported", matched: 286 },
  { id: "STMT-3389", bank: "Equity Bank", date: "23 Aug 2026", format: "CSV", entries: 194, importedAt: "Today 13:35", status: "Imported", matched: 194 },
  { id: "STMT-3388", bank: "Co-op Bank", date: "23 Aug 2026", format: "MT940", entries: 121, importedAt: "Today 13:31", status: "Processing", matched: 64 },
  { id: "STMT-3387", bank: "Safaricom Trust", date: "23 Aug 2026", format: "CSV", entries: 2_310, importedAt: "Today 12:55", status: "Imported", matched: 2_298 },
  { id: "STMT-3386", bank: "I&M Bank", date: "22 Aug 2026", format: "MT940", entries: 388, importedAt: "Yesterday 13:42", status: "Imported", matched: 388 },
  { id: "STMT-3385", bank: "KCB", date: "22 Aug 2026", format: "MT940", entries: 301, importedAt: "Yesterday 13:40", status: "Imported", matched: 301 },
  { id: "STMT-3384", bank: "DStv Trust", date: "22 Aug 2026", format: "OFX", entries: 48, importedAt: "Yesterday 09:12", status: "Failed", matched: 0 },
  { id: "STMT-3383", bank: "Equity Bank", date: "21 Aug 2026", format: "CSV", entries: 176, importedAt: "21 Aug 13:30", status: "Imported", matched: 176 },
];

/* ---------------- Settlement bank accounts ---------------- */
export interface BankAccount {
  id: string;
  bank: string;
  account: string;
  purpose: string;
  balance: number;
  pendingOut: number;
  lastStatement: string;
}
export const BANK_ACCOUNTS: BankAccount[] = [
  { id: "BAC-01", bank: "I&M Bank", account: "•••• 4821", purpose: "Main operating + RTGS out", balance: 98_000_000, pendingOut: 8_700_000, lastStatement: "Today 13:40" },
  { id: "BAC-02", bank: "KCB", account: "•••• 1177", purpose: "Operating float + PesaLink", balance: 74_000_000, pendingOut: 1_620_000, lastStatement: "Today 13:38" },
  { id: "BAC-03", bank: "Equity Bank", account: "•••• 6632", purpose: "Partner payouts", balance: 46_500_000, pendingOut: 2_340_000, lastStatement: "Today 13:35" },
  { id: "BAC-04", bank: "Co-op Bank", account: "•••• 2954", purpose: "Card settlement backup", balance: 22_800_000, pendingOut: 0, lastStatement: "Today 13:31" },
  { id: "BAC-05", bank: "Safaricom Trust", account: "•••• 0049", purpose: "M-Pesa float settlement", balance: 125_000_000, pendingOut: 12_400_000, lastStatement: "Today 12:55" },
];

/* ---------------- Auto-recon configuration ---------------- */
export interface ReconConfig {
  key: string;
  label: string;
  value: string;
  unit: string;
  hint: string;
  editable: boolean;
}
export const RECON_CONFIG: ReconConfig[] = [
  { key: "frequency", label: "Auto-reconcile frequency", value: "30", unit: "minutes", hint: "Engine pulls partner files on this cadence", editable: true },
  { key: "autoAccept", label: "Auto-accept threshold", value: "10,000", unit: "KES (< 0.01%)", hint: "Variances below this auto-close", editable: true },
  { key: "autoEscalate", label: "Auto-escalate threshold", value: "100,000", unit: "KES (> 0.1%)", hint: "Pages finance + Slack #treasury-alerts", editable: true },
  { key: "maxRetry", label: "Timing-difference retries", value: "3", unit: "attempts / 24h", hint: "Then auto-suspense", editable: true },
  { key: "suspense", label: "Auto-suspense window", value: "10K–100K", unit: "KES", hint: "Between accept and escalate thresholds", editable: false },
  { key: "notify", label: "Mismatch notification", value: "Email + Slack", unit: "", hint: "Finance team distribution list", editable: true },
  { key: "cutoff", label: "Reconciliation cut-off", value: "23:59", unit: "EAT daily", hint: "Books close for the day", editable: false },
  { key: "weekend", label: "Weekend / holiday handling", value: "Next business day", unit: "", hint: "Per CBK calendar", editable: false },
];

/* ---------------- Exception handling ---------------- */
export const EXCEPTIONS = [
  { type: "Insufficient float", count: 3, avgTime: "2 hours", process: "Auto-alert → Manual top-up", lastAt: "18 Aug — M-Pesa float" },
  { type: "Partner rejection", count: 1, avgTime: "4 hours", process: "Investigate → Correct → Resubmit", lastAt: "22 Aug — DStv OFX file" },
  { type: "Duplicate settlement", count: 0, avgTime: "—", process: "Auto-detected, blocked pre-flight", lastAt: "None in window" },
  { type: "Amount mismatch", count: 5, avgTime: "6 hours", process: "Reconcile → Adjust → Resettle", lastAt: "23 Aug — KCB fee at source" },
  { type: "Missing reference", count: 2, avgTime: "1 hour", process: "Contact partner → Match manually", lastAt: "19 Aug — Visa clearing" },
];

/* ---------------- KPI ---------------- */
export const SETTLEMENT_KPI = (o: { pending: number; pendingValue: number; breaks: number; suspense: number }) => [
  { label: "Pending settlements", value: String(o.pending), note: `${kes(o.pendingValue, { compact: true })} scheduled today`, icon: "bi-hourglass-split", tone: "amber" },
  { label: "Settled today", value: "8", note: `${kes(32_100_000, { compact: true })} · 0 failed`, icon: "bi-check2-circle", tone: "green" },
  { label: "Overdue", value: "1", note: "QuickLend — KES 2.1M · manual", icon: "bi-exclamation-octagon", tone: "red" },
  { label: "Settled (30d)", value: "KES 1.24B", note: "↑ 12% vs July", icon: "bi-bank", tone: "green" },
  { label: "Open breaks", value: String(o.breaks), note: "2 escalated · 3 fresh today", icon: "bi-intersect", tone: "amber" },
  { label: "Match rate (7d)", value: "99.93%", note: "auto-accept under KES 10K", icon: "bi-bullseye", tone: "green" },
  { label: "Suspense balance", value: kes(o.suspense, { compact: true }), note: "3 open entries", icon: "bi-pause-circle", tone: "blue" },
  { label: "Next auto-run", value: "16:00", note: "Safaricom + KCB files", icon: "bi-alarm", tone: "blue" },
];
