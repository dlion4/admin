/* ================================================================
   Page 21 — Product Configuration · data layer
   8 product config sets (~80 settings), segment/tier/user overrides,
   behaviour rules engine, environment promotion, version history,
   change-request approvals and a live config audit trail.
   ================================================================ */

export type ProductStatus = "Live" | "Beta" | "Frozen" | "Draft";

export type Product = {
  id: string;
  name: string;
  short: string;
  icon: string;
  color: string;
  category: string;
  status: ProductStatus;
  frozenNote?: string;
  owner: string;
  description: string;
  group: string;   // settings group label used in drawer
};

export type ValueKind = "currency" | "percent" | "seconds" | "number" | "boolean" | "text" | "list";

export type Setting = {
  id: string;
  productId: string;
  group: string;            // Limits / Fees / Behavior / Technical / Eligibility
  key: string;
  value: string;
  valueKind: ValueKind;
  min?: string;
  max?: string;
  editable: boolean;
  lockedReason?: string;
  frozen?: boolean;
  changed: string;
  changedBy: string;
  drift?: string;           // staging value differs
};

export type OverrideScope = "Segment" | "Tier" | "User" | "Merchant";
export type OverrideStatus = "Active" | "Frozen" | "Draft" | "Expired";

export type Override = {
  id: string;
  scope: OverrideScope;
  target: string;
  productId: string;
  settingKey: string;
  value: string;
  baseline: string;
  note: string;
  expires: string;
  status: OverrideStatus;
  created: string;
  createdBy: string;
  affected: number;
};

export type RuleKind = "Velocity" | "Cool-off" | "Blocklist" | "Limit" | "Automation";

export type Rule = {
  id: string;
  name: string;
  kind: RuleKind;
  productId: string;      // "all" for platform-wide
  trigger: string;
  action: string;
  scope: string;
  priority: number;
  enabled: boolean;
  hits30d: number;
  lastHit: string;
};

export type Environment = {
  id: "prod" | "staging" | "sandbox";
  name: string;
  note: string;
  lastPublish: string;
  publishedBy: string;
  locked: boolean;
  autoSync: boolean;
};

export type ConfigVersion = {
  id: string;
  date: string;
  admin: string;
  changes: number;
  note: string;
  scope: string;
  current?: boolean;
};

export type RequestStatus = "Pending" | "Approved" | "Rejected" | "Deployed";
export type ChangeRequest = {
  id: string;
  productId: string;
  settingKey: string;
  from: string;
  to: string;
  requestedBy: string;
  requestedAt: string;
  status: RequestStatus;
  risk: "Low" | "Medium" | "High";
  reason: string;
  approvals: { role: string; who: string; state: "Approved" | "Pending" | "Rejected" | "—" }[];
};

export type ProductAudit = {
  id: string; date: string; admin: string; area: string; change: string; from: string; to: string; reason: string;
};

/* ---------------- §21.0 product registry (8 config sets) ---------------- */
export const PRODUCTS: Product[] = [
  { id: "prod-mpesa", name: "M-Pesa Rail", short: "M-Pesa", icon: "bi-phone", color: "#12b76a", category: "Payments", status: "Live", owner: "P. Wanjiru", group: "Rail", description: "Safaricom Daraja rail — cash-in/out, STK push, B2C disbursements, callbacks and retries." },
  { id: "prod-cards", name: "Card Products", short: "Cards", icon: "bi-credit-card", color: "#2e90fa", category: "Cards", status: "Live", owner: "D. Kimani", group: "Cards", description: "Visa & Mastercard issuance, limits, contactless, 3-DS thresholds and fraud auto-lock." },
  { id: "prod-loans", name: "Micro-Loans", short: "Loans", icon: "bi-cash-coin", color: "#ee46bc", category: "Lending", status: "Live", owner: "C. Muthoni", group: "Lending", description: "Nano-loan amount bands, pricing, penalty, grace, eligibility gates and disbursement method." },
  { id: "prod-savings", name: "Savings Products", short: "Savings", icon: "bi-piggy-bank", color: "#16b364", category: "Savings", status: "Live", owner: "F. Hassan", group: "Savings", description: "Flexible pockets & locked goals — interest, accrual, round-ups and pocket limits." },
  { id: "prod-bank", name: "Bank Transfers", short: "Bank", icon: "bi-bank", color: "#7a5af8", category: "Banking", status: "Live", owner: "A. Otieno", group: "Banking", description: "RTGS/EFT/PesaLink rail selection, cutoffs, fees, retries and name verification." },
  { id: "prod-fx", name: "FX Exchange", short: "FX", icon: "bi-arrow-left-right", color: "#0ba5ec", category: "Remittance", status: "Live", owner: "S. Njoroge", group: "FX", description: "Currency basket, rate sourcing + margin, refresh cadence, holds and caps." },
  { id: "prod-bills", name: "Bill Payments", short: "Bills", icon: "bi-lightning-charge", color: "#f79009", category: "Utilities", status: "Live", owner: "M. Achieng", group: "Utilities", description: "234 billers, confirmation SLAs, fees, auto-refund and reminder channels." },
  { id: "prod-payroll", name: "Payroll Runs", short: "Payroll", icon: "bi-people", color: "#e04f16", category: "Business", status: "Beta", owner: "R. Barasa", group: "Business", description: "Bulk salary runs — cutoffs, per-employee fees, retries, approvals and retention." },
];

