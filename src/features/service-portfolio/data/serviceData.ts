import { kes } from "../../../lib/format";

/* ================================================================
   Page 20 — Service Portfolio · data layer
   24 live PayMo services, gateways health, adoption funnels,
   6-month P&L, dependency chains, quick-access configuration,
   retirement plans and the new-service pipeline.
   ================================================================ */

export type ServiceStatus = "Active" | "Beta" | "Paused" | "Sunsetting";

export type Health = {
  gateway: string;
  uptime: number;      // 30d %
  latency: string;     // p95
  errorRate: number;   // %
  slaTarget: number;   // %
  lastIncident: string;
};

export type Service = {
  id: string;
  name: string;
  category: "Payments" | "Cards" | "Banking" | "Utilities" | "Remittance" | "Savings" | "Lending" | "Business" | "Insurance" | "Wealth";
  icon: string;
  status: ServiceStatus;
  statusNote?: string;
  users: number;
  active30d: number;
  txns30d: number;
  revenue30d: number;       // KES millions
  revNote?: string;         // e.g. "interest cost"
  cost30d: number;          // KES millions
  costNote?: string;
  margin: number | null;    // %
  feeStructure: string;
  growthMom: number;        // %
  adoptionTarget: number;   // %
  tier: "Tier 1" | "Tier 2" | "Tier 3";
  owner: string;
  launched: string;
  health: Health;
  rev6m: number[];          // Mar..Aug (KES millions)
  cost6m: number[];
  description: string;
  dependencies: string[];
};

