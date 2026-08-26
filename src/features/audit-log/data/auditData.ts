/* ================================================================
   Audit Log — Data Layer
   Complete admin-side data for every record, tab and modal
   ================================================================ */

export interface AuditEntry {
  id: string;
  timestamp: string;
  admin: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  ip: string;
  result: string;
  session: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
  severity?: string;
  source?: string;
}

export interface AuditFinding {
  id: string;
  finding: string;
  severity: string;
  details: string;
  recommendation: string;
  status?: string;
  assignedTo?: string;
  dueDate?: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
}

export interface LogSource {
  id: string;
  name: string;
  count: string;
  status: string;
  icon: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
  ingestionRate?: string;
  avgEventSize?: string;
  latency?: string;
  encryption?: string;
  retention?: string;
}

export interface AuditIncident {
  id: string;
  title: string;
  severity: string;
  status: string;
  detectedAt: string;
  source: string;
  sourceIp: string;
  target: string;
  description: string;
  assignedTo?: string;
  resolvedAt?: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
}

export interface AuditSession {
  id: string;
  admin: string;
  role: string;
  ip: string;
  location: string;
  startedAt: string;
  lastActive: string;
  mfaMethod: string;
  status: string;
  userAgent?: string;
  actions?: number;
  locked?: boolean;
}

export interface AuditAlertRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  threshold: string;
  action: string;
  recipients: string;
  status: string;
  lastTriggered?: string;
  locked?: boolean;
}

export interface SectionExport {
  id: string;
  section: string;
  description: string;
  recordCount: string;
  lastExported: string;
  format: string;
  encrypted: boolean;
  icon: string;
}

export interface AuditRetentionRule {
  id: string;
  name: string;
  scope: string;
  retention: string;
  archiveAfter: string;
  deleteAfter: string;
  encryption: string;
  status: string;
  locked?: boolean;
}

/* ===== ENHANCED AUDIT ENTRIES ===== */
export const initialLogs: AuditEntry[] = [
  { id: "al-1", timestamp: "14:32:01", admin: "Joseph M.", action: "Freeze", targetType: "User", targetId: "PAY-89234", details: "Fraud suspicion — velocity anomaly", ip: "192.168.1.42", result: "Success", session: "S-8821", severity: "High", source: "Admin UI" },
  { id: "al-2", timestamp: "14:15:23", admin: "Sarah K.", action: "Approve", targetType: "Settlement", targetId: "SET-4456", details: "Amount: KES 4.2M to Partner ABC", ip: "192.168.1.15", result: "Success", session: "S-8820", severity: "Info", source: "Admin UI" },
  { id: "al-3", timestamp: "13:45:12", admin: "James O.", action: "Update", targetType: "Fee Config", targetId: "FEE-MP-CO", details: "Rate: 2.0% → 1.75% for M-Pesa cashout", ip: "192.168.1.28", result: "Success", session: "S-8819", severity: "Medium", source: "Admin UI" },
  { id: "al-4", timestamp: "13:00:45", admin: "Mary W.", action: "Export", targetType: "Report", targetId: "RPT-TXN-AUG", details: "Excel · 1.2M rows · 14 MB", ip: "192.168.1.33", result: "Success", session: "S-8818", severity: "Medium", source: "Admin UI" },
  { id: "al-5", timestamp: "12:30:00", admin: "David K.", action: "Create", targetType: "SAR", targetId: "SAR-2026-035", details: "User PAY-55667 · KES 1.2M suspicious", ip: "192.168.1.51", result: "Success", session: "S-8817", severity: "High", source: "Admin UI" },
  { id: "al-6", timestamp: "11:48:22", admin: "Grace M.", action: "Update", targetType: "Ticket", targetId: "T-4523", details: "Status: open → resolved", ip: "41.90.123.45", result: "Success", session: "S-8816", severity: "Info", source: "Admin UI" },
  { id: "al-7", timestamp: "11:12:08", admin: "Samuel K.", action: "Login", targetType: "Admin", targetId: "ADM-009", details: "Passkey verified · MFA confirmed", ip: "192.168.1.60", result: "Success", session: "S-8815", severity: "Info", source: "Admin UI" },
  { id: "al-8", timestamp: "10:44:31", admin: "System", action: "Reject", targetType: "Transaction", targetId: "TXN-55123", details: "Velocity rule triggered · KES 850K", ip: "10.0.0.1", result: "Failure", session: "JOB-221", severity: "Critical", source: "Fraud engine" },
  { id: "al-9", timestamp: "09:30:15", admin: "Joseph M.", action: "Delete", targetType: "User", targetId: "PAY-78901", details: "GDPR erasure request fulfilled", ip: "192.168.1.42", result: "Success", session: "S-8814", severity: "Critical", source: "Admin UI" },
  { id: "al-10", timestamp: "08:15:42", admin: "System", action: "Alert", targetType: "Fraud", targetId: "ALT-887", details: "Velocity anomaly · 15 txns in 2 min", ip: "10.0.0.1", result: "Success", session: "JOB-220", severity: "Critical", source: "Fraud engine" },
  { id: "al-11", timestamp: "07:55:10", admin: "System", action: "Backup", targetType: "Database", targetId: "DB-AUG-27", details: "Daily backup completed · 12.4 GB", ip: "10.0.0.5", result: "Success", session: "JOB-219", severity: "Info", source: "Background jobs" },
  { id: "al-12", timestamp: "06:30:00", admin: "System", action: "Rotate", targetType: "API Key", targetId: "KEY-PROD-7", details: "Scheduled key rotation completed", ip: "10.0.0.1", result: "Success", session: "JOB-218", severity: "Info", source: "System" },
];