/* ---------------- §21.1–21.7 settings library (~80 rows) ---------------- */
export const SETTINGS: Setting[] = [
  /* M-Pesa (9) */
  { id: "PCF-MP-01", productId: "prod-mpesa", group: "Limits", key: "Max cash-in per transaction", value: "KES 150,000", valueKind: "currency", min: "KES 1,000", max: "KES 300,000", editable: true, changed: "Jan 2025", changedBy: "J. Mwangi" },
  { id: "PCF-MP-02", productId: "prod-mpesa", group: "Limits", key: "Daily cash-in limit (per user)", value: "KES 300,000", valueKind: "currency", min: "KES 10,000", max: "KES 1,000,000", editable: true, changed: "Jan 2025", changedBy: "J. Mwangi", drift: "KES 350,000" },
  { id: "PCF-MP-03", productId: "prod-mpesa", group: "Limits", key: "Max cash-out per transaction", value: "KES 70,000", valueKind: "currency", min: "KES 1,000", max: "KES 150,000", editable: true, changed: "Jan 2025", changedBy: "J. Mwangi" },
  { id: "PCF-MP-04", productId: "prod-mpesa", group: "Rail", key: "Business till number", value: "123456", valueKind: "text", editable: false, lockedReason: "Provisioned with Safaricom", changed: "Mar 2022", changedBy: "System" },
  { id: "PCF-MP-05", productId: "prod-mpesa", group: "Rail", key: "Paybill number", value: "456789", valueKind: "text", editable: false, lockedReason: "Provisioned with Safaricom", changed: "Mar 2022", changedBy: "System" },
  { id: "PCF-MP-06", productId: "prod-mpesa", group: "Technical", key: "Callback timeout", value: "30 seconds", valueKind: "seconds", min: "10s", max: "120s", editable: true, changed: "Aug 2026", changedBy: "Ops Manager" },
  { id: "PCF-MP-07", productId: "prod-mpesa", group: "Technical", key: "Max retries on failure", value: "3", valueKind: "number", min: "0", max: "5", editable: true, changed: "Jan 2025", changedBy: "J. Mwangi" },
  { id: "PCF-MP-08", productId: "prod-mpesa", group: "Technical", key: "STK push timeout", value: "60 seconds", valueKind: "seconds", min: "30s", max: "120s", editable: true, changed: "Jan 2025", changedBy: "J. Mwangi" },
  { id: "PCF-MP-09", productId: "prod-mpesa", group: "Behavior", key: "Allow reverse on timeout", value: "Yes", valueKind: "boolean", editable: true, changed: "Jan 2025", changedBy: "J. Mwangi" },
  /* Cards (13) */
  { id: "PCF-CD-01", productId: "prod-cards", group: "Rail", key: "Visa BIN range", value: "412345–412399", valueKind: "text", editable: false, lockedReason: "Assigned by Visa", changed: "Jun 2022", changedBy: "System" },
  { id: "PCF-CD-02", productId: "prod-cards", group: "Rail", key: "Mastercard BIN range", value: "530012–530050", valueKind: "text", editable: false, lockedReason: "Assigned by Mastercard", changed: "Jun 2022", changedBy: "System" },
  { id: "PCF-CD-03", productId: "prod-cards", group: "Limits", key: "Default card limit (monthly)", value: "KES 500,000", valueKind: "currency", min: "KES 50,000", max: "KES 2,000,000", editable: true, changed: "Jul 2026", changedBy: "D. Kimani" },
  { id: "PCF-CD-04", productId: "prod-cards", group: "Limits", key: "Max card limit (monthly, VIP)", value: "KES 5,000,000", valueKind: "currency", min: "KES 500,000", max: "KES 10,000,000", editable: true, changed: "Jul 2026", changedBy: "D. Kimani" },
  { id: "PCF-CD-05", productId: "prod-cards", group: "Fees", key: "Physical card issuance fee", value: "KES 500", valueKind: "currency", min: "KES 0", max: "KES 2,500", editable: true, changed: "Feb 2026", changedBy: "Finance" },
  { id: "PCF-CD-06", productId: "prod-cards", group: "Fees", key: "Virtual card issuance fee", value: "KES 0", valueKind: "currency", min: "KES 0", max: "KES 500", editable: true, changed: "Feb 2024", changedBy: "Finance" },
  { id: "PCF-CD-07", productId: "prod-cards", group: "Behavior", key: "Allow international transactions", value: "Yes", valueKind: "boolean", editable: true, changed: "May 2026", changedBy: "D. Kimani" },
  { id: "PCF-CD-08", productId: "prod-cards", group: "Limits", key: "International daily limit", value: "KES 1,000,000", valueKind: "currency", min: "KES 10,000", max: "KES 5,000,000", editable: true, changed: "May 2026", changedBy: "D. Kimani" },
  { id: "PCF-CD-09", productId: "prod-cards", group: "Limits", key: "Contactless per-txn limit", value: "KES 5,000", valueKind: "currency", min: "KES 500", max: "KES 10,000", editable: true, changed: "Aug 20", changedBy: "Joseph M." },
  { id: "PCF-CD-10", productId: "prod-cards", group: "Limits", key: "Online transaction limit", value: "KES 200,000 / day", valueKind: "currency", min: "KES 10,000", max: "KES 1,000,000", editable: true, changed: "Apr 2026", changedBy: "D. Kimani", drift: "KES 250,000 / day" },
  { id: "PCF-CD-11", productId: "prod-cards", group: "Behavior", key: "3D Secure required above", value: "KES 5,000", valueKind: "currency", min: "KES 0", max: "KES 50,000", editable: true, changed: "Jan 2025", changedBy: "Risk" },
  { id: "PCF-CD-12", productId: "prod-cards", group: "Behavior", key: "Auto-lock card on fraud signal", value: "Yes — immediate", valueKind: "boolean", editable: true, changed: "Nov 2025", changedBy: "V. Kiprop" },
  { id: "PCF-CD-13", productId: "prod-cards", group: "Fees", key: "Card replacement fee", value: "KES 300", valueKind: "currency", min: "KES 0", max: "KES 1,500", editable: true, changed: "Feb 2026", changedBy: "Finance" },
  /* Loans (14) */
  { id: "PCF-LN-01", productId: "prod-loans", group: "Limits", key: "Minimum loan amount", value: "KES 1,000", valueKind: "currency", min: "KES 500", max: "KES 10,000", editable: true, changed: "Jan 2023", changedBy: "C. Muthoni" },
  { id: "PCF-LN-02", productId: "prod-loans", group: "Limits", key: "Maximum loan amount", value: "KES 500,000", valueKind: "currency", min: "KES 100,000", max: "KES 1,000,000", editable: true, changed: "Aug 22", changedBy: "Finance Mgr" },
  { id: "PCF-LN-03", productId: "prod-loans", group: "Fees", key: "Interest rate range", value: "4–8% monthly", valueKind: "percent", min: "1%", max: "10%", editable: true, changed: "Aug 01", changedBy: "C. Muthoni" },
  { id: "PCF-LN-04", productId: "prod-loans", group: "Behavior", key: "Loan term options", value: "7, 14, 30, 60, 90 days", valueKind: "list", editable: true, changed: "Mar 2026", changedBy: "C. Muthoni" },
  { id: "PCF-LN-05", productId: "prod-loans", group: "Fees", key: "Default penalty rate", value: "2% monthly on overdue", valueKind: "percent", min: "0%", max: "5%", editable: true, changed: "Jan 2023", changedBy: "C. Muthoni" },
  { id: "PCF-LN-06", productId: "prod-loans", group: "Behavior", key: "Grace period", value: "3 days", valueKind: "number", min: "0", max: "14 days", editable: true, changed: "Jan 2023", changedBy: "C. Muthoni", drift: "5 days" },
  { id: "PCF-LN-07", productId: "prod-loans", group: "Behavior", key: "Auto-deduct from wallet balance", value: "Yes", valueKind: "boolean", editable: true, changed: "Jan 2023", changedBy: "C. Muthoni" },
  { id: "PCF-LN-08", productId: "prod-loans", group: "Eligibility", key: "Credit score minimum", value: "300", valueKind: "number", min: "250", max: "600", editable: true, changed: "Aug 2026", changedBy: "V. Kiprop" },
  { id: "PCF-LN-09", productId: "prod-loans", group: "Eligibility", key: "Min account age", value: "90 days", valueKind: "number", min: "30", max: "365 days", editable: true, changed: "Jan 2023", changedBy: "C. Muthoni" },
  { id: "PCF-LN-10", productId: "prod-loans", group: "Eligibility", key: "Min transaction history", value: "10 transactions", valueKind: "number", min: "0", max: "50", editable: true, changed: "Jan 2023", changedBy: "C. Muthoni" },
  { id: "PCF-LN-11", productId: "prod-loans", group: "Limits", key: "Max active loans per user", value: "1", valueKind: "number", min: "1", max: "3", editable: true, changed: "Jan 2023", changedBy: "C. Muthoni" },
  { id: "PCF-LN-12", productId: "prod-loans", group: "Behavior", key: "Disbursement method", value: "PayMo wallet only", valueKind: "list", editable: true, changed: "Jan 2023", changedBy: "C. Muthoni" },
  { id: "PCF-LN-13", productId: "prod-loans", group: "Fees", key: "Prepayment penalty", value: "None", valueKind: "text", editable: true, changed: "Jan 2023", changedBy: "Finance" },
  { id: "PCF-LN-14", productId: "prod-loans", group: "Behavior", key: "Loan top-up allowed", value: "No", valueKind: "boolean", editable: true, changed: "Jan 2023", changedBy: "C. Muthoni" },
  /* Savings (12) */
  { id: "PCF-SV-01", productId: "prod-savings", group: "Fees", key: "Interest rate (APY)", value: "8.5%", valueKind: "percent", min: "0%", max: "14%", editable: true, changed: "Aug 10", changedBy: "Finance Mgr" },
  { id: "PCF-SV-02", productId: "prod-savings", group: "Behavior", key: "Interest calculation", value: "Daily balance, monthly credit", valueKind: "list", editable: true, changed: "Sep 2023", changedBy: "F. Hassan" },
  { id: "PCF-SV-03", productId: "prod-savings", group: "Limits", key: "Min balance to earn interest", value: "KES 100", valueKind: "currency", min: "KES 0", max: "KES 10,000", editable: true, changed: "Sep 2023", changedBy: "F. Hassan" },
  { id: "PCF-SV-04", productId: "prod-savings", group: "Limits", key: "Max balance for interest", value: "KES 1,000,000", valueKind: "currency", min: "KES 100,000", max: "KES 5,000,000", editable: true, changed: "Jul 2026", changedBy: "ALCO" },
  { id: "PCF-SV-05", productId: "prod-savings", group: "Limits", key: "Minimum deposit", value: "KES 50", valueKind: "currency", min: "KES 10", max: "KES 1,000", editable: true, changed: "Sep 2023", changedBy: "F. Hassan" },
  { id: "PCF-SV-06", productId: "prod-savings", group: "Limits", key: "Max deposits per month", value: "Unlimited", valueKind: "text", editable: true, changed: "Sep 2023", changedBy: "F. Hassan" },
  { id: "PCF-SV-07", productId: "prod-savings", group: "Behavior", key: "Withdrawal restrictions", value: "None", valueKind: "list", editable: true, changed: "Sep 2023", changedBy: "F. Hassan" },
  { id: "PCF-SV-08", productId: "prod-savings", group: "Fees", key: "Tax on interest", value: "15% WHT", valueKind: "percent", editable: false, lockedReason: "Regulatory — Income Tax Act", changed: "Sep 2023", changedBy: "Statute" },
  { id: "PCF-SV-09", productId: "prod-savings", group: "Behavior", key: "Auto-save (round-up)", value: "Yes", valueKind: "boolean", editable: true, changed: "Jun 2024", changedBy: "F. Hassan" },
  { id: "PCF-SV-10", productId: "prod-savings", group: "Behavior", key: "Round-up target", value: "Nearest KES 100", valueKind: "list", editable: true, changed: "Jun 2024", changedBy: "F. Hassan" },
  { id: "PCF-SV-11", productId: "prod-savings", group: "Behavior", key: "Goal-based savings", value: "Yes", valueKind: "boolean", editable: true, changed: "Jun 2024", changedBy: "F. Hassan" },
  { id: "PCF-SV-12", productId: "prod-savings", group: "Limits", key: "Savings pockets per user", value: "Max 5", valueKind: "number", min: "1", max: "20", editable: true, changed: "Jun 2024", changedBy: "F. Hassan" },
  /* Bank transfers (9) */
  { id: "PCF-BK-01", productId: "prod-bank", group: "Rail", key: "Supported banks", value: "KCB, Equity, NBK, Co-op, Absa, NCBA, Stanbic, SBM", valueKind: "list", editable: true, changed: "Aug 2026", changedBy: "A. Otieno" },
  { id: "PCF-BK-02", productId: "prod-bank", group: "Behavior", key: "Transfer methods", value: "RTGS (same day), EFT (T+1), PesaLink (instant)", valueKind: "list", editable: true, changed: "Jan 2026", changedBy: "A. Otieno" },
  { id: "PCF-BK-03", productId: "prod-bank", group: "Limits", key: "Min transfer amount", value: "KES 100", valueKind: "currency", min: "KES 10", max: "KES 10,000", editable: true, changed: "May 2022", changedBy: "A. Otieno" },
  { id: "PCF-BK-04", productId: "prod-bank", group: "Limits", key: "Max transfer amount", value: "KES 5,000,000", valueKind: "currency", min: "KES 1,000,000", max: "KES 10,000,000", editable: true, changed: "Aug 10", changedBy: "A. Otieno" },
  { id: "PCF-BK-05", productId: "prod-bank", group: "Technical", key: "RTGS cutoff time", value: "14:00 EAT", valueKind: "text", editable: true, changed: "Jan 2026", changedBy: "A. Otieno" },
  { id: "PCF-BK-06", productId: "prod-bank", group: "Fees", key: "RTGS fee", value: "KES 500 flat", valueKind: "currency", min: "KES 0", max: "KES 2,500", editable: true, changed: "Jan 2026", changedBy: "Finance" },
  { id: "PCF-BK-07", productId: "prod-bank", group: "Fees", key: "EFT fee", value: "KES 100 flat", valueKind: "currency", min: "KES 0", max: "KES 500", editable: true, changed: "Jan 2026", changedBy: "Finance" },
  { id: "PCF-BK-08", productId: "prod-bank", group: "Technical", key: "Auto-retry on failure", value: "Yes — 1 retry", valueKind: "boolean", editable: true, changed: "Mar 2026", changedBy: "A. Otieno", drift: "Yes — 2 retries" },
  { id: "PCF-BK-09", productId: "prod-bank", group: "Behavior", key: "Name verification before send", value: "Yes", valueKind: "boolean", editable: true, changed: "May 2022", changedBy: "Risk" },
  /* FX (7) */
  { id: "PCF-FX-01", productId: "prod-fx", group: "Rail", key: "Supported currencies", value: "USD, EUR, GBP, TZS, UGX", valueKind: "list", editable: true, changed: "Aug 06", changedBy: "S. Njoroge" },
  { id: "PCF-FX-02", productId: "prod-fx", group: "Behavior", key: "Rate source", value: "CBK mid-rate + margin", valueKind: "list", editable: true, changed: "Jan 2024", changedBy: "S. Njoroge" },
  { id: "PCF-FX-03", productId: "prod-fx", group: "Fees", key: "FX margin", value: "1.5%", valueKind: "percent", min: "0.5%", max: "3.5%", editable: true, changed: "Jan 2024", changedBy: "ALCO" },
  { id: "PCF-FX-04", productId: "prod-fx", group: "Fees", key: "FX fee", value: "3.0% of transaction", valueKind: "percent", min: "0%", max: "6%", editable: true, changed: "Jan 2024", changedBy: "Finance", drift: "2.5% of transaction" },
  { id: "PCF-FX-05", productId: "prod-fx", group: "Technical", key: "Rate refresh interval", value: "60 seconds", valueKind: "seconds", min: "15s", max: "300s", editable: true, changed: "Jan 2024", changedBy: "S. Njoroge" },
  { id: "PCF-FX-06", productId: "prod-fx", group: "Limits", key: "Max FX transaction", value: "KES 5,000,000 equivalent", valueKind: "currency", min: "KES 100,000", max: "KES 20,000,000", editable: true, changed: "Jan 2024", changedBy: "S. Njoroge" },
  { id: "PCF-FX-07", productId: "prod-fx", group: "Technical", key: "Quote hold period", value: "30 seconds", valueKind: "seconds", min: "10s", max: "120s", editable: true, changed: "Jan 2024", changedBy: "S. Njoroge" },
  /* Bills (7) */
  { id: "PCF-BL-01", productId: "prod-bills", group: "Rail", key: "Supported billers", value: "234 billers", valueKind: "list", editable: true, changed: "Aug 18", changedBy: "M. Achieng" },
  { id: "PCF-BL-02", productId: "prod-bills", group: "Behavior", key: "Payment confirmation SLA", value: "Instant (most) · 24h (some govt)", valueKind: "list", editable: true, changed: "Apr 2026", changedBy: "M. Achieng" },
  { id: "PCF-BL-03", productId: "prod-bills", group: "Fees", key: "Bill payment fee", value: "1.0% (min KES 10)", valueKind: "percent", min: "0%", max: "3%", editable: true, changed: "Apr 2022", changedBy: "Finance" },
  { id: "PCF-BL-04", productId: "prod-bills", group: "Behavior", key: "Failed payment auto-refund", value: "Within 24h", valueKind: "list", editable: true, changed: "Apr 2022", changedBy: "M. Achieng" },
  { id: "PCF-BL-05", productId: "prod-bills", group: "Behavior", key: "Bill reminders", value: "Push + SMS (opt-in)", valueKind: "list", editable: true, changed: "Sep 2025", changedBy: "M. Achieng" },
  { id: "PCF-BL-06", productId: "prod-bills", group: "Behavior", key: "Auto-pay", value: "Yes — user setup", valueKind: "boolean", editable: true, changed: "Sep 2025", changedBy: "M. Achieng" },
  { id: "PCF-BL-07", productId: "prod-bills", group: "Limits", key: "Auto-pay monthly cap", value: "KES 400,000 / user", valueKind: "currency", min: "KES 50,000", max: "KES 2,000,000", editable: true, changed: "Sep 2025", changedBy: "Risk", drift: "KES 500,000 / user" },
  /* Payroll (6) */
  { id: "PCF-PR-01", productId: "prod-payroll", group: "Technical", key: "Payroll run cutoff", value: "16:00 EAT (T-1)", valueKind: "text", editable: true, changed: "Mar 2024", changedBy: "R. Barasa" },
  { id: "PCF-PR-02", productId: "prod-payroll", group: "Limits", key: "Max employees per run", value: "2,000", valueKind: "number", min: "10", max: "10,000", editable: true, changed: "Mar 2024", changedBy: "R. Barasa" },
  { id: "PCF-PR-03", productId: "prod-payroll", group: "Fees", key: "Fee per employee", value: "KES 50 / month", valueKind: "currency", min: "KES 10", max: "KES 250", editable: true, changed: "Mar 2024", changedBy: "Finance" },
  { id: "PCF-PR-04", productId: "prod-payroll", group: "Technical", key: "Failed disbursement retry", value: "Next run · manual review > 5", valueKind: "list", editable: true, changed: "Mar 2024", changedBy: "R. Barasa" },
  { id: "PCF-PR-05", productId: "prod-payroll", group: "Behavior", key: "Payslip retention", value: "7 years (statutory)", valueKind: "text", editable: false, lockedReason: "Regulatory — Records Act", changed: "Mar 2024", changedBy: "Statute" },
  { id: "PCF-PR-06", productId: "prod-payroll", group: "Behavior", key: "Dual approval above", value: "KES 2,000,000 / run", valueKind: "currency", min: "KES 500,000", max: "KES 20,000,000", editable: true, changed: "Mar 2024", changedBy: "Risk" },
];

