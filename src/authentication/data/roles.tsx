/* ============================================================
   PayMo Admin — Page 0 data model
   Roles, tiers, permission matrix, gate specs, session policy
   Source: PAYMO_ADMIN_DASHBOARD_LAYOUT V2 (Page 0 + Role Hierarchy)
   ============================================================ */

import type { ReactNode } from "react";

export type PermState = "full" | "config" | "none";
export type SpecColumn = "super" | "platform" | "ops" | "compliance" | "finance" | "minor" | "analyst";
export type RoleId =
  | "super"
  | "platform"
  | "ops"
  | "compliance"
  | "finance"
  | "support-lead"
  | "developer"
  | "minor"
  | "partner"
  | "investor"
  | "analyst"
  | "care";

export type Category =
  | "Users"
  | "Transactions"
  | "Fraud"
  | "Finance"
  | "Partners"
  | "Investors"
  | "System";

export interface MatrixRow {
  category: Category;
  label: string;
  perms: Record<SpecColumn, PermState>;
}

const F: PermState = "full";
const N: PermState = "none";
const C: PermState = "config";

/** helper to keep the matrix terse: order = super, platform, ops, compliance, finance, minor, analyst */
const row = (category: Category, label: string, v: PermState[]): MatrixRow => ({
  category,
  label,
  perms: {
    super: v[0],
    platform: v[1],
    ops: v[2],
    compliance: v[3],
    finance: v[4],
    minor: v[5],
    analyst: v[6],
  },
});

export const MATRIX: MatrixRow[] = [
  row("Users", "View user list", [F, F, F, F, F, C, F]),
  row("Users", "View user detail", [F, F, F, F, F, C, F]),
  row("Users", "Edit user profile", [F, F, F, N, N, C, N]),
  row("Users", "Freeze account", [F, F, F, F, N, C, N]),
  row("Users", "Unfreeze account", [F, F, N, F, N, N, N]),
  row("Users", "Close account", [F, F, N, F, N, N, N]),
  row("Users", "Impersonate user", [F, F, N, N, N, N, N]),
  row("Users", "Delete user", [F, N, N, N, N, N, N]),
  row("Users", "Adjust user limits", [F, F, N, N, F, C, N]),
  row("Users", "Grant / revoke VIP", [F, F, N, N, N, N, N]),
  row("Users", "Export user data", [F, F, F, F, F, C, F]),
  row("Users", "View login history", [F, F, F, F, N, C, N]),

  row("Transactions", "View all transactions", [F, F, F, F, F, C, F]),
  row("Transactions", "Reverse transaction", [F, F, N, F, N, N, N]),
  row("Transactions", "Approve high-value", [F, F, N, N, F, N, N]),
  row("Transactions", "Set fee schedule", [F, F, N, N, F, N, N]),
  row("Transactions", "Override fee", [F, F, N, N, F, N, N]),
  row("Transactions", "Set withdrawal limits", [F, F, N, N, F, N, N]),
  row("Transactions", "Export transactions", [F, F, F, F, F, C, F]),
  row("Transactions", "Hold transaction", [F, F, F, F, N, N, N]),
  row("Transactions", "Batch process", [F, F, N, N, F, N, N]),

  row("Fraud", "View fraud dashboard", [F, F, F, F, F, N, N]),
  row("Fraud", "Block transaction", [F, F, F, F, N, N, N]),
  row("Fraud", "Flag user", [F, F, F, F, N, N, N]),
  row("Fraud", "Blacklist user", [F, F, N, F, N, N, N]),
  row("Fraud", "Review alerts", [F, F, F, F, N, N, N]),
  row("Fraud", "Manage blacklist", [F, F, N, F, N, N, N]),
  row("Fraud", "Configure rules", [F, F, N, F, N, N, N]),

  row("Finance", "View P&L", [F, F, N, N, F, N, F]),
  row("Finance", "Approve settlements", [F, F, N, N, F, N, N]),
  row("Finance", "Manage pools", [F, F, N, N, F, N, N]),
  row("Finance", "Set tax rates", [F, F, N, N, F, N, N]),
  row("Finance", "Manage charges", [F, F, N, N, F, N, N]),
  row("Finance", "View balance sheet", [F, F, N, N, F, N, F]),
  row("Finance", "Manage reserves", [F, F, N, N, F, N, N]),
  row("Finance", "Approve refunds", [F, F, N, N, F, N, N]),

  row("Partners", "View partners", [F, F, F, F, F, C, F]),
  row("Partners", "Onboard partner", [F, F, N, N, N, N, N]),
  row("Partners", "Suspend partner", [F, F, N, N, N, N, N]),
  row("Partners", "Set partner fees", [F, F, N, N, F, N, N]),
  row("Partners", "View partner transactions", [F, F, F, F, F, C, F]),
  row("Partners", "Manage partner API", [F, F, N, N, N, N, N]),

  row("Investors", "View investor data", [F, F, N, N, F, N, F]),
  row("Investors", "Edit investor terms", [F, F, N, N, N, N, N]),
  row("Investors", "Generate reports", [F, F, N, N, F, N, F]),
  row("Investors", "Manage cap table", [F, F, N, N, N, N, N]),
  row("Investors", "Process dividends", [F, F, N, N, F, N, N]),

  row("System", "Manage admins", [F, F, N, N, N, N, N]),
  row("System", "View audit log", [F, F, F, F, F, N, N]),
  row("System", "Configure system", [F, F, N, N, N, N, N]),
  row("System", "Manage roles", [F, N, N, N, N, N, N]),
  row("System", "API key management", [F, F, N, N, N, N, N]),
  row("System", "Database access", [F, N, N, N, N, N, N]),
  row("System", "Feature flags", [F, F, N, N, N, N, N]),
  row("System", "View error logs", [F, F, F, N, N, N, N]),
  row("System", "Manage webhooks", [F, F, N, N, N, N, N]),
  row("System", "Backup management", [F, N, N, N, N, N, N]),
];

