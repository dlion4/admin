import { kes } from "../../../lib/format";

/* ================================================================
   Page 13 — Withdrawal Controls · data layer
   ================================================================ */

export type GlobalLimit = {
  id: string;
  label: string;
  icon: string;
  current: number;
  max: number;
  effective: string;
  lastChanged: string;
  note: string;
};

export type PoolRule = {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  active: boolean;
};

export type FraudControl = {
  id: string;
  name: string;
  description: string;
  trigger: string;
  autoAction: string;
  override: "Super admin only" | "Admin with 2FA";
  enabled: boolean;
  params: string;
  hits30d: number;
  lastModified: string;
};

export type OverrideStatus = "Active" | "Restricted" | "Blocked" | "Expired";

export type UserOverride = {
  id: string;
  userId: string;
  name: string;
  tier: string;
  standardDaily: number;
  customDaily: number | "Unlimited" | 0;
  standardMonthly: number;
  customMonthly: number | "Unlimited" | 0;
  reason: string;
  setBy: string;
  expires: string;
  status: OverrideStatus;
};

export type QueueStatus = "Awaiting OTP" | "VP verification" | "Auto-review" | "Escalated";

export type HighValueItem = {
  id: string;
  time: string;
  userId: string;
  name: string;
  amount: number;
  channel: string;
  device: string;
  ip: string;
  flags: string[];
  ageMin: number;
  slaMin: number;
  status: QueueStatus;
  assigned: string;
};

export type BlockedStatus = "Pending review" | "Released" | "Under review" | "Account frozen";

export type BlockedRow = {
  id: string;
  date: string;
  time: string;
  userId: string;
  amount: number;
  device: string;
  ip: string;
  reason: string;
  autoAction: string;
  adminAction: string;
  status: BlockedStatus;
};

export type AuditRow = {
  id: string;
  date: string;
  admin: string;
  change: string;
  from: string;
  to: string;
  reason: string;
  approvedBy: string;
};

export type AnalyticsRow = {
  metric: string;
  today: string;
  week: string;
  month: string;
  vsLastMonth: string;
  trend: "up" | "down" | "flat";
};

/* ---------------- §13.1 Global withdrawal limits ---------------- */
export const GLOBAL_LIMITS: GlobalLimit[] = [
  { id: "LIM-01", label: "Daily limit (per user)", icon: "bi-calendar-day", current: 500_000, max: 5_000_000, effective: "Jan 2025", lastChanged: "Jan 2025", note: "Resets 00:00 EAT · applies per wallet" },
  { id: "LIM-02", label: "Monthly limit (per user)", icon: "bi-calendar-month", current: 5_000_000, max: 50_000_000, effective: "Jan 2025", lastChanged: "Jan 2025", note: "Rolling 30-day window" },
  { id: "LIM-03", label: "Per-transaction max", icon: "bi-lightning", current: 150_000, max: 1_000_000, effective: "Jan 2025", lastChanged: "Mar 2025", note: "Single withdrawal ceiling, all channels" },
  { id: "LIM-04", label: "Minimum withdrawal", icon: "bi-dash-circle", current: 100, max: 50, effective: "Jan 2025", lastChanged: "Jan 2025", note: "Floor per request (max column = lowest allowed)" },
  { id: "LIM-05", label: "ATM daily limit", icon: "bi-cash-machine", current: 100_000, max: 500_000, effective: "Jan 2025", lastChanged: "Jan 2025", note: "Across all ATM withdrawals per day" },
  { id: "LIM-06", label: "ATM per-transaction", icon: "bi-bank", current: 40_000, max: 200_000, effective: "Jan 2025", lastChanged: "Aug 1, 2025", note: "Raised 35K → 40K on partner agreement" },
  { id: "LIM-07", label: "International daily", icon: "bi-globe", current: 1_000_000, max: 10_000_000, effective: "Jan 2025", lastChanged: "Jan 2025", note: "Cross-border rails incl. cards abroad" },
  { id: "LIM-08", label: "Business daily (per sub-account)", icon: "bi-briefcase", current: 2_000_000, max: 20_000_000, effective: "Mar 2025", lastChanged: "Mar 2025", note: "PayMo Business sub-accounts" },
];

