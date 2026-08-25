/* ================================================================
   Page 22 — Recurring Services · data layer
   10 services, 9 plans, 18 mandates, 16 failed payments,
   6 dunning campaigns, churn analysis, win-back offers,
   lifecycle stages, gated retry/billing configuration,
   change-request approvals and a live recurring-ops audit trail.
   ================================================================ */

export type ServiceStatus = "Active" | "Paused" | "Sunsetting";

export type Service = {
  id: string;
  name: string;
  kind: "Subscription" | "Auto-debit" | "Repayment" | "Autopay";
  subscribers: number;
  mrr: number;              // KES / month
  mrrNote?: string;
  churn: string;            // "3.2%" or "N/A"
  tenure: string;           // "8.4 mo" or "N/A"
  status: ServiceStatus;
  signupsFrozen?: boolean;
  owner: string;
  icon: string;
  color: string;
  note: string;
};

export type PlanStatus = "Active" | "Paused" | "Draft" | "Retired";

export type Plan = {
  id: string;
  name: string;
  serviceId: string;
  price: number;            // KES / cycle
  billing: "Monthly" | "Annual";
  features: string[];
  subscribers: number;
  mrr: number;
  status: PlanStatus;
  trialDays: number;
  proration: boolean;
  changed: string;
};

export type MandateStatus = "Active" | "Trial" | "Paused" | "Retry pending" | "Grace" | "Cancelled";

export type Mandate = {
  id: string;               // PAY-xxxxx
  user: string;
  phone: string;
  serviceId: string;
  planId: string;
  amount: number;
  frequency: "Monthly" | "Weekly" | "Bi-weekly";
  billingDay: string;       // "5th" / "Mon" / "Signup day"
  next: string;
  status: MandateStatus;
  retries: number;
  started: string;
  tenureMo: number;
  ltv: number;
  channel: "M-Pesa" | "Bank" | "Card";
  autoResume?: string;      // date for paused mandates
  failingSince?: string;
  history: { when: string; what: string; state: string }[];
};

export type FailureStatus = "Retry pending" | "Paused" | "Grace" | "Cancelled" | "Recovered";

export type FailedPayment = {
  id: string;               // FPD-22xx
  mandateId: string;
  user: string;
  serviceId: string;
  amount: number;
  reason: string;
  retries: number;
  maxRetries: number;
  nextRetry: string;
  status: FailureStatus;
  failedAt: string;
  channel: "M-Pesa" | "Bank" | "Card";
  dunningStage: number;     // 0..3
};

export type CampaignStatus = "Active" | "Paused" | "Draft";

export type Campaign = {
  id: string;
  name: string;
  trigger: string;
  channels: string[];
  message: string;
  timing: string;
  conversion: number;
  status: CampaignStatus;
  audience: number;
  sent30d: number;
  variant?: string;
};

export type ChurnRow = {
  reason: string;
  count: number;
  pct: number;
  action: string;
  actionStatus: "Not started" | "In progress" | "Owner assigned" | "Shipped";
  owner: string;
};

export type Offer = {
  id: string;
  name: string;
  segment: string;
  discount: string;
  eligible: number;
  redeemed: number;
  expires: string;
  status: "Active" | "Draft" | "Expired";
};

export type LifecycleStage = {
  id: string;
  name: string;
  count: number;
  note: string;
  tone: string;
};

export type ConfigSetting = {
  id: string;
  group: "Retries" | "Notifications" | "Billing rules" | "Guardrails";
  key: string;
  value: string;
  valueKind: "duration" | "number" | "boolean" | "text" | "window";
  editable: boolean;
  lockedReason?: string;
  note: string;
  changed: string;
  changedBy: string;
  pendingTo?: string;
};

export type ChangeRequest = {
  id: string;
  subject: string;
  from: string;
  to: string;
  requestedBy: string;
  requestedAt: string;
  status: "Pending" | "Approved" | "Rejected" | "Deployed";
  risk: "Low" | "Medium" | "High";
  reason: string;
  approvals: { role: string; who: string; state: "Pending" | "Approved" | "Rejected" }[];
};

export type RecurringAudit = {
  id: string;
  date: string;
  admin: string;
  area: string;
  change: string;
  from: string;
  to: string;
  reason: string;
};