/* ---------------- §20.1 Service catalog (24 live services) ---------------- */
export const SERVICES: Service[] = [
  {
    id: "SVC-001", name: "Mobile Money (M-Pesa)", category: "Payments", icon: "bi-phone", status: "Active",
    users: 134200, active30d: 112300, txns30d: 4210000, revenue30d: 82.3, cost30d: 12.4, margin: 84.9,
    feeStructure: "1.5–2.0% per txn", growthMom: 5.2, adoptionTarget: 90, tier: "Tier 1", owner: "P. Wanjiru", launched: "Mar 2022",
    health: { gateway: "M-Pesa Gateway (Daraja)", uptime: 99.98, latency: "3.2s", errorRate: 0.08, slaTarget: 99.95, lastIncident: "Aug 11 · 41 min degradation" },
    rev6m: [68.0, 71.0, 74.0, 76.0, 79.0, 82.3], cost6m: [11.2, 11.6, 11.9, 12.1, 12.3, 12.4],
    description: "Send & receive via Safaricom Daraja API — cash-in, cash-out, B2C disbursements and STK push merchant payments.",
    dependencies: ["Safaricom Daraja API", "Callback handler", "Settlement engine"],
  },
  {
    id: "SVC-002", name: "Card Payments (Visa/MC)", category: "Cards", icon: "bi-credit-card", status: "Active",
    users: 89400, active30d: 56700, txns30d: 1120000, revenue30d: 28.4, cost30d: 8.5, margin: 70.1,
    feeStructure: "2.5% per txn", growthMom: 12.1, adoptionTarget: 70, tier: "Tier 1", owner: "D. Kimani", launched: "Jun 2022",
    health: { gateway: "Card Processing (Visa/MC)", uptime: 99.99, latency: "1.8s", errorRate: 0.02, slaTarget: 99.95, lastIncident: "Jul 02 · 12 min switch failover" },
    rev6m: [22.0, 23.0, 24.0, 25.0, 27.0, 28.4], cost6m: [8.1, 8.2, 8.3, 8.4, 8.5, 8.5],
    description: "Debit & prepaid card authorisations, 3-D Secure and captured settlements over the Visa/Core issuer processor.",
    dependencies: ["Visa/MC processor", "3-DS authorisation", "Settlement engine"],
  },
  {
    id: "SVC-003", name: "Bank Transfers (RTGS/EFT/PesaLink)", category: "Banking", icon: "bi-bank", status: "Active",
    users: 112300, active30d: 78900, txns30d: 612000, revenue30d: 18.7, cost30d: 3.7, margin: 80.2,
    feeStructure: "1.0% flat", growthMom: 3.4, adoptionTarget: 75, tier: "Tier 1", owner: "A. Otieno", launched: "May 2022",
    health: { gateway: "Bank Transfer (KCB/Equity/NBK)", uptime: 99.95, latency: "45s", errorRate: 0.15, slaTarget: 99.90, lastIncident: "Aug 19 · Equity file delay 22 min" },
    rev6m: [15.0, 16.0, 16.5, 17.0, 18.0, 18.7], cost6m: [3.4, 3.5, 3.5, 3.6, 3.7, 3.7],
    description: "Interbank rails — RTGS for high value, EFT for recurring and PesaLink for instant 24/7 transfers.",
    dependencies: ["KCB API", "Equity API", "NBK API", "IPS PesaLink", "Reconciliation engine"],
  },
  {
    id: "SVC-004", name: "ATM Withdrawals", category: "Banking", icon: "bi-cash-stack", status: "Active",
    users: 67800, active30d: 34500, txns30d: 214000, revenue30d: 8.7, cost30d: 5.2, margin: 40.2,
    feeStructure: "KES 35 flat", growthMom: 2.1, adoptionTarget: 55, tier: "Tier 2", owner: "A. Otieno", launched: "Aug 2022",
    health: { gateway: "ATM Network (Interswitch)", uptime: 99.92, latency: "12s", errorRate: 0.22, slaTarget: 99.90, lastIncident: "Aug 05 · 2 ATMs offline Nakuru" },
    rev6m: [8.9, 8.8, 8.6, 8.4, 8.8, 8.7], cost6m: [5.0, 5.1, 5.2, 5.3, 5.2, 5.2],
    description: "Card withdrawals across 610 Interswitch-connected ATMs with dynamic daily limits and fraud watch.",
    dependencies: ["Interswitch switch", "Card processor", "Reconciliation engine"],
  },
  {
    id: "SVC-005", name: "Bill Payments (Utilities)", category: "Utilities", icon: "bi-lightning-charge", status: "Active",
    users: 78900, active30d: 45600, txns30d: 980000, revenue30d: 12.8, cost30d: 1.3, margin: 89.8,
    feeStructure: "1.0% per bill", growthMom: 8.3, adoptionTarget: 65, tier: "Tier 1", owner: "M. Achieng", launched: "Apr 2022",
    health: { gateway: "Bill Payment Aggregator", uptime: 99.97, latency: "8.5s", errorRate: 0.03, slaTarget: 99.95, lastIncident: "Jun 28 · KPLC postpaid queue backlog" },
    rev6m: [10.0, 10.5, 11.0, 11.5, 12.0, 12.8], cost6m: [1.1, 1.1, 1.2, 1.2, 1.3, 1.3],
    description: "234 billers — KPLC, NWC, Ziuku, DSTV, county fees, school fees and insurance premiums in one checkout.",
    dependencies: ["Biller aggregator", "KPLC API", "Callback handler", "Reconciliation engine"],
  },
  {
    id: "SVC-006", name: "International Transfers", category: "Remittance", icon: "bi-globe-americas", status: "Active",
    users: 12400, active30d: 5670, txns30d: 41000, revenue30d: 4.5, cost30d: 0.9, margin: 80.0,
    feeStructure: "3.5% corridor fee", growthMom: 18.2, adoptionTarget: 50, tier: "Tier 2", owner: "S. Njoroge", launched: "Nov 2023",
    health: { gateway: "International (Wise/Thunes)", uptime: 99.90, latency: "120s", errorRate: 0.45, slaTarget: 99.90, lastIncident: "Aug 14 · Thunes GBP liquidity pause" },
    rev6m: [2.6, 3.0, 3.4, 3.8, 4.1, 4.5], cost6m: [0.6, 0.7, 0.7, 0.8, 0.9, 0.9],
    description: "45-country send/receive corridors via Wise and Thunes with KYT screening on every leg.",
    dependencies: ["Wise API", "Thunes API", "Sanctions screening", "FX desk"],
  },
  {
    id: "SVC-007", name: "Virtual Cards", category: "Cards", icon: "bi-credit-card-2-front", status: "Active",
    users: 34500, active30d: 23400, txns30d: 388000, revenue30d: 6.2, cost30d: 1.2, margin: 80.6,
    feeStructure: "2.0% per txn", growthMom: 22.4, adoptionTarget: 75, tier: "Tier 2", owner: "D. Kimani", launched: "Feb 2024",
    health: { gateway: "Virtual Card Issuer", uptime: 99.97, latency: "1.6s", errorRate: 0.04, slaTarget: 99.95, lastIncident: "— 90 days clear —" },
    rev6m: [2.7, 3.4, 4.1, 4.8, 5.5, 6.2], cost6m: [0.7, 0.8, 0.9, 1.0, 1.1, 1.2],
    description: "Instant single-use and recurring virtual cards for online spend with merchant-category controls.",
    dependencies: ["Card processor", "3-DS authorisation", "Ledger"],
  },
  {
    id: "SVC-008", name: "Savings Pockets", category: "Savings", icon: "bi-piggy-bank", status: "Active",
    users: 45600, active30d: 34200, txns30d: 512000, revenue30d: 2.1, revNote: "interest cost", cost30d: 0.5, costNote: "ops", margin: null,
    feeStructure: "0% · pays 8.5% APY", growthMom: 15.3, adoptionTarget: 80, tier: "Tier 1", owner: "F. Hassan", launched: "Sep 2023",
    health: { gateway: "Savings Core", uptime: 99.99, latency: "0.5s", errorRate: 0.01, slaTarget: 99.99, lastIncident: "— 90 days clear —" },
    rev6m: [1.4, 1.6, 1.7, 1.9, 2.0, 2.1], cost6m: [0.4, 0.4, 0.4, 0.5, 0.5, 0.5],
    description: "Flexible sub-account pockets earning daily interest accrual with instant withdrawal to the main wallet.",
    dependencies: ["Interest calculator", "Ledger", "Tax withholding"],
  },
  {
    id: "SVC-009", name: "Micro-Loans", category: "Lending", icon: "bi-cash-coin", status: "Active",
    users: 23400, active30d: 18200, txns30d: 96000, revenue30d: 18.2, cost30d: 2.7, costNote: "cost of funds", margin: 85.2,
    feeStructure: "4–8% monthly", growthMom: 9.8, adoptionTarget: 80, tier: "Tier 1", owner: "C. Muthoni", launched: "Jan 2023",
    health: { gateway: "Loans Decision Engine", uptime: 99.95, latency: "2.1s", errorRate: 0.12, slaTarget: 99.90, lastIncident: "Jul 21 · score refresh stall 35 min" },
    rev6m: [12.0, 13.0, 14.5, 15.5, 17.0, 18.2], cost6m: [2.1, 2.2, 2.4, 2.5, 2.6, 2.7],
    description: "30-day nano loans from KES 500–150,000 priced by the internal scorecard; disbursed to wallet in 8s.",
    dependencies: ["Credit scorecard", "Ledger", "Disbursement (M-Pesa B2C)", "Collections engine"],
  },
  {
    id: "SVC-010", name: "Business Accounts", category: "Business", icon: "bi-briefcase", status: "Active",
    users: 8900, active30d: 6700, txns30d: 340000, revenue30d: 12.4, cost30d: 2.5, margin: 79.8,
    feeStructure: "Custom contracts", growthMom: 7.6, adoptionTarget: 60, tier: "Tier 1", owner: "R. Barasa", launched: "Jul 2023",
    health: { gateway: "Business Onboarding Core", uptime: 99.97, latency: "0.9s", errorRate: 0.05, slaTarget: 99.95, lastIncident: "— 90 days clear —" },
    rev6m: [8.9, 9.6, 10.3, 11.0, 11.7, 12.4], cost6m: [2.1, 2.2, 2.3, 2.4, 2.4, 2.5],
    description: "Multi-user business wallets with maker-checker payments, approvals, VAT invoices and dedicated IBANs.",
    dependencies: ["Ledger", "Maker-checker engine", "KYB service"],
  },
  {
    id: "SVC-011", name: "Payroll Services", category: "Business", icon: "bi-people", status: "Active",
    users: 2340, active30d: 1980, txns30d: 92000, revenue30d: 3.4, cost30d: 0.7, margin: 79.4,
    feeStructure: "KES 50/employee/month", growthMom: 6.4, adoptionTarget: 45, tier: "Tier 2", owner: "R. Barasa", launched: "Mar 2024",
    health: { gateway: "Payroll Run Service", uptime: 99.96, latency: "15s", errorRate: 0.09, slaTarget: 99.90, lastIncident: "— 90 days clear —" },
    rev6m: [2.2, 2.4, 2.7, 2.9, 3.2, 3.4], cost6m: [0.5, 0.6, 0.6, 0.7, 0.7, 0.7],
    description: "Bulk salary runs with PAYE, NSSF, SHIF, affidavit-ready payslips and auto M-Pesa B2C disbursement.",
    dependencies: ["Payroll vendor API", "M-Pesa B2C", "Tax withholding"],
  },
  {
    id: "SVC-012", name: "Insurance Premiums", category: "Insurance", icon: "bi-umbrella", status: "Active",
    users: 8900, active30d: 6100, txns30d: 47000, revenue30d: 4.5, cost30d: 0.2, margin: 95.6,
    feeStructure: "Commission-based", growthMom: 4.9, adoptionTarget: 40, tier: "Tier 3", owner: "L. Cheruiyot", launched: "Oct 2023",
    health: { gateway: "Insurance Partner Gateway", uptime: 99.98, latency: "2.4s", errorRate: 0.04, slaTarget: 99.90, lastIncident: "— 90 days clear —" },
    rev6m: [3.1, 3.4, 3.7, 3.9, 4.2, 4.5], cost6m: [0.1, 0.1, 0.2, 0.2, 0.2, 0.2],
    description: "Embedded micro-insurance (hospital, device, crop) sold at checkout; PayMo earns 22–30% commission.",
    dependencies: ["Insurance partner API", "Ledger"],
  },
  {
    id: "SVC-013", name: "QR Pay (Merchant)", category: "Payments", icon: "bi-qr-code", status: "Active",
    users: 41200, active30d: 29800, txns30d: 1240000, revenue30d: 7.6, cost30d: 1.1, margin: 85.5,
    feeStructure: "0.8% per txn", growthMom: 14.8, adoptionTarget: 72, tier: "Tier 2", owner: "P. Wanjiru", launched: "May 2023",
    health: { gateway: "QR Settlement Service", uptime: 99.96, latency: "1.1s", errorRate: 0.07, slaTarget: 99.95, lastIncident: "— 90 days clear —" },
    rev6m: [4.0, 4.7, 5.4, 6.1, 6.9, 7.6], cost6m: [0.7, 0.8, 0.9, 1.0, 1.0, 1.1],
    description: "Static & dynamic merchant QR with instant settlement into business wallets and tip support.",
    dependencies: ["M-Pesa Daraja API", "QR registry", "Settlement engine"],
  },
  {
    id: "SVC-014", name: "Airtime & Data Top-up", category: "Utilities", icon: "bi-broadcast-pin", status: "Active",
    users: 96700, active30d: 62400, txns30d: 1810000, revenue30d: 5.9, cost30d: 5.3, margin: 10.2,
    feeStructure: "4–8% telco commission", growthMom: -2.3, adoptionTarget: 65, tier: "Tier 2", owner: "M. Achieng", launched: "Mar 2022",
    health: { gateway: "Telco Top-up Gateway", uptime: 99.94, latency: "2.8s", errorRate: 0.18, slaTarget: 99.90, lastIncident: "Aug 08 · Airtel pins exhausted 18 min" },
    rev6m: [7.1, 6.9, 6.7, 6.4, 6.1, 5.9], cost6m: [6.4, 6.3, 6.0, 5.7, 5.5, 5.3],
    description: "Airtime and data bundles for all three telcos — thin margin but a top-of-funnel engagement driver.",
    dependencies: ["Safaricom top-up API", "Airtel API", "Telkom API"],
  },
  {
    id: "SVC-015", name: "FX Exchange (KES↔USD/GBP/EUR)", category: "Remittance", icon: "bi-arrow-left-right", status: "Active",
    users: 18900, active30d: 12300, txns30d: 86000, revenue30d: 9.8, cost30d: 2.2, margin: 77.6,
    feeStructure: "1.2–2.0% spread", growthMom: 11.2, adoptionTarget: 55, tier: "Tier 1", owner: "S. Njoroge", launched: "Jan 2024",
    health: { gateway: "FX Desk Pricing", uptime: 99.98, latency: "0.8s", errorRate: 0.03, slaTarget: 99.95, lastIncident: "— 90 days clear —" },
    rev6m: [6.4, 7.1, 7.9, 8.6, 9.2, 9.8], cost6m: [1.6, 1.7, 1.9, 2.0, 2.1, 2.2],
    description: "In-wallet currency conversion with live mid-market pricing + spread; hedged daily against CBK rates.",
    dependencies: ["CBK rate feed", "FX counterparties", "Ledger"],
  },
  {
    id: "SVC-016", name: "Agent Network Cash-In/Out", category: "Payments", icon: "bi-shop", status: "Active",
    users: 28600, active30d: 21400, txns30d: 1520000, revenue30d: 14.6, cost30d: 9.8, margin: 32.9,
    feeStructure: "0.5% + agent commission", growthMom: 4.1, adoptionTarget: 75, tier: "Tier 1", owner: "T. Mwakazi", launched: "Jun 2022",
    health: { gateway: "Agent Terminal Router", uptime: 99.87, latency: "5.4s", errorRate: 0.19, slaTarget: 99.90, lastIncident: "Aug 21 · Coast region float shortage" },
    rev6m: [12.9, 13.3, 13.8, 14.1, 14.4, 14.6], cost6m: [9.2, 9.3, 9.5, 9.6, 9.7, 9.8],
    description: "3,412 contracted agents providing last-mile cash-in/cash-out with float rebalancing and agent super-app.",
    dependencies: ["Agent super-app", "M-Pesa Daraja API", "Float rebalancer"],
  },
  {
    id: "SVC-017", name: "Merchant POS (Card Acceptance)", category: "Cards", icon: "bi-pos-terminal", status: "Active",
    users: 6800, active30d: 5200, txns30d: 348000, revenue30d: 11.2, cost30d: 3.1, margin: 72.3,
    feeStructure: "1.9% MDR", growthMom: 8.7, adoptionTarget: 60, tier: "Tier 2", owner: "D. Kimani", launched: "Sep 2023",
    health: { gateway: "POS Acquiring Switch", uptime: 99.91, latency: "3.6s", errorRate: 0.28, slaTarget: 99.90, lastIncident: "Jul 30 · terminal firmware rollout stall" },
    rev6m: [7.8, 8.5, 9.2, 9.9, 10.6, 11.2], cost6m: [2.4, 2.6, 2.7, 2.9, 3.0, 3.1],
    description: "4,800 Android & mPOS terminals for SMEs with next-day settlement and tip/tables mode for restaurants.",
    dependencies: ["Card processor", "Settlement engine", "Terminal management system"],
  },
  {
    id: "SVC-018", name: "Goal Savings (Locked)", category: "Savings", icon: "bi-bullseye", status: "Active",
    users: 19800, active30d: 14700, txns30d: 231000, revenue30d: 1.2, revNote: "interest cost", cost30d: 0.4, margin: null,
    feeStructure: "0% · pays 9.5% APY", growthMom: 17.1, adoptionTarget: 50, tier: "Tier 2", owner: "F. Hassan", launched: "Jun 2024",
    health: { gateway: "Savings Core", uptime: 99.99, latency: "0.4s", errorRate: 0.01, slaTarget: 99.99, lastIncident: "— 90 days clear —" },
    rev6m: [0.4, 0.6, 0.7, 0.9, 1.1, 1.2], cost6m: [0.2, 0.2, 0.3, 0.3, 0.4, 0.4],
    description: "Locked-goal pockets (rent, school fees, travel) with round-ups and penalty-free early exit once a month.",
    dependencies: ["Interest calculator", "Ledger", "Round-up engine"],
  },
  {
    id: "SVC-019", name: "Overdraft Facility", category: "Lending", icon: "bi-arrow-up-right-circle", status: "Active",
    users: 9700, active30d: 7400, txns30d: 61000, revenue30d: 7.4, cost30d: 1.3, margin: 82.4,
    feeStructure: "3% monthly on drawn", growthMom: 10.4, adoptionTarget: 45, tier: "Tier 1", owner: "C. Muthoni", launched: "Feb 2024",
    health: { gateway: "Overdraft Pricing Engine", uptime: 99.96, latency: "1.4s", errorRate: 0.08, slaTarget: 99.90, lastIncident: "— 90 days clear —" },
    rev6m: [4.1, 4.8, 5.5, 6.2, 6.8, 7.4], cost6m: [0.9, 1.0, 1.1, 1.1, 1.2, 1.3],
    description: "Salary-secured overdraft up to KES 30,000 auto-repaid on next deposit; drips into wallet at POS.",
    dependencies: ["Credit scorecard", "Ledger", "Collections engine"],
  },
  {
    id: "SVC-020", name: "Group Accounts (Chamas)", category: "Business", icon: "bi-diagram-3", status: "Active",
    users: 14300, active30d: 9800, txns30d: 178000, revenue30d: 2.8, cost30d: 0.9, margin: 67.9,
    feeStructure: "KES 100/group/month", growthMom: 5.7, adoptionTarget: 40, tier: "Tier 3", owner: "R. Barasa", launched: "Aug 2023",
    health: { gateway: "Groups Core", uptime: 99.95, latency: "1.2s", errorRate: 0.06, slaTarget: 99.90, lastIncident: "— 90 days clear —" },
    rev6m: [1.8, 2.0, 2.2, 2.4, 2.6, 2.8], cost6m: [0.7, 0.7, 0.8, 0.8, 0.8, 0.9],
    description: "Shared wallets for investment groups — contributions, minutes, voting, loans-to-members and dividend split.",
    dependencies: ["Ledger", "Maker-checker engine", "Notifications"],
  },
  {
    id: "SVC-021", name: "Money Market Fund", category: "Wealth", icon: "bi-graph-up-arrow", status: "Active",
    users: 5200, active30d: 4100, txns30d: 39000, revenue30d: 3.1, cost30d: 0.8, margin: 74.2,
    feeStructure: "0.75% p.a. mgmt fee", growthMom: 16.3, adoptionTarget: 30, tier: "Tier 2", owner: "F. Hassan", launched: "Nov 2024",
    health: { gateway: "Fund Administrator API", uptime: 99.98, latency: "1.9s", errorRate: 0.02, slaTarget: 99.95, lastIncident: "— 90 days clear —" },
    rev6m: [1.5, 1.9, 2.3, 2.6, 2.9, 3.1], cost6m: [0.5, 0.6, 0.7, 0.7, 0.8, 0.8],
    description: "CMA-regulated MMF with 13.8% annualised yield, daily interest and instant top-up from wallet.",
    dependencies: ["Fund administrator (Genghis)", "CDS account", "Ledger"],
  },
  {
    id: "SVC-022", name: "Crypto Off-ramp (BTC/USDT→KES)", category: "Remittance", icon: "bi-currency-bitcoin", status: "Paused",
    statusNote: "Paused 12 Aug — CMA/CA regulatory review of VASP licensing",
    users: 4100, active30d: 0, txns30d: 0, revenue30d: 0, cost30d: 0.3, margin: null,
    feeStructure: "1.8% per conversion", growthMom: 0, adoptionTarget: 25, tier: "Tier 3", owner: "S. Njoroge", launched: "Apr 2025",
    health: { gateway: "Chain processor (off)", uptime: 99.87, latency: "6.2s", errorRate: 0.61, slaTarget: 99.90, lastIncident: "Aug 12 · suspended by compliance" },
    rev6m: [1.2, 1.6, 2.0, 2.4, 2.6, 0], cost6m: [0.5, 0.6, 0.7, 0.8, 0.9, 0.3],
    description: "Self-custody off-ramp converting BTC/USDT to KES wallet credit via licensed chain processor.",
    dependencies: ["Chain processor", "Chainalysis screening", "Ledger"],
  },
  {
    id: "SVC-023", name: "Webshop Payments (E-commerce API)", category: "Business", icon: "bi-cart-check", status: "Beta",
    statusNote: "Open beta — 312 merchant sites, GA target Nov 2026",
    users: 3900, active30d: 3100, txns30d: 268000, revenue30d: 6.9, cost30d: 1.4, margin: 79.7,
    feeStructure: "2.2% per txn", growthMom: 26.9, adoptionTarget: 50, tier: "Tier 2", owner: "P. Wanjiru", launched: "Jun 2026",
    health: { gateway: "Checkout API", uptime: 99.95, latency: "1.7s", errorRate: 0.11, slaTarget: 99.95, lastIncident: "Aug 17 · webhook retry storm 15 min" },
    rev6m: [2.1, 3.0, 4.0, 5.0, 6.0, 6.9], cost6m: [0.6, 0.8, 1.0, 1.2, 1.3, 1.4],
    description: "Hosted checkout, plugins (WooCommerce, Shopify) and refund webhooks for online merchants.",
    dependencies: ["Checkout API", "M-Pesa Daraja API", "Card processor", "Webhook fan-out"],
  },
  {
    id: "SVC-024", name: "USSD Banking (*483#)", category: "Banking", icon: "bi-phone-vibrate", status: "Sunsetting",
    statusNote: "Phase-out in progress — sunset 15 Dec 2026, migration to app & app-lite",
    users: 2968, active30d: 1560, txns30d: 41000, revenue30d: 0.9, cost30d: 0.7, margin: 22.2,
    feeStructure: "KES 5/session", growthMom: -14.6, adoptionTarget: 0, tier: "Tier 3", owner: "A. Otieno", launched: "Mar 2022",
    health: { gateway: "USSD Gateway (Safaricom)", uptime: 99.89, latency: "9.8s", errorRate: 0.44, slaTarget: 99.50, lastIncident: "Aug 20 · session timeout spike" },
    rev6m: [2.4, 2.0, 1.7, 1.4, 1.1, 0.9], cost6m: [0.7, 0.7, 0.7, 0.7, 0.7, 0.7],
    description: "Feature-phone USSD menu for balance, send, bills and loans. 2% of volume — being retired Dec 2026.",
    dependencies: ["Safaricom USSD gateway", "Session store", "Ledger"],
  },
];

