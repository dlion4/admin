/* ============================================================
   Page 1 — Admin Dashboard Home · data layer
   ============================================================ */

export type Trend = "up" | "down" | "flat";

export type HeroMetric = {
  id: string; label: string; value: string; raw: number; trend: Trend;
  delta: string; period: string; spark: number[]; color: string; icon: string;
};

const s = (base: number, n = 18, vol = 0.09, drift = 0.012) =>
  Array.from({ length: n }, (_, i) => Math.round(base * (1 + drift * i + (Math.sin(i * 1.7) + Math.cos(i * 0.9)) * vol * 0.5)));

export const HERO_METRICS: HeroMetric[] = [
  { id: "portfolio", label: "Total portfolio value", value: "KES 2.47B", raw: 2_470_000_000, trend: "up", delta: "+12.3%", period: "vs last month", spark: s(2200), color: "#12b76a", icon: "bi-safe2" },
  { id: "users", label: "Total users", value: "148,392", raw: 148392, trend: "up", delta: "+8,412", period: "new this month", spark: s(132000, 18, 0.04), color: "#2e90fa", icon: "bi-people" },
  { id: "active", label: "Active users (30d)", value: "89,214", raw: 89214, trend: "up", delta: "+5.2%", period: "daily active", spark: s(82000, 18, 0.05), color: "#7a5af8", icon: "bi-person-check" },
  { id: "txcount", label: "Transactions (30d)", value: "1,247,893", raw: 1247893, trend: "up", delta: "+15.7%", period: "vs last month", spark: s(1_050_000, 18, 0.07), color: "#0ba5ec", icon: "bi-arrow-left-right" },
  { id: "txvolume", label: "Transaction volume (30d)", value: "KES 18.6B", raw: 18_600_000_000, trend: "up", delta: "+22.1%", period: "vs last month", spark: s(14_800, 18, 0.1), color: "#12b76a", icon: "bi-graph-up-arrow" },
  { id: "revenue", label: "Revenue (30d)", value: "KES 186M", raw: 186_000_000, trend: "up", delta: "+18.4%", period: "transaction fees", spark: s(152, 18, 0.11), color: "#16b364", icon: "bi-cash-coin" },
  { id: "mrr", label: "MRR (subscriptions)", value: "KES 42.3M", raw: 42_300_000, trend: "up", delta: "+3.1%", period: "recurring", spark: s(39, 18, 0.05), color: "#875bf7", icon: "bi-arrow-repeat" },
  { id: "net", label: "Net revenue", value: "KES 124M", raw: 124_000_000, trend: "up", delta: "+14.2%", period: "operational profit", spark: s(104, 18, 0.09), color: "#12b76a", icon: "bi-piggy-bank" },
  { id: "cost", label: "Cost of operations (30d)", value: "KES 62M", raw: 62_000_000, trend: "up", delta: "+8.1%", period: "infra + staff", spark: s(56, 18, 0.06), color: "#f79009", icon: "bi-receipt" },
];

export type RevenueSource = { source: string; amount: number; pct: number; trend: Trend; mom: string; color: string; owner: string; margin: number };
export const REVENUE_SOURCES: RevenueSource[] = [
  { source: "Transaction fees", amount: 142_000_000, pct: 76.3, trend: "up", mom: "+KES 18.2M", color: "#12b76a", owner: "Payments", margin: 71 },
  { source: "Card fees", amount: 18_500_000, pct: 9.9, trend: "up", mom: "+KES 2.1M", color: "#2e90fa", owner: "Cards", margin: 54 },
  { source: "Utility commissions", amount: 12_800_000, pct: 6.9, trend: "flat", mom: "-KES 0.3M", color: "#7a5af8", owner: "Utilities", margin: 48 },
  { source: "Loan interest", amount: 12_300_000, pct: 6.6, trend: "up", mom: "+KES 3.2M", color: "#f79009", owner: "Credit", margin: 63 },
  { source: "Subscription (VIP)", amount: 8_200_000, pct: 4.4, trend: "up", mom: "+KES 1.4M", color: "#16b364", owner: "Growth", margin: 88 },
  { source: "FX margins", amount: 4_500_000, pct: 2.4, trend: "down", mom: "-KES 0.8M", color: "#ee46bc", owner: "Treasury", margin: 74 },
  { source: "Penalty fees", amount: 1_800_000, pct: 1.0, trend: "flat", mom: "+KES 0.1M", color: "#98a2b3", owner: "Credit", margin: 96 },
];

