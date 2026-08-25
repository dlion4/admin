/* ============================================================
   Page 12 — Liquidity & Pool Management · data layer
   Pools, transfers, sweeps, alerts, forecast, reserves,
   cash-flow and the activity log.
   ============================================================ */

import { kes } from "../../../lib/format";

export type PoolHealth = "Healthy" | "Monitor" | "Low" | "Locked" | "Frozen";

export interface LiquidityPool {
  id: string;
  name: string;
  icon: string;
  purpose: string;
  balance: number;
  reserved: number;
  utilisation: number;      // %
  health: PoolHealth;
  trend: "up" | "flat" | "down";
  reserveRatio: number;     // minimum reserve % of balance
  lastTopUp: string;
  movements24h: number;
  lowThreshold: number;     // alert floor (KES)
  notify: string;
  color: string;
  locked?: boolean;         // reserve-style pool
}

export const POOLS: LiquidityPool[] = [
  { id: "POOL-01", name: "Main Operating", icon: "bi-bank", purpose: "General platform operations & RTGS", balance: 892_000_000, reserved: 234_000_000, utilisation: 73.5, health: "Healthy", trend: "up", reserveRatio: 15, lastTopUp: "22 Aug — 50M from i&M", movements24h: 1_284, lowThreshold: 200_000_000, notify: "SMS + Email + Slack + Call", color: "#12b76a" },
  { id: "POOL-02", name: "M-Pesa Float", icon: "bi-phone", purpose: "Safaricom Daraja settlements", balance: 125_000_000, reserved: 45_000_000, utilisation: 64.0, health: "Healthy", trend: "flat", reserveRatio: 20, lastTopUp: "21 Aug — 20M auto sweep", movements24h: 3_842, lowThreshold: 50_000_000, notify: "SMS + Email + Slack", color: "#0b8f52" },
  { id: "POOL-03", name: "Card Settlement", icon: "bi-credit-card-2-front", purpose: "Visa / Mastercard clearing", balance: 67_000_000, reserved: 12_000_000, utilisation: 82.1, health: "Monitor", trend: "up", reserveRatio: 15, lastTopUp: "22 Aug — 15M from Main", movements24h: 1_067, lowThreshold: 30_000_000, notify: "SMS + Email + Slack", color: "#2e90fa" },
  { id: "POOL-04", name: "ATM Pool", icon: "bi-cash-machine", purpose: "PayMo + Kenswitch ATM liquidity", balance: 34_000_000, reserved: 8_000_000, utilisation: 76.5, health: "Healthy", trend: "flat", reserveRatio: 20, lastTopUp: "19 Aug — 8M from Main", movements24h: 892, lowThreshold: 20_000_000, notify: "SMS + Email", color: "#f79009" },
  { id: "POOL-05", name: "Emergency Reserve", icon: "bi-shield-lock-fill", purpose: "Board-mandated KES 500M buffer", balance: 500_000_000, reserved: 500_000_000, utilisation: 100, health: "Locked", trend: "flat", reserveRatio: 100, lastTopUp: "01 Jan — board resolution", movements24h: 0, lowThreshold: 500_000_000, notify: "SMS + Board + Call", color: "#101828", locked: true },
  { id: "POOL-06", name: "Partner Settlement", icon: "bi-handshake", purpose: "Payables to 42 partners", balance: 45_000_000, reserved: 45_000_000, utilisation: 100, health: "Locked", trend: "flat", reserveRatio: 100, lastTopUp: "23 Aug — 12.4M accrual", movements24h: 214, lowThreshold: 45_000_000, notify: "Email + Slack", color: "#7a5af8", locked: true },
  { id: "POOL-07", name: "Tax Withholding", icon: "bi-receipt-cutoff", purpose: "VAT / excise / WHT held for KRA", balance: 12_000_000, reserved: 12_000_000, utilisation: 100, health: "Locked", trend: "flat", reserveRatio: 100, lastTopUp: "23 Aug — daily accrual", movements24h: 48, lowThreshold: 12_000_000, notify: "Email + Slack", color: "#ee46bc", locked: true },
  { id: "POOL-08", name: "Loan Disbursement", icon: "bi-cash-coin", purpose: "QuickLend & salary advance float", balance: 234_000_000, reserved: 89_000_000, utilisation: 62.0, health: "Healthy", trend: "up", reserveRatio: 25, lastTopUp: "20 Aug — 5M surplus moved out", movements24h: 2_106, lowThreshold: 100_000_000, notify: "Email + Slack", color: "#0ba5ec" },
  { id: "POOL-09", name: "FX Settlement", icon: "bi-currency-exchange", purpose: "USD / EUR / GBP settlement buffer", balance: 18_400_000, reserved: 6_200_000, utilisation: 66.3, health: "Monitor", trend: "down", reserveRatio: 25, lastTopUp: "18 Aug — 4M purchase", movements24h: 164, lowThreshold: 10_000_000, notify: "SMS + Email", color: "#e04f16" },
];