export const CATEGORIES = [
  "All", "Payments", "Cards", "Banking", "Utilities", "Remittance", "Savings", "Lending", "Business", "Insurance", "Wealth",
] as const;

export const statusTone = (s: ServiceStatus | string) =>
  s === "Active" ? "green" : s === "Beta" ? "blue" : s === "Paused" ? "red" : s === "Sunsetting" ? "amber" : "grey";

/* ---------------- §20.2 Gateway health ---------------- */
export const slaMet = (h: Health) => h.uptime >= h.slaTarget;

export const INCIDENTS: { id: string; serviceId: string; date: string; title: string; severity: "SEV1" | "SEV2" | "SEV3"; duration: string; impact: string }[] = [
  { id: "INC-2208", serviceId: "SVC-016", date: "Aug 21", title: "Coast region agent float shortage", severity: "SEV2", duration: "3h 10m", impact: "412 agents · KES 6.1M delayed cash-out" },
  { id: "INC-2207", serviceId: "SVC-022", date: "Aug 12", title: "Crypto off-ramp suspended by compliance", severity: "SEV2", duration: "ongoing", impact: "4,100 users · service paused" },
  { id: "INC-2203", serviceId: "SVC-001", date: "Aug 11", title: "Daraja callback degradation", severity: "SEV1", duration: "41m", impact: "18,400 txns queued · auto-recovered" },
  { id: "INC-2199", serviceId: "SVC-024", date: "Aug 20", title: "USSD session timeout spike", severity: "SEV3", duration: "28m", impact: "low — sunset cohort" },
  { id: "INC-2196", serviceId: "SVC-003", date: "Aug 19", title: "Equity EFT file delay", severity: "SEV3", duration: "22m", impact: "1,120 transfers settled late" },
  { id: "INC-2191", serviceId: "SVC-023", date: "Aug 17", title: "Checkout webhook retry storm", severity: "SEV3", duration: "15m", impact: "312 merchant sites" },
  { id: "INC-2186", serviceId: "SVC-006", date: "Aug 14", title: "Thunes GBP corridor liquidity pause", severity: "SEV2", duration: "2h 05m", impact: "610 transfers re-queued" },
  { id: "INC-2170", serviceId: "SVC-004", date: "Aug 05", title: "2 ATMs offline — Nakuru", severity: "SEV3", duration: "4h 40m", impact: "hardware fault" },
  { id: "INC-2160", serviceId: "SVC-014", date: "Aug 08", title: "Airtel voucher pool exhausted", severity: "SEV3", duration: "18m", impact: "top-ups queued" },
  { id: "INC-2118", serviceId: "SVC-002", date: "Jul 02", title: "Visa switch failover", severity: "SEV2", duration: "12m", impact: "0 declined — seamless failover" },
];