export const REVENUE_12M = [
  { m: "Sep", rev: 108, cost: 47 }, { m: "Oct", rev: 116, cost: 49 }, { m: "Nov", rev: 121, cost: 51 },
  { m: "Dec", rev: 139, cost: 58 }, { m: "Jan", rev: 128, cost: 53 }, { m: "Feb", rev: 134, cost: 54 },
  { m: "Mar", rev: 145, cost: 56 }, { m: "Apr", rev: 151, cost: 57 }, { m: "May", rev: 158, cost: 58 },
  { m: "Jun", rev: 166, cost: 59 }, { m: "Jul", rev: 172, cost: 61 }, { m: "Aug", rev: 186, cost: 62 },
];

export type HealthCard = {
  id: string; name: string; status: "ok" | "warn" | "down"; headline: string; detail: string;
  lastCheck: string; icon: string; metrics: { k: string; v: string }[]; history: number[];
};
export const SYSTEM_HEALTH: HealthCard[] = [
  { id: "api", name: "API uptime", status: "ok", headline: "99.97%", detail: "12h avg · four nines this month", lastCheck: "30s ago", icon: "bi-hdd-network", history: [99.98, 99.99, 99.95, 99.97, 99.99, 99.96, 99.97], metrics: [{ k: "p50 latency", v: "38 ms" }, { k: "p95 latency", v: "124 ms" }, { k: "p99 latency", v: "410 ms" }, { k: "Requests (1h)", v: "4,812,004" }, { k: "5xx rate", v: "0.03%" }] },
  { id: "gateway", name: "Payment gateway", status: "ok", headline: "Operational", detail: "M-Pesa OK · Cards OK · Banks OK", lastCheck: "30s ago", icon: "bi-credit-card", history: [99.2, 99.4, 99.1, 99.6, 99.5, 99.3, 99.4], metrics: [{ k: "M-Pesa success", v: "99.2%" }, { k: "Visa success", v: "99.8%" }, { k: "Mastercard success", v: "99.7%" }, { k: "PesaLink success", v: "98.9%" }, { k: "Bank direct", v: "98.5%" }] },
  { id: "fraud", name: "Fraud engine", status: "ok", headline: "Active", detail: "23 alerts pending review", lastCheck: "30s ago", icon: "bi-shield-check", history: [18, 21, 19, 26, 24, 22, 23], metrics: [{ k: "Model version", v: "risk-v4.2.1" }, { k: "Alerts (1h)", v: "7" }, { k: "Auto-blocked", v: "14" }, { k: "False positive rate", v: "6.4%" }, { k: "Scoring latency", v: "42 ms" }] },
  { id: "support", name: "Support queue", status: "warn", headline: "12 open", detail: "3 urgent · avg response 4.2 min", lastCheck: "1m ago", icon: "bi-headset", history: [6, 8, 9, 14, 11, 13, 12], metrics: [{ k: "Urgent", v: "3" }, { k: "Agents online", v: "5 of 8" }, { k: "SLA breach risk", v: "2 tickets" }, { k: "CSAT (7d)", v: "4.6 / 5" }, { k: "Backlog age", v: "38 min" }] },
  { id: "db", name: "Database (primary)", status: "ok", headline: "Healthy", detail: "340 GB used · 1.2 TB available", lastCheck: "30s ago", icon: "bi-database", history: [61, 62, 63, 64, 64, 65, 66], metrics: [{ k: "Connections", v: "412 / 1000" }, { k: "Slow queries (1h)", v: "3" }, { k: "Cache hit", v: "99.4%" }, { k: "IOPS", v: "18,400" }, { k: "Vacuum", v: "Completed 02:14" }] },
  { id: "replica", name: "Database (replica)", status: "ok", headline: "In sync", detail: "Replication lag 0.3s", lastCheck: "30s ago", icon: "bi-hdd-stack", history: [0.4, 0.3, 0.5, 0.3, 0.2, 0.3, 0.3], metrics: [{ k: "Lag", v: "0.3 s" }, { k: "Read QPS", v: "9,120" }, { k: "Failover ready", v: "Yes" }, { k: "Last promotion drill", v: "12 Aug" }, { k: "Region", v: "af-south-1b" }] },
  { id: "jobs", name: "Background jobs", status: "ok", headline: "847 / 847", detail: "0 failed in the last 24 hours", lastCheck: "30s ago", icon: "bi-cpu", history: [840, 845, 838, 847, 847, 846, 847], metrics: [{ k: "Workers", v: "24" }, { k: "Retries", v: "11" }, { k: "Longest job", v: "settlement-build 4m 12s" }, { k: "Scheduled next", v: "14:45 recon" }, { k: "Dead letters", v: "0" }] },
  { id: "cdn", name: "CDN & static assets", status: "ok", headline: "99.99%", detail: "Hit rate 99.99% · 12 ms avg", lastCheck: "1m ago", icon: "bi-globe2", history: [99.98, 99.99, 99.99, 99.97, 99.99, 99.99, 99.99], metrics: [{ k: "Edge PoPs", v: "6 (Nairobi, JNB, LON)" }, { k: "Bandwidth (1h)", v: "412 GB" }, { k: "Origin shield", v: "Enabled" }, { k: "Purges today", v: "3" }, { k: "TLS", v: "1.3" }] },
  { id: "queue", name: "Message queue", status: "ok", headline: "342 msgs", detail: "0 dead letters · consumers healthy", lastCheck: "30s ago", icon: "bi-inboxes", history: [280, 310, 298, 342, 331, 350, 342], metrics: [{ k: "Depth", v: "342" }, { k: "Consumers", v: "18" }, { k: "Oldest message", v: "1.8 s" }, { k: "Throughput", v: "2,140 / min" }, { k: "DLQ", v: "0" }] },
];