/* ---------------- §21.x overrides (segment / tier / user / merchant) ---------------- */
export const OVERRIDES: Override[] = [
  { id: "OVR-01", scope: "Tier", target: "VIP", productId: "prod-cards", settingKey: "Max card limit (monthly, VIP)", value: "KES 5,000,000", baseline: "KES 500,000", note: "Contracted VIP card programme", expires: "Rolling", status: "Active", created: "Jul 2026", createdBy: "D. Kimani", affected: 1240 },
  { id: "OVR-02", scope: "Segment", target: "Students (18–25, verified)", productId: "prod-loans", settingKey: "Interest rate range", value: "3.5% monthly", baseline: "4–8% monthly", note: "Student lending pilot — subsidised", expires: "Dec 2026", status: "Active", created: "Jun 2026", createdBy: "C. Muthoni", affected: 8420 },
  { id: "OVR-03", scope: "User", target: "U-84920 · Amina H.", productId: "prod-mpesa", settingKey: "Daily cash-in limit (per user)", value: "KES 700,000", baseline: "KES 300,000", note: "High-value trader, enhanced KYC on file", expires: "Feb 2027", status: "Active", created: "May 2026", createdBy: "J. Mwangi", affected: 1 },
  { id: "OVR-04", scope: "Merchant", target: "M-2201 · Webshop ke", productId: "prod-cards", settingKey: "Online transaction limit", value: "KES 850,000 / day", baseline: "KES 200,000 / day", note: "E-commerce settlement contract", expires: "Rolling", status: "Active", created: "Jul 2026", createdBy: "P. Wanjiru", affected: 1 },
  { id: "OVR-05", scope: "Tier", target: "Business Pro", productId: "prod-bank", settingKey: "Max transfer amount", value: "KES 10,000,000", baseline: "KES 5,000,000", note: "Business tier benefit", expires: "Rolling", status: "Active", created: "Aug 2025", createdBy: "R. Barasa", affected: 610 },
  { id: "OVR-06", scope: "Segment", target: "New users (< 30 days)", productId: "prod-loans", settingKey: "Maximum loan amount", value: "KES 15,000", baseline: "KES 500,000", note: "Guardrail until history builds", expires: "Rolling", status: "Active", created: "Feb 2023", createdBy: "V. Kiprop", affected: 21400 },
  { id: "OVR-07", scope: "Segment", target: "Under-25 savers", productId: "prod-savings", settingKey: "Round-up target", value: "Nearest KES 50", baseline: "Nearest KES 100", note: "Youth saving habit study", expires: "Nov 2026", status: "Active", created: "Jul 2026", createdBy: "F. Hassan", affected: 38200 },
  { id: "OVR-08", scope: "User", target: "U-112049 · B. Kimathi", productId: "prod-fx", settingKey: "Max FX transaction", value: "KES 8,000,000", baseline: "KES 5,000,000", note: "Import business, treasury-reviewed", expires: "Sep 2026", status: "Frozen", created: "Apr 2026", createdBy: "S. Njoroge", affected: 1 },
  { id: "OVR-09", scope: "Segment", target: "Staff accounts", productId: "prod-cards", settingKey: "Allow international transactions", value: "No", baseline: "Yes", note: "Insider-risk policy", expires: "Rolling", status: "Active", created: "Jan 2023", createdBy: "N. Wafula", affected: 214 },
  { id: "OVR-10", scope: "Merchant", target: "M-881 · Utility Point", productId: "prod-bills", settingKey: "Auto-pay monthly cap", value: "KES 250,000 / user", baseline: "KES 400,000 / user", note: "Reseller arrangement", expires: "Jan 2027", status: "Active", created: "Mar 2026", createdBy: "M. Achieng", affected: 1 },
  { id: "OVR-11", scope: "Tier", target: "Silver", productId: "prod-mpesa", settingKey: "Max cash-in per transaction", value: "KES 70,000", baseline: "KES 150,000", note: "KYC tier alignment", expires: "Rolling", status: "Active", created: "Jan 2025", createdBy: "J. Mwangi", affected: 74800 },
  { id: "OVR-12", scope: "Segment", target: "Chama groups", productId: "prod-savings", settingKey: "Savings pockets per user", value: "Max 10", baseline: "Max 5", note: "Group treasury pockets", expires: "Rolling", status: "Active", created: "Aug 2023", createdBy: "R. Barasa", affected: 14300 },
  { id: "OVR-13", scope: "User", target: "U-90311 · Grace W.", productId: "prod-loans", settingKey: "Grace period", value: "7 days", baseline: "3 days", note: "Hardship programme — case HW-2231", expires: "Aug 18", status: "Expired", created: "May 2026", createdBy: "C. Muthoni", affected: 1 },
  { id: "OVR-14", scope: "Segment", target: "Farmers (seasonal)", productId: "prod-loans", settingKey: "Default penalty rate", value: "1% monthly", baseline: "2% monthly", note: "Harvest-cycle repayment pattern", expires: "Mar 2027", status: "Active", created: "Feb 2026", createdBy: "C. Muthoni", affected: 5900 },
  { id: "OVR-15", scope: "Merchant", target: "M-145 · GreenGrocers", productId: "prod-bank", settingKey: "RTGS fee", value: "KES 0", baseline: "KES 500 flat", note: "Enterprise contract 2026", expires: "Dec 2026", status: "Active", created: "Jan 2026", createdBy: "R. Barasa", affected: 1 },
  { id: "OVR-16", scope: "Tier", target: "Beta testers", productId: "prod-payroll", settingKey: "Fee per employee", value: "KES 35 / month", baseline: "KES 50 / month", note: "Open-beta incentive", expires: "Nov 2026", status: "Draft", created: "Aug 2026", createdBy: "R. Barasa", affected: 3900 },
];