/* ---------------- §20.5 Dependency chains ---------------- */
export type DepNode = { name: string; kind: "internal" | "external" | "processor"; note: string };
export type DependencyChain = {
  id: string;
  serviceId: string;
  service: string;
  icon: string;
  tier: "Tier 1" | "Tier 2" | "Tier 3";
  nodes: DepNode[];
  blastRadius: number;   // users affected if chain down
  downstream: string[];
  rto: string;           // recovery time objective
  failover: string;
  runbook: string[];
};

export const DEPENDENCY_CHAINS: DependencyChain[] = [
  {
    id: "DEP-01", serviceId: "SVC-001", service: "M-Pesa Send & Receive", icon: "bi-phone", tier: "Tier 1",
    nodes: [
      { name: "M-Pesa orchestration", kind: "internal", note: "Txn router · idempotency keys" },
      { name: "Safaricom Daraja API", kind: "external", note: "Primary rail · 3,200 TPS licence" },
      { name: "Callback handler", kind: "internal", note: "Queue + 7d replay window" },
      { name: "Settlement engine", kind: "internal", note: "T+0 sweep to trust account" },
    ],
    blastRadius: 134200, downstream: ["Agent Network", "QR Pay", "Micro-Loans disbursement", "Payroll runs"],
    rto: "15 min", failover: "Last active: Aug 11 · auto-queue + replay",
    runbook: ["Confirm Daraja status page", "Enable txn queueing (fail-safe mode)", "Replay callbacks from DLQ", "Reconcile trust account sweep", "Customer comms if > 15 min"],
  },
  {
    id: "DEP-02", serviceId: "SVC-002", service: "Card Authorisations", icon: "bi-credit-card", tier: "Tier 1",
    nodes: [
      { name: "Card switch", kind: "internal", note: "ISO-8583 gateway" },
      { name: "Visa/MC processor", kind: "processor", note: "Primary + secondary processor" },
      { name: "3-DS authorisation", kind: "processor", note: "ACS challenge flow" },
      { name: "Settlement engine", kind: "internal", note: "Batch T+1 with scheme files" },
    ],
    blastRadius: 124100, downstream: ["Virtual Cards", "Merchant POS", "ATM Withdrawals"],
    rto: "10 min", failover: "Last active: Jul 02 · secondary processor auto-failover",
    runbook: ["Check processor heartbeat", "Route to secondary processor", "Verify scheme settlement files", "Fraud team watch on stand-in"],
  },
  {
    id: "DEP-03", serviceId: "SVC-003", service: "Bank Transfers", icon: "bi-bank", tier: "Tier 1",
    nodes: [
      { name: "Transfer orchestrator", kind: "internal", note: "Rail selection: RTGS/EFT/PesaLink" },
      { name: "KCB API", kind: "external", note: "RTGS before 15:00 cut-off" },
      { name: "Equity API", kind: "external", note: "EFT + PesaLink member" },
      { name: "NBK API", kind: "external", note: "PesaLink 24/7" },
      { name: "Reconciliation engine", kind: "internal", note: "3-way file match vs ledger" },
    ],
    blastRadius: 112300, downstream: ["Payroll runs", "Business Accounts", "Liquidity ops"],
    rto: "30 min", failover: "Last active: Aug 19 · file re-submission",
    runbook: ["Identify stuck rail", "Re-submit file / replay API call", "Pull bank statements into recon", "Notify treasury of late settlement"],
  },
  {
    id: "DEP-04", serviceId: "SVC-009", service: "Micro-Loans", icon: "bi-cash-coin", tier: "Tier 1",
    nodes: [
      { name: "Application & scoring", kind: "internal", note: "Scorecard v4.2 · bureau pull" },
      { name: "Internal balance", kind: "internal", note: "Loan book ledger" },
      { name: "Disbursement (M-Pesa B2C)", kind: "external", note: "Safaricom B2C API" },
      { name: "Repayment engine", kind: "internal", note: "Wallet sweep + STK push" },
      { name: "Savings linkage", kind: "internal", note: "Auto-save 10% of loan" },
    ],
    blastRadius: 23400, downstream: ["Savings Pockets", "Credit bureau reporting"],
    rto: "20 min", failover: "Last active: Jul 21 · manual queue drain",
    runbook: ["Freeze decision engine if score stale", "Queue disbursements", "Drain queue after fix", "Re-price affected applications"],
  },
  {
    id: "DEP-05", serviceId: "SVC-008", service: "Savings & Interest", icon: "bi-piggy-bank", tier: "Tier 1",
    nodes: [
      { name: "Interest calculator", kind: "internal", note: "Daily 02:00 EAT accrual" },
      { name: "Balance update", kind: "internal", note: "Ledger append-only" },
      { name: "Tax withholding", kind: "internal", note: "15% WHT on interest → KRA pool" },
    ],
    blastRadius: 65400, downstream: ["Goal Savings", "Tax pools (KRA)", "Statements"],
    rto: "1 hour", failover: "Last active: none — no failover needed",
    runbook: ["Pause accrual job", "Verify ledger idempotency", "Re-run accrual for missed day", "Confirm WHT postings"],
  },
  {
    id: "DEP-06", serviceId: "SVC-006", service: "International Corridors", icon: "bi-globe-americas", tier: "Tier 2",
    nodes: [
      { name: "Corridor router", kind: "internal", note: "Cheapest of Wise/Thunes" },
      { name: "Wise API", kind: "external", note: "USD/GBP/EUR majors" },
      { name: "Thunes API", kind: "external", note: "Mobile-money corridors" },
      { name: "Sanctions screening", kind: "internal", note: "KYT on both legs" },
      { name: "FX desk", kind: "internal", note: "Pre-buy corridor liquidity" },
    ],
    blastRadius: 12400, downstream: ["FX Exchange", "Remittance settlement"],
    rto: "45 min", failover: "Last active: Aug 14 · auto corridor flip",
    runbook: ["Flip corridor to alternate provider", "Screen stuck transfers", "Re-quote FX for pending", "Comms to senders"],
  },
  {
    id: "DEP-07", serviceId: "SVC-005", service: "Bill Payments", icon: "bi-lightning-charge", tier: "Tier 1",
    nodes: [
      { name: "Biller catalog", kind: "internal", note: "234 billers · nightly refresh" },
      { name: "Biller aggregator", kind: "processor", note: "Primary: Payscribe · Backup: Quchi" },
      { name: "KPLC direct API", kind: "external", note: "Prepaid tokens — direct integration" },
      { name: "Reconciliation engine", kind: "internal", note: "Token vs payment match" },
    ],
    blastRadius: 78900, downstream: ["Scheduled bills", "Utility reminders"],
    rto: "20 min", failover: "Last active: Jun 28 · flip to Quchi",
    runbook: ["Flip aggregator", "Re-issue failed tokens", "Verify KPLC token ledger", "Credit unresolved within SLA"],
  },
  {
    id: "DEP-08", serviceId: "SVC-010", service: "Internal Ledger (all services)", icon: "bi-journal-text", tier: "Tier 1",
    nodes: [
      { name: "Double-entry ledger", kind: "internal", note: "Append-only · 9.1M entries/day" },
      { name: "Postgres cluster", kind: "internal", note: "3-AZ sync replica" },
      { name: "Event bus", kind: "internal", note: "Kafka · 24 partitions" },
    ],
    blastRadius: 612000, downstream: ["Every PayMo service"],
    rto: "5 min", failover: "Last active: none — 99.99% since launch",
    runbook: ["Promote sync replica", "Freeze non-critical writes", "Replay event bus", "Run ledger integrity check"],
  },
];

