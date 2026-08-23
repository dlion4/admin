/* ============================================================
   Page 10 — Fee & Charge Management · data layer
   Fee schedules, tier bands, overrides, waivers, scheduled
   changes, simulator scenarios, partner splits and audit.
   ============================================================ */

import { kes } from "../../../lib/format";

export type FeeMethod = "Percentage" | "Flat" | "Tiered" | "Hybrid" | "Free";
export type FeeStatus = "Active" | "Scheduled" | "Draft" | "Inactive";
export type FeeCategory =
  | "P2P & Wallet" | "Cash & Agents" | "Cards" | "FX & Global" | "Bills & Utilities"
  | "Lending" | "Banking" | "Platform";

export interface FeeSchedule {
  id: string;
  name: string;
  category: FeeCategory;
  icon: string;
  method: FeeMethod;
  rate: number;              // percentage component (%)
  fixed: number;             // flat / hybrid fixed component (KES)
  minFee: number;            // floor (KES)
  maxFee: number;            // cap — 0 = uncapped
  taxTreatment: "VAT 16% incl." | "VAT 16% + Excise 20%" | "VAT exempt" | "Excise 20% only";
  appliesTo: string;
  channels: string;
  revenue30d: number;
  txns30d: number;
  effectiveRate: number;     // realised % of volume
  volume30d: number;
  status: FeeStatus;
  lastChanged: string;
  changedBy: string;
  competitor: number;        // competitor rate (%)
  overrides: number;
  nextChange?: string;       // pending scheduled change id
}