/* ================================================================ Services (§22.1) */
export const SERVICES: Service[] = [
  { id: "svc-premium", name: "PayMo Premium", kind: "Subscription", subscribers: 12400, mrr: 12400000, churn: "3.2%", tenure: "8.4 mo", status: "Active", owner: "P. Wanjiru", icon: "bi-star", color: "#12b76a", note: "VIP auto-upgrade tier — fee discounts, priority support, analytics." },
  { id: "svc-business", name: "Business Suite", kind: "Subscription", subscribers: 3200, mrr: 9600000, churn: "2.1%", tenure: "14.2 mo", status: "Active", owner: "D. Kimani", icon: "bi-briefcase", color: "#175cd3", note: "Multi-user, payroll, bulk ops and API for SMEs." },
  { id: "svc-insurance", name: "Insurance Premiums", kind: "Subscription", subscribers: 8900, mrr: 4500000, churn: "5.4%", tenure: "6.8 mo", status: "Active", signupsFrozen: true, owner: "S. Achieng", icon: "bi-umbrella", color: "#7a5af8", note: "Partner underwritten (Jubilee). Signups frozen pending underwriting review." },
  { id: "svc-savings", name: "Savings Auto-Debit", kind: "Auto-debit", subscribers: 23400, mrr: 11700000, mrrNote: "deposits", churn: "8.2%", tenure: "5.1 mo", status: "Active", owner: "P. Wanjiru", icon: "bi-piggy-bank", color: "#0b8f52", note: "Round-ups and scheduled sweeps into goal wallets." },
  { id: "svc-loan", name: "Loan Repayment", kind: "Repayment", subscribers: 18200, mrr: 18200000, churn: "N/A", tenure: "N/A", status: "Active", owner: "V. Kiprop", icon: "bi-bank", color: "#b54708", note: "Instalment collection on disbursed loans — pauses follow hardship policy." },
  { id: "svc-utility", name: "Utility Auto-Pay", kind: "Autopay", subscribers: 34500, mrr: 8700000, churn: "12.3%", tenure: "4.2 mo", status: "Active", owner: "A. Njoroge", icon: "bi-lightning-charge", color: "#e0441e", note: "KPLC postpaid, water and internet bills paid on statement arrival." },
  { id: "svc-premium-plus", name: "PayMo Premium Plus", kind: "Subscription", subscribers: 2100, mrr: 4200000, churn: "1.8%", tenure: "11.3 mo", status: "Active", owner: "P. Wanjiru", icon: "bi-gem", color: "#dd2590", note: "No fees + VIP manager. Concierge onboarding for >KES 5M wallets." },
  { id: "svc-api", name: "API Access Tier", kind: "Subscription", subscribers: 450, mrr: 2250000, churn: "0.8%", tenure: "18.6 mo", status: "Active", owner: "D. Kimani", icon: "bi-plug", color: "#0e7490", note: "Metered API access for platform partners and integrators." },
  { id: "svc-payroll", name: "Payroll Sweep", kind: "Auto-debit", subscribers: 1150, mrr: 5800000, mrrNote: "payroll value", churn: "N/A", tenure: "9.8 mo", status: "Active", owner: "D. Kimani", icon: "bi-people", color: "#5925dc", note: "Employer-initiated salary sweeps into PayMo wallets on pay day." },
  { id: "svc-rent", name: "Rent Autopay", kind: "Autopay", subscribers: 3400, mrr: 6900000, churn: "6.5%", tenure: "7.2 mo", status: "Paused", owner: "A. Njoroge", icon: "bi-house-door", color: "#667085", note: "Pilot paused Aug 12 — landlord escrow disputes in Kisumu region." },
];

/* ================================================================ Plans (§22.2) */
export const PLANS: Plan[] = [
  { id: "plan-premium", name: "PayMo Premium", serviceId: "svc-premium", price: 999, billing: "Monthly", features: ["Fee discounts", "Priority support", "Analytics"], subscribers: 12400, mrr: 12400000, status: "Active", trialDays: 7, proration: true, changed: "Jul 02 · P. Wanjiru" },
  { id: "plan-premium-plus", name: "PayMo Premium Plus", serviceId: "svc-premium-plus", price: 1999, billing: "Monthly", features: ["All Premium", "No fees", "VIP manager"], subscribers: 2100, mrr: 4200000, status: "Active", trialDays: 7, proration: true, changed: "Jul 02 · P. Wanjiru" },
  { id: "plan-business", name: "Business Suite", serviceId: "svc-business", price: 2999, billing: "Monthly", features: ["Multi-user", "Payroll", "Bulk ops", "API"], subscribers: 3200, mrr: 9600000, status: "Active", trialDays: 14, proration: true, changed: "Jun 18 · D. Kimani" },
  { id: "plan-api-basic", name: "API Access — Basic", serviceId: "svc-api", price: 5000, billing: "Monthly", features: ["10K API calls/mo"], subscribers: 350, mrr: 1750000, status: "Active", trialDays: 0, proration: false, changed: "May 30 · D. Kimani" },
  { id: "plan-api-pro", name: "API Access — Pro", serviceId: "svc-api", price: 15000, billing: "Monthly", features: ["100K API calls/mo"], subscribers: 100, mrr: 1500000, status: "Active", trialDays: 0, proration: false, changed: "May 30 · D. Kimani" },
  { id: "plan-insurance", name: "Insurance — Family Cover", serviceId: "svc-insurance", price: 1500, billing: "Monthly", features: ["Outpatient", "Dental", "Last expense"], subscribers: 8900, mrr: 4500000, status: "Active", trialDays: 0, proration: false, changed: "Aug 09 · S. Achieng" },
  { id: "plan-insurance-plus", name: "Insurance — Family Cover Plus", serviceId: "svc-insurance", price: 2400, billing: "Monthly", features: ["Family Cover", "Inpatient", "Maternity"], subscribers: 1240, mrr: 2976000, status: "Paused", trialDays: 0, proration: false, changed: "Aug 12 · S. Achieng" },
  { id: "plan-payroll", name: "Payroll Sweep — Employer", serviceId: "svc-payroll", price: 4500, billing: "Monthly", features: ["Up to 250 staff", "Pay day scheduling", "P9 export"], subscribers: 1150, mrr: 5175000, status: "Active", trialDays: 0, proration: false, changed: "Jul 21 · D. Kimani" },
  { id: "plan-api-ent", name: "API Access — Enterprise", serviceId: "svc-api", price: 60000, billing: "Monthly", features: ["1M calls", "Dedicated VLan", "99.95% SLA"], subscribers: 0, mrr: 0, status: "Draft", trialDays: 0, proration: false, changed: "Aug 20 · D. Kimani" },
];

/* ================================================================ Mandates (§22.3 + expanded) */
const hist = (rows: [string, string, string][]) => rows.map(([when, what, state]) => ({ when, what, state }));

