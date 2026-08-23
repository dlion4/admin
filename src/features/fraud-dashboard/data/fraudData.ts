import { kes } from "../../../lib/format";

/* ================================================================
   Page 15 — Fraud Dashboard · data layer
   ================================================================ */

export type AlertStatus = "New" | "In review" | "Resolved" | "Escalated";

export type FraudAlert = {
  id: string;
  time: string;
  type: string;
  userId: string;
  user: string;
  amount: number;
  risk: number;
  status: AlertStatus;
  assigned: string;
  slaH: number | null;
  channel: string;
  device: string;
  ip: string;
  factors: string[];
  kyc: string;
  ageDays: number;
};

export type FraudPattern = {
  id: string;
  name: string;
  description: string;
  method: string;
  lastDetected: string;
  freq30d: number;
  action: string;
};

export type LossRow = {
  category: string;
  amount: number;
  recovery: number;
  trend: "up" | "down" | "flat";
  share: number;
};

export type FraudRule = {
  id: string;
  name: string;
  trigger: string;
  severity: "Critical" | "High" | "Medium";
  active: boolean;
  fpRate: number;
  lastTuned: string;
  hits30d: number;
};

export type BlacklistType = {
  id: string;
  type: string;
  icon: string;
  entries: number;
  added30d: number;
  removed30d: number;
  lastUpdated: string;
  mode: "Auto + Manual" | "Manual";
};

export type BlacklistEntry = {
  id: string;
  type: string;
  value: string;
  reason: string;
  added: string;
  addedBy: string;
  hits: number;
};

export type Investigator = {
  id: string;
  name: string;
  initials: string;
  assigned: number;
  resolved: number;
  avgTime: string;
  accuracy: number;
  escalations: number;
  load: number;
};

export type Sar = {
  id: string;
  filedDate: string;
  userId: string;
  amount: number;
  type: string;
  status: "Acknowledged" | "Under review";
  receipt: string;
};

export type OverviewMetric = {
  label: string;
  value: string;
  trend: "up" | "down" | "flat";
  target: string;
  status: "green" | "amber" | "red" | "grey";
  note: string;
};

/* ---------------- §15.1 Overview metrics ---------------- */
export const OVERVIEW: OverviewMetric[] = [
  { label: "Fraud alerts (30d)", value: "234", trend: "up", target: "—", status: "grey", note: "↑ 12% vs prior 30d" },
  { label: "Confirmed fraud cases", value: "18", trend: "down", target: "< 10", status: "amber", note: "↓ 3 cases vs prior 30d" },
  { label: "Fraud amount (30d)", value: "KES 2.4M", trend: "down", target: "< KES 1M", status: "amber", note: "↓ 15% vs prior 30d" },
  { label: "Fraud rate", value: "0.023%", trend: "down", target: "< 0.05%", status: "green", note: "of transaction volume" },
  { label: "Losses recovered", value: "KES 1.6M", trend: "up", target: "> 80%", status: "green", note: "↑ 22% recovery rate · 67%" },
  { label: "False positive rate", value: "34%", trend: "down", target: "< 20%", status: "amber", note: "↓ 4% after geo retune" },
  { label: "Avg investigation time", value: "4.2 hours", trend: "down", target: "< 2 hours", status: "amber", note: "↓ 30 min vs prior" },
  { label: "Active investigations", value: "12", trend: "flat", target: "—", status: "grey", note: "4 unassigned at last check" },
  { label: "Escalated to law enforcement", value: "2", trend: "flat", target: "—", status: "grey", note: "DCI joint cases" },
  { label: "SARs filed (30d)", value: "3", trend: "flat", target: "—", status: "grey", note: "all FRA-acknowledged" },
  { label: "Blacklisted entities (30d)", value: "23", trend: "up", target: "—", status: "grey", note: "devices + IPs + IDs" },
];