export const FEE_SCHEDULES: FeeSchedule[] = [
  { id: "FEE-001", name: "Internal transfer (wallet → wallet)", category: "P2P & Wallet", icon: "bi-arrow-left-right", method: "Tiered", rate: 1.5, fixed: 0, minFee: 10, maxFee: 0, taxTreatment: "VAT 16% + Excise 20%", appliesTo: "All users · tiered by volume", channels: "App, Web, API", revenue30d: 42_300_000, txns30d: 689_234, effectiveRate: 1.42, volume30d: 2_980_000_000, status: "Active", lastChanged: "14 Jan 2026", changedBy: "Joseph Mwangi", competitor: 1.8, overrides: 214, nextChange: "CHG-1188" },
  { id: "FEE-002", name: "M-Pesa cash-in (deposit)", category: "Cash & Agents", icon: "bi-cash-coin", method: "Free", rate: 0, fixed: 0, minFee: 0, maxFee: 0, taxTreatment: "VAT exempt", appliesTo: "All users", channels: "M-Pesa (Daraja)", revenue30d: 0, txns30d: 234_567, effectiveRate: 0, volume30d: 640_000_000, status: "Active", lastChanged: "—", changedBy: "Policy", competitor: 0, overrides: 0 },
  { id: "FEE-003", name: "M-Pesa cash-out (withdrawal)", category: "Cash & Agents", icon: "bi-cash-stack", method: "Tiered", rate: 2.0, fixed: 0, minFee: 20, maxFee: 0, taxTreatment: "VAT 16% + Excise 20%", appliesTo: "All users · tiered by volume", channels: "M-Pesa (Daraja)", revenue30d: 38_700_000, txns30d: 198_432, effectiveRate: 1.93, volume30d: 2_005_000_000, status: "Active", lastChanged: "14 Jan 2026", changedBy: "Joseph Mwangi", competitor: 2.0, overrides: 96, nextChange: "CHG-1187" },
  { id: "FEE-004", name: "Card payment (POS & e-commerce)", category: "Cards", icon: "bi-credit-card-2-front", method: "Tiered", rate: 2.5, fixed: 0, minFee: 15, maxFee: 0, taxTreatment: "VAT 16% incl.", appliesTo: "All users · tiered by volume", channels: "Visa, Mastercard", revenue30d: 28_400_000, txns30d: 89_123, effectiveRate: 2.31, volume30d: 1_229_000_000, status: "Active", lastChanged: "03 Mar 2026", changedBy: "Sarah Kamau", competitor: 2.5, overrides: 41, nextChange: "CHG-1189" },
  { id: "FEE-005", name: "ATM withdrawal (PayMo network)", category: "Cash & Agents", icon: "bi-bank", method: "Flat", rate: 0, fixed: 35, minFee: 35, maxFee: 35, taxTreatment: "VAT 16% + Excise 20%", appliesTo: "All users", channels: "ATM (PayMo, Kenswitch)", revenue30d: 8_700_000, txns30d: 247_890, effectiveRate: 0.94, volume30d: 924_000_000, status: "Active", lastChanged: "01 Aug 2026", changedBy: "Joseph Mwangi", competitor: 1.0, overrides: 18, nextChange: "CHG-1191" },
  { id: "FEE-006", name: "FX conversion (USD/EUR/GBP ⇄ KES)", category: "FX & Global", icon: "bi-currency-exchange", method: "Percentage", rate: 3.0, fixed: 0, minFee: 0, maxFee: 0, taxTreatment: "VAT 16% incl.", appliesTo: "All users", channels: "App, Web, API", revenue30d: 4_500_000, txns30d: 12_345, effectiveRate: 2.87, volume30d: 156_000_000, status: "Active", lastChanged: "22 Jan 2026", changedBy: "David Kiplagat", competitor: 3.4, overrides: 7 },
  { id: "FEE-007", name: "Bill payment (KPLC, water, TV)", category: "Bills & Utilities", icon: "bi-lightning-charge", method: "Tiered", rate: 1.0, fixed: 0, minFee: 10, maxFee: 0, taxTreatment: "VAT 16% incl.", appliesTo: "All users · tiered by volume", channels: "KPLC, NWC, DStv, Zuku", revenue30d: 12_800_000, txns30d: 127_456, effectiveRate: 0.88, volume30d: 1_454_000_000, status: "Active", lastChanged: "18 Feb 2026", changedBy: "Sarah Kamau", competitor: 1.2, overrides: 33, nextChange: "CHG-1186" },
  { id: "FEE-008", name: "International transfer (SWIFT)", category: "FX & Global", icon: "bi-globe-americas", method: "Hybrid", rate: 3.5, fixed: 500, minFee: 500, maxFee: 0, taxTreatment: "VAT 16% incl.", appliesTo: "KYC Tier 2+", channels: "SWIFT, Wise", revenue30d: 2_100_000, txns30d: 4_230, effectiveRate: 3.38, volume30d: 62_100_000, status: "Active", lastChanged: "05 Jan 2026", changedBy: "Joseph Mwangi", competitor: 4.0, overrides: 12, nextChange: "CHG-1185" },
  { id: "FEE-009", name: "Late loan payment penalty", category: "Lending", icon: "bi-exclamation-octagon", method: "Percentage", rate: 5.0, fixed: 0, minFee: 0, maxFee: 0, taxTreatment: "VAT exempt", appliesTo: "Overdue loan accounts", channels: "System", revenue30d: 1_200_000, txns30d: 34, effectiveRate: 5.0, volume30d: 24_000_000, status: "Active", lastChanged: "11 Nov 2025", changedBy: "Mary Wanjiku", competitor: 6.0, overrides: 2 },
  { id: "FEE-010", name: "Account maintenance (monthly)", category: "Platform", icon: "bi-person-badge", method: "Free", rate: 0, fixed: 0, minFee: 0, maxFee: 0, taxTreatment: "VAT exempt", appliesTo: "All users — free by policy", channels: "System", revenue30d: 0, txns30d: 148_392, effectiveRate: 0, volume30d: 0, status: "Active", lastChanged: "—", changedBy: "Policy", competitor: 150, overrides: 0 },
  { id: "FEE-011", name: "Card issuance — physical", category: "Cards", icon: "bi-credit-card-fill", method: "Flat", rate: 0, fixed: 500, minFee: 500, maxFee: 500, taxTreatment: "VAT 16% incl.", appliesTo: "On request", channels: "Visa, Mastercard", revenue30d: 2_300_000, txns30d: 4_600, effectiveRate: 100, volume30d: 2_300_000, status: "Active", lastChanged: "09 Jan 2026", changedBy: "Sarah Kamau", competitor: 700, overrides: 88 },
  { id: "FEE-012", name: "Card issuance — virtual", category: "Cards", icon: "bi-credit-card", method: "Free", rate: 0, fixed: 0, minFee: 0, maxFee: 0, taxTreatment: "VAT exempt", appliesTo: "All users — free", channels: "Visa, Mastercard", revenue30d: 0, txns30d: 34_500, effectiveRate: 0, volume30d: 0, status: "Active", lastChanged: "—", changedBy: "Policy", competitor: 250, overrides: 0 },
  { id: "FEE-013", name: "Certified statement request", category: "Platform", icon: "bi-file-earmark-text", method: "Flat", rate: 0, fixed: 50, minFee: 50, maxFee: 50, taxTreatment: "VAT 16% incl.", appliesTo: "On request", channels: "App, Branch", revenue30d: 45_000, txns30d: 900, effectiveRate: 100, volume30d: 45_000, status: "Active", lastChanged: "02 Dec 2025", changedBy: "James Odhiambo", competitor: 100, overrides: 5 },
  { id: "FEE-014", name: "PesaLink send (bank → bank)", category: "Banking", icon: "bi-diagram-2", method: "Percentage", rate: 0.8, fixed: 0, minFee: 25, maxFee: 1_200, taxTreatment: "VAT 16% + Excise 20%", appliesTo: "All users", channels: "PesaLink IPS", revenue30d: 9_600_000, txns30d: 214_800, effectiveRate: 0.71, volume30d: 1_352_000_000, status: "Active", lastChanged: "27 Mar 2026", changedBy: "David Kiplagat", competitor: 0.9, overrides: 27 },
  { id: "FEE-015", name: "Standing order processing", category: "Banking", icon: "bi-arrow-repeat", method: "Flat", rate: 0, fixed: 35, minFee: 35, maxFee: 35, taxTreatment: "VAT 16% incl.", appliesTo: "Per execution", channels: "System", revenue30d: 3_200_000, txns30d: 91_400, effectiveRate: 100, volume30d: 3_200_000, status: "Active", lastChanged: "16 Apr 2026", changedBy: "Sarah Kamau", competitor: 50, overrides: 14 },
  { id: "FEE-016", name: "Cheque deposit (agent assisted)", category: "Banking", icon: "bi-journal-check", method: "Percentage", rate: 1.0, fixed: 0, minFee: 200, maxFee: 0, taxTreatment: "VAT 16% + Excise 20%", appliesTo: "Business accounts", channels: "Agent, Branch", revenue30d: 640_000, txns30d: 1_820, effectiveRate: 0.92, volume30d: 69_500_000, status: "Active", lastChanged: "30 May 2026", changedBy: "James Odhiambo", competitor: 1.5, overrides: 3 },
  { id: "FEE-017", name: "Chargeback processing", category: "Cards", icon: "bi-shield-exclamation", method: "Flat", rate: 0, fixed: 750, minFee: 750, maxFee: 750, taxTreatment: "VAT 16% incl.", appliesTo: "Merchant disputes", channels: "Visa, Mastercard", revenue30d: 900_000, txns30d: 1_200, effectiveRate: 100, volume30d: 900_000, status: "Active", lastChanged: "21 Jun 2026", changedBy: "Mary Wanjiku", competitor: 1_200, overrides: 9 },
  { id: "FEE-018", name: "Partner API calls (per 1,000)", category: "Platform", icon: "bi-plug", method: "Flat", rate: 0, fixed: 5, minFee: 5, maxFee: 5, taxTreatment: "VAT 16% incl.", appliesTo: "42 partner integrations", channels: "PayMo API", revenue30d: 1_400_000, txns30d: 280_000_000, effectiveRate: 100, volume30d: 1_400_000, status: "Active", lastChanged: "08 Jul 2026", changedBy: "Joseph Mwangi", competitor: 8, overrides: 4 },
  { id: "FEE-019", name: "Dormancy fee (12m inactive)", category: "Platform", icon: "bi-moon-stars", method: "Flat", rate: 0, fixed: 0, minFee: 0, maxFee: 0, taxTreatment: "VAT exempt", appliesTo: "Dormant accounts — waived", channels: "System", revenue30d: 0, txns30d: 8_450, effectiveRate: 0, volume30d: 0, status: "Inactive", lastChanged: "04 Feb 2026", changedBy: "Joseph Mwangi", competitor: 300, overrides: 0 },
  { id: "FEE-020", name: "Utility bundle promo (airtime + bills)", category: "Bills & Utilities", icon: "bi-gift", method: "Hybrid", rate: 0.75, fixed: 5, minFee: 5, maxFee: 60, taxTreatment: "VAT 16% incl.", appliesTo: "Bundle subscribers · pilot ring 5%", channels: "Airtime, KPLC, NWC, DStv", revenue30d: 180_000, txns30d: 18_900, effectiveRate: 0.62, volume30d: 29_000_000, status: "Draft", lastChanged: "Draft · today", changedBy: "Sarah Kamau", competitor: 1.2, overrides: 0 },
];