/* ---------------- behaviour rules engine ---------------- */
export const RULES: Rule[] = [
  { id: "RL-01", name: "Cash-out velocity step-up", kind: "Velocity", productId: "prod-mpesa", trigger: "> 10 cash-outs / hour / user", action: "Require OTP step-up on next cash-out", scope: "All users", priority: 90, enabled: true, hits30d: 1204, lastHit: "Aug 22" },
  { id: "RL-02", name: "New-device cool-off", kind: "Cool-off", productId: "all", trigger: "First login from new device", action: "Block transfers for 30 minutes", scope: "All users", priority: 95, enabled: true, hits30d: 3410, lastHit: "Aug 23" },
  { id: "RL-03", name: "Minor gambling block", kind: "Blocklist", productId: "prod-cards", trigger: "MCC 7995 · cardholder under 21", action: "Decline transaction", scope: "Cards — under 21", priority: 99, enabled: true, hits30d: 89, lastHit: "Aug 21" },
  { id: "RL-04", name: "Loan retry cool-off", kind: "Cool-off", productId: "prod-loans", trigger: "Loan application declined", action: "7-day cool-off before re-apply", scope: "Loans", priority: 70, enabled: true, hits30d: 512, lastHit: "Aug 23" },
  { id: "RL-05", name: "Fraud auto-freeze", kind: "Automation", productId: "prod-cards", trigger: "3 fraud signals in 24h", action: "Freeze card + notify user + create case", scope: "All cards", priority: 98, enabled: true, hits30d: 67, lastHit: "Aug 22" },
  { id: "RL-06", name: "Large FX review", kind: "Limit", productId: "prod-fx", trigger: "FX > KES 2M / day / user", action: "Route to manual treasury review", scope: "FX", priority: 80, enabled: true, hits30d: 41, lastHit: "Aug 19" },
  { id: "RL-07", name: "Auto-pay biller cap", kind: "Limit", productId: "prod-bills", trigger: "> 3 billers on auto-pay / day", action: "Pause auto-pay until user confirms", scope: "Bills", priority: 60, enabled: true, hits30d: 288, lastHit: "Aug 20" },
  { id: "RL-08", name: "Loan top-up gap", kind: "Cool-off", productId: "prod-loans", trigger: "Top-up request within 24h of drawdown", action: "Hold request 24h", scope: "Loans", priority: 40, enabled: false, hits30d: 0, lastHit: "—" },
  { id: "RL-09", name: "Sanctioned-country e-comm", kind: "Blocklist", productId: "prod-cards", trigger: "Card e-comm merchant country sanctioned", action: "Decline + file TMS report", scope: "Cards — intl", priority: 99, enabled: true, hits30d: 12, lastHit: "Aug 14" },
  { id: "RL-10", name: "Idle balance nudge", kind: "Automation", productId: "prod-savings", trigger: "Wallet > KES 500K idle 14 days", action: "Prompt opt-in sweep to savings pocket", scope: "Savings", priority: 20, enabled: true, hits30d: 1840, lastHit: "Aug 23" },
  { id: "RL-11", name: "Large payroll approval", kind: "Limit", productId: "prod-payroll", trigger: "Payroll run > 500 employees", action: "Require ops approval before release", scope: "Payroll", priority: 75, enabled: true, hits30d: 9, lastHit: "Aug 15" },
  { id: "RL-12", name: "ATM frequency deterrent", kind: "Velocity", productId: "prod-bank", trigger: "> 4 ATM withdrawals / day", action: "Double ATM fee on next withdrawal", scope: "Banking", priority: 30, enabled: false, hits30d: 0, lastHit: "—" },
  { id: "RL-13", name: "EFT auto-retry", kind: "Automation", productId: "prod-bank", trigger: "EFT failed with bank timeout", action: "Retry once at 09:00 next day", scope: "Banking", priority: 50, enabled: true, hits30d: 124, lastHit: "Aug 22" },
];