export const MANDATES: Mandate[] = [
  { id: "PAY-12345", user: "Wanjiku Mwangi", phone: "+254 712 445 091", serviceId: "svc-premium", planId: "plan-premium", amount: 999, frequency: "Monthly", billingDay: "5th", next: "Aug 25", status: "Retry pending", retries: 2, started: "Feb 2025", tenureMo: 6, ltv: 5994, channel: "M-Pesa", failingSince: "Aug 23", history: hist([["Aug 23 · 06:12", "Charge failed — insufficient funds", "Failed"], ["Aug 23 · 06:12", "Dunning reminder 1 sent (push+SMS)", "Notified"], ["Aug 21 · 06:00", "Charge OK", "Paid"]]) },
  { id: "PAY-67890", user: "Otieno Ochieng", phone: "+254 720 118 762", serviceId: "svc-insurance", planId: "plan-insurance", amount: 1500, frequency: "Monthly", billingDay: "10th", next: "—", status: "Cancelled", retries: 3, started: "Nov 2024", tenureMo: 9, ltv: 13500, channel: "Card", failingSince: "Aug 10", history: hist([["Aug 20 · 09:00", "Auto-cancelled after 3 retries", "Cancelled"], ["Aug 19 · 18:30", "Final notice sent (email)", "Notified"], ["Aug 18 · 14:02", "Retry 3 failed — card expired", "Failed"]]) },
  { id: "PAY-89012", user: "Aisha Hassan", phone: "+254 733 902 348", serviceId: "svc-business", planId: "plan-business", amount: 2999, frequency: "Monthly", billingDay: "1st", next: "On unfreeze", status: "Paused", retries: 0, started: "Apr 2024", tenureMo: 16, ltv: 47984, channel: "Bank", autoResume: "On account unfreeze", history: hist([["Aug 22 · 10:00", "Paused — account frozen by Risk", "Paused"], ["Aug 01 · 06:00", "Charge OK", "Paid"], ["Jul 01 · 06:00", "Charge OK", "Paid"]]) },
  { id: "PAY-11223", user: "Kamau Ndira", phone: "+254 701 337 560", serviceId: "svc-premium-plus", planId: "plan-premium-plus", amount: 1999, frequency: "Monthly", billingDay: "12th", next: "Aug 24", status: "Retry pending", retries: 1, started: "Jan 2025", tenureMo: 7, ltv: 13993, channel: "M-Pesa", failingSince: "Aug 22", history: hist([["Aug 22 · 07:30", "Retry 1 failed — insufficient funds", "Failed"], ["Aug 20 · 07:30", "Charge failed — insufficient funds", "Failed"], ["Aug 19 · 07:30", "Charge OK", "Paid"]]) },
  { id: "PAY-44556", user: "Fatuma Ali", phone: "+254 745 660 214", serviceId: "svc-utility", planId: "plan-premium", amount: 3200, frequency: "Monthly", billingDay: "Statement", next: "Aug 25", status: "Retry pending", retries: 2, started: "Mar 2025", tenureMo: 5, ltv: 16000, channel: "M-Pesa", failingSince: "Aug 23", history: hist([["Aug 23 · 05:40", "KPLC charge failed — insufficient funds", "Failed"], ["Aug 23 · 05:40", "Reminder 2 queued (24h before retry)", "Notified"], ["Jul 25 · 05:40", "Charge OK", "Paid"]]) },
  { id: "PAY-15002", user: "Brian Kiptoo", phone: "+254 799 231 887", serviceId: "svc-premium", planId: "plan-premium", amount: 999, frequency: "Monthly", billingDay: "3rd", next: "Sep 03", status: "Active", retries: 0, started: "Jun 2025", tenureMo: 2, ltv: 1998, channel: "M-Pesa", history: hist([["Aug 03 · 06:00", "Charge OK", "Paid"], ["Jul 03 · 06:00", "Charge OK", "Paid"]]) },
  { id: "PAY-15003", user: "Mercy Wafula", phone: "+254 726 884 023", serviceId: "svc-savings", planId: "plan-premium", amount: 5000, frequency: "Monthly", billingDay: "25th", next: "Aug 25", status: "Active", retries: 0, started: "Sep 2024", tenureMo: 11, ltv: 55000, channel: "M-Pesa", history: hist([["Jul 25 · 06:00", "Goal sweep OK — 'New Toyota Probox'", "Paid"], ["Jun 25 · 06:00", "Goal sweep OK", "Paid"]]) },
  { id: "PAY-15004", user: "Peter Mbugua", phone: "+254 715 209 661", serviceId: "svc-loan", planId: "plan-premium", amount: 8400, frequency: "Monthly", billingDay: "20th", next: "Aug 27", status: "Grace", retries: 3, started: "May 2025", tenureMo: 3, ltv: 25200, channel: "M-Pesa", failingSince: "Aug 20", history: hist([["Aug 22 · 08:00", "Entered grace period — final notice sent", "Grace"], ["Aug 20 · 08:00", "Retry 3 failed — insufficient funds", "Failed"], ["Jul 20 · 08:00", "Charge OK", "Paid"]]) },
  { id: "PAY-15005", user: "Zainab Yusuf", phone: "+254 738 445 129", serviceId: "svc-premium", planId: "plan-premium", amount: 999, frequency: "Monthly", billingDay: "8th", next: "Sep 08", status: "Trial", retries: 0, started: "Aug 2025", tenureMo: 0, ltv: 0, channel: "M-Pesa", history: hist([["Aug 16 · 12:00", "Trial started — 7 days free", "Trial"], ["Aug 16 · 12:00", "Card verified KES 1 hold", "Verified"]]) },
  { id: "PAY-15006", user: "Dennis Mutua", phone: "+254 704 771 340", serviceId: "svc-business", planId: "plan-business", amount: 2999, frequency: "Monthly", billingDay: "1st", next: "Sep 01", status: "Active", retries: 0, started: "Oct 2024", tenureMo: 10, ltv: 29990, channel: "Bank", history: hist([["Aug 01 · 05:00", "Charge OK — equity direct debit", "Paid"], ["Jul 01 · 05:00", "Charge OK", "Paid"]]) },
  { id: "PAY-15007", user: "Grace Atieno", phone: "+254 748 092 553", serviceId: "svc-insurance", planId: "plan-insurance", amount: 1500, frequency: "Monthly", billingDay: "14th", next: "Aug 26", status: "Retry pending", retries: 1, started: "Dec 2024", tenureMo: 8, ltv: 12000, channel: "M-Pesa", failingSince: "Aug 22", history: hist([["Aug 22 · 09:15", "Retry 1 failed — M-Pesa daily limit hit", "Failed"], ["Aug 14 · 09:15", "Charge OK", "Paid"]]) },
  { id: "PAY-15008", user: "Samuel Kariuki", phone: "+254 722 615 097", serviceId: "svc-savings", planId: "plan-premium", amount: 2500, frequency: "Weekly", billingDay: "Mon", next: "Aug 25", status: "Active", retries: 0, started: "Jan 2025", tenureMo: 7, ltv: 75000, channel: "M-Pesa", history: hist([["Aug 18 · 06:00", "Weekly sweep OK", "Paid"], ["Aug 11 · 06:00", "Weekly sweep OK", "Paid"]]) },
  { id: "PAY-15009", user: "Njeri Kamau", phone: "+254 705 330 846", serviceId: "svc-payroll", planId: "plan-payroll", amount: 4500, frequency: "Monthly", billingDay: "25th", next: "Aug 25", status: "Active", retries: 0, started: "Nov 2024", tenureMo: 9, ltv: 40500, channel: "Bank", history: hist([["Jul 25 · 05:00", "Employer sweep OK — 42 staff", "Paid"], ["Jun 25 · 05:00", "Employer sweep OK — 42 staff", "Paid"]]) },
  { id: "PAY-15010", user: "Ali Abdi", phone: "+254 717 558 220", serviceId: "svc-api", planId: "plan-api-pro", amount: 15000, frequency: "Monthly", billingDay: "1st", next: "Sep 01", status: "Active", retries: 0, started: "Feb 2024", tenureMo: 18, ltv: 270000, channel: "Bank", history: hist([["Aug 01 · 04:00", "Charge OK — invoice INV-88213", "Paid"], ["Jul 01 · 04:00", "Charge OK", "Paid"]]) },
  { id: "PAY-15011", user: "Lydia Cherono", phone: "+254 729 846 173", serviceId: "svc-premium", planId: "plan-premium", amount: 999, frequency: "Monthly", billingDay: "18th", next: "—", status: "Cancelled", retries: 0, started: "Apr 2025", tenureMo: 3, ltv: 2997, channel: "M-Pesa", history: hist([["Aug 02 · 15:20", "Cancelled by user — price too high", "Cancelled"], ["Jul 18 · 06:00", "Charge OK", "Paid"], ["Aug 09 · 10:00", "Win-back 50% sent (push+email)", "Notified"]]) },
  { id: "PAY-15012", user: "Victor Omondi", phone: "+254 766 214 908", serviceId: "svc-utility", planId: "plan-premium", amount: 1850, frequency: "Monthly", billingDay: "Statement", next: "Nairobi Water · Sep 05", status: "Active", retries: 0, started: "Feb 2025", tenureMo: 6, ltv: 11100, channel: "M-Pesa", history: hist([["Aug 05 · 05:30", "Nairobi Water OK", "Paid"], ["Jul 05 · 05:30", "Nairobi Water OK", "Paid"]]) },
  { id: "PAY-15013", user: "Esther Nyambura", phone: "+254 713 987 334", serviceId: "svc-loan", planId: "plan-premium", amount: 6200, frequency: "Bi-weekly", billingDay: "Fri", next: "Aug 29", status: "Paused", retries: 0, started: "Jun 2025", tenureMo: 2, ltv: 24800, channel: "M-Pesa", autoResume: "Sep 05", history: hist([["Aug 15 · 11:00", "Paused by user — hardship plan approved", "Paused"], ["Aug 01 · 08:00", "Charge OK", "Paid"]]) },
  { id: "PAY-15014", user: "Hassan Juma", phone: "+254 741 103 572", serviceId: "svc-premium-plus", planId: "plan-premium-plus", amount: 1999, frequency: "Monthly", billingDay: "22nd", next: "Aug 28", status: "Active", retries: 0, started: "Sep 2024", tenureMo: 11, ltv: 21989, channel: "Card", history: hist([["Jul 22 · 07:00", "Charge OK — visa ••••4021", "Paid"], ["Jun 22 · 07:00", "Charge OK", "Paid"]]) },
];

