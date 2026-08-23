import { kes } from "../../../lib/format";

/* ================================================================
   Page 14 — Tax & Compliance Reporting · data layer
   ================================================================ */

export type TaxConfig = {
  id: string;
  type: string;
  icon: string;
  rate: string;
  ratePct: number;
  appliesTo: string;
  collection: string;
  active: boolean;
  legalBasis: string;
};

export type TaxPool = {
  id: string;
  name: string;
  collected30d: number;
  remitted30d: number;
  held: number;
  nextRemittance: string;
  onTrack: boolean;
  note: string;
};

export type ReportStatus = "Filed" | "Pending" | "Future" | "Overdue";

export type TaxReport = {
  id: string;
  report: string;
  authority: string;
  frequency: string;
  lastFiled: string;
  due: string;
  status: ReportStatus;
  method: string;
  owner: string;
};

export type UserTax = {
  userId: string;
  name: string;
  grossFees: number;
  vat: number;
  excise: number;
  wht: number;
  netDeducted: number;
  certificate: "Available" | "Processing" | "Unavailable";
};

export type Remittance = {
  id: string;
  date: string;
  taxType: string;
  amount: number;
  reference: string;
  method: string;
  status: "Acknowledged" | "Processing" | "Scheduled";
};

export type Correspondence = {
  id: string;
  date: string;
  from: string;
  subject: string;
  type: string;
  dueResponse: string;
  status: "In progress" | "Acknowledged" | "Response sent" | "Overdue";
  assigned: string;
  detail: string;
};

export type CalEvent = {
  id: string;
  date: string;
  event: string;
  authority: string;
  category: string;
  prepStart: string;
  owner: string;
  prepStarted: boolean;
};

export type TaxAudit = {
  id: string;
  date: string;
  admin: string;
  change: string;
  from: string;
  to: string;
  reason: string;
};

/* ---------------- §14.1 Tax configuration ---------------- */
export const TAX_CONFIG: TaxConfig[] = [
  { id: "TAX-01", type: "VAT", icon: "bi-percent", rate: "16%", ratePct: 16, appliesTo: "Service fees", collection: "Auto-deducted at source", active: true, legalBasis: "VAT Act 2013" },
  { id: "TAX-02", type: "Excise Duty", icon: "bi-phone", rate: "20%", ratePct: 20, appliesTo: "Mobile money transfer fees", collection: "Auto-deducted at source", active: true, legalBasis: "Finance Act 2023" },
  { id: "TAX-03", type: "Withholding Tax (resident)", icon: "bi-house", rate: "5%", ratePct: 5, appliesTo: "Interest income > KES 15K/mo", collection: "Auto-deducted at source", active: true, legalBasis: "ITA Cap 470" },
  { id: "TAX-04", type: "Withholding Tax (non-resident)", icon: "bi-globe", rate: "15%", ratePct: 15, appliesTo: "Interest income", collection: "Auto-deducted at source", active: true, legalBasis: "ITA Cap 470" },
  { id: "TAX-05", type: "Digital Service Tax", icon: "bi-cloud", rate: "1.5%", ratePct: 1.5, appliesTo: "Gross transaction value", collection: "Auto-calculated, remitted monthly", active: true, legalBasis: "Finance Act 2020" },
  { id: "TAX-06", type: "Stamp Duty", icon: "bi-stamp", rate: "1%", ratePct: 1, appliesTo: "Card transactions", collection: "Auto-deducted at source", active: true, legalBasis: "Stamp Duty Act" },
  { id: "TAX-07", type: "PAYE (Staff)", icon: "bi-people", rate: "Per bracket", ratePct: 0, appliesTo: "Employee salaries", collection: "Payroll system", active: true, legalBasis: "ITA Cap 470" },
  { id: "TAX-08", type: "Corporate Tax", icon: "bi-building", rate: "30%", ratePct: 30, appliesTo: "Company profits", collection: "Quarterly provision", active: true, legalBasis: "ITA Part IV" },
];