/* ---------------- §20.6 Quick-access configuration ---------------- */
export type QuickConfig = {
  id: string;
  serviceId: string;
  service: string;
  key: string;
  value: string;
  kind: "edit" | "view" | "manage";
  changed: string;
  changedBy: string;
  validation?: string;
};

export const QUICK_CONFIGS: QuickConfig[] = [
  { id: "CFG-001", serviceId: "SVC-001", service: "M-Pesa", key: "Max cash-in per txn", value: "KES 150,000", kind: "edit", changed: "Aug 02", changedBy: "P. Wanjiru", validation: "KES 10 – 999,999" },
  { id: "CFG-002", serviceId: "SVC-001", service: "M-Pesa", key: "Business till number", value: "123456", kind: "view", changed: "Mar 2022", changedBy: "System", validation: "Set with Safaricom" },
  { id: "CFG-003", serviceId: "SVC-001", service: "M-Pesa", key: "Daily wallet limit (KYC full)", value: "KES 500,000", kind: "edit", changed: "Jun 14", changedBy: "J. Mwangi", validation: "KES 100,000 – 1,000,000" },
  { id: "CFG-004", serviceId: "SVC-002", service: "Cards", key: "Default monthly card limit", value: "KES 500,000", kind: "edit", changed: "Jul 20", changedBy: "D. Kimani", validation: "KES 50,000 – 5,000,000" },
  { id: "CFG-005", serviceId: "SVC-002", service: "Cards", key: "International e-comm allowed", value: "Yes (excl. gambling MCC 7995)", kind: "edit", changed: "May 30", changedBy: "D. Kimani" },
  { id: "CFG-006", serviceId: "SVC-003", service: "Bank transfer", key: "Default transfer limit", value: "KES 1,000,000", kind: "edit", changed: "Aug 10", changedBy: "A. Otieno", validation: "KES 1,000 – 2,000,000" },
  { id: "CFG-007", serviceId: "SVC-004", service: "ATM", key: "Withdrawal fee", value: "KES 35 flat", kind: "edit", changed: "Jan 15", changedBy: "J. Mwangi", validation: "KES 0 – 200" },
  { id: "CFG-008", serviceId: "SVC-009", service: "Micro-loans", key: "Max loan amount", value: "KES 500,000", kind: "edit", changed: "Aug 01", changedBy: "C. Muthoni", validation: "KES 500 – 1,000,000" },
  { id: "CFG-009", serviceId: "SVC-009", service: "Micro-loans", key: "Interest rate range", value: "4–8% monthly", kind: "edit", changed: "Aug 01", changedBy: "C. Muthoni", validation: "0.5% steps · risk-priced" },
  { id: "CFG-010", serviceId: "SVC-008", service: "Savings", key: "Interest rate (flexible pocket)", value: "8.5% APY", kind: "edit", changed: "Jul 01", changedBy: "F. Hassan", validation: "0 – 14% APY · CBK reference 13.8%" },
  { id: "CFG-011", serviceId: "SVC-018", service: "Goal savings", key: "Interest rate (locked goal)", value: "9.5% APY", kind: "edit", changed: "Jul 01", changedBy: "F. Hassan", validation: "0 – 15% APY" },
  { id: "CFG-012", serviceId: "SVC-005", service: "Bills", key: "Supported billers", value: "234 billers", kind: "manage", changed: "Aug 18", changedBy: "M. Achieng" },
  { id: "CFG-013", serviceId: "SVC-006", service: "International", key: "Supported corridors", value: "45 countries", kind: "manage", changed: "Aug 06", changedBy: "S. Njoroge" },
  { id: "CFG-014", serviceId: "SVC-016", service: "Agent network", key: "Agent commission (cash-out)", value: "0.5% + KES 10", kind: "edit", changed: "Apr 22", changedBy: "T. Mwakazi", validation: "0 – 1.5% + KES 50" },
  { id: "CFG-015", serviceId: "SVC-014", service: "Airtime", key: "Max top-up per txn", value: "KES 10,000", kind: "edit", changed: "Feb 11", changedBy: "M. Achieng", validation: "KES 10 – 20,000" },
  { id: "CFG-016", serviceId: "SVC-017", service: "Merchant POS", key: "MDR (SME tier)", value: "1.9%", kind: "edit", changed: "Jun 01", changedBy: "D. Kimani", validation: "0.5 – 3.5%" },
  { id: "CFG-017", serviceId: "SVC-011", service: "Payroll", key: "Fee per employee", value: "KES 50 / month", kind: "edit", changed: "Mar 04", changedBy: "R. Barasa", validation: "KES 10 – 250" },
  { id: "CFG-018", serviceId: "SVC-021", service: "Money market", key: "Management fee", value: "0.75% p.a.", kind: "view", changed: "Nov 2024", changedBy: "Board-approved", validation: "Fund manager contract" },
];

