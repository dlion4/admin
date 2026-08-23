export type NavPage = {
  id: string;
  page: number;
  label: string;
  icon: string;
  ready?: boolean;
  badge?: number;
  summary: string;
  sections: string[];
};
export type NavGroup = { id: string; label: string; icon: string; pages: NavPage[] };

export const NAV: NavGroup[] = [
  {
    id: "overview", label: "OVERVIEW", icon: "bi-speedometer2",
    pages: [
      { id: "dashboard", page: 1, label: "Dashboard", icon: "bi-grid-1x2", ready: true, summary: "Command center for portfolio value, system health, alerts and credit risk.", sections: ["Portfolio hero", "Revenue breakdown", "System health 3×3", "Critical alerts", "24h volume", "Defaulters", "Quick actions", "Activity feed", "Channels", "Tasks"] },
      { id: "monitor", page: 2, label: "Real-Time Monitor", icon: "bi-broadcast-pin", ready: true, badge: 7, summary: "Live feed of transactions, logins, fraud alerts and system events.", sections: ["Live transaction stream", "Live metrics", "Geographic heatmap", "Channel performance", "Login stream", "Fraud alert feed", "System events"] },
      { id: "kpi", page: 3, label: "KPI Scorecard", icon: "bi-clipboard2-data", ready: true, summary: "Board-level KPI tracking against quarterly targets with RAG status.", sections: ["North-star metrics", "Growth KPIs", "Unit economics", "Cohort retention", "Target vs actual"] },
    ],
  },
  {
    id: "users", label: "USER MANAGEMENT", icon: "bi-people",
    pages: [
      { id: "user-directory", page: 4, label: "User Directory", icon: "bi-person-lines-fill", ready: true, summary: "Searchable directory of all 148,392 registered PayMo users.", sections: ["Advanced search", "Segment filters", "Bulk actions", "Saved views", "Export"] },
      { id: "user-detail", page: 5, label: "User Detail & Actions", icon: "bi-person-badge", ready: true, summary: "360° user profile with balances, devices, KYC and admin actions.", sections: ["Profile", "Balances", "Devices", "Login history", "Freeze/close", "Limits"] },
      { id: "kyc", page: 6, label: "KYC & Identity", icon: "bi-patch-check", ready: true, badge: 347, summary: "Identity verification queue with Onfido results and manual review.", sections: ["Pending queue", "Document viewer", "Liveness result", "Sanctions match", "Approve/reject"] },
      { id: "lifecycle", page: 7, label: "Account Lifecycle", icon: "bi-arrow-repeat", ready: true, summary: "Signup → activation → dormancy → closure lifecycle funnel.", sections: ["Lifecycle funnel", "Dormant accounts", "Reactivation campaigns", "Closure requests"] },
      { id: "vip", page: 8, label: "VIP Clients", icon: "bi-gem", ready: true, summary: "High-value client book with relationship managers and fee exemptions.", sections: ["VIP tiers", "Fee exemptions", "RM assignment", "Concierge requests"] },
    ],
  },
  {
    id: "finance", label: "TRANSACTIONS & FINANCE", icon: "bi-cash-stack",
    pages: [
      { id: "ledger", page: 9, label: "Transaction Ledger", icon: "bi-journal-text", ready: true, summary: "Immutable double-entry ledger across every rail.", sections: ["Ledger search", "Reversals", "Holds", "Batch processing", "Journal export"] },
      { id: "fees", page: 10, label: "Fee & Charge Management", icon: "bi-percent", summary: "Fee schedules, tiers, overrides and promotional pricing.", sections: ["Fee schedules", "Tier bands", "Overrides", "Simulation", "Effective dating"] },
      { id: "settlement", page: 11, label: "Settlement & Reconciliation", icon: "bi-arrow-left-right", badge: 3, summary: "Daily settlement files, matching engine and break resolution.", sections: ["Settlement runs", "Unmatched breaks", "Bank statements", "Approvals"] },
      { id: "liquidity", page: 12, label: "Liquidity & Pools", icon: "bi-droplet-half", summary: "Float pools, prefunding and utilisation ceilings.", sections: ["Pool balances", "Utilisation", "Top-up requests", "Sweep rules"] },
      { id: "withdrawals", page: 13, label: "Withdrawal Controls", icon: "bi-box-arrow-up", summary: "Withdrawal limits, velocity rules and manual approval queue.", sections: ["Global limits", "Per-tier limits", "High-value queue", "Velocity rules"] },
      { id: "tax", page: 14, label: "Tax & Compliance Reporting", icon: "bi-receipt-cutoff", summary: "Excise duty, VAT, withholding tax and CBK returns.", sections: ["KRA iTax", "Excise duty", "VAT", "CBK returns", "Filing calendar"] },
    ],
  },
  {
    id: "risk", label: "FRAUD & RISK", icon: "bi-shield-check",
    pages: [
      { id: "fraud", page: 15, label: "Fraud Dashboard", icon: "bi-shield-exclamation", badge: 23, summary: "Fraud loss, alert triage and rule performance.", sections: ["Loss metrics", "Alert queue", "Rule hit rates", "Blacklist"] },
      { id: "sar", page: 16, label: "Transaction Monitoring", icon: "bi-binoculars", summary: "Rule-based and ML monitoring producing SARs.", sections: ["Scenario library", "Case queue", "SAR filing", "FRA submission"] },
      { id: "risk-scoring", page: 17, label: "Risk Scoring Engine", icon: "bi-sliders2", summary: "Feature weights, model versions and score distribution.", sections: ["Model registry", "Feature weights", "Score bands", "Backtesting"] },
      { id: "aml", page: 18, label: "AML & Sanctions", icon: "bi-globe-americas", summary: "Sanctions screening, PEP lists and adverse media.", sections: ["Watchlists", "Screening hits", "PEP review", "Audit trail"] },
      { id: "incident", page: 19, label: "Incident Response", icon: "bi-fire", badge: 1, summary: "P1–P4 incident lifecycle with on-call and postmortems.", sections: ["Open incidents", "On-call roster", "Runbooks", "Postmortems"] },
    ],
  },
  {
    id: "products", label: "PRODUCTS & SERVICES", icon: "bi-box-seam",
    pages: [
      { id: "portfolio", page: 20, label: "Service Portfolio", icon: "bi-collection", summary: "Catalogue of all 24 live PayMo services and their P&L.", sections: ["Service list", "Adoption", "Revenue per service", "Lifecycle stage"] },
      { id: "product-config", page: 21, label: "Product Configuration", icon: "bi-gear-wide-connected", summary: "Per-product parameters, limits and eligibility rules.", sections: ["Parameters", "Eligibility", "Rollout rings", "Versioning"] },
      { id: "recurring", page: 22, label: "Recurring Services", icon: "bi-arrow-clockwise", summary: "Standing orders, subscriptions and scheduled disbursements.", sections: ["Mandates", "Retry policy", "Dunning", "Churn"] },
      { id: "cards", page: 23, label: "Card Programs", icon: "bi-credit-card-2-front", summary: "Visa & Mastercard BIN ranges, issuance and chargebacks.", sections: ["BIN registry", "Issuance queue", "Chargebacks", "Scheme fees"] },
      { id: "utility", page: 24, label: "Utility Services", icon: "bi-lightning-charge", summary: "Airtime, KPLC, water, DStv and government bill aggregators.", sections: ["Biller registry", "Commission grid", "Downtime", "Reconciliation"] },
    ],
  },
  {
    id: "partners", label: "PARTNERS & INVESTORS", icon: "bi-handshake",
    pages: [
      { id: "partner-dir", page: 25, label: "Partner Directory", icon: "bi-buildings", summary: "42 active partners with contracts, fees and settlement status.", sections: ["Partner list", "Contracts", "Fee terms", "Settlement status"] },
      { id: "partner-onboard", page: 26, label: "Partner Onboarding", icon: "bi-node-plus", badge: 12, summary: "Application → due diligence → sandbox → go-live pipeline.", sections: ["Applications", "Due diligence", "Sandbox keys", "Go-live checklist"] },
      { id: "investor", page: 27, label: "Investor Dashboard", icon: "bi-graph-up-arrow", summary: "Cap table, valuation history and investor KPIs.", sections: ["Cap table", "Valuation", "Runway", "Board pack"] },
      { id: "investor-reports", page: 28, label: "Investor Reports", icon: "bi-file-earmark-bar-graph", summary: "Quarterly reports, dividend runs and data-room access.", sections: ["Report builder", "Dividends", "Data room", "Access log"] },
    ],
  },
  {
    id: "platform", label: "PLATFORM ADMINISTRATION", icon: "bi-shield-lock",
    pages: [
      { id: "admins", page: 29, label: "Admin Management", icon: "bi-person-gear", summary: "18 admin accounts across 9 role tiers with passkeys.", sections: ["Admin list", "Invite flow", "Passkey registry", "Session control"] },
      { id: "roles", page: 30, label: "Permissions & Roles", icon: "bi-diagram-3", summary: "Role tiers and the 64-cell permission matrix.", sections: ["Role tiers", "Permission matrix", "Custom roles", "Change history"] },
      { id: "audit", page: 31, label: "Audit Log", icon: "bi-list-check", summary: "Immutable audit trail of every admin action.", sections: ["Search", "Actor filter", "Diff viewer", "Legal export"] },
      { id: "sysconfig", page: 32, label: "System Configuration", icon: "bi-toggles", summary: "Environment config, secrets rotation and maintenance windows.", sections: ["Config keys", "Secrets", "Maintenance", "Backups"] },
      { id: "api", page: 33, label: "API & Integrations", icon: "bi-plug", summary: "API keys, webhooks, rate limits and partner sandboxes.", sections: ["Keys", "Webhooks", "Rate limits", "Docs"] },
      { id: "flags", page: 34, label: "Feature Flags", icon: "bi-flag", summary: "LaunchDarkly-backed flags with targeting and kill switches.", sections: ["Flag list", "Targeting", "Kill switches", "Rollout"] },
      { id: "api-health", page: 43, label: "API Health & Interconnect", icon: "bi-activity", badge: 23, summary: "Circuit breakers, callbacks, DLQ and dependency map.", sections: ["Circuit breakers", "Callback registry", "DLQ", "Latency heatmap", "Impact analysis"] },
    ],
  },
  {
    id: "comms", label: "COMMUNICATIONS", icon: "bi-megaphone",
    pages: [
      { id: "notifications", page: 35, label: "Notification Center", icon: "bi-bell", badge: 9, summary: "Template registry and delivery analytics for push/SMS/email.", sections: ["Templates", "Delivery rates", "Channels", "Opt-outs"] },
      { id: "broadcast", page: 36, label: "Broadcast Messages", icon: "bi-send", summary: "Segment-targeted broadcasts with approval workflow.", sections: ["Composer", "Segments", "Approval", "Send history"] },
      { id: "support", page: 37, label: "Customer Support Queue", icon: "bi-headset", badge: 12, summary: "Ticket queue with SLA timers and agent workload.", sections: ["Queue", "SLA", "Agent load", "Macros"] },
    ],
  },
  {
    id: "docs", label: "DOCUMENTS & LEGAL", icon: "bi-file-earmark-text",
    pages: [
      { id: "terms", page: 38, label: "Terms & Conditions", icon: "bi-file-text", summary: "Versioned T&C with legal review and user re-consent.", sections: ["Versions", "Diff", "Legal review", "Re-consent"] },
      { id: "privacy", page: 39, label: "Privacy Policy", icon: "bi-incognito", summary: "ODPC-aligned privacy policy and DSAR handling.", sections: ["Policy versions", "DSAR queue", "Retention", "Consent"] },
      { id: "compliance-docs", page: 40, label: "Compliance Documents", icon: "bi-folder-check", summary: "CBK licences, audits and regulator correspondence.", sections: ["Licences", "Audit reports", "Correspondence", "Expiry alerts"] },
      { id: "templates", page: 41, label: "Document Templates", icon: "bi-files", summary: "Statement, receipt and notice templates with merge fields.", sections: ["Template list", "Merge fields", "Preview", "Publish"] },
    ],
  },
  {
    id: "analytics", label: "ANALYTICS & REPORTING", icon: "bi-bar-chart",
    pages: [
      { id: "analytics", page: 42, label: "Analytics Dashboard", icon: "bi-pie-chart", summary: "Self-serve explorer, scheduled reports and warehouse sync.", sections: ["Explorer", "Saved reports", "Schedules", "Warehouse"] },
    ],
  },
];

export const ALL_PAGES: NavPage[] = NAV.flatMap((g) => g.pages);
export const findPage = (id: string) => ALL_PAGES.find((p) => p.id === id);