/* ---------------- environments ---------------- */
export const ENVIRONMENTS: Environment[] = [
  { id: "prod", name: "Production", note: "Live to 1.02M users · changes need approval + publish window", lastPublish: "Aug 22 · 09:00", publishedBy: "J. Mwangi", locked: false, autoSync: false },
  { id: "staging", name: "Staging", note: "Pre-prod mirror · QA sign-off before promote", lastPublish: "Aug 23 · 11:40", publishedBy: "Ops Manager", locked: false, autoSync: false },
  { id: "sandbox", name: "Sandbox", note: "Partner sandbox · auto-syncs from staging nightly", lastPublish: "Aug 23 · 02:00", publishedBy: "Auto-sync", locked: true, autoSync: true },
];

/* ---------------- version history ---------------- */
export const VERSIONS: ConfigVersion[] = [
  { id: "v3.14.2", date: "Aug 22 · 09:00", admin: "J. Mwangi", changes: 4, note: "Loans expansion + contactless limit update", scope: "Loans · Cards", current: true },
  { id: "v3.14.1", date: "Aug 15 · 14:20", admin: "Ops Manager", changes: 1, note: "M-Pesa callback timeout 60s → 30s", scope: "M-Pesa" },
  { id: "v3.14.0", date: "Aug 10 · 10:05", admin: "Finance Mgr", changes: 3, note: "Savings APY 8.0% → 8.5% + interest cap raise", scope: "Savings" },
  { id: "v3.13.9", date: "Aug 06 · 16:44", admin: "S. Njoroge", changes: 2, note: "Corridor additions (Ghana, Vietnam)", scope: "FX" },
  { id: "v3.13.8", date: "Aug 01 · 09:30", admin: "C. Muthoni", changes: 5, note: "Scorecard 4.2 — max loan to 500K", scope: "Loans" },
  { id: "v3.13.7", date: "Jul 20 · 11:12", admin: "D. Kimani", changes: 2, note: "Card limits refresh for VIP programme", scope: "Cards" },
  { id: "v3.13.6", date: "Jul 01 · 08:30", admin: "ALCO", changes: 1, note: "Flexible pocket APY 9.0% → 8.5%", scope: "Savings" },
  { id: "v3.13.5", date: "Jun 14 · 15:58", admin: "J. Mwangi", changes: 2, note: "Wallet daily limit raised to 500K", scope: "M-Pesa" },
  { id: "v3.13.4", date: "May 30 · 13:05", admin: "D. Kimani", changes: 3, note: "International e-comm rules tightened", scope: "Cards" },
  { id: "v3.13.3", date: "May 12 · 10:40", admin: "M. Achieng", changes: 6, note: "Biller catalog refresh (231 → 234)", scope: "Bills" },
];