/* ================================================================ Failed payments queue (§22.3) */
export const FAILED: FailedPayment[] = [
  { id: "FPD-2201", mandateId: "PAY-12345", user: "Wanjiku Mwangi", serviceId: "svc-premium", amount: 999, reason: "Insufficient funds", retries: 2, maxRetries: 3, nextRetry: "Aug 25 · 06:00", status: "Retry pending", failedAt: "Aug 23 · 06:12", channel: "M-Pesa", dunningStage: 2 },
  { id: "FPD-2202", mandateId: "PAY-67890", user: "Otieno Ochieng", serviceId: "svc-insurance", amount: 1500, reason: "Card expired", retries: 3, maxRetries: 3, nextRetry: "—", status: "Cancelled", failedAt: "Aug 18 · 14:02", channel: "Card", dunningStage: 3 },
  { id: "FPD-2203", mandateId: "PAY-89012", user: "Aisha Hassan", serviceId: "svc-business", amount: 2999, reason: "Account frozen", retries: 0, maxRetries: 3, nextRetry: "On unfreeze", status: "Paused", failedAt: "Aug 22 · 10:00", channel: "Bank", dunningStage: 0 },
  { id: "FPD-2204", mandateId: "PAY-11223", user: "Kamau Ndira", serviceId: "svc-premium-plus", amount: 1999, reason: "Insufficient funds", retries: 1, maxRetries: 3, nextRetry: "Aug 24 · 07:30", status: "Retry pending", failedAt: "Aug 22 · 07:30", channel: "M-Pesa", dunningStage: 1 },
  { id: "FPD-2205", mandateId: "PAY-44556", user: "Fatuma Ali", serviceId: "svc-utility", amount: 3200, reason: "Insufficient funds", retries: 2, maxRetries: 3, nextRetry: "Aug 25 · 05:40", status: "Retry pending", failedAt: "Aug 23 · 05:40", channel: "M-Pesa", dunningStage: 2 },
  { id: "FPD-2206", mandateId: "PAY-15004", user: "Peter Mbugua", serviceId: "svc-loan", amount: 8400, reason: "Insufficient funds", retries: 3, maxRetries: 3, nextRetry: "Grace ends Aug 25", status: "Grace", failedAt: "Aug 20 · 08:00", channel: "M-Pesa", dunningStage: 3 },
  { id: "FPD-2207", mandateId: "PAY-15007", user: "Grace Atieno", serviceId: "svc-insurance", amount: 1500, reason: "M-Pesa daily limit hit", retries: 1, maxRetries: 3, nextRetry: "Aug 24 · 09:15", status: "Retry pending", failedAt: "Aug 22 · 09:15", channel: "M-Pesa", dunningStage: 1 },
  { id: "FPD-2208", mandateId: "PAY-15015", user: "Collins Barasa", serviceId: "svc-premium", amount: 999, reason: "Insufficient funds", retries: 2, maxRetries: 3, nextRetry: "Aug 25 · 06:00", status: "Retry pending", failedAt: "Aug 23 · 06:12", channel: "M-Pesa", dunningStage: 2 },
  { id: "FPD-2209", mandateId: "PAY-15016", user: "Ruth Wairimu", serviceId: "svc-savings", amount: 2000, reason: "Phone unreachable", retries: 1, maxRetries: 3, nextRetry: "Aug 24 · 06:00", status: "Retry pending", failedAt: "Aug 22 · 06:00", channel: "M-Pesa", dunningStage: 1 },
  { id: "FPD-2210", mandateId: "PAY-15017", user: "Kevin Ochieng", serviceId: "svc-business", amount: 2999, reason: "Bank reject — mandate dispute", retries: 0, maxRetries: 3, nextRetry: "Aug 24 · 05:00", status: "Retry pending", failedAt: "Aug 23 · 05:00", channel: "Bank", dunningStage: 1 },
  { id: "FPD-2211", mandateId: "PAY-15018", user: "Natalie Mwende", serviceId: "svc-premium", amount: 999, reason: "Insufficient funds", retries: 3, maxRetries: 3, nextRetry: "—", status: "Recovered", failedAt: "Aug 19 · 06:12", channel: "M-Pesa", dunningStage: 3 },
  { id: "FPD-2212", mandateId: "PAY-15019", user: "Joseph Lelei", serviceId: "svc-utility", amount: 4100, reason: "Insufficient funds", retries: 1, maxRetries: 3, nextRetry: "Aug 24 · 05:40", status: "Retry pending", failedAt: "Aug 22 · 05:40", channel: "M-Pesa", dunningStage: 1 },
  { id: "FPD-2213", mandateId: "PAY-15020", user: "Beatrice Kanini", serviceId: "svc-insurance", amount: 2400, reason: "Card declined — fraud block", retries: 0, maxRetries: 3, nextRetry: "Aug 24 · 09:00", status: "Retry pending", failedAt: "Aug 23 · 09:00", channel: "Card", dunningStage: 1 },
  { id: "FPD-2214", mandateId: "PAY-15021", user: "Ahmed Noor", serviceId: "svc-api", amount: 5000, reason: "Insufficient funds", retries: 2, maxRetries: 3, nextRetry: "Aug 25 · 04:00", status: "Retry pending", failedAt: "Aug 23 · 04:00", channel: "Bank", dunningStage: 2 },
  { id: "FPD-2215", mandateId: "PAY-15022", user: "Cynthia Adhiambo", serviceId: "svc-premium", amount: 999, reason: "Account closed", retries: 3, maxRetries: 3, nextRetry: "—", status: "Cancelled", failedAt: "Aug 17 · 06:12", channel: "M-Pesa", dunningStage: 3 },
  { id: "FPD-2216", mandateId: "PAY-15023", user: "Michael Waweru", serviceId: "svc-savings", amount: 5000, reason: "Insufficient funds", retries: 1, maxRetries: 3, nextRetry: "Aug 24 · 06:00", status: "Retry pending", failedAt: "Aug 22 · 06:00", channel: "M-Pesa", dunningStage: 1 },
];