/* ===== ENHANCED FINDINGS ===== */
export const initialFindings: AuditFinding[] = [
  { id: "af-1", finding: "Over-privileged Minor Admin", severity: "Medium", details: "Peter N. has export + view permissions but no impersonate access, creating an inconsistent permission profile", recommendation: "Review quarterly — align with standard tier matrix", status: "Open", assignedTo: "Platform Security", dueDate: "Sep 20, 2026" },
  { id: "af-2", finding: "No SoD for fee changes", severity: "Medium", details: "Finance Manager can initiate + approve fee changes under KES 10M without dual approval", recommendation: "Add second approver for fee changes", status: "In progress", assignedTo: "Compliance", dueDate: "Sep 15, 2026" },
  { id: "af-3", finding: "Stale permissions", severity: "Low", details: "Jane W. had P&L access for 3 days before revocation was logged", recommendation: "Implement auto-expiry for time-limited grants", status: "Open", assignedTo: "Engineering", dueDate: "Oct 1, 2026" },
  { id: "af-4", finding: "Shared credentials risk", severity: "Medium", details: "2 support agents share a legacy login from migration period", recommendation: "Migrate to individual accounts immediately", status: "In progress", assignedTo: "Platform Security", dueDate: "Sep 10, 2026" },
  { id: "af-5", finding: "Incomplete MFA enrollment", severity: "High", details: "1 admin (Samuel K.) has not completed MFA enrollment within 30-day window", recommendation: "Enforce MFA or suspend account", status: "Open", assignedTo: "Compliance", dueDate: "Aug 30, 2026" },
  { id: "af-6", finding: "Excessive API rate limits", severity: "Low", details: "Partner API allows 10,000 req/min — industry standard is 1,000", recommendation: "Reduce to 1,000 req/min with burst allowance", status: "Closed", assignedTo: "Engineering", dueDate: "Jul 30, 2026" },
];