/* ---------------- change requests (approvals queue) ---------------- */
export const REQUESTS: ChangeRequest[] = [
  { id: "CR-2101", productId: "prod-mpesa", settingKey: "Max cash-out per transaction", from: "KES 70,000", to: "KES 100,000", requestedBy: "A. Otieno", requestedAt: "Aug 23 · 08:14", status: "Pending", risk: "Medium", reason: "Align with agent float reality; fraud cleared the increase", approvals: [{ role: "Risk", who: "V. Kiprop", state: "Approved" }, { role: "Product", who: "P. Wanjiru", state: "Approved" }, { role: "Super Admin", who: "J. Mwangi", state: "Pending" }] },
  { id: "CR-2100", productId: "prod-savings", settingKey: "Interest rate (APY)", from: "8.5%", to: "9.0%", requestedBy: "F. Hassan", requestedAt: "Aug 22 · 17:02", status: "Pending", risk: "High", reason: "Competitive response to T-Kash 8.75% launch", approvals: [{ role: "Risk", who: "V. Kiprop", state: "Pending" }, { role: "Finance", who: "B. Salim", state: "Pending" }, { role: "Super Admin", who: "J. Mwangi", state: "Pending" }] },
  { id: "CR-2099", productId: "prod-cards", settingKey: "3D Secure required above", from: "KES 5,000", to: "KES 3,000", requestedBy: "V. Kiprop", requestedAt: "Aug 22 · 11:38", status: "Pending", risk: "Low", reason: "Fraud pattern shift to mid-ticket card-not-present", approvals: [{ role: "Risk", who: "V. Kiprop", state: "Approved" }, { role: "Product", who: "D. Kimani", state: "Pending" }, { role: "Super Admin", who: "J. Mwangi", state: "Pending" }] },
  { id: "CR-2098", productId: "prod-fx", settingKey: "FX fee", from: "3.0%", to: "2.75%", requestedBy: "S. Njoroge", requestedAt: "Aug 21 · 15:26", status: "Pending", risk: "Medium", reason: "Wise price drop in USD/KES corridor", approvals: [{ role: "Finance", who: "B. Salim", state: "Approved" }, { role: "Super Admin", who: "J. Mwangi", state: "Pending" }] },
  { id: "CR-2097", productId: "prod-loans", settingKey: "Max active loans per user", from: "1", to: "2 (second capped 150K)", requestedBy: "C. Muthoni", requestedAt: "Aug 20 · 09:50", status: "Pending", risk: "High", reason: "Repeat-borrower demand; NPL on first loans at 3.1%", approvals: [{ role: "Risk", who: "V. Kiprop", state: "Rejected" }, { role: "Product", who: "C. Muthoni", state: "Approved" }, { role: "Super Admin", who: "J. Mwangi", state: "Pending" }] },
  { id: "CR-2096", productId: "prod-loans", settingKey: "Maximum loan amount", from: "KES 300,000", to: "KES 500,000", requestedBy: "Finance Mgr", requestedAt: "Aug 22 · 08:00", status: "Deployed", risk: "Medium", reason: "Board approved expansion", approvals: [{ role: "Risk", who: "V. Kiprop", state: "Approved" }, { role: "Finance", who: "B. Salim", state: "Approved" }, { role: "Super Admin", who: "J. Mwangi", state: "Approved" }] },
  { id: "CR-2095", productId: "prod-cards", settingKey: "Contactless per-txn limit", from: "KES 3,000", to: "KES 5,000", requestedBy: "Joseph M.", requestedAt: "Aug 20 · 10:30", status: "Deployed", risk: "Low", reason: "Visa mandate update", approvals: [{ role: "Risk", who: "V. Kiprop", state: "Approved" }, { role: "Super Admin", who: "J. Mwangi", state: "Approved" }] },
  { id: "CR-2094", productId: "prod-bank", settingKey: "RTGS fee", from: "KES 550", to: "KES 500", requestedBy: "Finance", requestedAt: "Aug 12 · 14:15", status: "Approved", risk: "Low", reason: "Volume discount renegotiated with KBA", approvals: [{ role: "Finance", who: "B. Salim", state: "Approved" }, { role: "Super Admin", who: "J. Mwangi", state: "Approved" }] },
  { id: "CR-2093", productId: "prod-savings", settingKey: "Savings pockets per user", from: "Max 5", to: "Max 8", requestedBy: "F. Hassan", requestedAt: "Aug 05 · 09:20", status: "Rejected", risk: "Medium", reason: "Request", approvals: [{ role: "Risk", who: "V. Kiprop", state: "Approved" }, { role: "Super Admin", who: "J. Mwangi", state: "Rejected" }] },
];