/* ---------------- §13.2 Pool-based access rules ---------------- */
export const POOL_RULES: PoolRule[] = [
  { id: "PR-01", name: "Reserve floor", description: "Block withdrawals when available pool < 15%", trigger: "Pool balance check", action: "Block all withdrawals", active: true },
  { id: "PR-02", name: "Channel reserve", description: "Each channel has a dedicated reserve", trigger: "Per-channel balance", action: "Block channel-specific", active: true },
  { id: "PR-03", name: "Velocity check", description: "> 3 withdrawals in 1 hour", trigger: "Transaction counter", action: "Flag + require OTP", active: true },
  { id: "PR-04", name: "New account restriction", description: "First 7 days: max KES 10,000/day", trigger: "Account age", action: "Enforce reduced limit", active: true },
  { id: "PR-05", name: "High-value threshold", description: "> KES 100,000 requires additional verification", trigger: "Amount check", action: "Trigger OTP + push", active: true },
  { id: "PR-06", name: "Balance floor", description: "KES 500 minimum balance maintained", trigger: "Balance check", action: "Block if result < KES 500", active: true },
  { id: "PR-07", name: "Time-based restriction", description: "Withdrawals only 6AM–10PM", trigger: "Time check", action: "Block outside hours", active: false },
];

/* ---------------- §13.3 + §13.8 Anti-fraud controls & rule config ---------------- */
export const FRAUD_CONTROLS: FraudControl[] = [
  { id: "AF-01", name: "Dual-device detection", description: "Same user, 2 browsers/devices simultaneously", trigger: "Real-time session fingerprint", autoAction: "Block + freeze + alert", override: "Super admin only", enabled: true, params: "Block on simultaneous devices", hits30d: 14, lastModified: "Aug 1" },
  { id: "AF-02", name: "Geo-anomaly", description: "Withdrawal IP > 500km from usual location", trigger: "Real-time geo-distance", autoAction: "Block + require VP verification", override: "Admin with 2FA", enabled: true, params: "500km radius", hits30d: 61, lastModified: "Jul 15" },
  { id: "AF-03", name: "Velocity spike", description: "> 50% increase in withdrawal frequency vs 30d avg", trigger: "Real-time frequency model", autoAction: "Flag + require OTP", override: "Admin with 2FA", enabled: true, params: "50% above 30d avg", hits30d: 118, lastModified: "Jul 15" },
  { id: "AF-04", name: "New device", description: "Withdrawal from newly registered device", trigger: "Real-time device registry", autoAction: "Require OTP + push", override: "Admin with 2FA", enabled: true, params: "Always require OTP", hits30d: 342, lastModified: "Jun 1" },
  { id: "AF-05", name: "Amount anomaly", description: "Withdrawal > 300% of user's 30d avg", trigger: "Real-time amount model", autoAction: "Flag + require OTP", override: "Admin with 2FA", enabled: true, params: "300% of 30d avg", hits30d: 87, lastModified: "Jul 15" },
  { id: "AF-06", name: "Time anomaly", description: "Withdrawal at unusual hour (2AM–5AM) for user", trigger: "Real-time behavioural profile", autoAction: "Flag + require OTP", override: "Admin with 2FA", enabled: false, params: "2AM–5AM (disabled)", hits30d: 3, lastModified: "Aug 1" },
  { id: "AF-07", name: "Cross-border / VPN", description: "VPN/proxy detected during withdrawal", trigger: "Real-time network intelligence", autoAction: "Block + alert", override: "Super admin only", enabled: true, params: "Block all VPN/proxy", hits30d: 29, lastModified: "Jul 1" },
  { id: "AF-08", name: "Sequential rapid", description: "3+ withdrawals within 10 minutes", trigger: "Real-time burst counter", autoAction: "Block + alert", override: "Admin with 2FA", enabled: true, params: "3 in 10 minutes", hits30d: 44, lastModified: "Jul 15" },
  { id: "AF-09", name: "SIM swap detection", description: "Recent phone number change + withdrawal attempt", trigger: "Real-time carrier signal", autoAction: "Block + freeze + alert", override: "Super admin only", enabled: true, params: "Block if SIM changed < 24h", hits30d: 7, lastModified: "Jul 22" },
  { id: "AF-10", name: "Account age + amount", description: "New account (< 30d) + large withdrawal (> KES 50K)", trigger: "Real-time composite check", autoAction: "Block + require enhanced verification", override: "Super admin only", enabled: true, params: "< 30d age AND > KES 50K", hits30d: 52, lastModified: "Jul 15" },
];