/* ---------------- §14.2 Tax pool balances ---------------- */
export const TAX_POOLS: TaxPool[] = [
  { id: "POOL-VAT", name: "VAT Pool", collected30d: 29_800_000, remitted30d: 28_200_000, held: 1_600_000, nextRemittance: "Sep 20", onTrack: true, note: "1.6M accrual ahead of Sep 20 window" },
  { id: "POOL-EXC", name: "Excise Duty Pool", collected30d: 37_200_000, remitted30d: 35_400_000, held: 1_800_000, nextRemittance: "Sep 20", onTrack: true, note: "Highest-yield pool · transfer fees" },
  { id: "POOL-WHT", name: "WHT Pool", collected30d: 12_400_000, remitted30d: 11_800_000, held: 600_000, nextRemittance: "Sep 20", onTrack: true, note: "Resident + non-resident mix" },
  { id: "POOL-DST", name: "DST Pool", collected30d: 27_900_000, remitted30d: 26_500_000, held: 1_400_000, nextRemittance: "Sep 20", onTrack: true, note: "1.5% of gross transaction value" },
  { id: "POOL-SD", name: "Stamp Duty Pool", collected30d: 284_000, remitted30d: 270_000, held: 14_000, nextRemittance: "Sep 20", onTrack: true, note: "Card transactions only" },
  { id: "POOL-PAYE", name: "PAYE Pool", collected30d: 8_400_000, remitted30d: 8_400_000, held: 0, nextRemittance: "Sep 9", onTrack: true, note: "Fully remitted · payroll cycle" },
];

/* ---------------- §14.3 Reports schedule ---------------- */
export const REPORTS: TaxReport[] = [
  { id: "RPT-01", report: "VAT Return (ITAX)", authority: "KRA", frequency: "Monthly", lastFiled: "Aug 15", due: "Sep 20", status: "Filed", method: "iTAX portal", owner: "Tax team" },
  { id: "RPT-02", report: "Excise Duty Return", authority: "KRA", frequency: "Monthly", lastFiled: "Aug 15", due: "Sep 20", status: "Filed", method: "iTAX portal", owner: "Tax team" },
  { id: "RPT-03", report: "DST Return", authority: "KRA", frequency: "Monthly", lastFiled: "Aug 15", due: "Sep 20", status: "Filed", method: "iTAX portal", owner: "Tax team" },
  { id: "RPT-04", report: "PAYE Return", authority: "KRA", frequency: "Monthly", lastFiled: "Sep 9", due: "Sep 9", status: "Filed", method: "iTAX portal", owner: "HR" },
  { id: "RPT-05", report: "Income Tax (Corporate)", authority: "KRA", frequency: "Quarterly", lastFiled: "Jun 30", due: "Sep 30", status: "Pending", method: "iTAX portal", owner: "Finance Mgr" },
  { id: "RPT-06", report: "CBK Prudential Returns", authority: "CBK", frequency: "Monthly", lastFiled: "Jul 31", due: "Aug 31", status: "Pending", method: "CBK portal", owner: "Finance Mgr" },
  { id: "RPT-07", report: "AML/CFT Report", authority: "FRA", frequency: "Quarterly", lastFiled: "Jun 30", due: "Sep 30", status: "Pending", method: "GoAML system", owner: "Compliance" },
  { id: "RPT-08", report: "Transaction Tax Report", authority: "KRA", frequency: "Monthly", lastFiled: "Jul 31", due: "Aug 31", status: "Pending", method: "iTAX portal", owner: "Tax team" },
  { id: "RPT-09", report: "Beneficial Ownership", authority: "RAR", frequency: "Annual", lastFiled: "Dec 31", due: "Dec 31", status: "Future", method: "RAR portal", owner: "Legal" },
  { id: "RPT-10", report: "Data Protection Audit", authority: "ODPC", frequency: "Annual", lastFiled: "Mar 31", due: "Mar 31", status: "Future", method: "ODPC portal", owner: "Legal" },
];