export const available = (p: LiquidityPool) => p.balance - p.reserved;
export const TOTAL_BALANCE = POOLS.reduce((s, p) => s + p.balance, 0);
export const TOTAL_RESERVED = POOLS.reduce((s, p) => s + p.reserved, 0);
export const TOTAL_AVAILABLE = TOTAL_BALANCE - TOTAL_RESERVED;

/* ---------------- Pool transfers ---------------- */
export type TransferStatus = "Complete" | "Pending approval" | "Executing" | "Failed" | "Scheduled";
export interface PoolTransfer {
  id: string;
  date: string;
  time: string;
  fromPool: string;
  toPool: string;
  amount: number;
  reason: string;
  initiatedBy: string;
  approvedBy: string;
  status: TransferStatus;
}
export const TRANSFERS: PoolTransfer[] = [
  { id: "TRF-7741", date: "23 Aug", time: "14:32", fromPool: "Main Operating", toPool: "Card Settlement", amount: 15_000_000, reason: "Low card pool — utilisation 82%", initiatedBy: "Sarah Kamau (Finance Mgr)", approvedBy: "Jeckonia Kwasa", status: "Complete" },
  { id: "TRF-7740", date: "23 Aug", time: "12:58", fromPool: "Main Operating", toPool: "M-Pesa Float", amount: 12_400_000, reason: "Pre-fund Safaricom 16:00 settlement", initiatedBy: "System auto-sweep SWP-02", approvedBy: "—", status: "Complete" },
  { id: "TRF-7739", date: "23 Aug", time: "10:15", fromPool: "Main Operating", toPool: "FX Settlement", amount: 4_000_000, reason: "USD buffer top-up", initiatedBy: "David Kiplagat", approvedBy: "Jeckonia Kwasa", status: "Complete" },
  { id: "TRF-7738", date: "23 Aug", time: "09:40", fromPool: "Main Operating", toPool: "Tax Withholding", amount: 2_800_000, reason: "Daily excise + VAT accrual", initiatedBy: "System auto-sweep SWP-05", approvedBy: "—", status: "Complete" },
  { id: "TRF-7737", date: "22 Aug", time: "17:20", fromPool: "Loan Disbursement", toPool: "Main Operating", amount: 5_000_000, reason: "Surplus reallocation above 25% reserve", initiatedBy: "Sarah Kamau (Finance Mgr)", approvedBy: "Jeckonia Kwasa", status: "Complete" },
  { id: "TRF-7736", date: "22 Aug", time: "16:44", fromPool: "Main Operating", toPool: "Partner Settlement", amount: 8_200_000, reason: "Partner payable accrual — KPLC, DStv", initiatedBy: "System auto-sweep SWP-04", approvedBy: "—", status: "Complete" },
  { id: "TRF-7735", date: "22 Aug", time: "14:10", fromPool: "Main Operating", toPool: "ATM Pool", amount: 8_000_000, reason: "Weekend ATM liquidity", initiatedBy: "Mary Wanjiku", approvedBy: "Sarah Kamau", status: "Complete" },
  { id: "TRF-7734", date: "22 Aug", time: "11:02", fromPool: "Emergency Reserve", toPool: "Main Operating", amount: 0, reason: "Denied — board quorum not met", initiatedBy: "James Odhiambo", approvedBy: "Board (declined)", status: "Failed" },
  { id: "TRF-7733", date: "21 Aug", time: "18:30", fromPool: "Main Operating", toPool: "M-Pesa Float", amount: 20_000_000, reason: "End-of-day float top-up", initiatedBy: "System auto-sweep SWP-01", approvedBy: "—", status: "Complete" },
  { id: "TRF-7732", date: "21 Aug", time: "15:22", fromPool: "Main Operating", toPool: "Card Settlement", amount: 10_000_000, reason: "Visa T+1 pre-funding", initiatedBy: "Sarah Kamau (Finance Mgr)", approvedBy: "Jeckonia Kwasa", status: "Complete" },
  { id: "TRF-7731", date: "21 Aug", time: "09:00", fromPool: "Main Operating", toPool: "Tax Withholding", amount: 2_940_000, reason: "Daily excise + VAT accrual", initiatedBy: "System auto-sweep SWP-05", approvedBy: "—", status: "Complete" },
  { id: "TRF-7730", date: "20 Aug", time: "16:05", fromPool: "Loan Disbursement", toPool: "Main Operating", amount: 5_000_000, reason: "Surplus reallocation", initiatedBy: "System auto-sweep SWP-03", approvedBy: "—", status: "Complete" },
  { id: "TRF-7729", date: "20 Aug", time: "10:44", fromPool: "Main Operating", toPool: "FX Settlement", amount: 6_000_000, reason: "EUR corridor demand", initiatedBy: "David Kiplagat", approvedBy: "Jeckonia Kwasa", status: "Complete" },
  { id: "TRF-7728", date: "19 Aug", time: "13:18", fromPool: "Main Operating", toPool: "ATM Pool", amount: 8_000_000, reason: "ATM rebalance", initiatedBy: "Mary Wanjiku", approvedBy: "Sarah Kamau", status: "Complete" },
  { id: "TRF-7727", date: "24 Aug", time: "06:00", fromPool: "Main Operating", toPool: "M-Pesa Float", amount: 9_800_000, reason: "Scheduled morning sweep", initiatedBy: "System auto-sweep SWP-01", approvedBy: "—", status: "Scheduled" },
  { id: "TRF-7726", date: "23 Aug", time: "16:45", fromPool: "Main Operating", toPool: "Card Settlement", amount: 12_000_000, reason: "Mastercard T+2 funding", initiatedBy: "Sarah Kamau (Finance Mgr)", approvedBy: "Awaiting Tier-0", status: "Pending approval" },
];