/* ---------------- §13.4 User-specific limit overrides ---------------- */
export const USER_OVERRIDES: UserOverride[] = [
  { id: "OVR-001", userId: "PAY-VIP-001", name: "Wanjiru Kamau", tier: "VIP Platinum", standardDaily: 500_000, customDaily: "Unlimited", standardMonthly: 5_000_000, customMonthly: "Unlimited", reason: "VIP Platinum standing", setBy: "Joseph Mwangi", expires: "Never", status: "Active" },
  { id: "OVR-002", userId: "PAY-VIP-004", name: "Delta Logistics Ltd", tier: "Business Premium", standardDaily: 500_000, customDaily: 10_000_000, standardMonthly: 5_000_000, customMonthly: 100_000_000, reason: "Business Premium payroll cycle", setBy: "Joseph Mwangi", expires: "Never", status: "Active" },
  { id: "OVR-003", userId: "PAY-67890", name: "Brian Otieno", tier: "Standard", standardDaily: 500_000, customDaily: 250_000, standardMonthly: 5_000_000, customMonthly: 2_000_000, reason: "Previous fraud flag", setBy: "Sarah Kamau", expires: "Dec 2026", status: "Restricted" },
  { id: "OVR-004", userId: "PAY-89012", name: "Amina Hassan", tier: "Standard (new)", standardDaily: 500_000, customDaily: 100_000, standardMonthly: 5_000_000, customMonthly: 500_000, reason: "New account restriction", setBy: "System", expires: "Sep 2026", status: "Restricted" },
  { id: "OVR-005", userId: "PAY-11223", name: "Victor Kiplagat", tier: "Standard", standardDaily: 500_000, customDaily: 0, standardMonthly: 5_000_000, customMonthly: 0, reason: "Fraud investigation FRD-2291", setBy: "Joseph Mwangi", expires: "Until cleared", status: "Blocked" },
  { id: "OVR-006", userId: "PAY-VIP-002", name: "Halima Yusuf", tier: "VIP Platinum", standardDaily: 500_000, customDaily: 2_000_000, standardMonthly: 5_000_000, customMonthly: 20_000_000, reason: "VIP Platinum · property settlement", setBy: "Sarah Kamau", expires: "Nov 2026", status: "Active" },
  { id: "OVR-007", userId: "PAY-VIP-007", name: "Nairobi Dental Group", tier: "Business Premium", standardDaily: 500_000, customDaily: 5_000_000, standardMonthly: 5_000_000, customMonthly: 45_000_000, reason: "Supplier payments cycle", setBy: "Joseph Mwangi", expires: "Never", status: "Active" },
  { id: "OVR-008", userId: "PAY-33445", name: "Peter Mbugua", tier: "Standard", standardDaily: 500_000, customDaily: 50_000, standardMonthly: 5_000_000, customMonthly: 300_000, reason: "Chargeback dispute CB-88 open", setBy: "Sarah Kamau", expires: "Oct 2026", status: "Restricted" },
  { id: "OVR-009", userId: "PAY-44556", name: "Grace Wambui", tier: "Standard", standardDaily: 500_000, customDaily: 0, standardMonthly: 5_000_000, customMonthly: 0, reason: "Court order — estate freeze", setBy: "Joseph Mwangi", expires: "Until court lift", status: "Blocked" },
  { id: "OVR-010", userId: "PAY-55667", name: "Dennis Mutua", tier: "Standard", standardDaily: 500_000, customDaily: 300_000, standardMonthly: 5_000_000, customMonthly: 2_500_000, reason: "VPN withdrawal attempt — under review", setBy: "System", expires: "Oct 2026", status: "Restricted" },
  { id: "OVR-011", userId: "PAY-66778", name: "Fatuma Ali", tier: "Standard (new)", standardDaily: 500_000, customDaily: 10_000, standardMonthly: 5_000_000, customMonthly: 80_000, reason: "New account restriction (< 7 days)", setBy: "System", expires: "Aug 30, 2026", status: "Restricted" },
  { id: "OVR-012", userId: "PAY-77889", name: "Samuel Njoroge", tier: "Agent", standardDaily: 500_000, customDaily: 800_000, standardMonthly: 5_000_000, customMonthly: 8_000_000, reason: "Agent float rebalancing profile", setBy: "Sarah Kamau", expires: "Jan 2027", status: "Active" },
  { id: "OVR-013", userId: "PAY-88900", name: "Rift Valley Motors", tier: "Business", standardDaily: 500_000, customDaily: 3_000_000, standardMonthly: 5_000_000, customMonthly: 25_000_000, reason: "Fleet supplier payments", setBy: "Joseph Mwangi", expires: "Dec 2026", status: "Active" },
  { id: "OVR-014", userId: "PAY-99011", name: "Lucy Njeri", tier: "Standard", standardDaily: 500_000, customDaily: 450_000, standardMonthly: 5_000_000, customMonthly: 4_500_000, reason: "Dormancy re-activation (verified)", setBy: "Sarah Kamau", expires: "Sep 2026", status: "Active" },
  { id: "OVR-015", userId: "PAY-10123", name: "Kevin Ochieng", tier: "Standard", standardDaily: 500_000, customDaily: 0, standardMonthly: 5_000_000, customMonthly: 0, reason: "SIM-swap investigation FRD-2304", setBy: "Joseph Mwangi", expires: "Until cleared", status: "Blocked" },
];