export const CATEGORIES: Category[] = [
  "Users",
  "Transactions",
  "Fraud",
  "Finance",
  "Partners",
  "Investors",
  "System",
];

export const CATEGORY_ICON: Record<Category, ReactNode> = {
  Users: <i className="bi bi-people-fill" />,
  Transactions: <i className="bi bi-credit-card-fill" />,
  Fraud: <i className="bi bi-shield-exclamation" />,
  Finance: <i className="bi bi-cash-stack" />,
  Partners: <i className="bi bi-handshake" />,
  Investors: <i className="bi bi-graph-up-arrow" />,
  System: <i className="bi bi-gear-fill" />,
};

/** Roles that are not literal spec columns inherit a base column + overrides. */
interface DerivedConfig {
  base: SpecColumn;
  categoryOverride?: Partial<Record<Category, PermState>>;
  rowOverride?: Record<string, PermState>;
}

const DERIVED: Partial<Record<RoleId, DerivedConfig>> = {
  "support-lead": {
    base: "ops",
    categoryOverride: { Finance: N, Investors: N, Fraud: C },
    rowOverride: { "Edit user profile": C, "Freeze account": C, "Hold transaction": C },
  },
  developer: {
    base: "minor",
    categoryOverride: { Finance: N, Investors: N },
    rowOverride: {
      "View error logs": F,
      "Feature flags": F,
      "Manage webhooks": F,
      "API key management": C,
      "Database access": C,
      "Configure system": C,
      "View audit log": C,
      "Manage partner API": C,
    },
  },
  partner: {
    base: "ops",
    categoryOverride: { Partners: F, Fraud: N, Finance: N, Investors: N, Users: C },
    rowOverride: { "Set partner fees": C, "Manage partner API": C },
  },
  investor: {
    base: "finance",
    categoryOverride: { Users: N, Fraud: N, Transactions: C },
    rowOverride: { "Generate reports": F, "View investor data": F, "Manage cap table": C },
  },
  care: {
    base: "analyst",
    categoryOverride: { Finance: N, Investors: N, Partners: N },
    rowOverride: { "View login history": F, "Edit user profile": C, "Freeze account": C },
  },
};

const SUPER_ONLY = new Set(
  MATRIX.filter((r) => r.perms.super === "full" && r.perms.platform === "none").map((r) => r.label),
);

