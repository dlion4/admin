export interface DashboardRecord {
  id: string;
  name: string;
  owner: string;
  viewers: string;
  refresh: string;
  metrics: string;
  locked: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
  status: "Active" | "Draft" | "Archived" | "Under Review";
  createdAt: string;
  updatedAt: string;
  widgetCount: number;
  dataSourceCount: number;
  lastViewed: string;
  viewCount: number;
  sharedWith: number;
}

export interface ScheduledReportRecord {
  id: string;
  name: string;
  frequency: string;
  format: string;
  recipients: string;
  nextRun: string;
  lastStatus: "Success" | "Pending" | "Failed" | "Running";
  locked: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
  createdAt: string;
  createdBy: string;
  description: string;
}

export interface ModelRecord {
  id: string;
  name: string;
  type: string;
  accuracy: string;
  status: "Production" | "Beta" | "Retired" | "Training";
  locked: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
  owner: string;
  lastTrained: string;
  version: string;
  features: number;
  trainingRows: string;
  latency: string;
}

export interface CohortRecord {
  id: string;
  type: string;
  description: string;
  dimensions: string;
  metrics: string;
  locked: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
  createdAt: string;
  lastRun: string;
  status: "Active" | "Archived" | "Under Review";
}

export interface FunnelRecord {
  id: string;
  name: string;
  steps: string;
  conversionRate: string;
  dropOff: string;
  locked: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
  createdAt: string;
  lastRun: string;
  status: "Active" | "Archived" | "Under Review";
  totalUsers: number;
  avgTimeToConvert: string;
}

export interface QueryTemplateRecord {
  id: string;
  name: string;
  schema: string;
  description: string;
  lastRun: string;
  runCount: number;
  locked: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
  createdBy: string;
  status: "Active" | "Archived" | "Draft";
  avgRuntime: string;
  tags: string[];
}

export interface DataSourceRecord {
  id: string;
  name: string;
  type: string;
  status: "Connected" | "Disconnected" | "Error" | "Maintenance";
  lastSync: string;
  syncFrequency: string;
  rowCount: string;
  locked: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
  owner: string;
  piiHandling: string;
}

export const initialDashboards: DashboardRecord[] = [
  { id: "db-001", name: "Executive Summary", owner: "CEO", viewers: "Board + C-suite", refresh: "Daily", metrics: "Revenue, users, growth, profit", locked: false, status: "Active", createdAt: "Jan 15, 2026", updatedAt: "Aug 25, 2026", widgetCount: 12, dataSourceCount: 4, lastViewed: "2 min ago", viewCount: 847, sharedWith: 8 },
  { id: "db-002", name: "Financial Overview", owner: "CFO", viewers: "Finance team", refresh: "Daily", metrics: "P&L, balance sheet, cash flow", locked: false, status: "Active", createdAt: "Feb 1, 2026", updatedAt: "Aug 24, 2026", widgetCount: 18, dataSourceCount: 6, lastViewed: "15 min ago", viewCount: 623, sharedWith: 5 },
  { id: "db-003", name: "User Growth", owner: "Growth Lead", viewers: "Product + Marketing", refresh: "Daily", metrics: "Registrations, retention, churn", locked: false, status: "Active", createdAt: "Jan 20, 2026", updatedAt: "Aug 25, 2026", widgetCount: 10, dataSourceCount: 3, lastViewed: "1 hr ago", viewCount: 412, sharedWith: 12 },
  { id: "db-004", name: "Transaction Analytics", owner: "Ops Manager", viewers: "Operations", refresh: "Real-time", metrics: "Volume, channels, success rates", locked: true, lockedBy: "Super Admin", lockedAt: "Aug 24, 2026", lockReason: "Under compliance review", status: "Active", createdAt: "Jan 15, 2026", updatedAt: "Aug 24, 2026", widgetCount: 22, dataSourceCount: 8, lastViewed: "30 min ago", viewCount: 1205, sharedWith: 15 },
  { id: "db-005", name: "Fraud & Risk", owner: "Compliance Lead", viewers: "Compliance + Fraud", refresh: "Real-time", metrics: "Alerts, losses, patterns", locked: false, status: "Active", createdAt: "Feb 10, 2026", updatedAt: "Aug 25, 2026", widgetCount: 14, dataSourceCount: 5, lastViewed: "5 min ago", viewCount: 934, sharedWith: 6 },
  { id: "db-006", name: "Support Performance", owner: "Support Lead", viewers: "Support team", refresh: "Hourly", metrics: "Tickets, CSAT, SLA", locked: false, status: "Active", createdAt: "Mar 1, 2026", updatedAt: "Aug 23, 2026", widgetCount: 8, dataSourceCount: 2, lastViewed: "3 hrs ago", viewCount: 289, sharedWith: 10 },
  { id: "db-007", name: "Partner Performance", owner: "Partnerships", viewers: "Partnerships + Finance", refresh: "Daily", metrics: "Revenue, SLA, settlements", locked: false, status: "Active", createdAt: "Mar 15, 2026", updatedAt: "Aug 22, 2026", widgetCount: 9, dataSourceCount: 4, lastViewed: "1 day ago", viewCount: 156, sharedWith: 4 },
  { id: "db-008", name: "System Health", owner: "CTO", viewers: "Engineering", refresh: "Real-time", metrics: "Uptime, latency, errors", locked: false, status: "Active", createdAt: "Jan 15, 2026", updatedAt: "Aug 25, 2026", widgetCount: 16, dataSourceCount: 7, lastViewed: "10 min ago", viewCount: 1567, sharedWith: 20 },
  { id: "db-009", name: "Lending Portfolio", owner: "Lending Lead", viewers: "Lending + Finance", refresh: "Daily", metrics: "Disbursements, repayments, NPL", locked: false, status: "Draft", createdAt: "Jul 1, 2026", updatedAt: "Aug 20, 2026", widgetCount: 11, dataSourceCount: 3, lastViewed: "3 days ago", viewCount: 67, sharedWith: 3 },
  { id: "db-010", name: "Marketing Campaigns", owner: "Marketing Lead", viewers: "Marketing", refresh: "Daily", metrics: "Reach, conversion, ROAS", locked: false, status: "Active", createdAt: "Apr 1, 2026", updatedAt: "Aug 21, 2026", widgetCount: 7, dataSourceCount: 2, lastViewed: "2 days ago", viewCount: 234, sharedWith: 8 },
];