export type Alert = {
  id: string; priority: "critical" | "warning" | "info"; category: string; title: string; detail: string;
  action: string; age: string; owner: string; impact: string; playbook: string[];
};
export const ALERTS: Alert[] = [
  { id: "ALT-9012", priority: "critical", category: "Security", title: "3 accounts flagged for simultaneous multi-device withdrawal", detail: "Accounts #89234, #45120 and #77812 each attempted withdrawals from 3+ device fingerprints within 90 seconds.", action: "Review", age: "2 min", owner: "Fraud Ops", impact: "KES 1.24M exposure", playbook: ["Freeze the three accounts", "Pull device fingerprint graph", "Contact customers on registered number", "Raise SAR if confirmed"] },
  { id: "ALT-9011", priority: "critical", category: "Payments", title: "M-Pesa callback delay above 5 minutes", detail: "12 STK transactions have not received a result callback. Safaricom status page shows degraded C2B.", action: "Investigate", age: "8 min", owner: "Payments", impact: "12 pending txns · KES 486K", playbook: ["Check Daraja status", "Replay callbacks from DLQ", "Notify affected customers", "Open partner ticket"] },
  { id: "ALT-9010", priority: "critical", category: "Fraud", title: "Account takeover attempt detected — User #11223", detail: "Four failed passkey challenges then a successful SIM-swap-style recovery attempt from an unrecognised ASN.", action: "Block", age: "15 min", owner: "Fraud Ops", impact: "1 account · KES 312K balance", playbook: ["Block session and revoke tokens", "Force re-KYC", "Blacklist device fingerprint", "Notify customer"] },
  { id: "ALT-9009", priority: "warning", category: "Fraud", title: "Daily fraud threshold 78% reached", detail: "KES 14.2M of the KES 18M automated block ceiling has been consumed for today.", action: "Review", age: "22 min", owner: "Risk", impact: "Auto-block may pause", playbook: ["Review top blocked merchants", "Consider raising ceiling", "Notify compliance"] },
  { id: "ALT-9008", priority: "warning", category: "Partners", title: "Partner QuickLend settlement overdue by 2 days", detail: "KES 4.2M settlement has not been received. Partner API also reporting HTTP 503 intermittently.", action: "Contact", age: "1 hour", owner: "Partnerships", impact: "KES 4.2M receivable", playbook: ["Email finance contact", "Escalate to relationship manager", "Withhold next disbursement"] },
  { id: "ALT-9007", priority: "warning", category: "Liquidity", title: "Card settlement pool at 82% utilisation", detail: "Visa prefunding pool will breach the 90% ceiling by 16:00 EAT at the current burn rate.", action: "Top up", age: "2 hours", owner: "Treasury", impact: "Card auths could decline", playbook: ["Initiate KES 60M sweep from operating account", "Confirm with i&M", "Raise ceiling temporarily"] },
  { id: "ALT-9006", priority: "warning", category: "Operations", title: "3 support agents offline during peak hours", detail: "Queue depth rising; average first response has slipped from 2.1 min to 4.2 min.", action: "Reassign", age: "3 hours", owner: "Support Lead", impact: "12 open tickets", playbook: ["Page standby agents", "Enable deflection macros", "Extend SLA notice"] },
  { id: "ALT-9005", priority: "warning", category: "API", title: "UnionPay circuit breaker is OPEN", detail: "5 consecutive failures tripped the breaker at 14:28. Next probe at 14:32:30.", action: "Investigate", age: "4 hours", owner: "Platform", impact: "2,100 users (1.4%)", playbook: ["Check UnionPay status", "Verify certificate pinning", "Force half-open probe"] },
  { id: "ALT-9004", priority: "info", category: "KYC", title: "New KYC batch: 347 pending verification", detail: "Onfido returned results overnight — 312 clear, 24 consider, 11 rejected.", action: "Process", age: "30 min", owner: "Compliance", impact: "347 users waiting", playbook: ["Bulk approve clear results", "Manually review 24 consider cases", "Notify rejected users"] },
  { id: "ALT-9003", priority: "info", category: "System", title: "Maintenance scheduled: Sunday 02:00 EAT", detail: "Ledger partition migration with an expected 45-minute read-only window.", action: "Details", age: "4 hours", owner: "Platform", impact: "Read-only 45 min", playbook: ["Publish status page notice", "Schedule customer broadcast", "Freeze deploys 24h prior"] },
  { id: "ALT-9002", priority: "info", category: "Business", title: "12 new partner applications received today", detail: "Includes 3 SACCOs, 2 insurance aggregators and 1 cross-border remittance provider.", action: "Review", age: "5 hours", owner: "Partnerships", impact: "Pipeline +12", playbook: ["Triage by segment", "Run initial sanctions screen", "Assign due diligence owner"] },
  { id: "ALT-9001", priority: "info", category: "Finance", title: "KRA excise duty remittance prepared", detail: "KES 8.42M excise for the period is staged and awaiting Finance Manager approval.", action: "Approve", age: "6 hours", owner: "Finance", impact: "Filing due Aug 20", playbook: ["Verify computation", "Approve remittance", "File on iTax"] },
];