export function permFor(roleId: RoleId, r: MatrixRow): PermState {
  const derived = DERIVED[roleId];
  if (!derived) return r.perms[roleId as SpecColumn];
  if (SUPER_ONLY.has(r.label)) return "none";
  const ro = derived.rowOverride?.[r.label];
  if (ro !== undefined) return ro;
  const base = r.perms[derived.base];
  const co = derived.categoryOverride?.[r.category];
  if (co === undefined) return base;
  if (co === "none") return "none";
  if (base === "none") return "none";
  return co;
}

export function scoreFor(roleId: RoleId) {
  let full = 0;
  let config = 0;
  MATRIX.forEach((r) => {
    const p = permFor(roleId, r);
    if (p === "full") full += 1;
    else if (p === "config") config += 1;
  });
  const total = MATRIX.length;
  const pct = Math.round(((full + config * 0.5) / total) * 100);
  return { full, config, none: total - full - config, total, pct };
}

export function categoryScore(roleId: RoleId, cat: Category) {
  const rows = MATRIX.filter((r) => r.category === cat);
  let granted = 0;
  rows.forEach((r) => {
    const p = permFor(roleId, r);
    if (p === "full") granted += 1;
    else if (p === "config") granted += 0.5;
  });
  return { granted, total: rows.length, pct: Math.round((granted / rows.length) * 100) };
}

export type Clearance = "MAXIMUM" | "CRITICAL" | "HIGH" | "ELEVATED" | "STANDARD" | "RESTRICTED";

export interface Role {
  id: RoleId;
  tier: number;
  name: string;
  alias: string;
  icon: ReactNode;
  color: string;
  clearance: Clearance;
  summary: string;
  reportsTo: string;
  canCreate: string;
  scopes: string[];
  restrictions: string[];
  landing: string;
  sessionTimeout: string;
  idleTimeout: string;
  ipWhitelist: boolean;
  deviceBinding: boolean;
  dualControl: boolean;
  seats: { active: number; total: number };
  gates: string[];
  holders: { name: string; status: "online" | "idle" | "offline" }[];
}