/* ===== ENHANCED SOURCES ===== */
export const initialSources: LogSource[] = [
  { id: "ls-1", name: "Admin UI", count: "34,502 today", status: "Healthy", icon: "bi-person-gear", ingestionRate: "14.2 events/sec", avgEventSize: "1.2 KB", latency: "< 50ms", encryption: "AES-256", retention: "7 years" },
  { id: "ls-2", name: "Public API", count: "18,442 today", status: "Healthy", icon: "bi-plug", ingestionRate: "8.7 events/sec", avgEventSize: "0.8 KB", latency: "< 30ms", encryption: "AES-256", retention: "7 years" },
  { id: "ls-3", name: "Background jobs", count: "14,890 today", status: "Healthy", icon: "bi-cpu", ingestionRate: "6.1 events/sec", avgEventSize: "2.4 KB", latency: "< 100ms", encryption: "AES-256", retention: "7 years" },
  { id: "ls-4", name: "Fraud engine", count: "6,320 today", status: "Healthy", icon: "bi-shield-check", ingestionRate: "3.2 events/sec", avgEventSize: "1.8 KB", latency: "< 20ms", encryption: "AES-256", retention: "10 years" },
  { id: "ls-5", name: "Finance ledger", count: "3,880 today", status: "Healthy", icon: "bi-cash-stack", ingestionRate: "2.1 events/sec", avgEventSize: "3.1 KB", latency: "< 40ms", encryption: "AES-256", retention: "10 years" },
  { id: "ls-6", name: "Database changes", count: "200 today", status: "Healthy", icon: "bi-database", ingestionRate: "0.3 events/sec", avgEventSize: "5.2 KB", latency: "< 60ms", encryption: "AES-256", retention: "7 years" },
];

/* ===== INCIDENTS ===== */
export const initialIncidents: AuditIncident[] = [
  { id: "inc-1", title: "Unauthorized API access attempt", severity: "Critical", status: "Under investigation", detectedAt: "Aug 27, 2026 14:15", source: "Public API", sourceIp: "41.90.123.45", target: "API key pk_live_****7823", description: "Failed authentication from non-approved IP range. API key blocked by WAF rule after 3 failed attempts.", assignedTo: "Joseph M." },
  { id: "inc-2", title: "Velocity fraud alert — bulk transfers", severity: "High", status: "Contained", detectedAt: "Aug 27, 2026 10:44", source: "Fraud engine", sourceIp: "10.0.0.1", target: "User PAY-55123", description: "15 transactions totaling KES 2.3M in 2 minutes from single account. Pattern matches known mule account behavior.", assignedTo: "David K." },
  { id: "inc-3", title: "Privilege escalation attempt", severity: "Critical", status: "Resolved", detectedAt: "Aug 26, 2026 22:30", source: "Admin UI", sourceIp: "192.168.1.99", target: "Role: Minor Admin", description: "Support Agent attempted to self-assign Minor Admin role through endpoint manipulation. Request blocked by RBAC middleware.", assignedTo: "Sarah K.", resolvedAt: "Aug 26, 2026 22:35" },
  { id: "inc-4", title: "Data export anomaly", severity: "Medium", status: "Monitoring", detectedAt: "Aug 25, 2026 16:20", source: "Admin UI", sourceIp: "192.168.1.33", target: "Export: User data", description: "Admin exported 1.2M user records outside normal business hours. Export size exceeds 30-day average by 400%.", assignedTo: "Compliance team" },
];