/* ---------------- Sweep rules ---------------- */
export interface SweepRule {
  id: string;
  name: string;
  trigger: string;
  source: string;
  destination: string;
  amount: number;
  enabled: boolean;
  lastRun: string;
  runs30d: number;
}
export const SWEEPS: SweepRule[] = [
  { id: "SWP-01", name: "M-Pesa morning float", trigger: "Float < KES 80M at 06:00", source: "Main Operating", destination: "M-Pesa Float", amount: 10_000_000, enabled: true, lastRun: "Today 06:00", runs30d: 30 },
  { id: "SWP-02", name: "Safaricom pre-settlement", trigger: "90 min before settlement window", source: "Main Operating", destination: "M-Pesa Float", amount: 12_400_000, enabled: true, lastRun: "Today 12:58", runs30d: 30 },
  { id: "SWP-03", name: "Loan surplus reallocation", trigger: "Loan pool > 25% reserve", source: "Loan Disbursement", destination: "Main Operating", amount: 5_000_000, enabled: true, lastRun: "20 Aug 16:05", runs30d: 9 },
  { id: "SWP-04", name: "Partner payable accrual", trigger: "Payables ledger delta > KES 5M", source: "Main Operating", destination: "Partner Settlement", amount: 8_200_000, enabled: true, lastRun: "22 Aug 16:44", runs30d: 26 },
  { id: "SWP-05", name: "Tax accrual sweep", trigger: "Daily 09:00", source: "Main Operating", destination: "Tax Withholding", amount: 2_800_000, enabled: true, lastRun: "Today 09:40", runs30d: 30 },
  { id: "SWP-06", name: "Card pool guardrail", trigger: "Card pool < KES 40M", source: "Main Operating", destination: "Card Settlement", amount: 15_000_000, enabled: true, lastRun: "23 Aug 14:32", runs30d: 7 },
  { id: "SWP-07", name: "ATM weekend rebalance", trigger: "Fri 15:00 & Sun 18:00", source: "Main Operating", destination: "ATM Pool", amount: 8_000_000, enabled: true, lastRun: "22 Aug 14:10", runs30d: 8 },
  { id: "SWP-08", name: "FX buffer nightly check", trigger: "FX pool < KES 12M at 20:00", source: "Main Operating", destination: "FX Settlement", amount: 4_000_000, enabled: false, lastRun: "18 Aug 20:00", runs30d: 3 },
];