/* ---------------- Volume tier bands (Section 10.3) ---------------- */
export type TierCategory = "Internal transfer" | "M-Pesa cash-out" | "Card payment" | "Bill payment";
export interface TierBand {
  band: string;
  volume: string;
  rates: Record<TierCategory, string>;
  users: number;
}
export const TIER_BANDS: TierBand[] = [
  { band: "Band 1", volume: "< KES 100K / month", users: 118_240, rates: { "Internal transfer": "1.50% (min 10)", "M-Pesa cash-out": "2.00% (min 20)", "Card payment": "2.50% (min 15)", "Bill payment": "1.00% (min 10)" } },
  { band: "Band 2", volume: "KES 100K – 500K / month", users: 18_900, rates: { "Internal transfer": "1.25% (min 10)", "M-Pesa cash-out": "1.75% (min 20)", "Card payment": "2.25% (min 15)", "Bill payment": "0.85% (min 10)" } },
  { band: "Band 3", volume: "KES 500K – 2M / month", users: 7_640, rates: { "Internal transfer": "1.00% (min 10)", "M-Pesa cash-out": "1.50% (min 20)", "Card payment": "2.00% (min 15)", "Bill payment": "0.75% (min 10)" } },
  { band: "Band 4", volume: "KES 2M – 10M / month", users: 1_320, rates: { "Internal transfer": "0.75% (min 10)", "M-Pesa cash-out": "1.00% (min 15)", "Card payment": "1.50% (min 10)", "Bill payment": "0.50% (min 5)" } },
  { band: "Band 5", volume: "> KES 10M / month", users: 89, rates: { "Internal transfer": "Custom (RM-set)", "M-Pesa cash-out": "Custom (RM-set)", "Card payment": "Custom (RM-set)", "Bill payment": "Custom (RM-set)" } },
];