/* ===== SESSIONS ===== */
export const initialSessions: AuditSession[] = [
  { id: "s-1", admin: "Joseph Mwangi", role: "Super Admin", ip: "192.168.1.42", location: "Nairobi, Kenya", startedAt: "08:15 EAT", lastActive: "2 min ago", mfaMethod: "Hardware key", status: "Active", actions: 47, userAgent: "Chrome 128 · macOS" },
  { id: "s-2", admin: "Sarah Kamau", role: "Platform Admin", ip: "192.168.1.15", location: "Nairobi, Kenya", startedAt: "09:00 EAT", lastActive: "8 min ago", mfaMethod: "TOTP", status: "Active", actions: 23, userAgent: "Chrome 128 · Windows" },
  { id: "s-3", admin: "David Kimani", role: "Compliance Officer", ip: "192.168.1.51", location: "Mombasa, Kenya", startedAt: "10:30 EAT", lastActive: "15 min ago", mfaMethod: "Hardware key", status: "Active", actions: 12, userAgent: "Firefox 130 · Linux" },
  { id: "s-4", admin: "Grace Muthoni", role: "Operations Manager", ip: "41.90.123.45", location: "Nairobi, Kenya (VPN)", startedAt: "07:30 EAT", lastActive: "22 min ago", mfaMethod: "TOTP", status: "Active", actions: 31, userAgent: "Safari 19 · macOS" },
  { id: "s-5", admin: "Samuel Kariuki", role: "Support Agent", ip: "192.168.1.60", location: "Nairobi, Kenya", startedAt: "08:45 EAT", lastActive: "1 hour ago", mfaMethod: "Passkey", status: "Idle", actions: 8, userAgent: "Chrome 128 · Windows" },
  { id: "s-6", admin: "Peter Njoroge", role: "Minor Admin", ip: "192.168.1.77", location: "Nairobi, Kenya", startedAt: "11:00 EAT", lastActive: "3 hours ago", mfaMethod: "TOTP", status: "Expired", actions: 3, userAgent: "Chrome 128 · Windows" },
];

/* ===== ALERT RULES ===== */
export const initialAlertRules: AuditAlertRule[] = [
  { id: "ar-1", name: "Failed login threshold", description: "Alert when an admin exceeds failed login attempts", condition: "Failed logins > threshold", threshold: "5 attempts in 10 min", action: "Lock account + alert", recipients: "security@paymo.co.ke", status: "Active", lastTriggered: "Aug 25, 2026" },
  { id: "ar-2", name: "Privilege escalation", description: "Alert on any role or permission self-modification attempt", condition: "Role/perm change by non-Super Admin", threshold: "1 occurrence", action: "Block + alert immediately", recipients: "security@paymo.co.ke, joseph@paymo.co.ke", status: "Active", lastTriggered: "Aug 26, 2026" },
  { id: "ar-3", name: "Bulk data export", description: "Alert when export exceeds normal volume", condition: "Export > threshold rows", threshold: "100,000 rows", action: "Alert (15 min delay)", recipients: "compliance@paymo.co.ke", status: "Active", lastTriggered: "Aug 25, 2026" },
  { id: "ar-4", name: "Off-hours activity", description: "Alert on admin actions outside business hours", condition: "Action outside 06:00–22:00 EAT", threshold: "Any action", action: "Alert (immediate)", recipients: "security@paymo.co.ke", status: "Active", lastTriggered: "Aug 26, 2026" },
  { id: "ar-5", name: "Session anomaly", description: "Alert on impossible travel or concurrent sessions", condition: "Concurrent sessions > 2 or geo-anomaly", threshold: "2 concurrent sessions", action: "Alert + force logout", recipients: "security@paymo.co.ke", status: "Active", lastTriggered: "Aug 24, 2026" },
  { id: "ar-6", name: "High-value transaction", description: "Alert on settlements above threshold", condition: "Settlement amount > threshold", threshold: "KES 5,000,000", action: "Alert + require approval", recipients: "finance@paymo.co.ke", status: "Active", lastTriggered: "Aug 27, 2026" },
];

