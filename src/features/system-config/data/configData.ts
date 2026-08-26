// ================================================================
// System Configuration — Data Types & Mock Data
// ================================================================

/* ---------- Existing types (enhanced) ---------- */

export interface GeneralSetting {
  id: string;
  setting: string;
  value: string;
  editableBy: string;
  category?: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
  lastModified?: string;
  lastModifiedBy?: string;
}

export interface NotificationChannel {
  id: string;
  channel: string;
  status: string;
  provider: string;
  config: string;
  deliveryRate?: string;
  lastFired?: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
}

export interface RateLimit {
  id: string;
  endpoint: string;
  limit: string;
  window: string;
  appliesTo: string;
  status?: string;
  blocked24h?: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
}

export interface FeatureToggle {
  id: string;
  feature: string;
  state: string;
  rollout: string;
  description: string;
  owner?: string;
  lastToggled?: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
}

export interface ChangeRecord {
  id: string;
  date: string;
  admin: string;
  setting: string;
  oldValue: string;
  newValue: string;
  reason: string;
  status?: string;
}

export interface BrandSetting {
  id: string;
  name: string;
  value: string;
  icon: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
}

export interface MaintenanceWindow {
  id: string;
  day: string;
  time: string;
  message: string;
  notification: string;
  killSessions: string;
  adminAccess: string;
  emergency: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
}

/* ---------- New types ---------- */

export interface SecurityPolicy {
  id: string;
  policy: string;
  category: string;
  severity: string;
  status: string;
  description: string;
  lastEnforced?: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  type: string;
  status: string;
  permissions: string;
  rateLimit: string;
  createdDate: string;
  lastUsed?: string;
  expiresAt?: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
}

export interface SystemHealth {
  id: string;
  service: string;
  status: string;
  uptime: string;
  latency: string;
  lastCheck: string;
  incidents30d: string;
  owner: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  details: string;
  ip: string;
  severity: string;
}

export interface DocumentRecord {
  id: string;
  title: string;
  type: string;
  status: string;
  version: string;
  author: string;
  lastUpdated: string;
  content: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
}

export interface ConfigTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  settingsCount: string;
  lastApplied: string;
  usageCount: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
}

export interface NotificationRule {
  id: string;
  rule: string;
  trigger: string;
  channel: string;
  severity: string;
  status: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
}

/* ================================================================
   Initial Data
   ================================================================ */

export const initialGeneral: GeneralSetting[] = [
  { id: "gs-1", setting: "Platform name", value: "PayMo", editableBy: "Super admin", category: "Identity", lastModified: "Aug 10, 2026", lastModifiedBy: "Joseph M." },
  { id: "gs-2", setting: "Legal entity name", value: "PayMo Digital Bank Ltd", editableBy: "Company registry", category: "Identity", lastModified: "Jun 1, 2026", lastModifiedBy: "Legal Team" },
  { id: "gs-3", setting: "Country of operation", value: "Kenya", editableBy: "Regulatory", category: "Identity", lastModified: "Jan 15, 2026", lastModifiedBy: "Compliance" },
  { id: "gs-4", setting: "Base currency", value: "KES", editableBy: "Regulatory", category: "Finance", lastModified: "Jan 15, 2026", lastModifiedBy: "Compliance" },
  { id: "gs-5", setting: "Timezone", value: "Africa/Nairobi (EAT, UTC+3)", editableBy: "Super admin", category: "Locale", lastModified: "Feb 1, 2026", lastModifiedBy: "Joseph M." },
  { id: "gs-6", setting: "Date format", value: "DD/MM/YYYY", editableBy: "None", category: "Locale", lastModified: "Jan 1, 2026", lastModifiedBy: "System" },
  { id: "gs-7", setting: "Number format", value: "1,234.56", editableBy: "None", category: "Locale", lastModified: "Jan 1, 2026", lastModifiedBy: "System" },
  { id: "gs-8", setting: "Admin language", value: "English", editableBy: "None", category: "Locale", lastModified: "Jan 1, 2026", lastModifiedBy: "System" },
  { id: "gs-9", setting: "User app language", value: "English + Swahili", editableBy: "None", category: "Locale", lastModified: "Mar 1, 2026", lastModifiedBy: "Product" },
  { id: "gs-10", setting: "Session timeout", value: "8 hours", editableBy: "Security Lead", category: "Security", lastModified: "Aug 5, 2026", lastModifiedBy: "Security Lead" },
  { id: "gs-11", setting: "Password policy", value: "12+ chars, complexity", editableBy: "Security Lead", category: "Security", lastModified: "Jul 20, 2026", lastModifiedBy: "Security Lead" },
  { id: "gs-12", setting: "Max login attempts", value: "5", editableBy: "Security Lead", category: "Security", lastModified: "Jun 15, 2026", lastModifiedBy: "Security Lead" },
];