/* ================================================================ Dunning campaigns (§22.6) */
export const CAMPAIGNS: Campaign[] = [
  { id: "DUN-01", name: "Payment failed — reminder 1", trigger: "1st failure", channels: ["Push", "SMS"], message: "Payment failed, please top up", timing: "Immediately", conversion: 35, status: "Active", audience: 1840, sent30d: 4120 },
  { id: "DUN-02", name: "Payment failed — reminder 2", trigger: "2nd failure", channels: ["Push", "SMS", "Email"], message: "Final attempt tomorrow", timing: "24h before retry", conversion: 20, status: "Active", audience: 640, sent30d: 1310 },
  { id: "DUN-03", name: "Payment failed — final", trigger: "3rd failure", channels: ["Email"], message: "Subscription cancelled, resubscribe?", timing: "After cancel", conversion: 8, status: "Active", audience: 210, sent30d: 480 },
  { id: "DUN-04", name: "Win-back — 7 days", trigger: "Post cancellation", channels: ["Push", "Email"], message: "We miss you — 50% off first month", timing: "7 days after", conversion: 12, status: "Active", audience: 380, sent30d: 690 },
  { id: "DUN-05", name: "Win-back — 30 days", trigger: "Post cancellation", channels: ["Email"], message: "Special offer to come back", timing: "30 days after", conversion: 5, status: "Active", audience: 290, sent30d: 540 },
  { id: "DUN-06", name: "Card expiring — proactive", trigger: "Card expires in 14d", channels: ["Push", "SMS"], message: "Your card expires soon — update to keep your plan", timing: "14 days before", conversion: 44, status: "Paused", audience: 120, sent30d: 210, variant: "B beats A by 6.1pp" },
];

