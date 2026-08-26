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
}

export interface AuditFinding {
  id: string;
  finding: string;
  severity: string;
  details: string;
  recommendation: string;
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
}

export const initialLogs: AuditEntry[] = [
  { id: "al-1", timestamp: "14:32:01", admin: "Joseph M.", action: "Freeze", targetType: "User", targetId: "PAY-89234", details: "Fraud suspicion", ip: "192.168.1.x", result: "Success", session: "S-8821" },
  { id: "al-2", timestamp: "14:15:23", admin: "Sarah K.", action: "Approve", targetType: "Settlement", targetId: "SET-4456", details: "Amount: KES 4.2M", ip: "192.168.1.x", result: "Success", session: "S-8820" },
  { id: "al-3", timestamp: "13:45:12", admin: "James O.", action: "Update", targetType: "Fee Config", targetId: "FEE-MP-CO", details: "Rate: 2.0% → 1.75%", ip: "192.168.1.x", result: "Success", session: "S-8819" },
  { id: "al-4", timestamp: "13:00:45", admin: "Mary W.", action: "Export", targetType: "Report", targetId: "RPT-TXN-AUG", details: "Excel · 1.2M rows", ip: "192.168.1.x", result: "Success", session: "S-8818" },
  { id: "al-5", timestamp: "12:30:00", admin: "David K.", action: "Create", targetType: "SAR", targetId: "SAR-2026-035", details: "User PAY-55667 · KES 1.2M", ip: "192.168.1.x", result: "Success", session: "S-8817" },
  { id: "al-6", timestamp: "11:48:22", admin: "Grace M.", action: "Update", targetType: "Ticket", targetId: "T-4523", details: "Status: resolved", ip: "41.x.x.x", result: "Success", session: "S-8816" },
  { id: "al-7", timestamp: "11:12:08", admin: "Samuel K.", action: "Login", targetType: "Admin", targetId: "ADM-009", details: "Passkey verified", ip: "192.168.1.x", result: "Success", session: "S-8815" },
  { id: "al-8", timestamp: "10:44:31", admin: "System", action: "Reject", targetType: "Transaction", targetId: "TXN-55123", details: "Velocity rule triggered", ip: "10.x.x.x", result: "Failure", session: "JOB-221" },
  { id: "al-9", timestamp: "09:30:15", admin: "Joseph M.", action: "Delete", targetType: "User", targetId: "PAY-78901", details: "GDPR erasure request", ip: "192.168.1.x", result: "Success", session: "S-8814" },
  { id: "al-10", timestamp: "08:15:42", admin: "System", action: "Alert", targetType: "Fraud", targetId: "ALT-887", details: "Velocity anomaly detected", ip: "10.x.x.x", result: "Success", session: "JOB-220" },
];

export const initialFindings: AuditFinding[] = [
  { id: "af-1", finding: "Over-privileged Minor Admin", severity: "Medium", details: "Peter N. has export + view but no impersonate access", recommendation: "Review quarterly" },
  { id: "af-2", finding: "No SoD for fee changes", severity: "Medium", details: "Finance Manager can initiate + approve under KES 10M", recommendation: "Add second approver" },
  { id: "af-3", finding: "Stale permissions", severity: "Low", details: "Jane W. had P&L access before revocation", recommendation: "Implement auto-expiry" },
  { id: "af-4", finding: "Shared credentials risk", severity: "Medium", details: "2 support agents share a legacy login", recommendation: "Migrate to individual" },
];

export const initialSources: LogSource[] = [
  { id: "ls-1", name: "Admin UI", count: "34,502 today", status: "Healthy", icon: "bi-person-gear" },
  { id: "ls-2", name: "Public API", count: "18,442 today", status: "Healthy", icon: "bi-plug" },
  { id: "ls-3", name: "Background jobs", count: "14,890 today", status: "Healthy", icon: "bi-cpu" },
  { id: "ls-4", name: "Fraud engine", count: "6,320 today", status: "Healthy", icon: "bi-shield-check" },
  { id: "ls-5", name: "Finance ledger", count: "3,880 today", status: "Healthy", icon: "bi-cash-stack" },
  { id: "ls-6", name: "Database changes", count: "200 today", status: "Healthy", icon: "bi-database" },
];