export const initialScheduledReports: ScheduledReportRecord[] = [
  { id: "sr-001", name: "Daily Executive Summary", frequency: "Daily 7AM", format: "PDF + Email", recipients: "CEO, CFO, COO", nextRun: "Tomorrow 7AM", lastStatus: "Success", locked: false, createdAt: "Jan 15, 2026", createdBy: "Super Admin", description: "Comprehensive daily executive briefing covering KPIs, revenue, and critical alerts." },
  { id: "sr-002", name: "Weekly Growth Report", frequency: "Monday 8AM", format: "PDF", recipients: "Product, Marketing, Growth", nextRun: "Monday 8AM", lastStatus: "Success", locked: false, createdAt: "Feb 1, 2026", createdBy: "Growth Lead", description: "Weekly user acquisition, activation, retention and monetization metrics." },
  { id: "sr-003", name: "Weekly Fraud Report", frequency: "Monday 9AM", format: "PDF", recipients: "Compliance, MLRO, CEO", nextRun: "Monday 9AM", lastStatus: "Success", locked: true, lockedBy: "Super Admin", lockedAt: "Aug 20, 2026", lockReason: "Pending MLRO approval of new format", createdAt: "Feb 10, 2026", createdBy: "Compliance Lead", description: "Weekly fraud alert summary, loss analysis and pattern detection results." },
  { id: "sr-004", name: "Monthly Financial Pack", frequency: "1st of month", format: "Excel + PDF", recipients: "CFO, Board, Investors", nextRun: "Sep 1", lastStatus: "Pending", locked: false, createdAt: "Jan 15, 2026", createdBy: "CFO", description: "Full monthly financial statements, P&L, balance sheet, and cash flow analysis." },
  { id: "sr-005", name: "Monthly Compliance Pack", frequency: "5th of month", format: "PDF", recipients: "MLRO, Legal, Board", nextRun: "Sep 5", lastStatus: "Pending", locked: false, createdAt: "Mar 1, 2026", createdBy: "Compliance Lead", description: "Monthly AML/CFT compliance report including STR summaries and regulatory updates." },
  { id: "sr-006", name: "Monthly Partner Report", frequency: "5th of month", format: "PDF", recipients: "Each partner", nextRun: "Sep 5", lastStatus: "Pending", locked: false, createdAt: "Apr 1, 2026", createdBy: "Partnerships", description: "Monthly partner performance, SLA adherence and settlement reconciliation." },
  { id: "sr-007", name: "Quarterly Investor Report", frequency: "30 days post-quarter", format: "PDF + PPT", recipients: "All investors", nextRun: "Oct 30", lastStatus: "Pending", locked: false, createdAt: "Jan 15, 2026", createdBy: "CFO", description: "Quarterly investor update with financial highlights, growth metrics and strategic outlook." },
  { id: "sr-008", name: "Daily Reconciliation", frequency: "Daily 6AM", format: "Excel", recipients: "Finance team", nextRun: "Tomorrow 6AM", lastStatus: "Success", locked: false, createdAt: "Jan 15, 2026", createdBy: "Finance Ops", description: "Daily transaction reconciliation across all payment channels and settlement accounts." },
];