/* ---------------- §15.2 Active alerts (expanded to 14) ---------------- */
export const ALERTS: FraudAlert[] = [
  { id: "FRD-2848", time: "14:32", type: "Velocity spike", userId: "PAY-55667", user: "Dennis Mutua", amount: 120_000, risk: 78, status: "New", assigned: "Unassigned", slaH: 4, channel: "M-Pesa", device: "Chrome/Android", ip: "102.x (Kisumu)", factors: ["3 withdrawals in 1h", "geo-anomaly 528km", "new device"], kyc: "Verified", ageDays: 214 },
  { id: "FRD-2847", time: "14:31", type: "Dual-device withdrawal", userId: "PAY-89012", user: "Amina Hassan", amount: 50_000, risk: 87, status: "New", assigned: "Unassigned", slaH: 4, channel: "M-Pesa", device: "Chrome/Win + Safari/iOS", ip: "102.x / 41.x", factors: ["simultaneous sessions", "account < 30d"], kyc: "Verified", ageDays: 21 },
  { id: "FRD-2846", time: "14:15", type: "Velocity spike", userId: "PAY-45123", user: "Collins Kariuki", amount: 200_000, risk: 72, status: "In review", assigned: "Sarah K.", slaH: 2, channel: "Bank transfer", device: "Chrome/Android", ip: "196.x (Mombasa)", factors: ["frequency > 3× baseline"], kyc: "Verified", ageDays: 540 },
  { id: "FRD-2845", time: "13:45", type: "Geo-anomaly", userId: "PAY-22334", user: "Esther Muthoni", amount: 80_000, risk: 65, status: "In review", assigned: "James O.", slaH: 1, channel: "ATM", device: "ATM KCB-0442", ip: "41.x (Nairobi)", factors: ["IP > 500km from usual", "night withdrawal"], kyc: "Verified", ageDays: 388 },
  { id: "FRD-2844", time: "12:30", type: "Unusual pattern", userId: "PAY-67890", user: "Brian Otieno", amount: 45_000, risk: 58, status: "Resolved", assigned: "Sarah K.", slaH: null, channel: "M-Pesa", device: "Chrome/Android", ip: "41.x (Nairobi)", factors: ["round amounts"], kyc: "Verified", ageDays: 730 },
  { id: "FRD-2843", time: "11:15", type: "Account takeover attempt", userId: "PAY-11223", user: "Victor Kiplagat", amount: 0, risk: 91, status: "New", assigned: "Unassigned", slaH: 4, channel: "Login", device: "Unknown/Tor exit", ip: "185.x (VPN)", factors: ["credential stuffing", "SIM swap 6h ago", "Tor exit node"], kyc: "Verified", ageDays: 455 },
  { id: "FRD-2842", time: "10:00", type: "Structuring", userId: "PAY-44556", user: "Grace Wambui", amount: 48_000, risk: 62, status: "In review", assigned: "David K.", slaH: 3, channel: "M-Pesa", device: "PayMo App/Android", ip: "41.x (Nairobi)", factors: ["3 TXNs just below 150K", "new beneficiaries"], kyc: "Verified", ageDays: 96 },
  { id: "FRD-2841", time: "09:41", type: "Mule pattern", userId: "PAY-66778", user: "Fatuma Ali", amount: 265_000, risk: 84, status: "Escalated", assigned: "David K.", slaH: null, channel: "Bank transfer", device: "Samsung Internet", ip: "102.x (Kisumu)", factors: ["receives from many", "forwards to one", "dormant 90d wake-up"], kyc: "Verified", ageDays: 122 },
  { id: "FRD-2840", time: "09:12", type: "Card testing", userId: "PAY-88900", user: "Rift Valley Motors", amount: 4_800, risk: 76, status: "In review", assigned: "Grace M.", slaH: 2, channel: "Card", device: "API", ip: "197.x (Nakuru)", factors: ["14 micro-authorisations", "new card BIN"], kyc: "Business", ageDays: 611 },
  { id: "FRD-2839", time: "08:55", type: "Credential stuffing", userId: "PAY-55011", user: "Hellen Achieng", amount: 0, risk: 88, status: "Resolved", assigned: "James O.", slaH: null, channel: "Login", device: "Firefox/Linux", ip: "45.x (Dar es Salaam)", factors: ["5 failed logins then success"], kyc: "Verified", ageDays: 289 },
  { id: "FRD-2838", time: "08:30", type: "Dormant wake-up", userId: "PAY-21998", user: "Alex Mwangi", amount: 150_000, risk: 61, status: "In review", assigned: "Grace M.", slaH: 5, channel: "Bank transfer", device: "Chrome/Windows", ip: "41.x (Nairobi)", factors: ["inactive 90d+", "TXN > 100K", "new device"], kyc: "Verified", ageDays: 802 },
  { id: "FRD-2837", time: "07:58", type: "Rapid cycling", userId: "PAY-77332", user: "Irene Njeri", amount: 92_000, risk: 69, status: "New", assigned: "Unassigned", slaH: 4, channel: "M-Pesa", device: "Chrome/Android", ip: "105.x (Eldoret)", factors: ["deposit → transfer → withdraw < 5min"], kyc: "Verified", ageDays: 150 },
  { id: "FRD-2836", time: "07:12", type: "SIM swap detected", userId: "PAY-33210", user: "Tonny Kimani", amount: 35_000, risk: 90, status: "Escalated", assigned: "Sarah K.", slaH: null, channel: "M-Pesa", device: "Unknown/Android", ip: "41.x (Nairobi)", factors: ["SIM changed 2h before", "withdrawal attempt"], kyc: "Verified", ageDays: 331 },
  { id: "FRD-2835", time: "06:40", type: "Account farming", userId: "PAY-99012", user: "Meshack Opiyo", amount: 12_000, risk: 57, status: "In review", assigned: "James O.", slaH: 6, channel: "M-Pesa", device: "Chrome/Android", ip: "197.x (Nakuru)", factors: ["4 accounts same device/IP"], kyc: "Pending", ageDays: 3 },
];