export type TxHour = { hour: string; today: number; yesterday: number; success: number; anomaly?: string };
export const TX_24H: TxHour[] = [
  { hour: "00:00", today: 2140, yesterday: 2010, success: 99.4 }, { hour: "01:00", today: 1420, yesterday: 1380, success: 99.5 },
  { hour: "02:00", today: 980, yesterday: 940, success: 99.6 }, { hour: "03:00", today: 760, yesterday: 720, success: 99.7 },
  { hour: "04:00", today: 890, yesterday: 810, success: 99.6 }, { hour: "05:00", today: 1840, yesterday: 1610, success: 99.4 },
  { hour: "06:00", today: 4120, yesterday: 3810, success: 99.2 }, { hour: "07:00", today: 7420, yesterday: 6980, success: 99.1 },
  { hour: "08:00", today: 9840, yesterday: 9120, success: 98.9 }, { hour: "09:00", today: 11240, yesterday: 10420, success: 99.0 },
  { hour: "10:00", today: 12180, yesterday: 11340, success: 99.2 }, { hour: "11:00", today: 12640, yesterday: 11820, success: 99.3 },
  { hour: "12:00", today: 14210, yesterday: 12980, success: 99.1, anomaly: "Lunch-hour spike +9.5% above forecast" },
  { hour: "13:00", today: 13480, yesterday: 12640, success: 99.2 }, { hour: "14:00", today: 12920, yesterday: 12210, success: 98.7, anomaly: "Success rate dip — M-Pesa callback latency" },
  { hour: "15:00", today: 12410, yesterday: 11880, success: 99.1 }, { hour: "16:00", today: 13180, yesterday: 12440, success: 99.2 },
  { hour: "17:00", today: 15240, yesterday: 14120, success: 99.0 }, { hour: "18:00", today: 16890, yesterday: 15340, success: 98.9, anomaly: "Evening peak — payroll disbursements" },
  { hour: "19:00", today: 15120, yesterday: 14210, success: 99.1 }, { hour: "20:00", today: 12480, yesterday: 11940, success: 99.3 },
  { hour: "21:00", today: 8940, yesterday: 8620, success: 99.4 }, { hour: "22:00", today: 5210, yesterday: 5040, success: 99.5 },
  { hour: "23:00", today: 3180, yesterday: 3020, success: 99.5 },
];

export type CreditMetric = { label: string; value: string; trend: Trend; mom: string; tone: "good" | "bad" | "flat" };
export const CREDIT_METRICS: CreditMetric[] = [
  { label: "Total defaulters", value: "1,247", trend: "up", mom: "+23", tone: "bad" },
  { label: "Amount at risk", value: "KES 34.5M", trend: "down", mom: "-KES 2.1M recovered", tone: "good" },
  { label: "Accounts with negative balance", value: "892", trend: "flat", mom: "+12", tone: "flat" },
  { label: "Amounts below zero", value: "KES 12.8M", trend: "down", mom: "-KES 1.4M", tone: "good" },
  { label: "Pending recovery actions", value: "354", trend: "down", mom: "-18", tone: "good" },
  { label: "Last 30d recovery rate", value: "67%", trend: "up", mom: "+4 pts", tone: "good" },
  { label: "Loans in arrears (30d+)", value: "423", trend: "down", mom: "-31", tone: "good" },
  { label: "Loans in arrears (60d+)", value: "187", trend: "flat", mom: "+2", tone: "flat" },
  { label: "Loans in arrears (90d+)", value: "78", trend: "up", mom: "+5", tone: "bad" },
  { label: "Write-offs (30d)", value: "KES 1.2M", trend: "down", mom: "-KES 0.8M", tone: "good" },
  { label: "Recovery agents active", value: "4", trend: "flat", mom: "—", tone: "flat" },
  { label: "Legal actions initiated", value: "12", trend: "up", mom: "+3", tone: "bad" },
];