export const initialModels: ModelRecord[] = [
  { id: "ml-001", name: "Churn Prediction", type: "Classification", accuracy: "82%", status: "Production", locked: false, owner: "Data Science", lastTrained: "Aug 20, 2026", version: "v3.2", features: 47, trainingRows: "2.1M", latency: "12ms" },
  { id: "ml-002", name: "LTV Prediction", type: "Regression", accuracy: "78%", status: "Production", locked: false, owner: "Data Science", lastTrained: "Aug 18, 2026", version: "v2.8", features: 32, trainingRows: "1.8M", latency: "8ms" },
  { id: "ml-003", name: "Fraud Detection", type: "Anomaly detection", accuracy: "94% recall", status: "Production", locked: true, lockedBy: "Super Admin", lockedAt: "Aug 22, 2026", lockReason: "Model retraining in progress", owner: "MLRO Team", lastTrained: "Aug 22, 2026", version: "v5.1", features: 89, trainingRows: "12.4M", latency: "3ms" },
  { id: "ml-004", name: "Loan Default Prediction", type: "Classification", accuracy: "85%", status: "Production", locked: false, owner: "Lending Analytics", lastTrained: "Aug 15, 2026", version: "v4.0", features: 56, trainingRows: "3.2M", latency: "15ms" },
  { id: "ml-005", name: "Next-best-action", type: "Recommendation", accuracy: "72%", status: "Beta", locked: false, owner: "Growth Analytics", lastTrained: "Aug 10, 2026", version: "v1.4", features: 28, trainingRows: "890K", latency: "22ms" },
  { id: "ml-006", name: "Demand Forecasting", type: "Time series", accuracy: "88%", status: "Production", locked: false, owner: "Data Science", lastTrained: "Aug 24, 2026", version: "v2.1", features: 18, trainingRows: "5.6M", latency: "45ms" },
];

export const initialCohorts: CohortRecord[] = [
  { id: "co-001", type: "Retention cohort", description: "User retention by signup month", dimensions: "Signup month, week", metrics: "Retention %, active count", locked: false, createdAt: "Jan 20, 2026", lastRun: "Aug 25, 2026", status: "Active" },
  { id: "co-002", type: "Revenue cohort", description: "Revenue by user signup cohort", dimensions: "Signup month", metrics: "LTV, cumulative revenue", locked: false, createdAt: "Feb 1, 2026", lastRun: "Aug 24, 2026", status: "Active" },
  { id: "co-003", type: "Channel cohort", description: "Performance by acquisition channel", dimensions: "Channel, date", metrics: "Retention, revenue, CAC", locked: false, createdAt: "Feb 10, 2026", lastRun: "Aug 23, 2026", status: "Active" },
  { id: "co-004", type: "Product cohort", description: "Feature adoption by cohort", dimensions: "Feature, cohort", metrics: "Adoption %, usage frequency", locked: true, lockedBy: "Super Admin", lockedAt: "Aug 20, 2026", lockReason: "Methodology under review", createdAt: "Mar 1, 2026", lastRun: "Aug 18, 2026", status: "Under Review" },
  { id: "co-005", type: "Loan cohort", description: "Repayment by disbursement month", dimensions: "Month, risk tier", metrics: "Repayment, NPL rate", locked: false, createdAt: "Apr 1, 2026", lastRun: "Aug 22, 2026", status: "Active" },
];

export const initialFunnels: FunnelRecord[] = [
  { id: "fn-001", name: "User onboarding", steps: "Download → Register → KYC → First TXN", conversionRate: "67.8%", dropOff: "32.2%", locked: false, createdAt: "Jan 15, 2026", lastRun: "Aug 25, 2026", status: "Active", totalUsers: 234000, avgTimeToConvert: "4.2 days" },
  { id: "fn-002", name: "Loan application", steps: "Eligible → Apply → Approved → Disbursed", conversionRate: "45.2%", dropOff: "54.8%", locked: false, createdAt: "Feb 1, 2026", lastRun: "Aug 24, 2026", status: "Active", totalUsers: 89000, avgTimeToConvert: "2.1 days" },
  { id: "fn-003", name: "Card issuance", steps: "Eligible → Apply → Approved → Delivered → Activated", conversionRate: "62.3%", dropOff: "37.7%", locked: false, createdAt: "Mar 1, 2026", lastRun: "Aug 23, 2026", status: "Active", totalUsers: 45000, avgTimeToConvert: "7.5 days" },
  { id: "fn-004", name: "VIP upgrade", steps: "Eligible → Invited → Accepted → Active", conversionRate: "34.5%", dropOff: "65.5%", locked: true, lockedBy: "Super Admin", lockedAt: "Aug 19, 2026", lockReason: "VIP criteria being revised", createdAt: "Apr 1, 2026", lastRun: "Aug 17, 2026", status: "Under Review", totalUsers: 12000, avgTimeToConvert: "12 days" },
  { id: "fn-005", name: "Support resolution", steps: "Ticket → First response → Resolved", conversionRate: "92.1%", dropOff: "7.9%", locked: false, createdAt: "Mar 15, 2026", lastRun: "Aug 25, 2026", status: "Active", totalUsers: 67000, avgTimeToConvert: "4.8 hours" },
];