export const initialNotifications: NotificationChannel[] = [
  { id: "nc-1", channel: "Push (iOS)", status: "Enabled", provider: "APNs", config: "Certificate uploaded", deliveryRate: "99.8%", lastFired: "2 min ago" },
  { id: "nc-2", channel: "Push (Android)", status: "Enabled", provider: "FCM", config: "Server key configured", deliveryRate: "99.6%", lastFired: "1 min ago" },
  { id: "nc-3", channel: "SMS", status: "Enabled", provider: "Africa's Talking", config: "API key, sender name", deliveryRate: "98.9%", lastFired: "5 min ago" },
  { id: "nc-4", channel: "Email", status: "Enabled", provider: "SendGrid", config: "API key, templates", deliveryRate: "97.2%", lastFired: "3 min ago" },
  { id: "nc-5", channel: "In-app", status: "Enabled", provider: "Built-in", config: "—", deliveryRate: "100%", lastFired: "Just now" },
  { id: "nc-6", channel: "Webhook", status: "Enabled", provider: "Custom", config: "Per-partner configuration", deliveryRate: "99.9%", lastFired: "10 min ago" },
  { id: "nc-7", channel: "WhatsApp", status: "Disabled", provider: "Twilio", config: "Template pending approval", deliveryRate: "—", lastFired: "Never" },
  { id: "nc-8", channel: "USSD", status: "Enabled", provider: "Safaricom", config: "Short code: *334#", deliveryRate: "99.1%", lastFired: "1 min ago" },
];

export const initialRates: RateLimit[] = [
  { id: "rl-1", endpoint: "Login attempts", limit: "5 per IP", window: "15 min", appliesTo: "All", status: "Active", blocked24h: "1,247" },
  { id: "rl-2", endpoint: "Transaction submission", limit: "10 per user", window: "1 min", appliesTo: "All", status: "Active", blocked24h: "342" },
  { id: "rl-3", endpoint: "API requests (general)", limit: "1000 per key", window: "1 min", appliesTo: "API users", status: "Active", blocked24h: "8,901" },
  { id: "rl-4", endpoint: "API requests (search)", limit: "100 per key", window: "1 min", appliesTo: "API users", status: "Active", blocked24h: "2,456" },
  { id: "rl-5", endpoint: "Password reset", limit: "3 per email", window: "1 hour", appliesTo: "All", status: "Active", blocked24h: "89" },
  { id: "rl-6", endpoint: "KYC submission", limit: "5 per user", window: "1 hour", appliesTo: "All", status: "Active", blocked24h: "12" },
  { id: "rl-7", endpoint: "Admin login", limit: "3 per IP", window: "15 min", appliesTo: "Admins", status: "Active", blocked24h: "234" },
  { id: "rl-8", endpoint: "Export requests", limit: "3 per admin", window: "1 hour", appliesTo: "Admins", status: "Active", blocked24h: "67" },
  { id: "rl-9", endpoint: "File upload", limit: "20 per user", window: "1 hour", appliesTo: "All", status: "Active", blocked24h: "156" },
  { id: "rl-10", endpoint: "OTP verification", limit: "5 per phone", window: "10 min", appliesTo: "All", status: "Active", blocked24h: "445" },
];