export type Defaulter = {
  id: string; user: string; account: string; phone: string; county: string; product: string;
  principal: number; outstanding: number; daysPastDue: number; bucket: "30d" | "60d" | "90d" | "Written off";
  lastPayment: string; agent: string; status: "Recovering" | "Legal" | "Negotiating" | "Unreachable" | "Restructured";
  score: number; attempts: number;
};
const COUNTIES = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Machakos", "Nyeri", "Kakamega", "Thika", "Kisii", "Malindi", "Kitale"];
const AGENTS = ["Grace Wanjiru", "Peter Njoroge", "Faith Chebet", "Dennis Otieno"];
const PRODUCTS = ["Boost Loan", "Salary Advance", "Merchant Float", "Asset Finance", "Overdraft"];
const NAMES = [
  "Amina Hassan", "Brian Otieno", "Lucy Muthoni", "David Kimani", "Fatuma Abdalla", "James Mutua",
  "Wanjiru Karanja", "Samuel Okello", "Naomi Chemtai", "Kevin Barasa", "Esther Njeri", "Collins Ouma",
  "Mercy Akinyi", "Patrick Kiptoo", "Zainab Ali", "Joseph Maina", "Beatrice Wairimu", "Dennis Mwangi",
  "Sharon Adhiambo", "Felix Mutiso", "Caroline Nyambura", "Anthony Wafula", "Rose Atieno", "Vincent Kariuki",
];
export const DEFAULTERS: Defaulter[] = NAMES.map((n, i) => {
  const dpd = [12, 34, 47, 61, 78, 96, 118, 142][i % 8] + (i * 3) % 21;
  const outstanding = 18_000 + ((i * 47_311) % 940_000);
  return {
    id: `DEF-${4100 + i}`,
    user: n,
    account: `#${(10000 + i * 733) % 99999}`,
    phone: `+2547${(10 + i).toString().padStart(2, "0")} ${(100 + i * 7).toString().slice(0, 3)} ${(200 + i * 13).toString().slice(0, 3)}`,
    county: COUNTIES[i % COUNTIES.length],
    product: PRODUCTS[i % PRODUCTS.length],
    principal: Math.round(outstanding * 0.82),
    outstanding,
    daysPastDue: dpd,
    bucket: dpd >= 90 ? "90d" : dpd >= 60 ? "60d" : dpd >= 30 ? "30d" : "30d",
    lastPayment: ["2 days ago", "9 days ago", "3 weeks ago", "5 weeks ago", "2 months ago", "Never"][i % 6],
    agent: AGENTS[i % AGENTS.length],
    status: (["Recovering", "Negotiating", "Legal", "Unreachable", "Restructured"] as const)[i % 5],
    score: 20 + ((i * 17) % 78),
    attempts: 1 + (i % 9),
  };
});

export type QuickAction = { id: string; icon: string; label: string; hint: string; tone: string; confirm: string };
export const QUICK_ACTIONS: QuickAction[] = [
  { id: "search-user", icon: "bi-search", label: "Search user", hint: "Directory · Page 4", tone: "#2e90fa", confirm: "None" },
  { id: "freeze", icon: "bi-snow", label: "Freeze account", hint: "User detail · Page 5", tone: "#0ba5ec", confirm: "2FA + reason" },
  { id: "ledger", icon: "bi-journal-text", label: "Transaction ledger", hint: "Page 9", tone: "#7a5af8", confirm: "None" },
  { id: "fraud", icon: "bi-shield-exclamation", label: "Fraud alerts", hint: "Page 15 · 23 pending", tone: "#f04438", confirm: "None" },
  { id: "fees", icon: "bi-percent", label: "Set fees", hint: "Page 10", tone: "#12b76a", confirm: "2FA" },
  { id: "admins", icon: "bi-person-gear", label: "Manage admins", hint: "Page 29 · 18 accounts", tone: "#875bf7", confirm: "None" },
  { id: "broadcast", icon: "bi-megaphone", label: "Send broadcast", hint: "Page 36", tone: "#f79009", confirm: "Confirm message" },
  { id: "terms", icon: "bi-file-text", label: "Update T&C", hint: "Page 38", tone: "#667085", confirm: "2FA + legal review" },
  { id: "recon", icon: "bi-arrow-repeat", label: "Trigger reconciliation", hint: "Page 11", tone: "#16b364", confirm: "2FA" },
  { id: "export", icon: "bi-download", label: "Export report", hint: "Page 42", tone: "#2e90fa", confirm: "None" },
  { id: "lockdown", icon: "bi-shield-lock-fill", label: "Emergency lockdown", hint: "System-wide", tone: "#f04438", confirm: "2FA + super admin" },
  { id: "cards", icon: "bi-credit-card-2-front", label: "Manage cards", hint: "Page 23", tone: "#ee46bc", confirm: "None" },
];