/* ---------------- Waivers & overrides (Section 10.5) ---------------- */
export type OverrideStatus = "Active" | "Expiring" | "Expired" | "Revoked";
export interface FeeOverride {
  id: string;
  userId: string;
  userName: string;
  segment: string; // VIP tier or reason group
  feeId: string;
  feeName: string;
  standard: string;
  override: string;
  discountPct: number; // 100 = fully waived
  reason: string;
  grantedBy: string;
  approvedBy: string;
  grantedAt: string;
  expires: string;
  status: OverrideStatus;
  monthlyValue: number; // KES waived per month
}
export const FEE_OVERRIDES: FeeOverride[] = [
  { id: "OVR-3101", userId: "PAY-VIP-001", userName: "Grace Ochieng", segment: "VIP · Platinum", feeId: "ALL", feeName: "All fees — full waiver", standard: "Standard rates", override: "0% (waived)", discountPct: 100, reason: "Platinum VIP benefit", grantedBy: "Joseph Mwangi", approvedBy: "— (Tier 0)", grantedAt: "22 Aug 2026", expires: "Never", status: "Active", monthlyValue: 45_000 },
  { id: "OVR-3102", userId: "PAY-VIP-004", userName: "Apex Capital Ltd", segment: "VIP · Business", feeId: "FEE-001", feeName: "Internal transfer", standard: "1.5% (min 10)", override: "0.6% (min 10)", discountPct: 60, reason: "Business Premium pricing", grantedBy: "Joseph Mwangi", approvedBy: "— (Tier 0)", grantedAt: "15 Aug 2026", expires: "31 Dec 2026", status: "Active", monthlyValue: 128_400 },
  { id: "OVR-3103", userId: "PAY-67890", userName: "Dennis Mwangi", segment: "Goodwill", feeId: "FEE-001", feeName: "Internal transfer", standard: "1.5% (min 10)", override: "0% (waived)", discountPct: 100, reason: "Goodwill — system error SUP-1188", grantedBy: "Sarah Kamau", approvedBy: "Joseph Mwangi", grantedAt: "21 Aug 2026", expires: "21 Sep 2026", status: "Active", monthlyValue: 225 },
  { id: "OVR-3104", userId: "PAY-11223", userName: "Collins Ouma", segment: "Retention", feeId: "FEE-005", feeName: "ATM withdrawal", standard: "KES 35 flat", override: "KES 0", discountPct: 100, reason: "Competitive retention", grantedBy: "James Odhiambo", approvedBy: "Sarah Kamau", grantedAt: "20 Aug 2026", expires: "20 Nov 2026", status: "Active", monthlyValue: 35 },
  { id: "OVR-3105", userId: "PAY-VIP-011", userName: "Zawadi Enterprises", segment: "VIP · Business", feeId: "FEE-014", feeName: "PesaLink send", standard: "0.8% (min 25)", override: "0.4% (min 25)", discountPct: 50, reason: "High-volume payroll corridor", grantedBy: "Sarah Kamau", approvedBy: "Joseph Mwangi", grantedAt: "18 Aug 2026", expires: "31 Dec 2026", status: "Active", monthlyValue: 64_800 },
  { id: "OVR-3106", userId: "PAY-VIP-002", userName: "Samuel Ndegwa", segment: "VIP · Silver", feeId: "FEE-003", feeName: "M-Pesa cash-out", standard: "2.0% (min 20)", override: "1.5% (min 20)", discountPct: 25, reason: "Silver VIP benefit", grantedBy: "Joseph Mwangi", approvedBy: "— (Tier 0)", grantedAt: "12 Aug 2026", expires: "12 Feb 2027", status: "Active", monthlyValue: 8_200 },
  { id: "OVR-3107", userId: "PAY-VIP-007", userName: "Amina Hassan", segment: "VIP · Gold", feeId: "FEE-008", feeName: "International transfer", standard: "3.5% + KES 500", override: "2.5% + KES 250", discountPct: 40, reason: "Gold VIP remittance pricing", grantedBy: "Joseph Mwangi", approvedBy: "— (Tier 0)", grantedAt: "10 Aug 2026", expires: "10 Feb 2027", status: "Active", monthlyValue: 21_600 },
  { id: "OVR-3108", userId: "PAY-33456", userName: "Naomi Chemtai", segment: "Goodwill", feeId: "FEE-006", feeName: "FX conversion", standard: "3.0%", override: "0% (waived)", discountPct: 100, reason: "Rate error on USD payout", grantedBy: "David Kiplagat", approvedBy: "Sarah Kamau", grantedAt: "08 Aug 2026", expires: "08 Sep 2026", status: "Expiring", monthlyValue: 4_100 },
  { id: "OVR-3109", userId: "PAY-VIP-009", userName: "Tulia Events KE", segment: "VIP · Business", feeId: "FEE-004", feeName: "Card payment", standard: "2.5% (min 15)", override: "1.9% (min 15)", discountPct: 24, reason: "Events season volume deal", grantedBy: "Sarah Kamau", approvedBy: "Joseph Mwangi", grantedAt: "05 Aug 2026", expires: "05 Oct 2026", status: "Active", monthlyValue: 38_900 },
  { id: "OVR-3110", userId: "PAY-88214", userName: "Kevin Barasa", segment: "Hardship", feeId: "FEE-015", feeName: "Standing order", standard: "KES 35 flat", override: "KES 0", discountPct: 100, reason: "Financial hardship programme", grantedBy: "Mary Wanjiku", approvedBy: "Sarah Kamau", grantedAt: "01 Aug 2026", expires: "01 Feb 2027", status: "Active", monthlyValue: 35 },
  { id: "OVR-3111", userId: "PAY-55667", userName: "Esther Njeri", segment: "Referral", feeId: "FEE-003", feeName: "M-Pesa cash-out", standard: "2.0% (min 20)", override: "1.0% (min 20)", discountPct: 50, reason: "Referral champion — 120 invites", grantedBy: "James Odhiambo", approvedBy: "Sarah Kamau", grantedAt: "28 Jul 2026", expires: "28 Oct 2026", status: "Active", monthlyValue: 3_400 },
  { id: "OVR-3112", userId: "PAY-VIP-013", userName: "Baraka Logistics", segment: "VIP · Business", feeId: "FEE-016", feeName: "Cheque deposit", standard: "1.0% (min 200)", override: "0.5% (min 100)", discountPct: 50, reason: "Fleet payments contract", grantedBy: "Sarah Kamau", approvedBy: "Joseph Mwangi", grantedAt: "24 Jul 2026", expires: "24 Jan 2027", status: "Active", monthlyValue: 12_700 },
  { id: "OVR-3113", userId: "PAY-44556", userName: "Sharon Adhiambo", segment: "Goodwill", feeId: "FEE-004", feeName: "Card payment", standard: "2.5% (min 15)", override: "0% (one-off)", discountPct: 100, reason: "Duplicate charge dispute upheld", grantedBy: "Mary Wanjiku", approvedBy: "Joseph Mwangi", grantedAt: "19 Jul 2026", expires: "One-off", status: "Expired", monthlyValue: 48 },
  { id: "OVR-3114", userId: "PAY-77889", userName: "Martin Muli", segment: "Retention", feeId: "FEE-011", feeName: "Card issuance — physical", standard: "KES 500 flat", override: "KES 0", discountPct: 100, reason: "Card reissue — bank fault", grantedBy: "James Odhiambo", approvedBy: "Sarah Kamau", grantedAt: "12 Jul 2026", expires: "One-off", status: "Expired", monthlyValue: 500 },
  { id: "OVR-3115", userId: "PAY-90112", userName: "Irene Jepkorir", segment: "Fraud victim", feeId: "ALL", feeName: "All fees — 90 days", standard: "Standard rates", override: "0% (waived)", discountPct: 100, reason: "ATO victim remediation", grantedBy: "Mary Wanjiku", approvedBy: "Joseph Mwangi", grantedAt: "02 Jul 2026", expires: "02 Oct 2026", status: "Active", monthlyValue: 2_850 },
  { id: "OVR-3116", userId: "PAY-22334", userName: "Vincent Kariuki", segment: "Beta tester", feeId: "FEE-020", feeName: "Utility bundle promo", standard: "0.75% + KES 5", override: "0% (pilot free)", discountPct: 100, reason: "Bundle pilot ring — free tier", grantedBy: "Sarah Kamau", approvedBy: "Joseph Mwangi", grantedAt: "26 Jun 2026", expires: "26 Sep 2026", status: "Active", monthlyValue: 640 },
  { id: "OVR-3117", userId: "PAY-61123", userName: "Faith Chebet", segment: "Staff", feeId: "ALL", feeName: "All fees — staff account", standard: "Standard rates", override: "50% off all", discountPct: 50, reason: "Staff benefit scheme", grantedBy: "HR Portal", approvedBy: "Sarah Kamau", grantedAt: "01 Jan 2026", expires: "31 Dec 2026", status: "Active", monthlyValue: 1_940 },
  { id: "OVR-3118", userId: "PAY-72301", userName: "Peter Njoroge", segment: "Revoked", feeId: "FEE-003", feeName: "M-Pesa cash-out", standard: "2.0% (min 20)", override: "1.0% (min 20)", discountPct: 50, reason: "Volume deal — revoked on misuse", grantedBy: "Sarah Kamau", approvedBy: "Joseph Mwangi", grantedAt: "15 May 2026", expires: "Revoked 02 Aug", status: "Revoked", monthlyValue: 0 },
];