export const ROLES: Role[] = [
  {
    id: "super",
    tier: 0,
    name: "Super Admin",
    alias: "Founder / Owner",
    icon: <i className="bi bi-shield-fill-check" />,
    color: "#dc3545",
    clearance: "MAXIMUM",
    summary:
      "Unrestricted root authority over PayMo. Creates every other role, issues session PINs, and is the only tier able to touch the database, backups and the role engine itself.",
    reportsTo: "Self (board oversight)",
    canCreate: "All roles · all permissions",
    scopes: [
      "Full 58/58 permission set — no configurable gaps",
      "Issues Gate 4 session PINs to every admin",
      "Emergency lockdown & forced logout of any session",
      "Direct database access + backup management",
      "Role engine: create, edit and revoke roles",
    ],
    restrictions: [
      "Every action is immutably written to the audit ledger",
      "Hardware passkey mandatory — no biometric-only fallback",
      "Dual-control required for delete-user and cap-table edits",
    ],
    landing: "Page 1 · Admin Dashboard Home",
    sessionTimeout: "8 hours",
    idleTimeout: "15 minutes",
    ipWhitelist: true,
    deviceBinding: true,
    dualControl: true,
    seats: { active: 1, total: 2 },
    gates: ["PIN", "Hardware Passkey", "TOTP", "Self-issued PIN"],
    holders: [{ name: "Joseph Mwangi", status: "online" }],
  },
  {
    id: "platform",
    tier: 1,
    name: "Platform Admin",
    alias: "Head of Platform",
    icon: <i className="bi bi-wrench-adjustable-circle" />,
    color: "#0d6efd",
    clearance: "CRITICAL",
    summary:
      "Runs the platform day to day. Can create minor admins and analysts, configure the system, manage API keys, feature flags and webhooks — everything except the root-only capabilities.",
    reportsTo: "Super Admin",
    canCreate: "Minor admins · analysts",
    scopes: [
      "Manage admins (except super admin tier)",
      "System configuration + feature flags",
      "API key management & webhook registry",
      "Approve settlements, reversals and high-value transactions",
      "Onboard / suspend partners",
    ],
    restrictions: [
      "Cannot delete users or manage roles",
      "No direct database or backup access",
      "Config changes >KES 1M impact need super admin co-sign",
    ],
    landing: "Page 32 · System Configuration",
    sessionTimeout: "8 hours",
    idleTimeout: "30 minutes",
    ipWhitelist: true,
    deviceBinding: true,
    dualControl: true,
    seats: { active: 2, total: 3 },
    gates: ["PIN", "Passkey", "TOTP", "Session PIN"],
    holders: [
      { name: "Sarah Kimani", status: "online" },
      { name: "James Otieno", status: "idle" },
    ],
  },
  {
    id: "ops",
    tier: 2,
    name: "Operations Manager",
    alias: "Ops Command",
    icon: <i className="bi bi-sliders" />,
    color: "#6f42c1",
    clearance: "HIGH",
    summary:
      "Owns live operations — the real-time monitor, transaction holds, account freezes and the support org. Creates support agents and reviewers.",
    reportsTo: "Platform Admin",
    canCreate: "Support agents · reviewers",
    scopes: [
      "Freeze accounts & hold transactions",
      "Block transactions and flag users in fraud queue",
      "Real-time monitor + error logs",
      "Export user & transaction data",
      "Assign and reassign support queue",
    ],
    restrictions: [
      "Cannot unfreeze or close accounts (compliance-only)",
      "No finance, investor or fee-schedule access",
      "Cannot blacklist users — escalate to compliance",
    ],
    landing: "Page 2 · Real-Time Monitor",
    sessionTimeout: "8 hours",
    idleTimeout: "30 minutes",
    ipWhitelist: true,
    deviceBinding: false,
    dualControl: false,
    seats: { active: 3, total: 4 },
    gates: ["PIN", "Passkey", "TOTP", "Session PIN"],
    holders: [
      { name: "Mary Wanjiru", status: "online" },
      { name: "Peter Njoroge", status: "offline" },
    ],
  },
  {
    id: "compliance",
    tier: 3,
    name: "Compliance Officer",
    alias: "AML / Risk & Regulatory",
    icon: <i className="bi bi-balance-scale" />,
    color: "#20c997",
    clearance: "HIGH",
    summary:
      "Regulatory authority. Owns AML, sanctions screening, SARs, blacklists and account lifecycle terminations. Creates investigators.",
    reportsTo: "Platform Admin",
    canCreate: "Investigators",
    scopes: [
      "Unfreeze / close accounts",
      "Reverse transactions on regulatory grounds",
      "Blacklist users & manage the blacklist",
      "Configure fraud rules and risk thresholds",
      "Full audit-log read + CBK reporting exports",
    ],
    restrictions: [
      "No fee, settlement or treasury permissions",
      "Cannot edit user profiles",
      "Cannot impersonate users",
    ],
    landing: "Page 18 · AML & Sanctions",
    sessionTimeout: "8 hours",
    idleTimeout: "20 minutes",
    ipWhitelist: true,
    deviceBinding: true,
    dualControl: true,
    seats: { active: 2, total: 2 },
    gates: ["PIN", "Passkey", "TOTP", "Session PIN"],
    holders: [{ name: "David Kariuki", status: "online" }],
  },
  {
    id: "finance",
    tier: 4,
    name: "Finance Manager",
    alias: "Finance / Treasury Admin",
    icon: <i className="bi bi-cash-stack" />,
    color: "#198754",
    clearance: "HIGH",
    summary:
      "Owns the money: P&L, settlements, liquidity pools, reserves, tax rates, fee schedules and refunds. Creates accountants.",
    reportsTo: "Platform Admin",
    canCreate: "Accountants",
    scopes: [
      "Approve settlements & refunds",
      "Set fee schedules, tax rates and withdrawal limits",
      "Manage liquidity pools and reserves",
      "P&L, balance sheet, investor dividends",
      "Approve high-value transactions & batch runs",
    ],
    restrictions: [
      "No account freeze / close powers",
      "Cannot edit investor terms or cap table",
      "Fraud dashboard is read-only",
    ],
    landing: "Page 11 · Settlement & Reconciliation",
    sessionTimeout: "8 hours",
    idleTimeout: "20 minutes",
    ipWhitelist: true,
    deviceBinding: true,
    dualControl: true,
    seats: { active: 2, total: 3 },
    gates: ["PIN", "Passkey", "TOTP", "Session PIN"],
    holders: [
      { name: "Grace Achieng", status: "online" },
      { name: "Kevin Mutua", status: "idle" },
    ],
  },
  {
    id: "support-lead",
    tier: 5,
    name: "Support Lead",
    alias: "Customer Experience Lead",
    icon: <i className="bi bi-headset" />,
    color: "#0dcaf0",
    clearance: "ELEVATED",
    summary:
      "Leads the support floor, owns the ticket queue and SLAs, and supervises customer care admins and support agents.",
    reportsTo: "Operations Manager",
    canCreate: "Support agents",
    scopes: [
      "Full support queue ownership & escalation",
      "Configurable freeze / hold on flagged accounts",
      "Review fraud alerts raised by agents",
      "Export user & transaction data for tickets",
      "Broadcast service notices to customers",
    ],
    restrictions: [
      "No finance or investor visibility",
      "Cannot reverse transactions",
      "Sensitive actions require ops manager approval",
    ],
    landing: "Page 37 · Customer Support Queue",
    sessionTimeout: "8 hours",
    idleTimeout: "30 minutes",
    ipWhitelist: false,
    deviceBinding: false,
    dualControl: false,
    seats: { active: 4, total: 6 },
    gates: ["PIN", "Passkey", "TOTP", "Session PIN"],
    holders: [{ name: "Brian Ochieng", status: "online" }],
  },
  {
    id: "developer",
    tier: 6,
    name: "Developer Admin",
    alias: "Engineering / DevOps",
    icon: <i className="bi bi-laptop" />,
    color: "#6610f2",
    clearance: "ELEVATED",
    summary:
      "Engineering access to logs, feature flags, webhooks, circuit breakers and sandbox API keys. Production data access is masked by default.",
    reportsTo: "Platform Admin",
    canCreate: "None — service accounts only",
    scopes: [
      "Error logs, traces and API health (Page 43)",
      "Feature flags & webhook management",
      "Circuit breaker + dead letter queue controls",
      "Sandbox API key issuance",
      "Read-only masked production data",
    ],
    restrictions: [
      "PII is masked unless a break-glass ticket is open",
      "Database access is read-replica, query-audited",
      "No money movement permissions at all",
    ],
    landing: "Page 43 · API Health & Interconnections",
    sessionTimeout: "6 hours",
    idleTimeout: "30 minutes",
    ipWhitelist: true,
    deviceBinding: true,
    dualControl: false,
    seats: { active: 5, total: 8 },
    gates: ["PIN", "Hardware Passkey", "TOTP", "Session PIN"],
    holders: [
      { name: "Alex Mwendwa", status: "online" },
      { name: "Faith Nduta", status: "online" },
    ],
  },
  {
    id: "minor",
    tier: 6,
    name: "Minor Admin",
    alias: "Employer / Delegated Admin",
    icon: <i className="bi bi-puzzle" />,
    color: "#fd7e14",
    clearance: "STANDARD",
    summary:
      "A permission-configurable account. Every capability marked ⚙️ is switched on or off individually by the super admin for this specific account.",
    reportsTo: "Platform Admin",
    canCreate: "None — limited permissions",
    scopes: [
      "Per-account configurable permission set",
      "Scoped to an assigned user segment or employer",
      "Export limited to their own scope",
      "Cannot see aggregate platform finance",
    ],
    restrictions: [
      "No fraud, finance or investor modules",
      "Every ⚙️ toggle logged on change",
      "Scope re-certified every 90 days",
    ],
    landing: "Page 4 · User Directory (scoped)",
    sessionTimeout: "4 hours",
    idleTimeout: "15 minutes",
    ipWhitelist: false,
    deviceBinding: false,
    dualControl: false,
    seats: { active: 11, total: 20 },
    gates: ["PIN", "Passkey", "TOTP", "Session PIN"],
    holders: [{ name: "Delegated accounts ×11", status: "online" }],
  },
  {
    id: "partner",
    tier: 4,
    name: "Partner Relations Admin",
    alias: "Partnerships & BD",
    icon: <i className="bi bi-handshake" />,
    color: "#d63384",
    clearance: "STANDARD",
    summary:
      "Owns the partner lifecycle — directory, onboarding pipeline, contracted fees and partner transaction visibility.",
    reportsTo: "Platform Admin",
    canCreate: "None",
    scopes: [
      "Partner directory & onboarding pipeline",
      "Partner transaction visibility",
      "Configurable partner fee proposals",
      "Partner API request routing to platform admin",
    ],
    restrictions: [
      "Cannot suspend partners without platform admin",
      "No user or fraud module access",
      "Fee changes are proposals, not commits",
    ],
    landing: "Page 25 · Partner Directory",
    sessionTimeout: "8 hours",
    idleTimeout: "30 minutes",
    ipWhitelist: false,
    deviceBinding: false,
    dualControl: false,
    seats: { active: 2, total: 3 },
    gates: ["PIN", "Passkey", "TOTP", "Session PIN"],
    holders: [{ name: "Lydia Chebet", status: "idle" }],
  },
  {
    id: "investor",
    tier: 4,
    name: "Investor Relations Admin",
    alias: "IR & Reporting",
    icon: <i className="bi bi-graph-up-arrow" />,
    color: "#ffc107",
    clearance: "STANDARD",
    summary:
      "Prepares investor packs, dividend runs and board reporting from finance data. Read-mostly with generation rights.",
    reportsTo: "Platform Admin",
    canCreate: "None",
    scopes: [
      "Investor dashboard & report generation",
      "P&L / balance sheet read access",
      "Dividend processing with finance co-sign",
      "Configurable cap-table view",
    ],
    restrictions: [
      "Cannot edit investor terms",
      "No user, fraud or system access",
      "All exports watermarked and tracked",
    ],
    landing: "Page 27 · Investor Dashboard",
    sessionTimeout: "8 hours",
    idleTimeout: "30 minutes",
    ipWhitelist: false,
    deviceBinding: false,
    dualControl: true,
    seats: { active: 1, total: 2 },
    gates: ["PIN", "Passkey", "TOTP", "Session PIN"],
    holders: [{ name: "Nancy Wambui", status: "offline" }],
  },
  {
    id: "analyst",
    tier: 7,
    name: "Analyst",
    alias: "Read-only / BI",
    icon: <i className="bi bi-bar-chart-line-fill" />,
    color: "#6c757d",
    clearance: "RESTRICTED",
    summary:
      "Pure read-only analytics across users, transactions, finance summaries and investor reporting. Zero write capability anywhere.",
    reportsTo: "Any Tier 1–4 admin",
    canCreate: "None",
    scopes: [
      "Analytics dashboard & KPI scorecards",
      "Read user, transaction, P&L and investor data",
      "Export datasets for BI tooling",
    ],
    restrictions: [
      "No write action exists on any screen",
      "No fraud dashboard or audit log",
      "Exports rate-limited to 5 per hour",
    ],
    landing: "Page 42 · Analytics Dashboard",
    sessionTimeout: "8 hours",
    idleTimeout: "30 minutes",
    ipWhitelist: false,
    deviceBinding: false,
    dualControl: false,
    seats: { active: 6, total: 10 },
    gates: ["PIN", "Passkey", "TOTP", "Session PIN"],
    holders: [{ name: "BI team ×6", status: "online" }],
  },
  {
    id: "care",
    tier: 8,
    name: "Customer Care Admin",
    alias: "Support Agent · Frontline",
    icon: <i className="bi bi-chat-dots-fill" />,
    color: "#0d6efd",
    clearance: "RESTRICTED",
    summary:
      "Frontline agent handling tickets, KYC nudges and account questions. Sees only what a ticket needs, everything else is masked.",
    reportsTo: "Support Lead",
    canCreate: "None",
    scopes: [
      "Ticket queue & customer conversation history",
      "User lookup with masked PII",
      "Login history for account-recovery checks",
      "Raise freeze / hold requests for approval",
    ],
    restrictions: [
      "Cannot move money or reverse anything",
      "No finance, partner or investor access",
      "Every record opened is written to the audit log",
    ],
    landing: "Page 37 · Support Queue (agent view)",
    sessionTimeout: "8 hours",
    idleTimeout: "30 minutes",
    ipWhitelist: false,
    deviceBinding: false,
    dualControl: false,
    seats: { active: 18, total: 24 },
    gates: ["PIN", "Passkey", "TOTP", "Session PIN"],
    holders: [{ name: "Care floor ×18", status: "online" }],
  },
];