export type Activity = {
  id: string; time: string; admin: string; role: string; action: string; target: string;
  details: string; ip: string; tone: "green" | "amber" | "red" | "blue"; category: string; reversible: boolean;
};
export const ACTIVITY: Activity[] = [
  { id: "AUD-88231", time: "2 min ago", admin: "Jeckonia Kwasa", role: "Super Admin", action: "Froze account", target: "User #89234", details: "Fraud suspicion — dual browser session from two counties", ip: "197.232.14.88", tone: "red", category: "Users", reversible: true },
  { id: "AUD-88230", time: "8 min ago", admin: "Sarah Kamau", role: "Finance Manager", action: "Approved settlement", target: "Partner #12 — QuickLend", details: "KES 4.2M disbursed to i&M 0034 5566 7788", ip: "197.232.14.91", tone: "green", category: "Finance", reversible: false },
  { id: "AUD-88229", time: "15 min ago", admin: "James Odhiambo", role: "Platform Admin", action: "Updated fee schedule", target: "All users", details: "Mobile money tier 3: 0.50% → 0.45%, effective 01 Sep", ip: "197.232.14.77", tone: "amber", category: "Finance", reversible: true },
  { id: "AUD-88228", time: "22 min ago", admin: "Jeckonia Kwasa", role: "Super Admin", action: "Granted VIP status", target: "User #4512", details: "Exempt from transaction fees for 12 months", ip: "197.232.14.88", tone: "green", category: "Users", reversible: true },
  { id: "AUD-88227", time: "31 min ago", admin: "Mary Wanjiku", role: "Operations Manager", action: "Reversed transaction", target: "TXN-882341", details: "Duplicate charge KES 12,400 corrected and refunded", ip: "197.232.14.62", tone: "amber", category: "Transactions", reversible: false },
  { id: "AUD-88226", time: "45 min ago", admin: "David Kiplagat", role: "Compliance Officer", action: "Blacklisted device", target: "Device FP #8823", details: "Linked to a 6-account fraud ring in Nakuru", ip: "197.232.14.55", tone: "red", category: "Fraud", reversible: true },
  { id: "AUD-88225", time: "1 hour ago", admin: "Sarah Kamau", role: "Finance Manager", action: "Closed SAR", target: "SAR-2026-034", details: "False positive confirmed after source-of-funds review", ip: "197.232.14.91", tone: "green", category: "Compliance", reversible: false },
  { id: "AUD-88224", time: "1 hour ago", admin: "James Odhiambo", role: "Platform Admin", action: "Updated KYC rules", target: "System", details: "Added proof-of-address requirement for tier 3 upgrades", ip: "197.232.14.77", tone: "blue", category: "Compliance", reversible: true },
  { id: "AUD-88223", time: "2 hours ago", admin: "Faith Chebet", role: "Support Lead", action: "Escalated ticket", target: "SUP-2026-1042", details: "Customer unable to withdraw after SIM swap — routed to fraud", ip: "197.232.14.40", tone: "amber", category: "Support", reversible: false },
  { id: "AUD-88222", time: "2 hours ago", admin: "Jeckonia Kwasa", role: "Super Admin", action: "Rotated API credential", target: "Safaricom Daraja", details: "Consumer secret rotated; old key valid for 60 more minutes", ip: "197.232.14.88", tone: "blue", category: "System", reversible: false },
  { id: "AUD-88221", time: "3 hours ago", admin: "Mary Wanjiku", role: "Operations Manager", action: "Adjusted withdrawal limit", target: "User #33456", details: "Daily ceiling raised KES 150,000 → KES 500,000 (VIP)", ip: "197.232.14.62", tone: "green", category: "Users", reversible: true },
  { id: "AUD-88220", time: "3 hours ago", admin: "David Kiplagat", role: "Compliance Officer", action: "Filed SAR", target: "SAR-2026-035", details: "Structuring pattern across 14 deposits below KES 100,000", ip: "197.232.14.55", tone: "red", category: "Compliance", reversible: false },
  { id: "AUD-88219", time: "4 hours ago", admin: "Peter Njoroge", role: "Analyst", action: "Exported report", target: "Revenue by channel (Aug)", details: "CSV export of 1.2M rows — watermarked and logged", ip: "197.232.14.31", tone: "blue", category: "Analytics", reversible: false },
  { id: "AUD-88218", time: "5 hours ago", admin: "James Odhiambo", role: "Platform Admin", action: "Enabled feature flag", target: "instant-pesalink", details: "Rolled out to 25% of Nairobi users", ip: "197.232.14.77", tone: "green", category: "System", reversible: true },
  { id: "AUD-88217", time: "6 hours ago", admin: "Sarah Kamau", role: "Finance Manager", action: "Topped up pool", target: "Card settlement pool", details: "KES 60M swept from operating account at i&M", ip: "197.232.14.91", tone: "green", category: "Finance", reversible: false },
  { id: "AUD-88216", time: "7 hours ago", admin: "Jeckonia Kwasa", role: "Super Admin", action: "Created admin", target: "Cynthia Awuor — Support Agent", details: "Tier 8, reports to Support Lead, passkey pending", ip: "197.232.14.88", tone: "blue", category: "Admins", reversible: true },
  { id: "AUD-88215", time: "8 hours ago", admin: "Mary Wanjiku", role: "Operations Manager", action: "Held transaction", target: "TXN-881902", details: "KES 2.4M merchant payout held for source verification", ip: "197.232.14.62", tone: "amber", category: "Transactions", reversible: true },
  { id: "AUD-88214", time: "9 hours ago", admin: "David Kiplagat", role: "Compliance Officer", action: "Approved KYC batch", target: "312 users", details: "Onfido clear results bulk-approved", ip: "197.232.14.55", tone: "green", category: "Compliance", reversible: false },
  { id: "AUD-88213", time: "10 hours ago", admin: "Faith Chebet", role: "Support Lead", action: "Published macro", target: "Support templates", details: "New macro: 'M-Pesa delay — expected resolution'", ip: "197.232.14.40", tone: "blue", category: "Support", reversible: true },
  { id: "AUD-88212", time: "11 hours ago", admin: "James Odhiambo", role: "Platform Admin", action: "Suspended partner", target: "Partner #31 — PesaBora", details: "Repeated webhook signature failures; sandbox only", ip: "197.232.14.77", tone: "red", category: "Partners", reversible: true },
];