/* ---------------- §21.8 audit seed ---------------- */
export const PRODUCT_AUDIT: ProductAudit[] = [
  { id: "PCA-2210", date: "Aug 23 · 09:12", admin: "Jeckonia Kwasa", area: "Overrides", change: "OVR-08 FX cap frozen", from: "Active", to: "Frozen", reason: "Treasury review of import documentation" },
  { id: "PCA-2209", date: "Aug 22 · 16:40", admin: "C. Muthoni", area: "Loans", change: "Rule RL-08 edited", from: "12h gap", to: "24h gap", reason: "Cool-off too short — repeat borrowing pattern" },
  { id: "PCA-2208", date: "Aug 22 · 09:00", admin: "J. Mwangi", area: "Publish", change: "v3.14.2 promoted to Production", from: "v3.14.1", to: "v3.14.2", reason: "4 approved changes released in Aug 22 window" },
  { id: "PCA-2207", date: "Aug 22 · 08:02", admin: "Finance Mgr", area: "Loans", change: "Max loan amount", from: "KES 300,000", to: "KES 500,000", reason: "Board approved expansion" },
  { id: "PCA-2206", date: "Aug 21 · 14:31", admin: "R. Barasa", area: "Payroll", change: "New override drafted", from: "—", to: "OVR-16 beta fee", reason: "Open-beta incentive programme" },
  { id: "PCA-2205", date: "Aug 20 · 10:30", admin: "Joseph M.", area: "Cards", change: "Contactless per-txn limit", from: "KES 3,000", to: "KES 5,000", reason: "Visa mandate update" },
  { id: "PCA-2204", date: "Aug 19 · 11:55", admin: "V. Kiprop", area: "Rules", change: "RL-09 priority raised", from: "80", to: "99", reason: "Sanctions screening must never be bypassed" },
  { id: "PCA-2203", date: "Aug 18 · 09:44", admin: "M. Achieng", area: "Bills", change: "Biller catalog refreshed", from: "231 billers", to: "234 billers", reason: "Added 2 counties + Zuku Fiber" },
  { id: "PCA-2202", date: "Aug 15 · 14:20", admin: "Ops Manager", area: "M-Pesa", change: "Callback timeout", from: "60 seconds", to: "30 seconds", reason: "Reduce pending TXN time" },
  { id: "PCA-2201", date: "Aug 10 · 10:05", admin: "Finance Mgr", area: "Savings", change: "Interest rate (APY)", from: "8.0%", to: "8.5%", reason: "Competitive adjustment" },
  { id: "PCA-2200", date: "Aug 08 · 13:18", admin: "D. Kimani", area: "Cards", change: "Rule RL-12 disabled", from: "Enabled", to: "Disabled", reason: "Fee doubling failed consumer-fairness review" },
  { id: "PCA-2199", date: "Aug 06 · 16:44", admin: "S. Njoroge", area: "FX", change: "Supported currencies", from: "3 currencies", to: "5 currencies", reason: "TZS + UGX corridors via Thunes" },
];