export const initialFeatures: FeatureToggle[] = [
  { id: "ft-1", feature: "Savings pockets", state: "Enabled", rollout: "100%", description: "Multiple savings goals", owner: "Product", lastToggled: "Aug 1, 2026" },
  { id: "ft-2", feature: "Virtual cards", state: "Enabled", rollout: "100%", description: "Instant virtual card issuance", owner: "Card Team", lastToggled: "Jul 15, 2026" },
  { id: "ft-3", feature: "Business accounts", state: "Enabled", rollout: "100%", description: "Multi-user business accounts", owner: "Product", lastToggled: "Jun 20, 2026" },
  { id: "ft-4", feature: "International transfers", state: "Enabled", rollout: "100%", description: "FX + cross-border", owner: "Payments", lastToggled: "Jul 1, 2026" },
  { id: "ft-5", feature: "New onboarding flow", state: "Beta", rollout: "20%", description: "A/B test — new UX", owner: "Product", lastToggled: "Aug 18, 2026" },
  { id: "ft-6", feature: "AI fraud detection v3.3", state: "Beta", rollout: "10%", description: "New ML model", owner: "ML Team", lastToggled: "Aug 20, 2026" },
  { id: "ft-7", feature: "PayLater (BNPL)", state: "Disabled", rollout: "0%", description: "Pending launch", owner: "Product", lastToggled: "Jul 10, 2026" },
  { id: "ft-8", feature: "Crypto wallet", state: "Disabled", rollout: "0%", description: "In development", owner: "Engineering", lastToggled: "Jun 1, 2026" },
  { id: "ft-9", feature: "Biometric payments", state: "Beta", rollout: "5%", description: "Face/fingerprint auth", owner: "Security", lastToggled: "Aug 22, 2026" },
  { id: "ft-10", feature: "Bill split feature", state: "Disabled", rollout: "0%", description: "Peer bill splitting", owner: "Product", lastToggled: "Aug 1, 2026" },
];

export const initialHistory: ChangeRecord[] = [
  { id: "ch-1", date: "Aug 22", admin: "Joseph M.", setting: "Maintenance window", oldValue: "Sat 2AM", newValue: "Sun 2AM", reason: "Lower traffic day", status: "Deployed" },
  { id: "ch-2", date: "Aug 20", admin: "Ops Manager", setting: "Push provider", oldValue: "Firebase", newValue: "FCM", reason: "Better delivery", status: "Deployed" },
  { id: "ch-3", date: "Aug 15", admin: "Joseph M.", setting: "Primary color", oldValue: "#2E7D32", newValue: "#1B5E20", reason: "Brand refresh", status: "Deployed" },
  { id: "ch-4", date: "Aug 10", admin: "Security Lead", setting: "TLS min version", oldValue: "1.2", newValue: "1.3", reason: "Security hardening", status: "Deployed" },
  { id: "ch-5", date: "Aug 5", admin: "Security Lead", setting: "Session duration", oldValue: "12h", newValue: "8h", reason: "Security review", status: "Deployed" },
  { id: "ch-6", date: "Aug 1", admin: "Joseph M.", setting: "Rate limit (API)", oldValue: "500/min", newValue: "1000/min", reason: "Increased capacity", status: "Deployed" },
  { id: "ch-7", date: "Jul 28", admin: "Ops Manager", setting: "SMS provider", oldValue: "Twilio", newValue: "Africa's Talking", reason: "Cost optimization", status: "Deployed" },
  { id: "ch-8", date: "Jul 25", admin: "Joseph M.", setting: "Email templates", oldValue: "v1.2", newValue: "v1.3", reason: "Brand refresh", status: "Deployed" },
];

export const initialBrand: BrandSetting[] = [
  { id: "br-1", name: "Primary color", value: "#1B5E20", icon: "bi-circle-fill" },
  { id: "br-2", name: "Secondary color", value: "#FFD600", icon: "bi-circle-fill" },
  { id: "br-3", name: "Logo (full)", value: "paymo-logo-full.svg", icon: "bi-image" },
  { id: "br-4", name: "Logo (icon)", value: "paymo-icon.svg", icon: "bi-image" },
  { id: "br-5", name: "Favicon", value: "paymo-favicon.ico", icon: "bi-app" },
  { id: "br-6", name: "SMS sender", value: "PayMo", icon: "bi-chat-text" },
  { id: "br-7", name: "White-label", value: "Disabled", icon: "bi-toggle-off" },
  { id: "br-8", name: "Email footer", value: "PayMo Digital Bank © 2026", icon: "bi-envelope" },
  { id: "br-9", name: "App splash screen", value: "paymo-splash.png", icon: "bi-phone" },
];