export type Channel = { name: string; share: number; volume: number; revenue: number; growth: number; color: string; txns: number; avgTicket: number; successRate: number };
export const CHANNELS: Channel[] = [
  { name: "M-Pesa", share: 52.4, volume: 9_744_000_000, revenue: 92_400_000, growth: 18.2, color: "#12b76a", txns: 653_896, avgTicket: 14_900, successRate: 99.2 },
  { name: "Card (Visa)", share: 16.8, volume: 3_124_800_000, revenue: 34_100_000, growth: 12.4, color: "#2e90fa", txns: 209_646, avgTicket: 14_905, successRate: 99.8 },
  { name: "Bank transfer", share: 12.1, volume: 2_250_600_000, revenue: 21_800_000, growth: 6.1, color: "#7a5af8", txns: 51_204, avgTicket: 43_954, successRate: 98.5 },
  { name: "Internal wallet", share: 10.4, volume: 1_934_400_000, revenue: 18_600_000, growth: 24.6, color: "#16b364", txns: 224_620, avgTicket: 8_612, successRate: 99.9 },
  { name: "Card (Mastercard)", share: 5.6, volume: 1_041_600_000, revenue: 12_400_000, growth: 9.8, color: "#f79009", txns: 78_204, avgTicket: 13_319, successRate: 99.7 },
  { name: "ATM", share: 2.7, volume: 502_200_000, revenue: 6_700_000, growth: -3.4, color: "#98a2b3", txns: 30_323, avgTicket: 16_562, successRate: 97.8 },
];