/* ---------------- §15.3 Pattern detection ---------------- */
export const PATTERNS: FraudPattern[] = [
  { id: "PAT-01", name: "Dual browser", description: "Same user, 2 browsers, simultaneous withdrawal", method: "Session tracking", lastDetected: "Today", freq30d: 3, action: "Auto-block + alert" },
  { id: "PAT-02", name: "Rapid cycling", description: "Deposit → transfer → withdraw in < 5 min", method: "Sequence analysis", lastDetected: "Yesterday", freq30d: 12, action: "Auto-flag" },
  { id: "PAT-03", name: "Mule account", description: "Receives from many, sends to one", method: "Network analysis", lastDetected: "3 days ago", freq30d: 2, action: "Auto-freeze" },
  { id: "PAT-04", name: "Card testing", description: "Multiple small transactions on a new card", method: "Velocity + amount", lastDetected: "1 week ago", freq30d: 0, action: "Auto-block" },
  { id: "PAT-05", name: "SIM swap", description: "Login from new device + changed phone number", method: "Telco API check", lastDetected: "2 days ago", freq30d: 1, action: "Auto-freeze + alert" },
  { id: "PAT-06", name: "Account farming", description: "Multiple accounts from same device/IP", method: "Device fingerprint", lastDetected: "5 days ago", freq30d: 3, action: "Auto-flag" },
  { id: "PAT-07", name: "Structuring", description: "Multiple transactions just below reporting threshold", method: "Amount pattern", lastDetected: "Today", freq30d: 5, action: "Auto-flag" },
  { id: "PAT-08", name: "Sleep-to-active", description: "Dormant account suddenly very active", method: "Activity analysis", lastDetected: "Yesterday", freq30d: 8, action: "Auto-flag" },
  { id: "PAT-09", name: "Credential stuffing", description: "Multiple failed logins followed by success", method: "Login analysis", lastDetected: "3 days ago", freq30d: 4, action: "Auto-block + alert" },
];

/* ---------------- §15.6 Loss analysis ---------------- */
export const LOSSES: LossRow[] = [
  { category: "Account takeover", amount: 890_000, recovery: 620_000, trend: "down", share: 37.1 },
  { category: "Card fraud", amount: 560_000, recovery: 340_000, trend: "flat", share: 23.3 },
  { category: "Social engineering", amount: 450_000, recovery: 280_000, trend: "up", share: 18.8 },
  { category: "Internal fraud", amount: 300_000, recovery: 200_000, trend: "flat", share: 12.5 },
  { category: "Mule accounts", amount: 200_000, recovery: 160_000, trend: "down", share: 8.3 },
];

export const TOTAL_LOSS = LOSSES.reduce((s, l) => s + l.amount, 0);
export const TOTAL_RECOVERY = LOSSES.reduce((s, l) => s + l.recovery, 0);