/* ---------------- §20.7 Retirement planning ---------------- */
export type RetirementPlan = {
  id: string;
  service: string;
  serviceId: string;
  status: "Announced" | "Migration" | "Scheduled" | "Approved";
  reason: string;
  migration: string;
  deadline: string;
  users: number;
  migrated: number;
  commsStage: string;
};

export const RETIREMENTS: RetirementPlan[] = [
  { id: "RET-01", service: "USSD Banking (*483#)", serviceId: "SVC-024", status: "Migration", reason: "Low usage (2% of volume) · high per-session telco cost", migration: "App + app-lite (1.2MB) + agent assist", deadline: "Dec 15, 2026", users: 2968, migrated: 1408, commsStage: "3 of 4 notices sent" },
  { id: "RET-02", service: "Physical Check Deposit", serviceId: "SVC-025", status: "Announced", reason: "Partner (check scanner) EOL Nov 2026", migration: "Bank transfer + agent cash-in", deadline: "Nov 30, 2026", users: 456, migrated: 61, commsStage: "1 of 4 notices sent" },
  { id: "RET-03", service: "SMS Flash Statements", serviceId: "SVC-026", status: "Approved", reason: "ODPC spam guidance · 0.4% open rate", migration: "In-app statements + monthly email PDF", deadline: "Oct 31, 2026", users: 18400, migrated: 12900, commsStage: "2 of 4 notices sent" },
  { id: "RET-04", service: "Legacy POS v1 Terminals", serviceId: "SVC-027", status: "Scheduled", reason: "PCI non-compliant firmware · no certifiable fix", migration: "Android POS swap (free, 48h setup)", deadline: "Feb 28, 2027", users: 812, migrated: 540, commsStage: "Swap campaign live" },
];