export const initialMaintenance: MaintenanceWindow[] = [
  { id: "mw-1", day: "Sunday", time: "2:00–4:00 AM EAT", message: "We're performing scheduled upgrades. We'll be back shortly.", notification: "Push + SMS · 1 hour before", killSessions: "Yes", adminAccess: "Yes", emergency: "Armed · requires 2FA" },
];

export const initialSecurityPolicies: SecurityPolicy[] = [
  { id: "sp-1", policy: "Password complexity", category: "Authentication", severity: "High", status: "Enforced", description: "Minimum 12 characters, uppercase, lowercase, number, symbol", lastEnforced: "Aug 10, 2026" },
  { id: "sp-2", policy: "MFA enforcement", category: "Authentication", severity: "Critical", status: "Enforced", description: "All admin accounts require TOTP-based 2FA", lastEnforced: "Jul 1, 2026" },
  { id: "sp-3", policy: "Session timeout", category: "Access Control", severity: "High", status: "Enforced", description: "Admin sessions expire after 8 hours of inactivity", lastEnforced: "Aug 5, 2026" },
  { id: "sp-4", policy: "IP allowlist", category: "Network", severity: "Medium", status: "Enforced", description: "Admin panel restricted to approved IP ranges", lastEnforced: "Jun 15, 2026" },
  { id: "sp-5", policy: "Data encryption at rest", category: "Data Protection", severity: "Critical", status: "Enforced", description: "AES-256 encryption for all sensitive data at rest", lastEnforced: "Jan 1, 2026" },
  { id: "sp-6", policy: "TLS minimum version", category: "Network", severity: "High", status: "Enforced", description: "TLS 1.3 minimum for all connections", lastEnforced: "Aug 10, 2026" },
  { id: "sp-7", policy: "API key rotation", category: "Access Control", severity: "Medium", status: "Enforced", description: "API keys must be rotated every 90 days", lastEnforced: "Jul 1, 2026" },
  { id: "sp-8", policy: "Audit log retention", category: "Compliance", severity: "High", status: "Enforced", description: "Audit logs retained for 365 days minimum", lastEnforced: "Jan 1, 2026" },
  { id: "sp-9", policy: "Data residency", category: "Compliance", severity: "Critical", status: "Enforced", description: "Customer data must remain within Kenya borders", lastEnforced: "Jan 1, 2026" },
  { id: "sp-10", policy: "Incident response SLA", category: "Compliance", severity: "Critical", status: "Enforced", description: "Critical incidents must be acknowledged within 15 minutes", lastEnforced: "Mar 1, 2026" },
];

export const initialApiKeys: ApiKey[] = [
  { id: "ak-1", name: "Partner Portal API", key: "pm_live_****_a3f8", type: "Live", status: "Active", permissions: "Read, Write", rateLimit: "1000/min", createdDate: "Jun 1, 2026", lastUsed: "2 min ago", expiresAt: "Sep 1, 2026" },
  { id: "ak-2", name: "Mobile App API", key: "pm_live_****_b7c2", type: "Live", status: "Active", permissions: "Read, Write, Admin", rateLimit: "5000/min", createdDate: "May 15, 2026", lastUsed: "Just now", expiresAt: "Aug 15, 2026" },
  { id: "ak-3", name: "Merchant Gateway", key: "pm_live_****_d9e1", type: "Live", status: "Active", permissions: "Read, Transactions", rateLimit: "2000/min", createdDate: "Jul 1, 2026", lastUsed: "5 min ago", expiresAt: "Oct 1, 2026" },
  { id: "ak-4", name: "Staging Test Key", key: "pm_test_****_f4a8", type: "Test", status: "Active", permissions: "Read, Write", rateLimit: "100/min", createdDate: "Aug 1, 2026", lastUsed: "1 hour ago", expiresAt: "Nov 1, 2026" },
  { id: "ak-5", name: "Legacy Integration", key: "pm_live_****_c2d5", type: "Live", status: "Revoked", permissions: "Read", rateLimit: "500/min", createdDate: "Feb 1, 2026", lastUsed: "30 days ago", expiresAt: "Expired" },
  { id: "ak-6", name: "Analytics Pipeline", key: "pm_live_****_e8f3", type: "Live", status: "Active", permissions: "Read only", rateLimit: "5000/min", createdDate: "Apr 10, 2026", lastUsed: "10 min ago", expiresAt: "Oct 10, 2026" },
];