/* ---------------- §15.7 Fraud rules ---------------- */
export const FRAUD_RULES: FraudRule[] = [
  { id: "FR-001", name: "Dual-device block", trigger: "2 devices, same user, < 5 min", severity: "Critical", active: true, fpRate: 5, lastTuned: "Aug 1", hits30d: 14 },
  { id: "FR-002", name: "Velocity spike", trigger: "> 3× normal in 1 hour", severity: "High", active: true, fpRate: 28, lastTuned: "Jul 15", hits30d: 118 },
  { id: "FR-003", name: "Geo-impossible", trigger: "> 500km in < 30 min", severity: "Critical", active: true, fpRate: 2, lastTuned: "Jul 15", hits30d: 61 },
  { id: "FR-004", name: "Amount anomaly", trigger: "> 300% of 30d avg", severity: "High", active: true, fpRate: 35, lastTuned: "Aug 10", hits30d: 87 },
  { id: "FR-005", name: "Structuring", trigger: "3+ TXNs just below KES 150K in 24h", severity: "High", active: true, fpRate: 42, lastTuned: "Jul 1", hits30d: 52 },
  { id: "FR-006", name: "New device + large", trigger: "New device + TXN > KES 50K", severity: "Medium", active: true, fpRate: 55, lastTuned: "Aug 1", hits30d: 96 },
  { id: "FR-007", name: "Dormant wake-up", trigger: "Inactive 90d+ + TXN > KES 100K", severity: "Medium", active: true, fpRate: 30, lastTuned: "Jul 15", hits30d: 38 },
  { id: "FR-008", name: "Credential stuffing", trigger: "> 5 failed logins then success", severity: "Critical", active: true, fpRate: 8, lastTuned: "Aug 10", hits30d: 21 },
  { id: "FR-009", name: "Beneficiary burst", trigger: "8+ new beneficiaries added in 24h", severity: "Medium", active: true, fpRate: 44, lastTuned: "Aug 18", hits30d: 27 },
  { id: "FR-010", name: "Off-hours profile shift", trigger: "Night activity for day-active profile 3d in a row", severity: "Low" as "Medium", active: false, fpRate: 61, lastTuned: "Aug 20", hits30d: 6 },
  { id: "FR-011", name: "Chargeback velocity", trigger: "> 3 chargebacks in 7d on one card", severity: "High", active: true, fpRate: 19, lastTuned: "Aug 5", hits30d: 17 },
  { id: "FR-012", name: "Refund round-trip", trigger: "Refund then withdrawal of same amount < 1h", severity: "Medium", active: true, fpRate: 33, lastTuned: "Aug 12", hits30d: 12 },
];

/* ---------------- §15.5 Blacklist ---------------- */
export const BLACKLIST_TYPES: BlacklistType[] = [
  { id: "BL-DV", type: "Device fingerprints", icon: "bi-pc-display", entries: 1_234, added30d: 23, removed30d: 5, lastUpdated: "Aug 22", mode: "Auto + Manual" },
  { id: "BL-IP", type: "IP addresses", icon: "bi-hdd-network", entries: 567, added30d: 12, removed30d: 3, lastUpdated: "Aug 22", mode: "Auto + Manual" },
  { id: "BL-PH", type: "Phone numbers", icon: "bi-telephone", entries: 89, added30d: 4, removed30d: 1, lastUpdated: "Aug 20", mode: "Manual" },
  { id: "BL-EM", type: "Email addresses", icon: "bi-at", entries: 34, added30d: 2, removed30d: 0, lastUpdated: "Aug 18", mode: "Manual" },
  { id: "BL-BI", type: "Card BINs", icon: "bi-credit-card", entries: 12, added30d: 1, removed30d: 0, lastUpdated: "Aug 15", mode: "Manual" },
  { id: "BL-ID", type: "National IDs", icon: "bi-person-badge", entries: 45, added30d: 3, removed30d: 0, lastUpdated: "Aug 22", mode: "Manual" },
  { id: "BL-BA", type: "Bank accounts", icon: "bi-bank", entries: 12, added30d: 1, removed30d: 0, lastUpdated: "Aug 10", mode: "Manual" },
];