export const roleById = (id: RoleId) => ROLES.find((r) => r.id === id)!;

export const TIER_TABLE = [
  { tier: 0, role: "Super Admin (founder/owner)", canCreate: "All roles, all permissions", reportsTo: "Self" },
  { tier: 1, role: "Platform Admin", canCreate: "Minor admins, analysts", reportsTo: "Super Admin" },
  { tier: 2, role: "Operations Manager", canCreate: "Support agents, reviewers", reportsTo: "Platform Admin" },
  { tier: 3, role: "Compliance Officer", canCreate: "Investigators", reportsTo: "Platform Admin" },
  { tier: 4, role: "Finance Manager", canCreate: "Accountants", reportsTo: "Platform Admin" },
  { tier: 5, role: "Support Lead", canCreate: "Support agents", reportsTo: "Operations Manager" },
  { tier: 6, role: "Minor Admin (employer/dev)", canCreate: "None — limited permissions", reportsTo: "Platform Admin" },
  { tier: 7, role: "Analyst (read-only)", canCreate: "None", reportsTo: "Any Tier 1–4" },
  { tier: 8, role: "Support Agent", canCreate: "None", reportsTo: "Support Lead" },
];

export interface GateSpec {
  key: "pin" | "passkey" | "totp" | "session";
  index: number;
  title: string;
  short: string;
  icon: ReactNode;
  tone: string;
  blurb: string;
  rules: { field: string; value: string }[];
}