export const initialSystemHealth: SystemHealth[] = [
  { id: "sh-1", service: "Core Banking API", status: "Healthy", uptime: "99.99%", latency: "45ms", lastCheck: "30s ago", incidents30d: "0", owner: "Platform Team" },
  { id: "sh-2", service: "Payment Gateway", status: "Healthy", uptime: "99.97%", latency: "120ms", lastCheck: "30s ago", incidents30d: "1", owner: "Payments" },
  { id: "sh-3", service: "Authentication Service", status: "Healthy", uptime: "99.99%", latency: "35ms", lastCheck: "30s ago", incidents30d: "0", owner: "Security" },
  { id: "sh-4", service: "Notification Service", status: "Degraded", uptime: "99.5%", latency: "850ms", lastCheck: "30s ago", incidents30d: "3", owner: "Platform Team" },
  { id: "sh-5", service: "KYC Verification", status: "Healthy", uptime: "99.8%", latency: "2.1s", lastCheck: "1 min ago", incidents30d: "2", owner: "Compliance" },
  { id: "sh-6", service: "Fraud Detection ML", status: "Healthy", uptime: "99.95%", latency: "180ms", lastCheck: "30s ago", incidents30d: "0", owner: "ML Team" },
  { id: "sh-7", service: "Database Cluster", status: "Healthy", uptime: "99.99%", latency: "12ms", lastCheck: "30s ago", incidents30d: "0", owner: "Platform Team" },
  { id: "sh-8", service: "CDN / Static Assets", status: "Healthy", uptime: "100%", latency: "8ms", lastCheck: "30s ago", incidents30d: "0", owner: "DevOps" },
  { id: "sh-9", service: "Email Delivery", status: "Healthy", uptime: "99.8%", latency: "1.5s", lastCheck: "1 min ago", incidents30d: "1", owner: "Platform Team" },
  { id: "sh-10", service: "SMS Gateway", status: "Healthy", uptime: "99.9%", latency: "3.2s", lastCheck: "1 min ago", incidents30d: "1", owner: "Platform Team" },
];

export const initialAuditLogs: AuditLogEntry[] = [
  { id: "al-1", timestamp: "Aug 27, 14:32", actor: "Joseph M.", action: "Updated", resource: "Maintenance window", details: "Changed from Saturday to Sunday", ip: "192.168.1.45", severity: "Info" },
  { id: "al-2", timestamp: "Aug 27, 14:15", actor: "Security Lead", action: "Locked", resource: "TLS min version", details: "Locked to prevent downgrade", ip: "10.0.0.22", severity: "Warning" },
  { id: "al-3", timestamp: "Aug 27, 13:45", actor: "Ops Manager", action: "Created", resource: "Notification channel", details: "Added WhatsApp via Twilio", ip: "172.16.0.8", severity: "Info" },
  { id: "al-4", timestamp: "Aug 27, 12:30", actor: "Joseph M.", action: "Deleted", resource: "API key", details: "Revoked legacy integration key", ip: "192.168.1.45", severity: "Warning" },
  { id: "al-5", timestamp: "Aug 27, 11:20", actor: "Security Lead", action: "Enforced", resource: "Password policy", details: "Updated minimum to 12 characters", ip: "10.0.0.22", severity: "Critical" },
  { id: "al-6", timestamp: "Aug 27, 10:00", actor: "System", action: "Rotated", resource: "API key", details: "Auto-rotated Mobile App API key", ip: "—", severity: "Info" },
  { id: "al-7", timestamp: "Aug 26, 16:45", actor: "Joseph M.", action: "Deployed", resource: "Feature toggle", details: "Enabled biometric payments at 5%", ip: "192.168.1.45", severity: "Info" },
  { id: "al-8", timestamp: "Aug 26, 14:30", actor: "Ops Manager", action: "Updated", resource: "Rate limit", details: "Increased API general to 1000/min", ip: "172.16.0.8", severity: "Info" },
  { id: "al-9", timestamp: "Aug 26, 11:15", actor: "Security Lead", action: "Blocked", resource: "IP range", details: "Blocked suspicious IP range 45.33.x.x", ip: "10.0.0.22", severity: "Critical" },
  { id: "al-10", timestamp: "Aug 25, 09:00", actor: "System", action: "Alert", resource: "Notification service", details: "Delivery rate dropped below 98%", ip: "—", severity: "Warning" },
];