/* ---------------- High-value withdrawal queue (> KES 100K) ---------------- */
export const HIGH_VALUE_QUEUE: HighValueItem[] = [
  { id: "WQ-1042", time: "15:41", userId: "PAY-VIP-002", name: "Halima Yusuf", amount: 480_000, channel: "Bank transfer", device: "Safari/iOS 18", ip: "41.90.x (Nairobi)", flags: ["High-value", "Amount anomaly"], ageMin: 4, slaMin: 15, status: "Awaiting OTP", assigned: "Auto" },
  { id: "WQ-1041", time: "15:22", userId: "PAY-VIP-004", name: "Delta Logistics Ltd", amount: 2_400_000, channel: "Bank transfer", device: "Chrome/Windows", ip: "41.90.x (Nairobi)", flags: ["High-value", "Override limit"], ageMin: 23, slaMin: 30, status: "VP verification", assigned: "Mercy A. (VP)" },
  { id: "WQ-1040", time: "15:04", userId: "PAY-33445", name: "Peter Mbugua", amount: 145_000, channel: "M-Pesa", device: "Chrome/Android", ip: "102.x (Kisumu)", flags: ["High-value", "Geo-anomaly 528km"], ageMin: 41, slaMin: 30, status: "Escalated", assigned: "Sarah Kamau" },
  { id: "WQ-1039", time: "14:47", userId: "PAY-VIP-007", name: "Nairobi Dental Group", amount: 1_100_000, channel: "Bank transfer", device: "Edge/Windows", ip: "41.90.x (Nairobi)", flags: ["High-value"], ageMin: 58, slaMin: 60, status: "Awaiting OTP", assigned: "Auto" },
  { id: "WQ-1038", time: "14:30", userId: "PAY-77889", name: "Samuel Njoroge", amount: 260_000, channel: "Agent", device: "PayMo App/Android", ip: "197.x (Nakuru)", flags: ["High-value", "New device"], ageMin: 75, slaMin: 30, status: "Auto-review", assigned: "Auto" },
  { id: "WQ-1037", time: "14:12", userId: "PAY-88900", name: "Rift Valley Motors", amount: 890_000, channel: "Bank transfer", device: "Chrome/Windows", ip: "41.90.x (Nairobi)", flags: ["High-value", "Override limit"], ageMin: 93, slaMin: 120, status: "Auto-review", assigned: "Auto" },
  { id: "WQ-1036", time: "13:55", userId: "PAY-22334", name: "Esther Muthoni", amount: 320_000, channel: "M-Pesa", device: "Chrome/Android", ip: "41.90.x (Nairobi)", flags: ["High-value", "Velocity spike"], ageMin: 110, slaMin: 30, status: "VP verification", assigned: "Mercy A. (VP)" },
  { id: "WQ-1035", time: "13:31", userId: "PAY-VIP-001", name: "Wanjiru Kamau", amount: 750_000, channel: "Card", device: "Safari/macOS", ip: "41.90.x (Nairobi)", flags: ["High-value"], ageMin: 134, slaMin: 15, status: "Awaiting OTP", assigned: "Auto" },
  { id: "WQ-1034", time: "12:58", userId: "PAY-67890", name: "Brian Otieno", amount: 250_000, channel: "ATM", device: "ATM KCB-0442", ip: "196.x (Mombasa)", flags: ["High-value", "Restriction cap"], ageMin: 167, slaMin: 30, status: "Escalated", assigned: "Sarah Kamau" },
  { id: "WQ-1033", time: "12:20", userId: "PAY-99011", name: "Lucy Njeri", amount: 180_000, channel: "M-Pesa", device: "Chrome/Android", ip: "41.90.x (Nairobi)", flags: ["High-value", "Amount anomaly"], ageMin: 205, slaMin: 30, status: "Awaiting OTP", assigned: "Auto" },
  { id: "WQ-1032", time: "11:44", userId: "PAY-VIP-004", name: "Delta Logistics Ltd", amount: 3_600_000, channel: "RTGS", device: "Chrome/Windows", ip: "41.90.x (Nairobi)", flags: ["High-value", "Override limit"], ageMin: 241, slaMin: 120, status: "VP verification", assigned: "Mercy A. (VP)" },
  { id: "WQ-1031", time: "10:59", userId: "PAY-89012", name: "Amina Hassan", amount: 100_000, channel: "M-Pesa", device: "Safari/iOS 18", ip: "102.x (Kisumu)", flags: ["High-value", "New account"], ageMin: 326, slaMin: 30, status: "Auto-review", assigned: "Auto" },
];