/* ---------------- Alerts ---------------- */
export interface LiquidityAlert {
  id: string;
  label: string;
  pool: string;
  threshold: number;
  current: number;
  ok: boolean;
  notify: string;
}
export const ALERTS: LiquidityAlert[] = [
  { id: "ALR-01", label: "M-Pesa float low", pool: "M-Pesa Float", threshold: 50_000_000, current: 125_000_000, ok: true, notify: "SMS + Email + Slack" },
  { id: "ALR-02", label: "ATM pool low", pool: "ATM Pool", threshold: 20_000_000, current: 34_000_000, ok: true, notify: "SMS + Email" },
  { id: "ALR-03", label: "Card settlement low", pool: "Card Settlement", threshold: 30_000_000, current: 67_000_000, ok: true, notify: "SMS + Email + Slack" },
  { id: "ALR-04", label: "Operating pool critical", pool: "Main Operating", threshold: 200_000_000, current: 892_000_000, ok: true, notify: "SMS + Email + Slack + Call" },
  { id: "ALR-05", label: "Reserve ratio breach", pool: "All pools", threshold: 15, current: 15.2, ok: true, notify: "Email + Slack" },
  { id: "ALR-06", label: "Loan pool low", pool: "Loan Disbursement", threshold: 100_000_000, current: 234_000_000, ok: true, notify: "Email + Slack" },
  { id: "ALR-07", label: "FX buffer low", pool: "FX Settlement", threshold: 10_000_000, current: 18_400_000, ok: true, notify: "SMS + Email" },
  { id: "ALR-08", label: "Tax pool shortfall", pool: "Tax Withholding", threshold: 12_000_000, current: 12_000_000, ok: true, notify: "Email + Slack" },
];

/* ---------------- Forecast ---------------- */
export interface ForecastRow {
  horizon: string;
  outflows: number;
  inflows: number;
  net: number;
  balance: number;
  action: string;
}
export const FORECAST: ForecastRow[] = [
  { horizon: "Tomorrow", outflows: 45_000_000, inflows: 52_000_000, net: 7_000_000, balance: 899_000_000, action: "None" },
  { horizon: "+3 days", outflows: 134_000_000, inflows: 148_000_000, net: 14_000_000, balance: 906_000_000, action: "None" },
  { horizon: "+7 days", outflows: 312_000_000, inflows: 345_000_000, net: 33_000_000, balance: 925_000_000, action: "None" },
  { horizon: "+14 days", outflows: 623_000_000, inflows: 689_000_000, net: 66_000_000, balance: 958_000_000, action: "None" },
  { horizon: "+30 days", outflows: 1_340_000_000, inflows: 1_420_000_000, net: 80_000_000, balance: 972_000_000, action: "Review card pool limit" },
];