export const GATE_SPECS: GateSpec[] = [
  {
    key: "pin",
    index: 1,
    title: "6-Digit Admin PIN",
    short: "PIN",
    icon: <i className="bi bi-123" />,
    tone: "#0d6efd",
    blurb: "Knowledge factor. Bcrypt-hashed, never stored in plain text.",
    rules: [
      { field: "Input", value: "6 numeric digits, masked entry" },
      { field: "Attempts", value: "3 max, then 30-minute lockout" },
      { field: "Reset", value: "Via super admin or email recovery" },
      { field: "Storage", value: "Bcrypt hash, never plain text" },
    ],
  },
  {
    key: "passkey",
    index: 2,
    title: "Passkey — FIDO2 / WebAuthn",
    short: "Passkey",
    icon: <i className="bi bi-key-fill" />,
    tone: "#6f42c1",
    blurb: "Possession factor. Hardware security key or platform biometric.",
    rules: [
      { field: "Type", value: "Hardware security key (YubiKey) or biometric (fingerprint/face)" },
      { field: "Registration", value: "Must be registered by super admin before first use" },
      { field: "Fallback", value: "Super admin can issue a temporary 12-word recovery phrase" },
      { field: "Storage", value: "Public key server-side, private key never leaves the device" },
    ],
  },
  {
    key: "totp",
    index: 3,
    title: "Time-Based 2FA (TOTP)",
    short: "TOTP",
    icon: <i className="bi bi-stopwatch-fill" />,
    tone: "#20c997",
    blurb: "Rotating one-time code from your authenticator app.",
    rules: [
      { field: "App", value: "Google Authenticator, Authy, or Microsoft Authenticator" },
      { field: "Code", value: "6-digit, 30-second rotation" },
      { field: "Setup", value: "Super admin generates QR code for admin to scan" },
      { field: "Backup", value: "5 single-use recovery codes, sealed envelope storage" },
    ],
  },
  {
    key: "session",
    index: 4,
    title: "Super Admin–Issued Session PIN",
    short: "Session PIN",
    icon: <i className="bi bi-shield-check" />,
    tone: "#dc3545",
    blurb: "Out-of-band factor issued per session by the super admin.",
    rules: [
      { field: "Type", value: "4-digit numeric PIN set by super admin per session" },
      { field: "Validity", value: "Single session only, expires on logout or after 8 hours" },
      { field: "Purpose", value: "Blocks access even if all other factors are compromised" },
      { field: "Issuance", value: "Super admin issues via secure channel (not in-app)" },
    ],
  },
];