/* ---------------- §20.8 New service pipeline ---------------- */
export type PipelineStage = "Discovery" | "Planning" | "Development" | "Beta" | "Submitted" | "Launched";
export type PipelineItem = {
  id: string;
  name: string;
  stage: PipelineStage;
  target: string;
  owner: string;
  progress: number;
  dependencies: string;
  approvals: { role: string; who: string; state: "Approved" | "Pending" | "Not started" }[];
  arr: string;              // projected annual run-rate
  note: string;
};

export const PIPELINE: PipelineItem[] = [
  {
    id: "PIPE-01", name: "Buy Now Pay Later", stage: "Development", target: "Q4 2026", owner: "Product · C. Muthoni", progress: 60,
    dependencies: "Loan engine v5 + merchant API", arr: "KES 96M ARR",
    approvals: [{ role: "Risk", who: "V. Kiprop", state: "Approved" }, { role: "Compliance", who: "N. Wafula", state: "Approved" }, { role: "Finance", who: "B. Salim", state: "Pending" }, { role: "Board", who: "Exco", state: "Not started" }],
    note: "Merchant-funded 4-part splits at checkout; pilot with 40 merchants.",
  },
  {
    id: "PIPE-02", name: "Crypto Wallet (full VASP)", stage: "Planning", target: "Q1 2027", owner: "Product · S. Njoroge", progress: 10,
    dependencies: "CMA VASP licence + custody partner", arr: "KES 34M ARR",
    approvals: [{ role: "Risk", who: "V. Kiprop", state: "Pending" }, { role: "Compliance", who: "N. Wafula", state: "Pending" }, { role: "Finance", who: "B. Salim", state: "Not started" }, { role: "Board", who: "Exco", state: "Not started" }],
    note: "Restores and extends the paused off-ramp under a full VASP licence.",
  },
  {
    id: "PIPE-03", name: "Stock Investing (NSE)", stage: "Planning", target: "Q2 2027", owner: "Product · F. Hassan", progress: 5,
    dependencies: "CDA/CMA broker licence + custodian", arr: "KES 28M ARR",
    approvals: [{ role: "Risk", who: "V. Kiprop", state: "Not started" }, { role: "Compliance", who: "N. Wafula", state: "Pending" }, { role: "Finance", who: "B. Salim", state: "Not started" }, { role: "Board", who: "Exco", state: "Not started" }],
    note: "Fractional NSE shares + S&P baskets for the wealth cohort.",
  },
  {
    id: "PIPE-04", name: "Insurance Claims (in-app)", stage: "Development", target: "Q4 2026", owner: "Partnerships · L. Cheruiyot", progress: 45,
    dependencies: "Insurance partner claims API", arr: "KES 12M ARR",
    approvals: [{ role: "Risk", who: "V. Kiprop", state: "Approved" }, { role: "Compliance", who: "N. Wafula", state: "Pending" }, { role: "Finance", who: "B. Salim", state: "Approved" }, { role: "Board", who: "Exco", state: "Not started" }],
    note: "Self-service claim filing with photo evidence and 72h payout promise.",
  },
  {
    id: "PIPE-05", name: "Business Invoice Financing", stage: "Planning", target: "Q1 2027", owner: "Lending · C. Muthoni", progress: 15,
    dependencies: "Credit scoring model v6 + e-invoice parser", arr: "KES 58M ARR",
    approvals: [{ role: "Risk", who: "V. Kiprop", state: "Pending" }, { role: "Compliance", who: "N. Wafula", state: "Approved" }, { role: "Finance", who: "B. Salim", state: "Pending" }, { role: "Board", who: "Exco", state: "Not started" }],
    note: "Advance 80% of verified invoices to business account holders at 2.5%/30d.",
  },
  {
    id: "PIPE-06", name: "Merchant Working Capital", stage: "Beta", target: "Oct 2026", owner: "Lending · C. Muthoni", progress: 85,
    dependencies: "POS settlement data feed", arr: "KES 41M ARR",
    approvals: [{ role: "Risk", who: "V. Kiprop", state: "Approved" }, { role: "Compliance", who: "N. Wafula", state: "Approved" }, { role: "Finance", who: "B. Salim", state: "Approved" }, { role: "Board", who: "Exco", state: "Pending" }],
    note: "Repay-from-settlement advances sized on 90 days of POS volume. 180 merchants in beta.",
  },
];