/* ---------------- §14.4 User tax summary (expanded to 15) ---------------- */
export const USER_TAX: UserTax[] = [
  { userId: "PAY-12345", name: "Mercy Wanjiru", grossFees: 34_200, vat: 1_710, excise: 2_736, wht: 0, netDeducted: 4_446, certificate: "Available" },
  { userId: "PAY-67890", name: "Brian Otieno", grossFees: 12_800, vat: 640, excise: 1_024, wht: 0, netDeducted: 1_664, certificate: "Available" },
  { userId: "PAY-89012", name: "Amina Hassan", grossFees: 2_100, vat: 105, excise: 168, wht: 0, netDeducted: 273, certificate: "Available" },
  { userId: "PAY-VIP-001", name: "Wanjiru Kamau", grossFees: 412_000, vat: 20_600, excise: 32_960, wht: 0, netDeducted: 53_560, certificate: "Available" },
  { userId: "PAY-VIP-004", name: "Delta Logistics Ltd", grossFees: 1_284_000, vat: 64_200, excise: 102_720, wht: 12_500, netDeducted: 179_420, certificate: "Available" },
  { userId: "PAY-33445", name: "Peter Mbugua", grossFees: 8_900, vat: 445, excise: 712, wht: 0, netDeducted: 1_157, certificate: "Available" },
  { userId: "PAY-22334", name: "Esther Muthoni", grossFees: 15_600, vat: 780, excise: 1_248, wht: 0, netDeducted: 2_028, certificate: "Available" },
  { userId: "PAY-45123", name: "Collins Kariuki", grossFees: 61_400, vat: 3_070, excise: 4_912, wht: 0, netDeducted: 7_982, certificate: "Processing" },
  { userId: "PAY-55667", name: "Dennis Mutua", grossFees: 7_300, vat: 365, excise: 584, wht: 0, netDeducted: 949, certificate: "Available" },
  { userId: "PAY-66778", name: "Fatuma Ali", grossFees: 1_850, vat: 93, excise: 148, wht: 0, netDeducted: 241, certificate: "Unavailable" },
  { userId: "PAY-77889", name: "Samuel Njoroge", grossFees: 96_700, vat: 4_835, excise: 7_736, wht: 0, netDeducted: 12_571, certificate: "Available" },
  { userId: "PAY-88900", name: "Rift Valley Motors", grossFees: 528_000, vat: 26_400, excise: 42_240, wht: 8_200, netDeducted: 76_840, certificate: "Available" },
  { userId: "PAY-99011", name: "Lucy Njeri", grossFees: 5_400, vat: 270, excise: 432, wht: 0, netDeducted: 702, certificate: "Available" },
  { userId: "PAY-11223", name: "Victor Kiplagat", grossFees: 0, vat: 0, excise: 0, wht: 0, netDeducted: 0, certificate: "Unavailable" },
  { userId: "PAY-10123", name: "Kevin Ochieng", grossFees: 3_700, vat: 185, excise: 296, wht: 0, netDeducted: 481, certificate: "Processing" },
];

/* ---------------- §14.5 Remittance history (expanded to 12) ---------------- */
export const REMITTANCE: Remittance[] = [
  { id: "REM-0412", date: "Aug 15", taxType: "VAT", amount: 28_200_000, reference: "KRA-VAT-0826", method: "iTAX (EFT)", status: "Acknowledged" },
  { id: "REM-0411", date: "Aug 15", taxType: "Excise Duty", amount: 35_400_000, reference: "KRA-EXC-0826", method: "iTAX (EFT)", status: "Acknowledged" },
  { id: "REM-0410", date: "Aug 15", taxType: "DST", amount: 26_500_000, reference: "KRA-DST-0826", method: "iTAX (EFT)", status: "Acknowledged" },
  { id: "REM-0409", date: "Aug 15", taxType: "Stamp Duty", amount: 270_000, reference: "KRA-SD-0826", method: "iTAX (EFT)", status: "Acknowledged" },
  { id: "REM-0408", date: "Aug 14", taxType: "WHT", amount: 11_800_000, reference: "KRA-WHT-0826", method: "iTAX (EFT)", status: "Acknowledged" },
  { id: "REM-0407", date: "Jul 31", taxType: "Transaction Tax Report", amount: 0, reference: "KRA-TTR-0731", method: "iTAX (filing only)", status: "Acknowledged" },
  { id: "REM-0406", date: "Jul 31", taxType: "CBK Prudential Returns", amount: 0, reference: "CBK-PRU-0731", method: "CBK portal", status: "Acknowledged" },
  { id: "REM-0405", date: "Jul 15", taxType: "VAT", amount: 27_100_000, reference: "KRA-VAT-0726", method: "iTAX (EFT)", status: "Acknowledged" },
  { id: "REM-0404", date: "Jul 15", taxType: "Excise Duty", amount: 34_200_000, reference: "KRA-EXC-0726", method: "iTAX (EFT)", status: "Acknowledged" },
  { id: "REM-0403", date: "Jul 14", taxType: "DST", amount: 25_800_000, reference: "KRA-DST-0726", method: "iTAX (EFT)", status: "Acknowledged" },
  { id: "REM-0402", date: "Jun 30", taxType: "Income Tax (Corporate)", amount: 187_000_000, reference: "KRA-CIT-Q1", method: "iTAX (EFT)", status: "Acknowledged" },
  { id: "REM-0401", date: "Jun 15", taxType: "VAT", amount: 26_400_000, reference: "KRA-VAT-0626", method: "iTAX (EFT)", status: "Acknowledged" },
];