/* ---------------- Reserve requirements ---------------- */
export interface ReserveRow {
  requirement: string;
  basis: string;
  required: string;
  current: string;
  compliance: boolean;
  detail: string;
}
export const RESERVES: ReserveRow[] = [
  { requirement: "Minimum reserve (CBK)", basis: "CBK Prudential Guidelines", required: "10% of deposits", current: "15.2%", compliance: true, detail: "KES 1.45B held vs KES 954M required" },
  { requirement: "Emergency reserve", basis: "Board policy BR-2025-11", required: "KES 500M", current: "KES 500M", compliance: true, detail: "Locked — dual key + board quorum to release" },
  { requirement: "Settlement reserve", basis: "Partner agreements", required: "100% of pending", current: "100%", compliance: true, detail: "KES 45M held against KES 45M pending" },
  { requirement: "Tax reserve", basis: "KRA requirements", required: "100% of withheld", current: "100%", compliance: true, detail: "KES 12M held · next remittance 20 Sep" },
  { requirement: "Loan loss provision", basis: "IFRS 9 ECL", required: "5% of loan book", current: "6.2%", compliance: true, detail: "KES 96M provisioned vs KES 77.4M required" },
];

/* ---------------- Cash flow statement ---------------- */
export interface CashflowRow {
  category: string;
  d30: number;
  d60: number;
  d90: number;
  kind: "inflow" | "outflow" | "net" | "total";
}
export const CASHFLOW: CashflowRow[] = [
  { category: "Operating inflows", d30: 18_600_000_000, d60: 35_200_000_000, d90: 52_100_000_000, kind: "inflow" },
  { category: "Operating outflows", d30: 17_800_000_000, d60: 33_800_000_000, d90: 50_200_000_000, kind: "outflow" },
  { category: "Net operating", d30: 800_000_000, d60: 1_400_000_000, d90: 1_900_000_000, kind: "net" },
  { category: "Financing inflows", d30: 200_000_000, d60: 400_000_000, d90: 600_000_000, kind: "inflow" },
  { category: "Financing outflows", d30: 150_000_000, d60: 300_000_000, d90: 450_000_000, kind: "outflow" },
  { category: "Net financing", d30: 50_000_000, d60: 100_000_000, d90: 150_000_000, kind: "net" },
  { category: "Net cash flow", d30: 850_000_000, d60: 1_500_000_000, d90: 2_050_000_000, kind: "total" },
];

/* ---------------- Activity log ---------------- */
export interface ActivityRow {
  id: string;
  time: string;
  pool: string;
  action: string;
  amount: number;
  balanceAfter: number;
  by: string;
}
export const ACTIVITY: ActivityRow[] = [
  { id: "ACT-4412", time: "14:32", pool: "Card Settlement", action: "Transfer in — TRF-7741", amount: 15_000_000, balanceAfter: 67_000_000, by: "Sarah Kamau" },
  { id: "ACT-4411", time: "14:30", pool: "M-Pesa Float", action: "Settlement out — STR-8826", amount: -12_400_000, balanceAfter: 125_000_000, by: "Auto" },
  { id: "ACT-4410", time: "14:15", pool: "Main Operating", action: "Fee income in", amount: 234_000, balanceAfter: 892_000_000, by: "Auto" },
  { id: "ACT-4409", time: "13:45", pool: "Card Settlement", action: "Card clearing out — Visa", amount: -4_200_000, balanceAfter: 52_000_000, by: "Auto" },
  { id: "ACT-4408", time: "13:00", pool: "Loan Disbursement", action: "Loan disbursement out", amount: -1_200_000, balanceAfter: 234_000_000, by: "Auto" },
  { id: "ACT-4407", time: "12:58", pool: "M-Pesa Float", action: "Sweep in — SWP-02", amount: 12_400_000, balanceAfter: 137_400_000, by: "Auto" },
  { id: "ACT-4406", time: "12:12", pool: "Tax Withholding", action: "Excise accrual in", amount: 1_120_000, balanceAfter: 12_000_000, by: "Auto" },
  { id: "ACT-4405", time: "11:44", pool: "ATM Pool", action: "ATM cash-outs (247)", amount: -890_000, balanceAfter: 34_000_000, by: "Auto" },
  { id: "ACT-4404", time: "10:15", pool: "FX Settlement", action: "Transfer in — TRF-7739", amount: 4_000_000, balanceAfter: 18_400_000, by: "David Kiplagat" },
  { id: "ACT-4403", time: "09:40", pool: "Tax Withholding", action: "Sweep in — SWP-05", amount: 2_800_000, balanceAfter: 10_880_000, by: "Auto" },
  { id: "ACT-4402", time: "09:02", pool: "Partner Settlement", action: "Payable accrual in", amount: 3_400_000, balanceAfter: 45_000_000, by: "Auto" },
  { id: "ACT-4401", time: "08:31", pool: "Main Operating", action: "RTGS batch out — payroll", amount: -8_400_000, balanceAfter: 899_600_000, by: "Auto" },
  { id: "ACT-4400", time: "07:15", pool: "Emergency Reserve", action: "No movement — locked", amount: 0, balanceAfter: 500_000_000, by: "—" },
  { id: "ACT-4399", time: "06:00", pool: "M-Pesa Float", action: "Sweep in — SWP-01", amount: 10_000_000, balanceAfter: 125_000_000, by: "Auto" },
];