export const SESSION_POLICY = [
  { setting: "Session timeout", value: "8 hours (configurable by super admin)" },
  { setting: "Idle timeout", value: "30 minutes" },
  { setting: "Concurrent sessions", value: "1 per admin (new login kills old session)" },
  { setting: "IP whitelist", value: "Optional — super admin can restrict to office IPs" },
  { setting: "Device binding", value: "Optional — bind to registered device fingerprint" },
  { setting: "Audit log", value: "Every login/logout recorded with IP, device, timestamp" },
  { setting: "Forced logout", value: "Super admin can terminate any active session" },
  { setting: "Session encryption", value: "AES-256-GCM for session tokens" },
  { setting: "CSRF protection", value: "Synchronizer token pattern on all state-changing requests" },
];

export const AUTHENTICATORS = [
  {
    id: "yubikey",
    name: "YubiKey 5C NFC",
    type: "Hardware security key",
    icon: <i className="bi bi-shield-lock" />,
    detail: "AAGUID cb69481e-8ff7 · USB-C + NFC",
    attestation: "Packed / FIDO2 L2",
    lastUsed: "Today 08:14",
    hardware: true,
  },
  {
    id: "touchid",
    name: "MacBook Pro — Touch ID",
    type: "Platform biometric",
    icon: <i className="bi bi-fingerprint" />,
    detail: "Secure Enclave · macOS 15.3",
    attestation: "Apple Anonymous",
    lastUsed: "Yesterday 19:02",
    hardware: false,
  },
  {
    id: "faceid",
    name: "iPhone 15 Pro — Face ID",
    type: "Platform biometric",
    icon: <i className="bi bi-person-bounding-box" />,
    detail: "iCloud Keychain synced passkey",
    attestation: "Apple Anonymous",
    lastUsed: "3 days ago",
    hardware: false,
  },
];