/* ---------------- §14.6 Regulatory correspondence (expanded to 8) ---------------- */
export const CORRESPONDENCE: Correspondence[] = [
  { id: "CORR-0231", date: "Aug 20", from: "CBK", subject: "Monthly prudential data request", type: "Information", dueResponse: "Aug 31", status: "In progress", assigned: "Finance Mgr", detail: "Liquidity coverage & reserve position schedules for July. Data pull 80% complete; validation pending." },
  { id: "CORR-0230", date: "Aug 15", from: "KRA", subject: "VAT reconciliation query", type: "Inquiry", dueResponse: "Sep 5", status: "In progress", assigned: "Tax team", detail: "KES 1.6M gap between declared output VAT and iTAX computation. Provisional schedule drafted; awaiting input tax certificates." },
  { id: "CORR-0229", date: "Aug 10", from: "FRA", subject: "AML training compliance reminder", type: "Advisory", dueResponse: "N/A", status: "Acknowledged", assigned: "Compliance", detail: "Annual AML/CFT staff training due Oct 31. Training provider booked." },
  { id: "CORR-0228", date: "Jul 28", from: "ODPC", subject: "Data breach notification procedures", type: "Advisory", dueResponse: "N/A", status: "Acknowledged", assigned: "Legal", detail: "Updated ODPC breach notification template adopted into the incident runbook." },
  { id: "CORR-0227", date: "Jul 21", from: "KRA", subject: "Excise duty base clarification", type: "Inquiry", dueResponse: "Aug 10", status: "Response sent", assigned: "Tax team", detail: "Confirmed cashout fees in excise base per Finance Act 2023 amendment." },
  { id: "CORR-0226", date: "Jul 12", from: "CBK", subject: "Quarterly board risk appetite review", type: "Information", dueResponse: "Aug 1", status: "Response sent", assigned: "Finance Mgr", detail: "Risk appetite dashboard submitted with board minutes." },
  { id: "CORR-0225", date: "Jun 30", from: "FRA", subject: "GoAML filing quality notice", type: "Advisory", dueResponse: "N/A", status: "Acknowledged", assigned: "Compliance", detail: "Two STRs returned for narrative quality; templates updated." },
  { id: "CORR-0224", date: "Jun 18", from: "KRA", subject: "DST return late-filing warning", type: "Warning", dueResponse: "Jun 25", status: "Response sent", assigned: "Tax team", detail: "Filed Jun 24 with 9-day margin after portal outage. Waiver of penalty requested." },
];

/* ---------------- §14.7 Compliance calendar ---------------- */
export const CALENDAR: CalEvent[] = [
  { id: "CAL-01", date: "Aug 31", event: "CBK Monthly Returns", authority: "CBK", category: "Banking", prepStart: "Aug 25", owner: "Finance Mgr", prepStarted: true },
  { id: "CAL-02", date: "Sep 5", event: "KRA VAT Query Response", authority: "KRA", category: "Tax", prepStart: "Aug 25", owner: "Tax team", prepStarted: true },
  { id: "CAL-03", date: "Sep 9", event: "PAYE Return", authority: "KRA", category: "Tax", prepStart: "Sep 1", owner: "HR", prepStarted: false },
  { id: "CAL-04", date: "Sep 20", event: "VAT + Excise + DST Returns", authority: "KRA", category: "Tax", prepStart: "Sep 15", owner: "Tax team", prepStarted: false },
  { id: "CAL-05", date: "Sep 30", event: "Corporate Tax (Q2)", authority: "KRA", category: "Tax", prepStart: "Sep 20", owner: "Finance Mgr", prepStarted: false },
  { id: "CAL-06", date: "Sep 30", event: "AML/CFT Report (Q3)", authority: "FRA", category: "AML", prepStart: "Sep 15", owner: "Compliance", prepStarted: false },
  { id: "CAL-07", date: "Oct 31", event: "AML Staff Training", authority: "FRA", category: "AML", prepStart: "Oct 1", owner: "Compliance", prepStarted: false },
  { id: "CAL-08", date: "Dec 31", event: "Beneficial Ownership", authority: "RAR", category: "Governance", prepStart: "Dec 1", owner: "Legal", prepStarted: false },
  { id: "CAL-09", date: "Jan 20", event: "Q4 VAT + Excise + DST", authority: "KRA", category: "Tax", prepStart: "Jan 12", owner: "Tax team", prepStarted: false },
  { id: "CAL-10", date: "Mar 31", event: "Data Protection Audit", authority: "ODPC", category: "Privacy", prepStart: "Mar 1", owner: "Legal", prepStarted: false },
];