export const initialQueryTemplates: QueryTemplateRecord[] = [
  { id: "qt-001", name: "Daily Transaction Volume", schema: "Transactions", description: "Total transaction volume and count by channel for last 30 days", lastRun: "Aug 25, 2026", runCount: 342, locked: false, createdBy: "Analytics Team", status: "Active", avgRuntime: "2.4s", tags: ["transactions", "daily"] },
  { id: "qt-002", name: "User Registration Funnel", schema: "Users", description: "Registration step completion rates and drop-off analysis", lastRun: "Aug 24, 2026", runCount: 189, locked: false, createdBy: "Growth Lead", status: "Active", avgRuntime: "3.1s", tags: ["users", "funnel"] },
  { id: "qt-003", name: "Fraud Alert Analysis", schema: "Fraud", description: "Alert patterns, false positive rates and loss amounts by category", lastRun: "Aug 25, 2026", runCount: 567, locked: true, lockedBy: "Super Admin", lockedAt: "Aug 22, 2026", lockReason: "PII masking update in progress", createdBy: "MLRO Team", status: "Active", avgRuntime: "5.7s", tags: ["fraud", "compliance"] },
  { id: "qt-004", name: "Partner Revenue Split", schema: "Finance", description: "Revenue allocation by partner, settlement status and discrepancies", lastRun: "Aug 20, 2026", runCount: 78, locked: false, createdBy: "Finance Ops", status: "Active", avgRuntime: "4.2s", tags: ["finance", "partners"] },
  { id: "qt-005", name: "System Performance Metrics", schema: "System", description: "API latency, error rates and uptime metrics by service", lastRun: "Aug 25, 2026", runCount: 1203, locked: false, createdBy: "CTO", status: "Active", avgRuntime: "1.8s", tags: ["system", "performance"] },
];

export const initialDataSources: DataSourceRecord[] = [
  { id: "ds-001", name: "Transactions", type: "PostgreSQL", status: "Connected", lastSync: "2 min ago", syncFrequency: "Real-time", rowCount: "45.2M rows", locked: false, owner: "Data Engineering", piiHandling: "Masked for non-privileged" },
  { id: "ds-002", name: "Users", type: "PostgreSQL", status: "Connected", lastSync: "5 min ago", syncFrequency: "Real-time", rowCount: "2.1M rows", locked: false, owner: "Data Engineering", piiHandling: "Masked for non-privileged" },
  { id: "ds-003", name: "Finance", type: "PostgreSQL", status: "Connected", lastSync: "15 min ago", syncFrequency: "15 min", rowCount: "8.7M rows", locked: false, owner: "Data Engineering", piiHandling: "Encrypted" },
  { id: "ds-004", name: "Fraud", type: "PostgreSQL", status: "Connected", lastSync: "1 min ago", syncFrequency: "Real-time", rowCount: "12.4M rows", locked: true, lockedBy: "Super Admin", lockedAt: "Aug 22, 2026", lockReason: "Security audit", owner: "Security Team", piiHandling: "Fully encrypted" },
  { id: "ds-005", name: "Partners", type: "MongoDB", status: "Connected", lastSync: "1 hour ago", syncFrequency: "Hourly", rowCount: "340K rows", locked: false, owner: "Data Engineering", piiHandling: "Masked" },
  { id: "ds-006", name: "System", type: "ClickHouse", status: "Connected", lastSync: "30 sec ago", syncFrequency: "Real-time", rowCount: "156M rows", locked: false, owner: "DevOps", piiHandling: "No PII" },
  { id: "ds-007", name: "Support", type: "PostgreSQL", status: "Connected", lastSync: "30 min ago", syncFrequency: "30 min", rowCount: "1.2M rows", locked: false, owner: "Data Engineering", piiHandling: "Masked" },
  { id: "ds-008", name: "Loans", type: "PostgreSQL", status: "Connected", lastSync: "10 min ago", syncFrequency: "10 min", rowCount: "3.2M rows", locked: false, owner: "Data Engineering", piiHandling: "Encrypted" },
  { id: "ds-009", name: "Cards", type: "PostgreSQL", status: "Maintenance", lastSync: "2 hours ago", syncFrequency: "Real-time", rowCount: "980K rows", locked: false, owner: "Data Engineering", piiHandling: "Encrypted" },
];