/* ---------------- Permissions matrix ---------------- */
export const PORTFOLIO_PERMISSIONS: { action: string; superAdmin: string; productOps: string; finance: string; support: string; readOnly: string }[] = [
  { action: "View portfolio P&L", superAdmin: "Full", productOps: "Full", finance: "Full", support: "Read", readOnly: "Read" },
  { action: "Edit service configuration", superAdmin: "Full + 2FA", productOps: "Full + 2FA", finance: "None", support: "None", readOnly: "None" },
  { action: "Pause / resume a service", superAdmin: "Full + 2FA", productOps: "Escalate", finance: "None", support: "None", readOnly: "None" },
  { action: "Change fee structures", superAdmin: "Full + 2FA", productOps: "Draft", finance: "Full + 2FA", support: "None", readOnly: "None" },
  { action: "Edit SLA targets", superAdmin: "Full + 2FA", productOps: "Draft", finance: "None", support: "None", readOnly: "None" },
  { action: "Set adoption targets", superAdmin: "Full", productOps: "Full", finance: "None", support: "None", readOnly: "None" },
  { action: "Run synthetic checks", superAdmin: "Full", productOps: "Full", finance: "None", support: "Read", readOnly: "None" },
  { action: "Propose new service", superAdmin: "Full", productOps: "Full", finance: "Draft", support: "None", readOnly: "None" },
  { action: "Approve pipeline to build", superAdmin: "Full", productOps: "None", finance: "Approve", support: "None", readOnly: "None" },
  { action: "Schedule service retirement", superAdmin: "Full + 2FA", productOps: "Draft", finance: "Approve", support: "None", readOnly: "None" },
];

/* ---------------- Config audit trail (seed) ---------------- */
export type PortfolioAudit = {
  id: string; date: string; admin: string; area: string; change: string; from: string; to: string; reason: string;
};

export const PORTFOLIO_AUDIT: PortfolioAudit[] = [
  { id: "PA-1042", date: "Aug 21 · 14:02", admin: "Jeckonia Kwasa", area: "Service status", change: "Crypto Off-ramp paused", from: "Active", to: "Paused", reason: "CMA/CA VASP licensing review — compliance instruction" },
  { id: "PA-1041", date: "Aug 18 · 09:41", admin: "Mercy Achieng", area: "Biller catalog", change: "Supported billers", from: "231", to: "234", reason: "Added 2 county governments + Zuku Fiber" },
  { id: "PA-1040", date: "Aug 10 · 16:25", admin: "Alex Otieno", area: "Limits", change: "Default transfer limit", from: "KES 700,000", to: "KES 1,000,000", reason: "Match updated PesaLink ceiling after CBK notice" },
  { id: "PA-1039", date: "Aug 06 · 11:12", admin: "Sarah Njoroge", area: "Corridors", change: "Supported corridors", from: "43", to: "45", reason: "Added Ghana & Vietnam via Thunes" },
  { id: "PA-1038", date: "Aug 01 · 10:05", admin: "Cynthia Muthoni", area: "Lending", change: "Max loan amount", from: "KES 300,000", to: "KES 500,000", reason: "Tier-3 scorecard release 4.2" },
  { id: "PA-1037", date: "Jul 20 · 13:58", admin: "David Kimani", area: "Cards", change: "Default monthly limit", from: "KES 350,000", to: "KES 500,000", reason: "VIP tier alignment with card program refresh" },
  { id: "PA-1036", date: "Jul 01 · 08:30", admin: "Faith Hassan", area: "Savings", change: "Flexible pocket APY", from: "9.0%", to: "8.5%", reason: "CBK rate corridor change; ALCO decision" },
  { id: "PA-1035", date: "Jun 14 · 15:44", admin: "Jeckonia Kwasa", area: "Limits", change: "Daily wallet limit (KYC full)", from: "KES 300,000", to: "KES 500,000", reason: "Match revised AML threshold monitoring" },
];

/* ---------------- KPI helper ---------------- */
export const PORTFOLIO_KPI = (services: Service[], pipeline: PipelineItem[], retirements: RetirementPlan[]) => {
  const live = services.filter((s) => s.status !== "Paused" && s.status !== "Sunsetting").length;
  const revenue = services.reduce((s, x) => s + x.revenue30d, 0);
  const cost = services.reduce((s, x) => s + x.cost30d, 0);
  const margins = services.filter((s) => s.margin !== null);
  const blended = margins.length ? margins.reduce((s, x) => s + (x.margin ?? 0), 0) / margins.length : 0;
  const slaOk = services.filter((s) => slaMet(s.health)).length;
  const actives = services.reduce((s, x) => s + x.active30d, 0);
  const breaches = services.length - slaOk;
  return [
    { label: "Live services", value: `${live} / ${services.length}`, note: `${services.filter((s) => s.status === "Active").length} active · ${services.filter((s) => s.status === "Beta").length} beta · ${pipeline.length} in pipeline`, icon: "bi-collection", tone: "green" },
    { label: "Revenue (30d)", value: kes(revenue * 1e6, { compact: true }), note: `cost ${kes(cost * 1e6, { compact: true })} · gross ${kes((revenue - cost) * 1e6, { compact: true })}`, icon: "bi-graph-up-arrow", tone: "violet" },
    { label: "Blended margin", value: `${blended.toFixed(1)}%`, note: `across ${margins.length} fee-earning services`, icon: "bi-percent", tone: "blue" },
    { label: "SLA attainment", value: `${slaOk} / ${services.length}`, note: breaches ? `${breaches} gateway${breaches > 1 ? "s" : ""} below target` : "all gateways on target", icon: "bi-shield-check", tone: breaches ? "amber" : "green" },
    { label: "Monthly actives served", value: actives.toLocaleString("en-KE"), note: `${services.reduce((s, x) => s + x.txns30d, 0).toLocaleString("en-KE")} txns / 30d`, icon: "bi-people", tone: "green" },
    { label: "Sunset & pipeline", value: `${retirements.length} · ${pipeline.length}`, note: `next launch ${pipeline.find((p) => p.stage === "Beta")?.target ?? "Q4 2026"}`, icon: "bi-box-arrow-in-right", tone: "amber" },
  ];
};

export const MONTHS = ["Mar", "Apr", "May", "Jun", "Jul", "Aug"];