export const RECOVERY_PHRASE =
  "vault ledger ember quartz nomad ripple falcon cobalt tundra saffron pivot harbor";

export const BACKUP_CODES = ["7F2K-9QX4", "B3MD-1TZ8", "K9PL-4RV2", "X4WC-8HN6", "Q7YT-3JB5"];

export const DEMO = {
  email: "joseph.mwangi@paymo.co.ke",
  password: "PayMo@2026",
  pin: "482913",
  ip: "197.232.61.14",
  device: "FP-8A4C-19DE-7731",
  location: "Nairobi, KE · Westlands HQ",
};

export const THREAT_SIGNALS = [
  { label: "IP reputation", value: "Clean · office range", tone: "#198754" },
  { label: "Device fingerprint", value: "Known & bound", tone: "#198754" },
  { label: "Impossible travel", value: "Not detected", tone: "#198754" },
  { label: "Failed logins (1h)", value: "23 platform-wide", tone: "#ffc107" },
  { label: "Tor / VPN exit", value: "Not detected", tone: "#198754" },
  { label: "Credential stuffing", value: "2 blocked attempts", tone: "#fd7e14" },
];

export const ACTIVE_SESSIONS = [
  { admin: "Joseph Mwangi", role: "Super Admin", ip: "197.232.61.14", device: "MacBook Pro 16", started: "08:14", state: "Active" },
  { admin: "Sarah Kimani", role: "Platform Admin", ip: "197.232.61.22", device: "Dell XPS 15", started: "09:02", state: "Active" },
  { admin: "David Kariuki", role: "Compliance Officer", ip: "41.90.64.7", device: "iPad Pro", started: "11:35", state: "Idle 12m" },
  { admin: "Grace Achieng", role: "Finance Manager", ip: "197.232.61.31", device: "ThinkPad T14", started: "07:58", state: "Active" },
];