/* ---------------- Scheduled changes (Section 10.6) ---------------- */
export type ChangeStatus = "Pending approval" | "Approved" | "Scheduled" | "Rejected" | "Draft" | "Withdrawn";
export interface ScheduledChange {
  id: string;
  feeId: string;
  feeName: string;
  current: string;
  proposed: string;
  effective: string;
  submittedBy: string;
  submittedAt: string;
  status: ChangeStatus;
  impact: string;
  approvals: { role: string; by?: string; at?: string };
}
export const SCHEDULED_CHANGES: ScheduledChange[] = [
  { id: "CHG-1185", feeId: "FEE-008", feeName: "International transfer", current: "3.5% + KES 500", proposed: "3.0% + KES 300", effective: "01 Sep 2026", submittedBy: "David Kiplagat", submittedAt: "20 Aug 09:12", status: "Pending approval", impact: "−KES 210K/mo · +18% volume expected", approvals: { role: "Super Admin (Tier 0)" } },
  { id: "CHG-1186", feeId: "FEE-007", feeName: "Bill payment", current: "1.0% (min 10)", proposed: "1.5% (min 10)", effective: "01 Sep 2026", submittedBy: "Sarah Kamau", submittedAt: "19 Aug 16:40", status: "Pending approval", impact: "+KES 6.4M/mo · 127,456 users affected", approvals: { role: "Super Admin (Tier 0)" } },
  { id: "CHG-1187", feeId: "FEE-003", feeName: "M-Pesa cash-out", current: "2.0% (min 20)", proposed: "Band 2 → 1.60% (min 20)", effective: "15 Sep 2026", submittedBy: "Joseph Mwangi", submittedAt: "18 Aug 11:05", status: "Pending approval", impact: "−KES 1.9M/mo · 18,900 band-2 users", approvals: { role: "Super Admin (Tier 0)" } },
  { id: "CHG-1188", feeId: "FEE-001", feeName: "Internal transfer", current: "Band 4: 0.75%", proposed: "Band 4: 0.65% (min 10)", effective: "01 Oct 2026", submittedBy: "Sarah Kamau", submittedAt: "17 Aug 14:22", status: "Approved", impact: "−KES 480K/mo · 1,320 band-4 users", approvals: { role: "Super Admin (Tier 0)", by: "Joseph Mwangi", at: "18 Aug 10:00" } },
  { id: "CHG-1189", feeId: "FEE-004", feeName: "Card payment", current: "2.5% (min 15)", proposed: "2.25% (min 15)", effective: "15 Sep 2026", submittedBy: "Sarah Kamau", submittedAt: "16 Aug 08:31", status: "Draft", impact: "−KES 2.8M/mo · not yet submitted", approvals: { role: "Super Admin (Tier 0)" } },
  { id: "CHG-1190", feeId: "FEE-019", feeName: "Dormancy fee", current: "Waived (KES 0)", proposed: "KES 100 / month after 18m", effective: "01 Nov 2026", submittedBy: "James Odhiambo", submittedAt: "12 Aug 17:55", status: "Rejected", impact: "Rejected — ODPC retention risk", approvals: { role: "Super Admin (Tier 0)", by: "Joseph Mwangi", at: "13 Aug 09:20" } },
  { id: "CHG-1191", feeId: "FEE-005", feeName: "ATM withdrawal", current: "KES 35 flat", proposed: "KES 30 flat", effective: "01 Sep 2026", submittedBy: "Joseph Mwangi", submittedAt: "11 Aug 13:47", status: "Scheduled", impact: "−KES 1.2M/mo · 247,890 withdrawals", approvals: { role: "Super Admin (Tier 0)", by: "Joseph Mwangi", at: "11 Aug 15:02" } },
];