/* ---------------- §13.5 Blocked withdrawals log ---------------- */
export const BLOCKED_LOG: BlockedRow[] = [
  { id: "BLK-0231", date: "Aug 22", time: "14:32", userId: "PAY-89012", amount: 50_000, device: "Chrome/Win + Safari/iOS", ip: "102.x / 41.x", reason: "Dual-device", autoAction: "Frozen", adminAction: "Pending review", status: "Pending review" },
  { id: "BLK-0230", date: "Aug 22", time: "11:15", userId: "PAY-45123", amount: 200_000, device: "Firefox/Linux", ip: "196.x (Mombasa)", reason: "Geo-anomaly", autoAction: "Blocked", adminAction: "Released (VP verified)", status: "Released" },
  { id: "BLK-0229", date: "Aug 21", time: "23:45", userId: "PAY-22334", amount: 80_000, device: "Chrome/Android", ip: "41.x (Nairobi)", reason: "Velocity spike", autoAction: "Blocked", adminAction: "Released (user confirmed)", status: "Released" },
  { id: "BLK-0228", date: "Aug 21", time: "03:12", userId: "PAY-55667", amount: 120_000, device: "Unknown/Android", ip: "102.x (VPN)", reason: "Cross-border VPN", autoAction: "Frozen", adminAction: "Pending review", status: "Pending review" },
  { id: "BLK-0227", date: "Aug 20", time: "15:00", userId: "PAY-77889", amount: 45_000, device: "Chrome/Windows", ip: "41.x (Nairobi)", reason: "New device", autoAction: "OTP required", adminAction: "User completed OTP", status: "Released" },
  { id: "BLK-0226", date: "Aug 20", time: "09:41", userId: "PAY-10123", amount: 65_000, device: "PayMo App/Android", ip: "197.x (Nakuru)", reason: "SIM swap detected", autoAction: "Frozen", adminAction: "Escalated FRD-2304", status: "Account frozen" },
  { id: "BLK-0225", date: "Aug 19", time: "22:03", userId: "PAY-33445", amount: 150_000, device: "Chrome/Android", ip: "105.x (Eldoret)", reason: "Sequential rapid", autoAction: "Blocked", adminAction: "Released (cooling-off passed)", status: "Released" },
  { id: "BLK-0224", date: "Aug 19", time: "16:27", userId: "PAY-11223", amount: 95_000, device: "Samsung Internet", ip: "41.x (Nairobi)", reason: "Fraud investigation hold", autoAction: "Blocked", adminAction: "Held — FRD-2291", status: "Under review" },
  { id: "BLK-0223", date: "Aug 18", time: "19:55", userId: "PAY-66778", amount: 28_000, device: "Chrome/Android", ip: "102.x (Kisumu)", reason: "New account + amount", autoAction: "Blocked", adminAction: "Enhanced verification pending", status: "Under review" },
  { id: "BLK-0222", date: "Aug 18", time: "13:08", userId: "PAY-44556", amount: 0, device: "—", ip: "—", reason: "Court order — estate freeze", autoAction: "Frozen", adminAction: "Legal notified", status: "Account frozen" },
  { id: "BLK-0221", date: "Aug 17", time: "20:34", userId: "PAY-88900", amount: 220_000, device: "Edge/Windows", ip: "41.x (Nairobi)", reason: "Geo-anomaly", autoAction: "Blocked", adminAction: "Released (travel confirmed)", status: "Released" },
  { id: "BLK-0220", date: "Aug 16", time: "02:17", userId: "PAY-21998", amount: 74_000, device: "Safari/iOS", ip: "197.x (Nakuru)", reason: "Time anomaly", autoAction: "OTP required", adminAction: "Released (user confirmed)", status: "Released" },
  { id: "BLK-0219", date: "Aug 15", time: "17:49", userId: "PAY-55011", amount: 310_000, device: "Chrome/Windows", ip: "45.x (Dar es Salaam)", reason: "Cross-border VPN", autoAction: "Frozen", adminAction: "Released — verified business trip", status: "Released" },
  { id: "BLK-0218", date: "Aug 14", time: "11:22", userId: "PAY-77332", amount: 56_000, device: "Firefox/Linux", ip: "102.x (Kisumu)", reason: "Amount anomaly", autoAction: "OTP required", adminAction: "User completed OTP", status: "Released" },
  { id: "BLK-0217", date: "Aug 12", time: "18:03", userId: "PAY-33210", amount: 130_000, device: "Chrome/Android + Safari/iOS", ip: "41.x / 102.x", reason: "Dual-device", autoAction: "Frozen", adminAction: "Released — shared device confirmed", status: "Released" },
];