/* ================================================================ Churn analysis (§22.5) */
export const CHURN: ChurnRow[] = [
  { reason: "Price too high", count: 45, pct: 28, action: "Review pricing", actionStatus: "In progress", owner: "P. Wanjiru" },
  { reason: "Didn't use features", count: 38, pct: 24, action: "Improve onboarding", actionStatus: "Owner assigned", owner: "A. Njoroge" },
  { reason: "Switched to competitor", count: 23, pct: 14, action: "Competitive analysis", actionStatus: "Not started", owner: "D. Kimani" },
  { reason: "Insufficient funds", count: 22, pct: 14, action: "Offer lower tier", actionStatus: "Shipped", owner: "P. Wanjiru" },
  { reason: "Account closed", count: 18, pct: 11, action: "Retention outreach", actionStatus: "Owner assigned", owner: "S. Achieng" },
  { reason: "Other", count: 14, pct: 9, action: "—", actionStatus: "Not started", owner: "—" },
];

/* ================================================================ Win-back offers */
export const OFFERS: Offer[] = [
  { id: "WB-11", name: "Come back — 50% off first month", segment: "Cancelled ≤ 7 days", discount: "50% · 1 month", eligible: 380, redeemed: 46, expires: "Rolling", status: "Active" },
  { id: "WB-12", name: "Lapsed — 30 day special", segment: "Cancelled ≤ 30 days", discount: "KES 499 flat · 3 months", eligible: 290, redeemed: 15, expires: "Sep 30", status: "Active" },
  { id: "WB-13", name: "Hardship tier — Premium Lite", segment: "Cancelled: insufficient funds", discount: "KES 399/month", eligible: 220, redeemed: 61, expires: "Dec 31", status: "Active" },
  { id: "WB-14", name: "Annual prepay — 2 months free", segment: "Tenure > 6 months", discount: "KES 9,990/year", eligible: 5400, redeemed: 0, expires: "—", status: "Draft" },
];

/* ================================================================ Lifecycle (§22.7) */
export const LIFECYCLE: LifecycleStage[] = [
  { id: "trial", name: "Trial (7 days)", count: 340, note: "KES 1 card/PIN hold verifies the mandate", tone: "blue" },
  { id: "active", name: "Active", count: 84120, note: "Charging on billing day · SLA 99.97%", tone: "green" },
  { id: "failed", name: "Payment failed", count: 1240, note: "Enters dunning immediately (reminder 1)", tone: "amber" },
  { id: "retry1", name: "Retry 1 (48h)", count: 840, note: "45% recover on first retry", tone: "amber" },
  { id: "retry2", name: "Retry 2 (96h)", count: 380, note: "20% recover on second retry", tone: "amber" },
  { id: "retry3", name: "Retry 3 (144h)", count: 150, note: "7% recover on final retry", tone: "orange" },
  { id: "paused", name: "Paused", count: 2310, note: "User or admin pause · auto-resume honoured", tone: "violet" },
  { id: "cancelled", name: "Cancelled", count: 1890, note: "Auto-cancel after max retries or user request", tone: "red" },
  { id: "winback", name: "Win-back pool", count: 612, note: "Offer traffic from DUN-04 / DUN-05", tone: "violet" },
  { id: "reactivated", name: "Reactivated", count: 214, note: "Within 30-day window with dunning offer", tone: "green" },
];

/* ================================================================ Recurring configuration (§22.8) */
export const CONFIG: ConfigSetting[] = [
  { id: "RCF-01", group: "Retries", key: "Retry interval", value: "48 hours", valueKind: "duration", editable: true, note: "Delay between retry attempts after a failed charge.", changed: "Jun 12", changedBy: "J. Mwangi", pendingTo: "24 hours" },
  { id: "RCF-02", group: "Retries", key: "Max retries", value: "3", valueKind: "number", editable: true, note: "Attempts before auto-cancel flows in.", changed: "Jun 12", changedBy: "J. Mwangi" },
  { id: "RCF-03", group: "Retries", key: "Retry window", value: "06:00 – 20:00 EAT", valueKind: "window", editable: true, note: "Retries only fire inside this window (quiet hours).", changed: "Apr 02", changedBy: "J. Mwangi" },
  { id: "RCF-04", group: "Retries", key: "Smart retry timing", value: "Pilot — off", valueKind: "text", editable: true, note: "ML model picks the best hour per user (pilot cohort 5%).", changed: "Aug 14", changedBy: "A. Njoroge" },
  { id: "RCF-05", group: "Retries", key: "Grace period after final failure", value: "3 days", valueKind: "duration", editable: true, note: "Mandate survives this long after the last failed retry.", changed: "Jun 12", changedBy: "J. Mwangi" },
  { id: "RCF-06", group: "Notifications", key: "Notify user on failure", value: "Yes (Push + SMS)", valueKind: "boolean", editable: true, note: "DUN-01 template fires on 1st failure.", changed: "Mar 30", changedBy: "P. Wanjiru" },
  { id: "RCF-07", group: "Notifications", key: "Notify before cancellation", value: "Yes (Email, 24h before)", valueKind: "boolean", editable: true, note: "DUN-03 final notice.", changed: "Mar 30", changedBy: "P. Wanjiru" },
  { id: "RCF-08", group: "Notifications", key: "Weekend retries", value: "No", valueKind: "boolean", editable: true, note: "Skip Sat/Sun retries — collections policy.", changed: "Jan 15", changedBy: "V. Kiprop" },
  { id: "RCF-09", group: "Billing rules", key: "Auto-cancel after max retries", value: "Yes", valueKind: "boolean", editable: true, note: "Off would queue everything for manual review.", changed: "Jun 12", changedBy: "J. Mwangi" },
  { id: "RCF-10", group: "Billing rules", key: "Reactivation window", value: "30 days (with dunning offer)", valueKind: "duration", editable: true, note: "How long a cancelled mandate can be revived untouched.", changed: "Jun 12", changedBy: "J. Mwangi" },
  { id: "RCF-11", group: "Billing rules", key: "Prorate mid-month subscription", value: "Yes", valueKind: "boolean", editable: true, note: "Upgrade/downgrade charges prorated to the day.", changed: "Feb 08", changedBy: "P. Wanjiru" },
  { id: "RCF-12", group: "Billing rules", key: "Billing day", value: "Same day as signup", valueKind: "text", editable: false, lockedReason: "Core billing invariant — engineering change only", note: "Anchors every monthly mandate.", changed: "Launch", changedBy: "Platform" },
  { id: "RCF-13", group: "Billing rules", key: "If billing day is 29/30/31", value: "Last day of month", valueKind: "text", editable: false, lockedReason: "Core billing invariant — engineering change only", note: "Feb 29 → Feb 28 in non-leap years.", changed: "Launch", changedBy: "Platform" },
  { id: "RCF-14", group: "Guardrails", key: "Max mandate amount", value: "KES 500,000 / cycle", valueKind: "text", editable: true, note: "Above this, Finance co-signs the mandate.", changed: "Jul 19", changedBy: "V. Kiprop" },
  { id: "RCF-15", group: "Guardrails", key: "Currency", value: "KES only", valueKind: "text", editable: false, lockedReason: "CBK single-settlement currency until FX licenses land", note: "Multi-currency mandates track FX page 26.", changed: "May 11", changedBy: "Platform" },
];