/* ===== SECTION EXPORTS ===== */
export const initialSectionExports: SectionExport[] = [
  { id: "se-1", section: "Users", description: "User accounts, profiles, KYC documents", recordCount: "245,832", lastExported: "Aug 20, 2026", format: "CSV + JSON", encrypted: true, icon: "bi-people" },
  { id: "se-2", section: "Transactions", description: "All transactions, payments, transfers", recordCount: "12,450,891", lastExported: "Aug 25, 2026", format: "CSV + JSON", encrypted: true, icon: "bi-arrow-left-right" },
  { id: "se-3", section: "Settlements", description: "Settlement batches, partner payouts", recordCount: "89,234", lastExported: "Aug 25, 2026", format: "CSV", encrypted: true, icon: "bi-bank" },
  { id: "se-4", section: "KYC Records", description: "Identity verification documents and status", recordCount: "198,445", lastExported: "Aug 15, 2026", format: "CSV + PDF", encrypted: true, icon: "bi-person-check" },
  { id: "se-5", section: "Partners", description: "Partner accounts, contracts, fee schedules", recordCount: "156", lastExported: "Aug 10, 2026", format: "JSON", encrypted: true, icon: "bi-handshake" },
  { id: "se-6", section: "Fee Configuration", description: "Fee schedules, rates, tiers", recordCount: "89", lastExported: "Aug 22, 2026", format: "JSON", encrypted: false, icon: "bi-percent" },
  { id: "se-7", section: "SARs", description: "Suspicious activity reports and filings", recordCount: "35", lastExported: "Aug 20, 2026", format: "PDF + CSV", encrypted: true, icon: "bi-flag" },
  { id: "se-8", section: "Support Tickets", description: "Customer support tickets and resolutions", recordCount: "45,891", lastExported: "Aug 24, 2026", format: "CSV", encrypted: false, icon: "bi-headset" },
  { id: "se-9", section: "Audit Trail", description: "Immutable audit log entries", recordCount: "2,340,000", lastExported: "Aug 26, 2026", format: "Signed JSON + CSV", encrypted: true, icon: "bi-list-check" },
  { id: "se-10", section: "Fraud Alerts", description: "Fraud detection alerts and investigations", recordCount: "1,234", lastExported: "Aug 25, 2026", format: "CSV + JSON", encrypted: true, icon: "bi-shield-exclamation" },
  { id: "se-11", section: "Admin Activity", description: "Admin login, logout, and action history", recordCount: "78,234", lastExported: "Aug 27, 2026", format: "CSV", encrypted: true, icon: "bi-person-gear" },
  { id: "se-12", section: "System Config", description: "Platform configuration and feature flags", recordCount: "234", lastExported: "Aug 15, 2026", format: "JSON", encrypted: false, icon: "bi-gear" },
];

/* ===== RETENTION RULES ===== */
export const initialRetentionRules: AuditRetentionRule[] = [
  { id: "rr-1", name: "Financial audit trail", scope: "Transactions, settlements, ledger", retention: "10 years", archiveAfter: "1 year", deleteAfter: "Never", encryption: "AES-256 + HSM", status: "Active" },
  { id: "rr-2", name: "Admin activity logs", scope: "Login, actions, permission changes", retention: "7 years", archiveAfter: "6 months", deleteAfter: "Never", encryption: "AES-256", status: "Active" },
  { id: "rr-3", name: "KYC documents", scope: "Identity docs, verification images", retention: "7 years", archiveAfter: "1 year", deleteAfter: "After regulatory period", encryption: "AES-256 + HSM", status: "Active" },
  { id: "rr-4", name: "Support tickets", scope: "Tickets, chat logs, call recordings", retention: "3 years", archiveAfter: "6 months", deleteAfter: "3 years", encryption: "AES-256", status: "Active" },
  { id: "rr-5", name: "System events", scope: "API logs, job outputs, health checks", retention: "1 year", archiveAfter: "3 months", deleteAfter: "1 year", encryption: "Standard", status: "Active" },
  { id: "rr-6", name: "Fraud investigations", scope: "Alerts, investigation notes, SARs", retention: "10 years", archiveAfter: "2 years", deleteAfter: "Never", encryption: "AES-256 + HSM", status: "Active" },
];