/* ---------------- §14.8 Tax configuration audit trail (expanded to 10) ---------------- */
export const TAX_AUDIT: TaxAudit[] = [
  { id: "TAXAUD-0112", date: "Aug 1", admin: "Joseph Mwangi", change: "VAT rate", from: "16%", to: "16%", reason: "No change (annual review)" },
  { id: "TAXAUD-0111", date: "Jul 1", admin: "Sarah Kamau (Finance Mgr)", change: "Excise duty base", from: "Transfer fees only", to: "Transfer + cashout fees", reason: "Finance Act 2023 amendment" },
  { id: "TAXAUD-0110", date: "Jun 20", admin: "Joseph Mwangi", change: "WHT non-resident rate", from: "15%", to: "15%", reason: "No change (treaty review)" },
  { id: "TAXAUD-0109", date: "Jun 14", admin: "Sarah Kamau (Finance Mgr)", change: "PAYE pool remittance day", from: "Day 9", to: "Day 9", reason: "Confirmed with payroll vendor" },
  { id: "TAXAUD-0108", date: "May 30", admin: "Joseph Mwangi", change: "DST rate", from: "1.5%", to: "1.5%", reason: "No change (annual review)" },
  { id: "TAXAUD-0107", date: "May 12", admin: "Sarah Kamau (Finance Mgr)", change: "Stamp duty base", from: "All card txns", to: "Domestic card txns", reason: "Cross-border exemption ruling" },
  { id: "TAXAUD-0106", date: "Apr 28", admin: "Joseph Mwangi", change: "VAT threshold review", from: "—", to: "Turnover above KES 5M", reason: "Registration threshold check" },
  { id: "TAXAUD-0105", date: "Apr 10", admin: "Sarah Kamau (Finance Mgr)", change: "WHT resident trigger", from: "KES 10K/mo", to: "KES 15K/mo", reason: "Finance Act 2024 alignment" },
  { id: "TAXAUD-0104", date: "Mar 22", admin: "Joseph Mwangi", change: "Corporate tax provision", from: "30%", to: "30%", reason: "Quarterly provision confirmed" },
  { id: "TAXAUD-0103", date: "Jan 1", admin: "Joseph Mwangi", change: "DST rate", from: "1.5%", to: "1.5%", reason: "No change (annual review)" },
];

/* ---------------- KPI ---------------- */
export const TAX_POOLS_TOTAL = TAX_POOLS.reduce((s, p) => s + p.collected30d, 0);
export const TAX_HELD_TOTAL = TAX_POOLS.reduce((s, p) => s + p.held, 0);

export const TAX_KPI = (o: { pendingReports: number; openCorr: number; nextDue: string }) => [
  { label: "Collected (30d)", value: kes(TAX_POOLS_TOTAL, { compact: true }), note: "6 pools · auto-deducted at source", icon: "bi-bank", tone: "green" },
  { label: "Held in pools", value: kes(TAX_HELD_TOTAL, { compact: true }), note: "Awaiting next remittance window", icon: "bi-wallet2", tone: "blue" },
  { label: "Remitted (30d)", value: kes(TAX_POOLS.reduce((s, p) => s + p.remitted30d, 0), { compact: true }), note: "iTAX EFT · all acknowledged", icon: "bi-send-check", tone: "green" },
  { label: "Next filing", value: o.nextDue, note: "CBK Prudential Returns · Aug 31", icon: "bi-calendar-event", tone: "amber" },
  { label: "Reports pending", value: String(o.pendingReports), note: "4 iTAX + CBK + GoAML queues", icon: "bi-file-earmark-text", tone: o.pendingReports > 3 ? "amber" : "green" },
  { label: "Correspondence open", value: String(o.openCorr), note: "KRA VAT query due Sep 5", icon: "bi-envelope-paper", tone: "red" },
  { label: "Effective VAT rate", value: "16%", note: "VAT Act 2013 · annual review Aug 1", icon: "bi-percent", tone: "violet" },
  { label: "Compliance score", value: "98.2%", note: "CBK supervisory dashboard", icon: "bi-patch-check", tone: "green" },
];