export const initialDocuments: DocumentRecord[] = [
  {
    id: "doc-1", title: "Disaster Recovery Plan", type: "Runbook", status: "Active", version: "v3.1",
    author: "Joseph M.", lastUpdated: "Aug 15, 2026",
    content: "DISASTER RECOVERY PLAN\n\nPayMo Digital Bank Ltd\nVersion 3.1 — Effective {{date}}\n\n1. PURPOSE\nThis document outlines the disaster recovery procedures for all critical PayMo systems.\n\n2. SCOPE\nApplies to: Core Banking API, Payment Gateway, Authentication Service, Database Cluster.\n\n3. RPO / RTO TARGETS\nRecovery Point Objective: 15 minutes\nRecovery Time Objective: 2 hours\n\n4. FAILOVER PROCEDURE\nStep 1: Detect failure via monitoring alerts\nStep 2: Assess impact scope and affected services\nStep 3: Activate secondary region (eu-west-1)\nStep 4: Switch DNS records to secondary\nStep 5: Verify data consistency\nStep 6: Notify stakeholders\n\n5. CONTACTS\nIncident Commander: {{incidentCommander}}\nOn-call Engineer: {{onCallEngineer}}\nExecutive Sponsor: {{execSponsor}}"
  },
  {
    id: "doc-2", title: "Security Incident Response", type: "Policy", status: "Active", version: "v2.4",
    author: "Security Lead", lastUpdated: "Aug 10, 2026",
    content: "SECURITY INCIDENT RESPONSE PROCEDURE\n\nPayMo Digital Bank Ltd\nVersion 2.4 — Effective {{date}}\n\n1. CLASSIFICATION\nP1 — Critical: Data breach, unauthorized access\nP2 — High: Service compromise, malware\nP3 — Medium: Suspicious activity, policy violation\nP4 — Low: Vulnerability report, minor concern\n\n2. RESPONSE TIMELINES\nP1: Acknowledge within 15 min, contain within 1 hour\nP2: Acknowledge within 30 min, contain within 4 hours\nP3: Acknowledge within 4 hours, resolve within 24 hours\nP4: Acknowledge within 24 hours, resolve within 7 days\n\n3. NOTIFICATION CHAIN\n1. On-call Security Engineer\n2. Security Lead\n3. CTO\n4. CEO (P1 only)\n5. CBK (if regulatory breach)\n\n4. EVIDENCE PRESERVATION\nAll logs must be preserved for 90 days minimum.\nChain of custody must be maintained."
  },
  {
    id: "doc-3", title: "API Rate Limiting Guide", type: "Technical", status: "Active", version: "v1.8",
    author: "Platform Team", lastUpdated: "Aug 20, 2026",
    content: "API RATE LIMITING GUIDE\n\nPayMo Developer Documentation\nVersion 1.8\n\n1. OVERVIEW\nPayMo APIs enforce rate limits to ensure fair usage and platform stability.\n\n2. DEFAULT LIMITS\nGeneral API: 1000 requests/minute per key\nSearch API: 100 requests/minute per key\nTransaction API: 10 requests/minute per user\n\n3. RATE LIMIT HEADERS\nX-RateLimit-Limit: Maximum requests per window\nX-RateLimit-Remaining: Remaining requests\nX-RateLimit-Reset: Window reset timestamp\n\n4. HANDLING 429 RESPONSES\nImplement exponential backoff.\nStart with 1 second, double on each retry.\nMaximum 5 retries before circuit break.\n\n5. REQUESTING INCREASES\nContact: {{supportEmail}}\nInclude: Use case, expected volume, justification"
  },
  {
    id: "doc-4", title: "Change Management SOP", type: "SOP", status: "Active", version: "v4.0",
    author: "Ops Manager", lastUpdated: "Jul 28, 2026",
    content: "CHANGE MANAGEMENT STANDARD OPERATING PROCEDURE\n\nPayMo Digital Bank Ltd\nVersion 4.0 — Effective {{date}}\n\n1. PURPOSE\nEnsure all configuration and code changes follow a controlled process.\n\n2. CHANGE CATEGORIES\nStandard: Pre-approved, low-risk changes\nNormal: Changes requiring CAB review\nEmergency: Urgent changes requiring immediate action\n\n3. STANDARD CHANGE PROCESS\n1. Create change request\n2. Self-service approval for standard changes\n3. Deploy to staging\n4. Automated testing\n5. Deploy to production\n6. Verify and close\n\n4. NORMAL CHANGE PROCESS\n1. Create change request with impact assessment\n2. CAB review and approval\n3. Deploy to staging\n4. UAT sign-off\n5. Change window deployment\n6. Post-implementation review\n\n5. EMERGENCY CHANGE PROCESS\n1. Declare emergency\n2. Verbal approval from on-call director\n3. Deploy with monitoring\n4. Retroactive documentation within 24 hours"
  },
  {
    id: "doc-5", title: "Data Retention Policy", type: "Policy", status: "Active", version: "v2.1",
    author: "Compliance", lastUpdated: "Jun 15, 2026",
    content: "DATA RETENTION POLICY\n\nPayMo Digital Bank Ltd\nVersion 2.1 — Effective {{date}}\n\n1. PURPOSE\nDefine data retention periods in compliance with CBK regulations and data protection law.\n\n2. RETENTION PERIODS\nCustomer PII: Duration of relationship + 7 years\nTransaction records: 7 years from transaction date\nAudit logs: 365 days minimum\nSession logs: 90 days\nMarketing consent: Until withdrawal + 30 days\nSupport tickets: 2 years from resolution\n\n3. DELETION PROCEDURE\nAutomated deletion at expiry\n30-day warning before deletion\nEscalation to Data Protection Officer\nDeletion certificate generated\n\n4. LEGAL HOLDS\nAll deletion paused during active investigations.\nLegal team must notify within 24 hours."
  },
];