export const BLACKLIST_ENTRIES: BlacklistEntry[] = [
  { id: "BLE-0501", type: "Device fingerprints", value: "d7f3:a91b:04ce:8f2a", reason: "ATO attempt FRD-2843", added: "Aug 22", addedBy: "Sarah K.", hits: 9 },
  { id: "BLE-0500", type: "IP addresses", value: "185.220.101.44 (Tor exit)", reason: "Tor exit node · login stuffing", added: "Aug 22", addedBy: "Auto (FR-008)", hits: 31 },
  { id: "BLE-0499", type: "Phone numbers", value: "+254 712 000 448", reason: "SIM swap fraud ring", added: "Aug 20", addedBy: "David K.", hits: 4 },
  { id: "BLE-0498", type: "Device fingerprints", value: "b1c9:77aa:e210:4d05", reason: "Card testing · 14 micro-auths", added: "Aug 21", addedBy: "Auto (FR-006)", hits: 12 },
  { id: "BLE-0497", type: "National IDs", value: "ID 3•••••89", reason: "Synthetic identity cluster", added: "Aug 22", addedBy: "Sarah K.", hits: 2 },
  { id: "BLE-0496", type: "Bank accounts", value: "KCB •••• 2214", reason: "Mule network SAR-2026-031", added: "Aug 10", addedBy: "David K.", hits: 6 },
  { id: "BLE-0495", type: "Email addresses", value: "m•••@tempmail.io", reason: "Account farming burst", added: "Aug 18", addedBy: "Grace M.", hits: 3 },
  { id: "BLE-0494", type: "IP addresses", value: "102.68.77.0/24", reason: "Geo-anomaly cluster Kisumu", added: "Aug 19", addedBy: "Auto (FR-003)", hits: 18 },
  { id: "BLE-0493", type: "Card BINs", value: "BIN 5312xx", reason: "Non-EMV issuing bank · testing", added: "Aug 15", addedBy: "James O.", hits: 7 },
  { id: "BLE-0492", type: "Phone numbers", value: "+254 733 000 118", reason: "Vishing victim verification fail × 5", added: "Aug 16", addedBy: "Grace M.", hits: 2 },
  { id: "BLE-0491", type: "Device fingerprints", value: "e04d:22ff:9a13:7b61", reason: "Credential stuffing FRD-2839", added: "Aug 20", addedBy: "Auto (FR-008)", hits: 11 },
  { id: "BLE-0490", type: "National IDs", value: "ID 2•••••04", reason: "Loan stacking ring Kiambu", added: "Aug 14", addedBy: "Sarah K.", hits: 5 },
  { id: "BLE-0489", type: "IP addresses", value: "45.83.90.12 (VPN)", reason: "Cross-border withdrawal block", added: "Aug 17", addedBy: "Auto (FR-003)", hits: 14 },
  { id: "BLE-0488", type: "Device fingerprints", value: "9912:cc04:71ea:0f38", reason: "Dormant wake-up + structuring", added: "Aug 21", addedBy: "David K.", hits: 8 },
  { id: "BLE-0487", type: "Email addresses", value: "d•••@mailinator.com", reason: "Bonus abuse ring", added: "Aug 12", addedBy: "James O.", hits: 1 },
];

/* ---------------- §15.8 Team performance ---------------- */
export const TEAM: Investigator[] = [
  { id: "INV-01", name: "Sarah Kamau", initials: "SK", assigned: 45, resolved: 38, avgTime: "3.1 hours", accuracy: 96, escalations: 2, load: 72 },
  { id: "INV-02", name: "James Otieno", initials: "JO", assigned: 38, resolved: 32, avgTime: "4.5 hours", accuracy: 94, escalations: 1, load: 64 },
  { id: "INV-03", name: "David Kiprop", initials: "DK", assigned: 42, resolved: 35, avgTime: "3.8 hours", accuracy: 95, escalations: 3, load: 81 },
  { id: "INV-04", name: "Grace Mwende", initials: "GM", assigned: 28, resolved: 24, avgTime: "5.2 hours", accuracy: 92, escalations: 1, load: 58 },
];

/* ---------------- §15.9 SAR filings (expanded to 6) ---------------- */
export const SARS: Sar[] = [
  { id: "SAR-2026-034", filedDate: "Aug 15", userId: "PAY-55667", amount: 1_200_000, type: "Structuring", status: "Acknowledged", receipt: "FRA-REF-8823" },
  { id: "SAR-2026-033", filedDate: "Aug 8", userId: "PAY-88900", amount: 450_000, type: "Suspected money laundering", status: "Acknowledged", receipt: "FRA-REF-8712" },
  { id: "SAR-2026-032", filedDate: "Jul 28", userId: "PAY-22334", amount: 890_000, type: "Account takeover + rapid movement", status: "Under review", receipt: "FRA-REF-8645" },
  { id: "SAR-2026-031", filedDate: "Jul 15", userId: "PAY-44556", amount: 2_100_000, type: "Mule network", status: "Acknowledged", receipt: "FRA-REF-8501" },
  { id: "SAR-2026-030", filedDate: "Jul 1", userId: "PAY-11223", amount: 640_000, type: "Structuring + third-party funding", status: "Acknowledged", receipt: "FRA-REF-8390" },
  { id: "SAR-2026-029", filedDate: "Jun 18", userId: "PAY-66778", amount: 380_000, type: "Suspected mule activity", status: "Under review", receipt: "FRA-REF-8288" },
];