/* ---------------- §13.6 Withdrawal analytics ---------------- */
export const ANALYTICS: AnalyticsRow[] = [
  { metric: "Total withdrawals", today: "KES 45.2M", week: "KES 312M", month: "KES 1.34B", vsLastMonth: "↑ 15.3%", trend: "up" },
  { metric: "Withdrawal count", today: "12,345", week: "84,500", month: "367,000", vsLastMonth: "↑ 12.1%", trend: "up" },
  { metric: "Avg withdrawal size", today: "KES 3,662", week: "KES 3,692", month: "KES 3,651", vsLastMonth: "↑ 2.8%", trend: "up" },
  { metric: "Blocked withdrawals", today: "23", week: "156", month: "678", vsLastMonth: "↓ 8.4%", trend: "down" },
  { metric: "False positive rate", today: "34%", week: "31%", month: "28%", vsLastMonth: "↓ 6%", trend: "down" },
  { metric: "Channel — M-Pesa", today: "68%", week: "67%", month: "66%", vsLastMonth: "—", trend: "flat" },
  { metric: "Channel — ATM", today: "12%", week: "13%", month: "14%", vsLastMonth: "—", trend: "flat" },
  { metric: "Channel — Bank", today: "20%", week: "20%", month: "20%", vsLastMonth: "—", trend: "flat" },
];