export const initialConfigTemplates: ConfigTemplate[] = [
  { id: "ct-1", name: "Production Baseline", category: "Environment", description: "Standard production configuration for PayMo platform", settingsCount: "47", lastApplied: "Aug 1, 2026", usageCount: "12" },
  { id: "ct-2", name: "Staging Default", category: "Environment", description: "Staging environment with relaxed rate limits", settingsCount: "42", lastApplied: "Jul 15, 2026", usageCount: "8" },
  { id: "ct-3", name: "High Security", category: "Security", description: "Hardened configuration with strictest security settings", settingsCount: "38", lastApplied: "Aug 10, 2026", usageCount: "3" },
  { id: "ct-4", name: "Partner Onboarding", category: "Integration", description: "Default configuration for new partner integrations", settingsCount: "25", lastApplied: "Jul 20, 2026", usageCount: "6" },
  { id: "ct-5", name: "GDPR Compliance", category: "Compliance", description: "Data protection and privacy configuration", settingsCount: "31", lastApplied: "Jun 1, 2026", usageCount: "2" },
  { id: "ct-6", name: "CBK Regulatory", category: "Compliance", description: "Central Bank of Kenya regulatory compliance settings", settingsCount: "44", lastApplied: "May 15, 2026", usageCount: "4" },
];

export const initialNotificationRules: NotificationRule[] = [
  { id: "nr-1", rule: "Transaction alert", trigger: "Any transaction > KES 1,000", channel: "Push + SMS", severity: "Info", status: "Active" },
  { id: "nr-2", rule: "Login from new device", trigger: "Unrecognized device fingerprint", channel: "Push + Email", severity: "Warning", status: "Active" },
  { id: "nr-3", rule: "Failed payment", trigger: "3+ consecutive payment failures", channel: "SMS", severity: "Warning", status: "Active" },
  { id: "nr-4", rule: "Large transfer", trigger: "Transfer > KES 100,000", channel: "Push + SMS + Email", severity: "Critical", status: "Active" },
  { id: "nr-5", rule: "KYC rejection", trigger: "KYC document rejected", channel: "Push + Email", severity: "Warning", status: "Active" },
  { id: "nr-6", rule: "System maintenance", trigger: "Maintenance window approaching", channel: "Push + SMS", severity: "Info", status: "Active" },
  { id: "nr-7", rule: "Fraud detection", trigger: "ML model flags transaction", channel: "Push + SMS + Email", severity: "Critical", status: "Active" },
  { id: "nr-8", rule: "Balance alert", trigger: "Balance below KES 500", channel: "Push", severity: "Info", status: "Active" },
];