/* ================================================================ Change requests */
export const REQUESTS: ChangeRequest[] = [
  { id: "RRC-3301", subject: "Retry interval", from: "48 hours", to: "24 hours", requestedBy: "P. Wanjiru", requestedAt: "Aug 22 · 14:20", status: "Pending", risk: "Medium", reason: "Recovery data shows 24h recovers 9pp better on retry 2; capacity signed off.", approvals: [{ role: "Risk", who: "V. Kiprop", state: "Approved" }, { role: "Product", who: "P. Wanjiru", state: "Pending" }, { role: "Super Admin", who: "J. Mwangi", state: "Pending" }] },
  { id: "RRC-3302", subject: "DUN-02 message copy", from: "Final attempt tomorrow", to: "Final attempt tomorrow — top up now, keep Premium", requestedBy: "A. Njoroge", requestedAt: "Aug 21 · 09:05", status: "Pending", risk: "Low", reason: "A/B variant B converted +6.1pp; promote to full traffic.", approvals: [{ role: "Product", who: "P. Wanjiru", state: "Approved" }, { role: "Super Admin", who: "J. Mwangi", state: "Pending" }] },
  { id: "RRC-3303", subject: "Max mandate amount", from: "KES 500,000 / cycle", to: "KES 750,000 / cycle", requestedBy: "D. Kimani", requestedAt: "Aug 20 · 16:44", status: "Pending", risk: "High", reason: "Enterprise payroll sweeps need a higher ceiling (Safaricom contract).", approvals: [{ role: "Risk", who: "V. Kiprop", state: "Pending" }, { role: "Finance", who: "R. Otieno", state: "Pending" }, { role: "Super Admin", who: "J. Mwangi", state: "Pending" }] },
  { id: "RRC-3299", subject: "Grace period after final failure", from: "2 days", to: "3 days", requestedBy: "V. Kiprop", requestedAt: "Aug 14 · 11:30", status: "Approved", risk: "Low", reason: "Align with CBK fair-treatment guidance.", approvals: [{ role: "Risk", who: "V. Kiprop", state: "Approved" }, { role: "Super Admin", who: "J. Mwangi", state: "Approved" }] },
  { id: "RRC-3296", subject: "Weekend retries", from: "Yes", to: "No", requestedBy: "V. Kiprop", requestedAt: "Jan 15 · 10:00", status: "Deployed", risk: "Medium", reason: "Collections policy — weekend pressure harms vulnerable users.", approvals: [{ role: "Risk", who: "V. Kiprop", state: "Approved" }, { role: "Product", who: "P. Wanjiru", state: "Approved" }, { role: "Super Admin", who: "J. Mwangi", state: "Approved" }] },
  { id: "RRC-3290", subject: "DUN-01 channels", from: "SMS", to: "Push + SMS", requestedBy: "P. Wanjiru", requestedAt: "Mar 30 · 08:15", status: "Deployed", risk: "Low", reason: "Push doubles reminder reach at zero SMS cost.", approvals: [{ role: "Product", who: "P. Wanjiru", state: "Approved" }, { role: "Super Admin", who: "J. Mwangi", state: "Approved" }] },
];

/* ================================================================ Audit trail */
export const RECUR_AUDIT: RecurringAudit[] = [
  { id: "REA-2187", date: "Aug 23 · 09:12", admin: "Jeckonia Kwasa", area: "Failed queue", change: "FPD-2211 marked recovered (manual)", from: "Retry pending", to: "Recovered", reason: "User paid via agent after reminder 2" },
  { id: "REA-2186", date: "Aug 23 · 06:40", admin: "System", area: "Retries", change: "Nightly retry batch", from: "—", to: "1,240 attempted · 558 recovered", reason: "Scheduled run 06:00 window" },
  { id: "REA-2185", date: "Aug 22 · 17:02", admin: "Pauline Wanjiru", area: "Plans", change: "plan-insurance-plus paused", from: "Active", to: "Paused", reason: "Underwriter rate review — no new signups" },
  { id: "REA-2184", date: "Aug 22 · 10:00", admin: "Risk (auto)", area: "Mandates", change: "PAY-89012 paused", from: "Active", to: "Paused", reason: "Account frozen — KYC re-verification" },
  { id: "REA-2183", date: "Aug 21 · 15:31", admin: "Alex Njoroge", area: "Dunning", change: "DUN-06 card-expiring campaign paused", from: "Active", to: "Paused", reason: "Card list freshness issue — data engineering fix" },
  { id: "REA-2182", date: "Aug 20 · 16:44", admin: "Daniel Kimani", area: "Guardrails", change: "RRC-3303 filed (max mandate amount)", from: "KES 500,000", to: "KES 750,000", reason: "Enterprise payroll sweeps ceiling" },
  { id: "REA-2181", date: "Aug 20 · 08:00", admin: "System", area: "Lifecycle", change: "Auto-cancel batch (14 mandates)", from: "Grace", to: "Cancelled", reason: "Grace period elapsed — win-back pool" },
  { id: "REA-2180", date: "Aug 19 · 14:26", admin: "Jeckonia Kwasa", area: "Config", change: "Smart retry timing set to pilot", from: "off", to: "Pilot — off", reason: "5% cohort for 2 weeks, then review" },
  { id: "REA-2179", date: "Aug 18 · 09:03", admin: "System", area: "Retries", change: "PAY-67890 cancelled after max retries", from: "Retry 3", to: "Cancelled", reason: "Card expired — no update after final notice" },
  { id: "REA-2178", date: "Aug 16 · 12:00", admin: "Product (auto)", area: "Lifecycle", change: "PAY-15005 trial started", from: "—", to: "Trial", reason: "Signup flow — 7-day free trial" },
];