/* ---------------- §15.10 Heatmap matrices ---------------- */
export const HEAT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const HEATMAP: number[][] = HEAT_DAYS.map((_, d) =>
  Array.from({ length: 24 }, (_, h) => {
    const night = h >= 1 && h <= 5 ? 3 : h >= 2 && h <= 4 ? 4 : 0;
    const evening = h >= 20 && h <= 23 ? 2 : 0;
    const peak = (h >= 9 && h <= 11) || (h >= 14 && h <= 16) ? 1 : 0;
    const weekend = d >= 5 ? 1 : 0;
    const wobble = (d * 7 + h * 3) % 5 === 0 ? 1 : 0;
    return Math.min(5, night + evening + peak + weekend + wobble);
  })
);

export const CHANNEL_HEAT = [
  { n: "M-Pesa", v: 41, c: "#12b76a" },
  { n: "Card", v: 24, c: "#175cd3" },
  { n: "Bank transfer", v: 19, c: "#7a5af8" },
  { n: "ATM", v: 11, c: "#f79009" },
  { n: "Agent", v: 5, c: "#98a2b3" },
];

export const COUNTY_HEAT = [
  { n: "Nairobi", v: 38 },
  { n: "Mombasa", v: 17 },
  { n: "Kisumu", v: 13 },
  { n: "Nakuru", v: 11 },
  { n: "Kiambu", v: 9 },
  { n: "Uasin Gishu", v: 6 },
  { n: "Machakos", v: 4 },
  { n: "Other", v: 2 },
];

export const AMOUNT_HEAT = [
  { n: "< KES 1K (testing)", v: 26 },
  { n: "KES 1K–10K", v: 22 },
  { n: "KES 10K–50K", v: 19 },
  { n: "KES 50K–150K", v: 21 },
  { n: "> KES 150K", v: 12 },
];

export const DEVICE_HEAT = [
  { n: "Android", v: 44 },
  { n: "iOS", v: 21 },
  { n: "Web", v: 24 },
  { n: "API", v: 8 },
  { n: "ATM", v: 3 },
];

/* ---------------- KPI ---------------- */
export const FRAUD_KPI = (o: { newAlerts: number; unassigned: number }) => [
  { label: "Alerts (30d)", value: "234", note: "↑ 12% · 14 in queue now", icon: "bi-bell", tone: o.newAlerts > 2 ? "red" : "amber" },
  { label: "Fraud amount (30d)", value: kes(TOTAL_LOSS, { compact: true }), note: `recovered ${kes(TOTAL_RECOVERY, { compact: true })} · net ${kes(TOTAL_LOSS - TOTAL_RECOVERY, { compact: true })}`, icon: "bi-cash-coin", tone: "amber" },
  { label: "Fraud rate", value: "0.023%", note: "target < 0.05% · green", icon: "bi-bullseye", tone: "green" },
  { label: "Confirmed cases", value: "18", note: "target < 10 · ↓ 3", icon: "bi-file-earmark-exclamation", tone: "amber" },
  { label: "Unassigned alerts", value: String(o.unassigned), note: "SLA 4h from trigger", icon: "bi-person-x", tone: o.unassigned > 0 ? "red" : "green" },
  { label: "Avg investigation", value: "4.2h", note: "target < 2h · ↓ 30 min", icon: "bi-stopwatch", tone: "amber" },
  { label: "Recovery rate", value: "67%", note: "KES 1.6M of 2.4M · ↑ 22%", icon: "bi-arrow-counterclockwise", tone: "green" },
  { label: "Blacklist entries", value: "1,993", note: "23 added / 5 removed (30d)", icon: "bi-slash-circle", tone: "violet" },
];