/* ---------------- Simulator scenarios (Section 10.4) ---------------- */
export interface SimScenario {
  id: string;
  name: string;
  detail: string;
  currentRevenue: number;
  projectedRevenue: number;
  users: number;
  avgSaving: number;
  sentiment: "positive" | "negative" | "neutral";
}
export const SIM_SCENARIOS: SimScenario[] = [
  { id: "SIM-01", name: "Internal 1.5% → 1.25%", detail: "Headline P2P rate cut, all bands", currentRevenue: 42_300_000, projectedRevenue: 35_200_000, users: 689_234, avgSaving: 10.3, sentiment: "negative" },
  { id: "SIM-02", name: "Cash-out 2.0% → 1.75%", detail: "Band 1 cash-out reduction", currentRevenue: 38_700_000, projectedRevenue: 33_900_000, users: 198_432, avgSaving: 24.2, sentiment: "negative" },
  { id: "SIM-03", name: "ATM KES 35 → KES 30", detail: "Network-wide flat cut", currentRevenue: 8_700_000, projectedRevenue: 7_500_000, users: 247_890, avgSaving: 4.8, sentiment: "negative" },
  { id: "SIM-04", name: "Bill payment 1.0% → 1.5%", detail: "Utility corridor increase", currentRevenue: 12_800_000, projectedRevenue: 19_200_000, users: 127_456, avgSaving: -50.2, sentiment: "positive" },
  { id: "SIM-05", name: "Combined autumn pricing", detail: "SIM-01 + SIM-03 + SIM-04 bundle", currentRevenue: 63_800_000, projectedRevenue: 61_900_000, users: 891_000, avgSaving: -8.4, sentiment: "neutral" },
];

/* ---------------- Partner fee sharing (Section 10.8) ---------------- */
export interface PartnerShare {
  id: string;
  partner: string;
  feeType: string;
  paymoShare: number;
  partnerShare: number;
  settlement: "Daily" | "Weekly" | "Monthly";
  status: "Active" | "Renegotiating" | "Suspended";
  value30d: number;
  nextReview: string;
}
export const PARTNER_SHARES: PartnerShare[] = [
  { id: "PS-01", partner: "Safaricom (M-Pesa)", feeType: "Cash-out revenue", paymoShare: 60, partnerShare: 40, settlement: "Daily", status: "Active", value30d: 15_480_000, nextReview: "01 Oct 2026" },
  { id: "PS-02", partner: "Visa Kenya", feeType: "Card interchange", paymoShare: 70, partnerShare: 30, settlement: "Weekly", status: "Active", value30d: 8_520_000, nextReview: "15 Oct 2026" },
  { id: "PS-03", partner: "Mastercard EA", feeType: "Card interchange", paymoShare: 68, partnerShare: 32, settlement: "Weekly", status: "Renegotiating", value30d: 5_760_000, nextReview: "30 Aug 2026" },
  { id: "PS-04", partner: "KCB Bank", feeType: "PesaLink transfer", paymoShare: 80, partnerShare: 20, settlement: "Daily", status: "Active", value30d: 1_920_000, nextReview: "01 Nov 2026" },
  { id: "PS-05", partner: "KPLC", feeType: "Bill commission", paymoShare: 30, partnerShare: 70, settlement: "Weekly", status: "Active", value30d: 3_840_000, nextReview: "01 Oct 2026" },
  { id: "PS-06", partner: "Equity Bank", feeType: "Bank transfer", paymoShare: 82, partnerShare: 18, settlement: "Daily", status: "Active", value30d: 1_240_000, nextReview: "01 Dec 2026" },
  { id: "PS-07", partner: "Airtel Money", feeType: "Cash-in/cash-out", paymoShare: 65, partnerShare: 35, settlement: "Monthly", status: "Suspended", value30d: 0, nextReview: "Renegotiation paused" },
  { id: "PS-08", partner: "QuickLend", feeType: "Loan disbursement fee", paymoShare: 55, partnerShare: 45, settlement: "Monthly", status: "Active", value30d: 660_000, nextReview: "15 Sep 2026" },
];