/* ================================================================ Permissions matrix */
export const RECUR_PERMISSIONS: { area: string; actions: string[]; support: string; finance: string; risk: string; product: string; superAdmin: string }[] = [
  { area: "Mandates", actions: ["Pause / resume", "Skip cycle", "Cancel"], support: "Full", finance: "View", risk: "Full", product: "Full + 2FA", superAdmin: "Full + 2FA" },
  { area: "Mandates", actions: ["Change amount / billing day"], support: "View", finance: "View", risk: "View", product: "Full", superAdmin: "Full + 2FA" },
  { area: "Mandates", actions: ["Create / delete"], support: "None", finance: "None", risk: "None", product: "Full", superAdmin: "Full + 2FA" },
  { area: "Failed queue", actions: ["Retry now", "Mark recovered", "Extend grace"], support: "Full", finance: "View", risk: "Full", product: "Full", superAdmin: "Full + 2FA" },
  { area: "Plans & pricing", actions: ["Create / edit / clone"], support: "None", finance: "View", risk: "View", product: "Full", superAdmin: "Full + 2FA" },
  { area: "Plans & pricing", actions: ["Retire plan", "Change price"], support: "None", finance: "Full + 2FA", risk: "View", product: "Full + 2FA", superAdmin: "Full + 2FA" },
  { area: "Dunning", actions: ["Edit / pause campaigns", "A/B tests"], support: "None", finance: "None", risk: "View", product: "Full", superAdmin: "Full + 2FA" },
  { area: "Services", actions: ["Pause service", "Freeze signups"], support: "None", finance: "View", risk: "Full + 2FA", product: "Full + 2FA", superAdmin: "Full + 2FA" },
  { area: "Configuration", actions: ["Retry / billing settings"], support: "None", finance: "View", risk: "Full + 2FA", product: "Full + 2FA", superAdmin: "Full + 2FA" },
  { area: "Approvals", actions: ["Approve / reject CRs"], support: "None", finance: "Full (Finance CRs)", risk: "Full (Risk CRs)", product: "Full (Product CRs)", superAdmin: "Full + 2FA" },
  { area: "Audit", actions: ["Export (7-year retention)"], support: "View", finance: "View", risk: "Full", product: "View", superAdmin: "Full + 2FA" },
];

/* ================================================================ Analytics (§22.4) */
export const ANALYTICS: { metric: string; value: string; trend: string; tone: string; note: string }[] = [
  { metric: "Total recurring revenue", value: "KES 71.55M/mo", trend: "+8.4%", tone: "green", note: "Across 10 services" },
  { metric: "Recurring share of total revenue", value: "38.5%", trend: "+2.1pp", tone: "green", note: "Board target 45% by Q4" },
  { metric: "Subscription churn (overall)", value: "3.8%", trend: "-0.4pp", tone: "green", note: "30-day rolling" },
  { metric: "Failed payment rate", value: "4.2%", trend: "-0.8pp", tone: "green", note: "Of 96K charges/mo" },
  { metric: "Recovery rate (after retry)", value: "72%", trend: "+5pp", tone: "green", note: "Within 3 retries" },
  { metric: "Retry success — 1st", value: "45%", trend: "—", tone: "grey", note: "48h after failure" },
  { metric: "Retry success — 2nd", value: "20%", trend: "—", tone: "grey", note: "96h after failure" },
  { metric: "Retry success — 3rd", value: "7%", trend: "—", tone: "grey", note: "144h after failure" },
  { metric: "Dunning recovery (30d)", value: "KES 2.3M", trend: "+12%", tone: "green", note: "Reminders + win-backs" },
];

/* ================================================================ KPI strip builder */
export const RECUR_KPI = (s: { services: Service[]; mandates: Mandate[]; failed: FailedPayment[]; pending: number; campaigns: Campaign[] }) => {
  const mrr = s.services.reduce((a, x) => a + x.mrr, 0);
  const retrying = s.failed.filter((f) => f.status === "Retry pending").length;
  const recoverable = s.failed.filter((f) => f.status !== "Cancelled" && f.status !== "Recovered").reduce((a, x) => a + x.amount, 0);
  return [
    { label: "Recurring revenue", value: `KES ${(mrr / 1e6).toFixed(2)}M`, note: "per month · 38.5% of total", icon: "bi-graph-up-arrow", tone: "green" },
    { label: "Active mandates", value: s.mandates.filter((m) => m.status === "Active" || m.status === "Trial").length.toLocaleString("en-KE"), note: `${s.mandates.filter((m) => m.status === "Paused").length} paused · ${s.mandates.filter((m) => m.status === "Cancelled").length} cancelled`, icon: "bi-arrow-repeat", tone: "blue" },
    { label: "Failed queue", value: String(retrying), note: `KES ${Math.round(recoverable / 1000)}K recoverable`, icon: "bi-exclamation-triangle", tone: retrying > 6 ? "amber" : "green" },
    { label: "Recovery rate", value: "72%", note: "after retry · +5pp", icon: "bi-arrow-counterclockwise", tone: "green" },
    { label: "Churn", value: "3.8%", note: "overall · -0.4pp", icon: "bi-person-dash", tone: "green" },
    { label: "Pending CRs", value: String(s.pending), note: "needs approval", icon: "bi-hourglass-split", tone: s.pending > 0 ? "amber" : "green" },
  ];
};