/* ---------------- §13.7 Limit change audit ---------------- */
export const AUDIT: AuditRow[] = [
  { id: "AUD-0112", date: "Aug 22", admin: "Joseph Mwangi", change: "Global daily limit", from: "KES 500K", to: "KES 500K", reason: "No change (quarterly review)", approvedBy: "—" },
  { id: "AUD-0111", date: "Aug 15", admin: "Joseph Mwangi", change: "User PAY-VIP-004 daily", from: "KES 500K", to: "KES 10M", reason: "Business growth", approvedBy: "—" },
  { id: "AUD-0110", date: "Aug 10", admin: "Sarah Kamau", change: "User PAY-67890 daily", from: "KES 500K", to: "KES 250K", reason: "Fraud precaution", approvedBy: "Joseph Mwangi" },
  { id: "AUD-0109", date: "Aug 1", admin: "Joseph Mwangi", change: "ATM per-transaction", from: "KES 35K", to: "KES 40K", reason: "Partner agreement update", approvedBy: "—" },
  { id: "AUD-0108", date: "Jul 30", admin: "Sarah Kamau", change: "User PAY-33445 daily", from: "KES 500K", to: "KES 50K", reason: "Open chargeback CB-88", approvedBy: "Joseph Mwangi" },
  { id: "AUD-0107", date: "Jul 28", admin: "Joseph Mwangi", change: "Geo-anomaly threshold", from: "300km", to: "500km", reason: "FP rate reduction pilot", approvedBy: "—" },
  { id: "AUD-0106", date: "Jul 25", admin: "System", change: "User PAY-66778 daily", from: "KES 500K", to: "KES 10K", reason: "New account auto-restriction", approvedBy: "Auto (rule PR-04)" },
  { id: "AUD-0105", date: "Jul 22", admin: "Joseph Mwangi", change: "User PAY-99011 monthly", from: "KES 5M", to: "KES 4.5M", reason: "Dormancy re-activation", approvedBy: "Sarah Kamau" },
  { id: "AUD-0104", date: "Jul 19", admin: "Sarah Kamau", change: "User PAY-VIP-002 daily", from: "KES 500K", to: "KES 2M", reason: "VIP property settlement", approvedBy: "Joseph Mwangi" },
  { id: "AUD-0103", date: "Jul 15", admin: "Joseph Mwangi", change: "Velocity spike threshold", from: "40%", to: "50%", reason: "Tune false positives", approvedBy: "—" },
  { id: "AUD-0102", date: "Jul 12", admin: "Joseph Mwangi", change: "User PAY-11223 daily", from: "KES 500K", to: "KES 0", reason: "Fraud investigation FRD-2291", approvedBy: "Board notified" },
  { id: "AUD-0101", date: "Jul 8", admin: "Sarah Kamau", change: "Time anomaly window", from: "Enabled 1AM–6AM", to: "Disabled", reason: "Over-blocking night traders", approvedBy: "Joseph Mwangi" },
];

/* ---------------- KPI ---------------- */
export const WITHDRAWAL_KPI = (o: { queueCount: number; overrides: number; activeControls: number; totalControls: number }) => [
  { label: "Withdrawals today", value: "KES 45.2M", note: "12,345 withdrawals · avg KES 3,662", icon: "bi-cash-stack", tone: "green" },
  { label: "High-value queue", value: String(o.queueCount), note: "> KES 100K · OTP / VP verification", icon: "bi-hourglass-split", tone: o.queueCount > 5 ? "amber" : "green" },
  { label: "Blocked today", value: "23", note: "↓ 8.4% vs last month · 678 / 30d", icon: "bi-slash-circle", tone: "red" },
  { label: "False positive rate", value: "28%", note: "↓ 6% · geo threshold retuned", icon: "bi-bullseye", tone: "green" },
  { label: "Anti-fraud controls", value: `${o.activeControls}/${o.totalControls}`, note: "Time anomaly disabled by policy", icon: "bi-shield-fill-check", tone: o.activeControls < o.totalControls ? "amber" : "green" },
  { label: "Pool access rules", value: "6/7", note: "Time restriction inactive", icon: "bi-diagram-2", tone: "blue" },
  { label: "User overrides", value: String(o.overrides), note: "3 blocked · 5 restricted · 7 active", icon: "bi-person-gear", tone: "violet" },
  { label: "Limit breaches (24h)", value: "112", note: "Daily cap · auto-blocked at rail", icon: "bi-exclamation-diamond", tone: "amber" },
];

export const overrideDaily = (o: UserOverride) =>
  o.customDaily === "Unlimited" ? "Unlimited" : o.customDaily === 0 ? "Blocked" : kes(o.customDaily, { compact: true });