export type Task = {
  id: string; task: string; due: string; assigned: string; priority: "High" | "Medium" | "Normal";
  status: "In progress" | "Pending" | "Blocked" | "Done"; progress: number; category: string; notes: string;
};
export const TASKS: Task[] = [
  { id: "TSK-201", task: "Monthly compliance report to CBK", due: "31 Aug 2026", assigned: "David Kiplagat", priority: "High", status: "In progress", progress: 64, category: "Compliance", notes: "7 of 11 schedules complete. Schedule 8 blocked on settlement close." },
  { id: "TSK-202", task: "Partner fee renegotiation — QuickLend", due: "25 Aug 2026", assigned: "James Odhiambo", priority: "Medium", status: "Pending", progress: 10, category: "Partners", notes: "Proposal drafted at 1.8% take rate; awaiting partner counter." },
  { id: "TSK-203", task: "Q3 investor report draft", due: "05 Sep 2026", assigned: "Sarah Kamau", priority: "Medium", status: "Pending", progress: 25, category: "Investors", notes: "Financial pack ready; narrative and cohort charts outstanding." },
  { id: "TSK-204", task: "Security audit follow-up — 12 items", due: "15 Sep 2026", assigned: "Platform Team", priority: "High", status: "In progress", progress: 33, category: "Security", notes: "4 of 12 findings remediated. Two are pending vendor patches." },
  { id: "TSK-205", task: "New card BIN onboarding — Visa", due: "28 Aug 2026", assigned: "Mary Wanjiku", priority: "Normal", status: "Pending", progress: 0, category: "Cards", notes: "BIN 489712 certification slot booked for 27 Aug." },
  { id: "TSK-206", task: "KRA excise duty remittance", due: "20 Aug 2026", assigned: "Sarah Kamau", priority: "High", status: "In progress", progress: 80, category: "Tax", notes: "KES 8.42M computed; awaiting Finance Manager approval." },
  { id: "TSK-207", task: "Ledger partition migration rehearsal", due: "29 Aug 2026", assigned: "Platform Team", priority: "High", status: "In progress", progress: 55, category: "Platform", notes: "Staging rehearsal passed; production window Sunday 02:00." },
  { id: "TSK-208", task: "Recovery campaign — 90d+ arrears", due: "01 Sep 2026", assigned: "Grace Wanjiru", priority: "Medium", status: "In progress", progress: 42, category: "Credit", notes: "78 accounts; 31 contacted, 9 restructured so far." },
  { id: "TSK-209", task: "ODPC data-subject request backlog", due: "27 Aug 2026", assigned: "David Kiplagat", priority: "High", status: "Blocked", progress: 20, category: "Compliance", notes: "Blocked on legal sign-off for redaction template." },
  { id: "TSK-210", task: "Fraud model v4.3 shadow deployment", due: "08 Sep 2026", assigned: "Risk Team", priority: "Medium", status: "In progress", progress: 47, category: "Risk", notes: "Shadow mode 6 days; FPR down 1.9 pts vs v4.2.1." },
  { id: "TSK-211", task: "Support agent hiring — 3 roles", due: "12 Sep 2026", assigned: "Faith Chebet", priority: "Normal", status: "Pending", progress: 15, category: "People", notes: "Job posts live; 41 applications screened." },
  { id: "TSK-212", task: "Disaster recovery failover drill", due: "18 Sep 2026", assigned: "Platform Team", priority: "High", status: "Pending", progress: 0, category: "Platform", notes: "Quarterly requirement under CBK guidance note 4.7." },
  { id: "TSK-213", task: "Update customer T&C for card programme", due: "10 Sep 2026", assigned: "Legal", priority: "Medium", status: "In progress", progress: 60, category: "Legal", notes: "Draft v3.2 in review; needs 30-day customer notice." },
  { id: "TSK-214", task: "Renew CBK payment service provider licence", due: "30 Sep 2026", assigned: "David Kiplagat", priority: "High", status: "Pending", progress: 5, category: "Compliance", notes: "Application pack opens 01 Sep. Fees KES 1.2M." },
  { id: "TSK-215", task: "Close August settlement breaks", due: "02 Sep 2026", assigned: "Sarah Kamau", priority: "High", status: "In progress", progress: 71, category: "Finance", notes: "14 of 48 breaks remaining, all under KES 25,000." },
  { id: "TSK-216", task: "Publish Q2 transparency report", due: "22 Aug 2026", assigned: "Comms", priority: "Normal", status: "Done", progress: 100, category: "Comms", notes: "Published on paymo.co.ke/transparency on 21 Aug." },
];

export const DEFAULTER_TREND = [
  { m: "Mar", risk: 41.2, recovered: 3.1 }, { m: "Apr", risk: 39.8, recovered: 3.6 },
  { m: "May", risk: 38.4, recovered: 4.0 }, { m: "Jun", risk: 37.1, recovered: 4.4 },
  { m: "Jul", risk: 36.6, recovered: 4.9 }, { m: "Aug", risk: 34.5, recovered: 5.4 },
];