/* ---------------- permissions matrix ---------------- */
export const CONFIG_PERMISSIONS: { action: string; superAdmin: string; productOps: string; finance: string; risk: string; readOnly: string }[] = [
  { action: "View configuration", superAdmin: "Full", productOps: "Full", finance: "Full", risk: "Full", readOnly: "Read" },
  { action: "Edit a setting", superAdmin: "Full + 2FA", productOps: "Request", finance: "Request", risk: "Request", readOnly: "None" },
  { action: "Add / delete a setting", superAdmin: "Full + 2FA", productOps: "Request", finance: "None", risk: "None", readOnly: "None" },
  { action: "Freeze / unfreeze setting or product", superAdmin: "Full + 2FA", productOps: "Escalate", finance: "None", risk: "Full + 2FA", readOnly: "None" },
  { action: "Reset to default", superAdmin: "Full + 2FA", productOps: "None", finance: "None", risk: "None", readOnly: "None" },
  { action: "Manage overrides", superAdmin: "Full + 2FA", productOps: "Full + 2FA", finance: "Request", risk: "Request", readOnly: "None" },
  { action: "Manage rules engine", superAdmin: "Full + 2FA", productOps: "Request", finance: "None", risk: "Full + 2FA", readOnly: "None" },
  { action: "Promote to production", superAdmin: "Full + 2FA", productOps: "Prepare", finance: "Approve", risk: "Approve", readOnly: "None" },
  { action: "Rollback a version", superAdmin: "Full + 2FA", productOps: "None", finance: "Approve", risk: "Approve", readOnly: "None" },
  { action: "Approve change requests", superAdmin: "Full", productOps: "None", finance: "Approve", risk: "Approve", readOnly: "None" },
];

/* ---------------- KPI helper ---------------- */
export const CONFIG_KPI = (s: {
  settings: Setting[]; overrides: Override[]; rules: Rule[]; requests: ChangeRequest[]; versions: ConfigVersion[];
}) => {
  const drift = s.settings.filter((x) => x.drift).length;
  const pending = s.requests.filter((r) => r.status === "Pending").length;
  const frozen = s.settings.filter((x) => x.frozen).length + s.overrides.filter((o) => o.status === "Frozen").length;
  return [
    { label: "Config sets", value: `${new Set(s.settings.map((x) => x.productId)).size} products`, note: `${s.settings.length} settings · ${s.settings.filter((x) => !x.editable).length} locked (regulatory/rail)`, icon: "bi-gear-wide-connected", tone: "green" },
    { label: "Env drift", value: drift ? `${drift} settings` : "In sync", note: `staging vs production · ${frozen} frozen`, icon: "bi-arrow-left-right", tone: drift ? "amber" : "green" },
    { label: "Pending approvals", value: `${pending}`, note: `${s.requests.filter((r) => r.status === "Pending" && r.risk === "High").length} high-risk · SLA 24h`, icon: "bi-hourglass-split", tone: pending ? "amber" : "green" },
    { label: "Active overrides", value: `${s.overrides.filter((o) => o.status === "Active").length}`, note: `${s.overrides.filter((o) => o.status === "Frozen").length} frozen · ${s.overrides.filter((o) => o.status === "Draft").length} draft`, icon: "bi-person-badge", tone: "violet" },
    { label: "Rules live", value: `${s.rules.filter((r) => r.enabled).length} / ${s.rules.length}`, note: `${s.rules.reduce((a, r) => a + (r.enabled ? r.hits30d : 0), 0).toLocaleString("en-KE")} triggers in 30d`, icon: "bi-lightning-charge", tone: "blue" },
    { label: "Current version", value: s.versions.find((v) => v.current)?.id ?? "—", note: `published ${s.versions.find((v) => v.current)?.date ?? ""}`, icon: "bi-clock-history", tone: "green" },
  ];
};