/* ---------------- Exemption / waiver request queue ---------------- */
export interface ExemptionRequest {
  id: string;
  userId: string;
  userName: string;
  segment: string;
  feeName: string;
  ask: string;
  justification: string;
  rm: string;
  submittedAt: string;
  sla: string;
  monthlyValue: number;
  risk: "Low" | "Medium" | "High";
}
export const EXEMPTION_REQUESTS: ExemptionRequest[] = [
  { id: "EXR-208", userId: "PAY-VIP-016", userName: "Mavuno Farms Ltd", segment: "VIP · Business", feeName: "Internal transfer", ask: "0.9% (from 1.5%)", justification: "KES 41M/mo payroll corridor moving to PayMo if approved", rm: "Sarah Kamau", submittedAt: "Today 09:14", sla: "4h left", monthlyValue: 24_600, risk: "Low" },
  { id: "EXR-207", userId: "PAY-VIP-021", userName: "Hawa Ahmed", segment: "VIP · Gold", feeName: "FX conversion", ask: "Full waiver, 3 months", justification: "Diaspora remittance champion — 200+ referrals", rm: "David Kiplagat", submittedAt: "Today 08:02", sla: "6h left", monthlyValue: 5_800, risk: "Low" },
  { id: "EXR-206", userId: "PAY-45230", userName: "Anthony Wafula", segment: "Hardship", feeName: "Late loan penalty", ask: "Waive one cycle", justification: "Hospitalised — documented case SUP-2101", rm: "Mary Wanjiku", submittedAt: "Yesterday 16:45", sla: "1h left", monthlyValue: 2_400, risk: "Low" },
  { id: "EXR-205", userId: "PAY-VIP-018", userName: "Simba Utilities", segment: "VIP · Business", feeName: "PesaLink send", ask: "0.3% cap KES 600", justification: "Bulk supplier payouts — 4,200 txns/mo", rm: "Sarah Kamau", submittedAt: "Yesterday 14:10", sla: "Overdue 2h", monthlyValue: 41_200, risk: "Medium" },
  { id: "EXR-204", userId: "PAY-77419", userName: "Joyce Moraa", segment: "Goodwill", feeName: "Card payment", ask: "Refund KES 480 fees", justification: "POS outage 22 Aug — receipts attached", rm: "James Odhiambo", submittedAt: "Yesterday 11:38", sla: "9h left", monthlyValue: 480, risk: "Low" },
  { id: "EXR-203", userId: "PAY-31882", userName: "Otieno Logistics", segment: "New business", feeName: "Card payment", ask: "1.9% intro rate, 6 months", justification: "Migrating fleet from competitor acquirer", rm: "Sarah Kamau", submittedAt: "22 Aug 15:22", sla: "Overdue 6h", monthlyValue: 28_900, risk: "Medium" },
  { id: "EXR-202", userId: "PAY-60114", userName: "Alice Wambui", segment: "Retention", feeName: "Account maintenance", ask: "Confirm stays free", justification: "Competitor letter offering zero fees", rm: "James Odhiambo", submittedAt: "22 Aug 10:05", sla: "Answered", monthlyValue: 0, risk: "Low" },
  { id: "EXR-201", userId: "PAY-VIP-003", userName: "Njeri Holdings", segment: "VIP · Platinum", feeName: "All fees", ask: "Extend full waiver 2027", justification: "Platinum renewal — KES 96M volume", rm: "Joseph Mwangi", submittedAt: "21 Aug 09:00", sla: "2 days left", monthlyValue: 96_000, risk: "Low" },
];

/* ---------------- Forecast (Section 10.7) ---------------- */
export interface FeeForecast {
  feeName: string;
  current: number;
  nextMonth: number;
  threeMonth: number;
  driver: string;
}
export const FEE_FORECASTS: FeeForecast[] = [
  { feeName: "Transfer fees", current: 52_600_000, nextMonth: 46_500_000, threeMonth: 58_200_000, driver: "User growth +8%/mo" },
  { feeName: "Cash-out fees", current: 38_700_000, nextMonth: 41_200_000, threeMonth: 48_900_000, driver: "Volume +6%/mo" },
  { feeName: "Card fees", current: 31_600_000, nextMonth: 32_100_000, threeMonth: 42_300_000, driver: "Card adoption push" },
  { feeName: "Bill payment", current: 12_800_000, nextMonth: 19_200_000, threeMonth: 19_800_000, driver: "CHG-1186 + new billers" },
  { feeName: "PesaLink & banking", current: 13_440_000, nextMonth: 14_900_000, threeMonth: 18_700_000, driver: "Payroll corridors" },
  { feeName: "FX & international", current: 6_600_000, nextMonth: 6_100_000, threeMonth: 8_400_000, driver: "CHG-1185 rate cut" },
];