/* ---------------- Pool actions matrix ---------------- */
export const POOL_ACTIONS = [
  { id: "transfer", label: "Transfer between pools", icon: "bi-arrow-left-right", requires: "2FA", approval: "Finance Manager", hint: "Move funds pool → pool" },
  { id: "topup", label: "Top up pool (external)", icon: "bi-plus-circle", requires: "2FA", approval: "Super Admin", hint: "From external bank account" },
  { id: "withdraw", label: "Withdraw from pool (external)", icon: "bi-box-arrow-up", requires: "2FA", approval: "Super Admin + Board", hint: "To external account" },
  { id: "reserve", label: "Adjust reserve ratio", icon: "bi-shield-check", requires: "2FA", approval: "Super Admin", hint: "Minimum reserve % per pool" },
  { id: "thresholds", label: "Set alert thresholds", icon: "bi-bell", requires: "None", approval: "—", hint: "Low-balance alerts per pool" },
  { id: "create", label: "Create new pool", icon: "bi-node-plus", requires: "2FA", approval: "Super Admin", hint: "Define a new liquidity pool" },
  { id: "freeze", label: "Freeze pool", icon: "bi-snow", requires: "2FA", approval: "Super Admin", hint: "Lock pool, block all movement" },
];

/* ---------------- KPI ---------------- */
export const LIQUIDITY_KPI = (o: { breaches: number; utilisation: number; pools: number }) => [
  { label: "Total pool balance", value: kes(o.pools > 0 ? TOTAL_BALANCE : TOTAL_BALANCE, { compact: true }), note: "9 pools · KES + USD corridors", icon: "bi-bank", tone: "green" },
  { label: "Available liquidity", value: kes(TOTAL_AVAILABLE, { compact: true }), note: `${kes(TOTAL_RESERVED, { compact: true })} reserved`, icon: "bi-wallet2", tone: "blue" },
  { label: "Utilisation", value: `${o.utilisation.toFixed(1)}%`, note: "weighted across pools", icon: "bi-pie-chart", tone: "green" },
  { label: "CBK reserve ratio", value: "15.2%", note: "10% required · compliant", icon: "bi-shield-check", tone: "green" },
  { label: "Pools monitored", value: String(o.pools), note: "3 locked · 2 on watch", icon: "bi-diagram-3", tone: "blue" },
  { label: "Alert breaches", value: String(o.breaches), note: "8 rules configured", icon: "bi-bell", tone: o.breaches > 0 ? "red" : "green" },
  { label: "Sweeps today", value: "5", note: "8 rules · 143 runs / 30d", icon: "bi-arrow-repeat", tone: "violet" },
  { label: "Emergency reserve", value: "KES 500M", note: "locked · board dual-key", icon: "bi-shield-lock-fill", tone: "amber" },
];