/* ---------------- Audit trail ---------------- */
export interface FeeAudit {
  id: string;
  time: string;
  admin: string;
  action: string;
  target: string;
  detail: string;
  ip: string;
}
export const FEE_AUDIT: FeeAudit[] = [
  { id: "AUD-91204", time: "2 min ago", admin: "Joseph Mwangi", action: "Submitted fee change", target: "CHG-1187 · M-Pesa cash-out", detail: "Band 2 → 1.60% effective 15 Sep — awaiting Tier 0 approval.", ip: "197.232.14.40" },
  { id: "AUD-91203", time: "18 min ago", admin: "Sarah Kamau", action: "Granted override", target: "OVR-3102 · Apex Capital Ltd", detail: "Internal transfer 0.6% — KES 128.4K/mo value.", ip: "197.232.14.51" },
  { id: "AUD-91202", time: "1h ago", admin: "Joseph Mwangi", action: "Approved scheduled change", target: "CHG-1188 · Internal transfer", detail: "Band 4 0.75% → 0.65% approved with 2FA.", ip: "197.232.14.40" },
  { id: "AUD-91201", time: "2h ago", admin: "Mary Wanjiku", action: "Extended waiver", target: "OVR-3115 · Irene Jepkorir", detail: "ATO remediation waiver extended to 02 Oct.", ip: "197.232.14.62" },
  { id: "AUD-91200", time: "3h ago", admin: "David Kiplagat", action: "Exported fee schedule", target: "fee-schedule-aug.csv", detail: "20 schedules · PII redacted · watermarked.", ip: "197.232.14.55" },
  { id: "AUD-91199", time: "5h ago", admin: "Joseph Mwangi", action: "Rejected change", target: "CHG-1190 · Dormancy fee", detail: "ODPC retention risk — Dormancy stays waived.", ip: "197.232.14.40" },
  { id: "AUD-91198", time: "7h ago", admin: "Sarah Kamau", action: "Created draft", target: "FEE-020 · Utility bundle promo", detail: "Hybrid 0.75% + KES 5 pilot ring 5%.", ip: "197.232.14.51" },
  { id: "AUD-91197", time: "9h ago", admin: "James Odhiambo", action: "Revoked override", target: "OVR-3118 · Peter Njoroge", detail: "Volume deal misused for resale arbitrage.", ip: "197.232.14.58" },
  { id: "AUD-91196", time: "Yesterday", admin: "Joseph Mwangi", action: "Scheduled ATM cut", target: "CHG-1191 · ATM withdrawal", detail: "KES 35 → KES 30 effective 01 Sep.", ip: "197.232.14.40" },
  { id: "AUD-91195", time: "Yesterday", admin: "Sarah Kamau", action: "Tier matrix edit", target: "Band 4 · Card payment", detail: "1.5% floor moved min 10 (was 15).", ip: "197.232.14.51" },
  { id: "AUD-91194", time: "22 Aug", admin: "David Kiplagat", action: "Partner split updated", target: "PS-03 · Mastercard EA", detail: "68/32 interim while renegotiation runs.", ip: "197.232.14.55" },
  { id: "AUD-91193", time: "22 Aug", admin: "Mary Wanjiku", action: "Approved exemption", target: "EXR-199 · Baraka Logistics", detail: "Cheque deposit 0.5% — 6-month term.", ip: "197.232.14.62" },
];

/* ---------------- Revenue mix (donut) ---------------- */
export const FEE_REVENUE_MIX = [
  { label: "Internal transfer", value: 42_300_000, color: "#12b76a" },
  { label: "M-Pesa cash-out", value: 38_700_000, color: "#0b8f52" },
  { label: "Card payments", value: 31_600_000, color: "#2e90fa" },
  { label: "Bill payment", value: 12_800_000, color: "#0ba5ec" },
  { label: "PesaLink & banking", value: 13_440_000, color: "#7a5af8" },
  { label: "ATM withdrawal", value: 8_700_000, color: "#f79009" },
  { label: "FX & international", value: 6_600_000, color: "#ee46bc" },
  { label: "Platform & other", value: 7_840_000, color: "#98a2b3" },
];

/* ---------------- KPI strip ---------------- */
export const FEE_KPI = (opts: {
  revenue: number; active: number; pending: number; overrides: number; waived: number; requests: number;
}) => [
  { label: "Fee revenue (30d)", value: kes(opts.revenue), note: "↑ 18.4% vs last month", icon: "bi-cash-stack", tone: "green" },
  { label: "Active fee lines", value: String(opts.active), note: "of 20 configured schedules", icon: "bi-list-check", tone: "green" },
  { label: "Pending approvals", value: String(opts.pending), note: "scheduled changes · 2FA", icon: "bi-hourglass-split", tone: "amber" },
  { label: "Active overrides", value: String(opts.overrides), note: "waivers & custom pricing", icon: "bi-person-check", tone: "blue" },
  { label: "Waived value / mo", value: kes(opts.waived, { compact: true }), note: "across all overrides", icon: "bi-gift", tone: "violet" },
  { label: "Exemption queue", value: String(opts.requests), note: "RM requests · 2 overdue", icon: "bi-inbox", tone: "amber" },
  { label: "Effective take rate", value: "1.14%", note: "fees ÷ total volume", icon: "bi-percent", tone: "green" },
  { label: "Excise + VAT due", value: "KES 31.9M", note: "auto-remitted to KRA", icon: "bi-receipt-cutoff", tone: "blue" },
];
