/* ================================================================
   Permission & Role — Data Layer
   Complete admin-side data for every record, tab and modal
   ================================================================ */

export interface RoleRecord {
  id: string;
  name: string;
  tier: string;
  created: string;
  admins: string;
  lastModified: string;
  deletionPolicy: string;
  status: string;
  description?: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
  permissionCount?: number;
  lastAccessReview?: string;
}

export interface PermChangeRecord {
  id: string;
  date: string;
  admin: string;
  role: string;
  permission: string;
  change: string;
  reason: string;
  approvedBy?: string;
  status?: string;
  locked?: boolean;
}

export interface AuditRecord {
  id: string;
  date: string;
  reviewer: string;
  scope: string;
  findings: string;
  status: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
  duration?: string;
  adminsReviewed?: string;
}

export interface PolicyRecord {
  id: string;
  name: string;
  rule: string;
  scope: string;
  status: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
  severity?: string;
  lastEnforced?: string;
}

export interface TemplateRecord {
  id: string;
  name: string;
  basedOn: string;
  permissions: string;
  usageCount: string;
  created: string;
  status: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
}

export interface AdminAssignment {
  id: string;
  name: string;
  email: string;
  role: string;
  tier: string;
  status: string;
  lastActive: string;
  mfaEnabled: boolean;
  sessionsActive: number;
  joinedDate: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
  permissions?: string;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  severity: string;
  category: string;
  event: string;
  admin: string;
  ip: string;
  status: string;
  details?: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
}

export interface EmergencyAccess {
  id: string;
  admin: string;
  reason: string;
  requestedAt: string;
  expiresAt: string;
  status: string;
  approvedBy?: string;
  scope?: string;
  locked?: boolean;
}

export interface RoleDocument {
  id: string;
  name: string;
  type: string;
  role: string;
  status: string;
  version: string;
  created: string;
  updatedBy: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  content?: string;
  classification?: string;
  fileSize?: string;
}

/* ===== ROLES ===== */
export const initialRoles: RoleRecord[] = [
  { id: "r-1", name: "Super Admin", tier: "Tier 0", created: "Jan 2024", admins: "2", lastModified: "—", deletionPolicy: "Protected", status: "System", description: "Full platform access with kill switch and emergency controls", permissionCount: 80, lastAccessReview: "Aug 22, 2026" },
  { id: "r-2", name: "Platform Admin", tier: "Tier 1", created: "Jan 2024", admins: "1", lastModified: "Aug 2026", deletionPolicy: "Protected", status: "System", description: "All features except kill switch and emergency controls", permissionCount: 72, lastAccessReview: "Aug 22, 2026" },
  { id: "r-3", name: "Operations Manager", tier: "Tier 2", created: "Jan 2024", admins: "1", lastModified: "—", deletionPolicy: "Protected", status: "System", description: "Users, transactions, settlements, fee config", permissionCount: 58, lastAccessReview: "Jul 15, 2026" },
  { id: "r-4", name: "Compliance Officer", tier: "Tier 3", created: "Jan 2024", admins: "1", lastModified: "—", deletionPolicy: "Protected", status: "System", description: "SARs, KYC, AML, audit trails", permissionCount: 45, lastAccessReview: "Jul 15, 2026" },
  { id: "r-5", name: "Finance Manager", tier: "Tier 4", created: "Jan 2024", admins: "1", lastModified: "—", deletionPolicy: "Protected", status: "System", description: "Reports, fees, settlements, exports", permissionCount: 40, lastAccessReview: "Jul 1, 2026" },
  { id: "r-6", name: "Support Lead", tier: "Tier 5", created: "Jan 2024", admins: "1", lastModified: "—", deletionPolicy: "Protected", status: "System", description: "Tickets, users, reports, team management", permissionCount: 32, lastAccessReview: "Jun 15, 2026" },
  { id: "r-7", name: "Minor Admin (Custom)", tier: "Tier 6", created: "Jan 2024", admins: "1", lastModified: "Aug 2026", deletionPolicy: "Can delete", status: "Custom", description: "Limited admin with view + export permissions", permissionCount: 18, lastAccessReview: "Aug 22, 2026" },
  { id: "r-8", name: "Analyst", tier: "Tier 7", created: "Jan 2024", admins: "1", lastModified: "—", deletionPolicy: "Protected", status: "System", description: "Read-only access to all data", permissionCount: 12, lastAccessReview: "Jun 1, 2026" },
  { id: "r-9", name: "Support Agent", tier: "Tier 8", created: "Jan 2024", admins: "2", lastModified: "—", deletionPolicy: "Protected", status: "System", description: "View users, view transactions, respond to tickets", permissionCount: 10, lastAccessReview: "Jun 1, 2026" },
  { id: "r-10", name: "Read-Only Viewer", tier: "Tier 9", created: "Mar 2024", admins: "0", lastModified: "—", deletionPolicy: "Can delete", status: "Custom", description: "Minimal read-only access for auditors", permissionCount: 5, lastAccessReview: "May 15, 2026" },
  { id: "r-11", name: "Regional Manager", tier: "Tier 6", created: "Jun 2026", admins: "1", lastModified: "Aug 2026", deletionPolicy: "Can delete", status: "Custom", description: "Regional operations with geo-scoped access", permissionCount: 28, lastAccessReview: "Aug 10, 2026" },
  { id: "r-12", name: "Risk Analyst", tier: "Tier 7", created: "May 2026", admins: "1", lastModified: "—", deletionPolicy: "Can delete", status: "Custom", description: "Fraud detection and risk scoring access", permissionCount: 22, lastAccessReview: "Jul 20, 2026" },
];

/* ===== PERMISSION CHANGES ===== */
export const initialChanges: PermChangeRecord[] = [
  { id: "pc-1", date: "Aug 22", admin: "Joseph M.", role: "Minor Admin", permission: "Impersonate user", change: "Revoked", reason: "Security review", approvedBy: "Super Admin", status: "Deployed" },
  { id: "pc-2", date: "Aug 15", admin: "Joseph M.", role: "Minor Admin", permission: "Export user data", change: "Granted", reason: "Business need", approvedBy: "Super Admin", status: "Deployed" },
  { id: "pc-3", date: "Aug 1", admin: "Joseph M.", role: "Support Agent", permission: "View risk scores", change: "Granted", reason: "Better fraud awareness", approvedBy: "Platform Admin", status: "Deployed" },
  { id: "pc-4", date: "Jul 15", admin: "Joseph M.", role: "Analyst", permission: "View P&L", change: "Revoked", reason: "Least privilege", approvedBy: "Super Admin", status: "Deployed" },
  { id: "pc-5", date: "Jul 1", admin: "Sarah K.", role: "Finance Manager", permission: "Approve refunds", change: "Granted", reason: "Operational need", approvedBy: "Super Admin", status: "Deployed" },
  { id: "pc-6", date: "Jun 20", admin: "Joseph M.", role: "Operations Manager", permission: "Manage blacklist", change: "Granted", reason: "Fraud response speed", approvedBy: "Super Admin", status: "Deployed" },
  { id: "pc-7", date: "Aug 25", admin: "Joseph M.", role: "Regional Manager", permission: "View regional analytics", change: "Granted", reason: "Regional oversight", approvedBy: "Platform Admin", status: "Pending" },
  { id: "pc-8", date: "Aug 20", admin: "Sarah K.", role: "Risk Analyst", permission: "Configure fraud rules", change: "Revoked", reason: "Temporary restriction", approvedBy: "Super Admin", status: "Pending" },
  { id: "pc-9", date: "Aug 18", admin: "Joseph M.", role: "Support Lead", permission: "Escalate to compliance", change: "Granted", reason: "Faster escalation path", approvedBy: "Super Admin", status: "Deployed" },
  { id: "pc-10", date: "Aug 10", admin: "David K.", role: "Minor Admin", permission: "View settlements", change: "Granted", reason: "Finance reporting", approvedBy: "Platform Admin", status: "Deployed" },
];

/* ===== AUDITS ===== */
export const initialAudits: AuditRecord[] = [
  { id: "au-1", date: "Aug 22", reviewer: "Joseph M.", scope: "Full access review", findings: "Minor Admin over-privileged", status: "Remediated", duration: "2 hours", adminsReviewed: "8" },
  { id: "au-2", date: "Jul 15", reviewer: "Sarah K.", scope: "Finance permissions", findings: "No issues found", status: "Passed", duration: "1 hour", adminsReviewed: "4" },
  { id: "au-3", date: "Jun 1", reviewer: "David K.", scope: "Support roles", findings: "2 shared credentials", status: "In progress", duration: "3 hours", adminsReviewed: "6" },
  { id: "au-4", date: "May 15", reviewer: "Joseph M.", scope: "Tier 0-2 privileged", findings: "All accounts compliant", status: "Passed", duration: "4 hours", adminsReviewed: "3" },
  { id: "au-5", date: "Apr 1", reviewer: "Sarah K.", scope: "Annual compliance", findings: "1 inactive account found", status: "Remediated", duration: "6 hours", adminsReviewed: "12" },
];

/* ===== POLICIES ===== */
export const initialPolicies: PolicyRecord[] = [
  { id: "pol-1", name: "Least privilege default", rule: "New roles start with minimum permissions", scope: "All roles", status: "Active", severity: "Critical", lastEnforced: "Always" },
  { id: "pol-2", name: "Dual approval for destructive", rule: "2 Super Admins must approve destructive actions", scope: "Tier 0–2", status: "Active", severity: "Critical", lastEnforced: "Aug 22, 2026" },
  { id: "pol-3", name: "Annual access review", rule: "All admin access reviewed yearly", scope: "All admins", status: "Active", severity: "High", lastEnforced: "Jul 15, 2026" },
  { id: "pol-4", name: "Separation of duties", rule: "Initiator ≠ Approver for financial ops", scope: "Finance roles", status: "Active", severity: "Critical", lastEnforced: "Always" },
  { id: "pol-5", name: "Session timeout", rule: "8 hour max session, 30 min idle timeout", scope: "All admins", status: "Active", severity: "Medium", lastEnforced: "Always" },
  { id: "pol-6", name: "IP restriction", rule: "Office + VPN only for Tier 0–2", scope: "Privileged roles", status: "Active", severity: "High", lastEnforced: "Always" },
  { id: "pol-7", name: "MFA enforcement", rule: "All admins must use TOTP or hardware key", scope: "All admins", status: "Active", severity: "Critical", lastEnforced: "Always" },
  { id: "pol-8", name: "Privilege escalation logging", rule: "All privilege changes logged with SHA-256 hash", scope: "All roles", status: "Active", severity: "High", lastEnforced: "Always" },
];

/* ===== TEMPLATES ===== */
export const initialTemplates: TemplateRecord[] = [
  { id: "t-1", name: "Standard Support", basedOn: "Support Agent", permissions: "View users, View transactions, Respond to tickets", usageCount: "2", created: "Jan 2024", status: "Active" },
  { id: "t-2", name: "Read-Only Auditor", basedOn: "Analyst", permissions: "Read-only all data", usageCount: "1", created: "Mar 2024", status: "Active" },
  { id: "t-3", name: "Finance Limited", basedOn: "Finance Manager", permissions: "View P&L, View balance sheet, View reports", usageCount: "0", created: "May 2024", status: "Draft" },
  { id: "t-4", name: "Compliance Standard", basedOn: "Compliance Officer", permissions: "View SARs, View KYC, View audit trails", usageCount: "1", created: "Apr 2024", status: "Active" },
  { id: "t-5", name: "Fraud Analyst", basedOn: "Risk Analyst", permissions: "View fraud dashboard, View risk scores, Review alerts", usageCount: "1", created: "Jun 2026", status: "Active" },
];

/* ===== ADMIN ASSIGNMENTS ===== */
export const initialAdmins: AdminAssignment[] = [
  { id: "a-1", name: "Joseph Mwangi", email: "joseph@paymo.com", role: "Super Admin", tier: "Tier 0", status: "Active", lastActive: "2 min ago", mfaEnabled: true, sessionsActive: 2, joinedDate: "Jan 2024", permissions: "Full access" },
  { id: "a-2", name: "Sarah Kamau", email: "sarah@paymo.com", role: "Platform Admin", tier: "Tier 1", status: "Active", lastActive: "15 min ago", mfaEnabled: true, sessionsActive: 1, joinedDate: "Jan 2024", permissions: "All except kill switch" },
  { id: "a-3", name: "David Kimani", email: "david@paymo.com", role: "Compliance Officer", tier: "Tier 3", status: "Active", lastActive: "1 hour ago", mfaEnabled: true, sessionsActive: 1, joinedDate: "Feb 2024", permissions: "SARs, KYC, AML" },
  { id: "a-4", name: "Peter Njoroge", email: "peter@paymo.com", role: "Minor Admin", tier: "Tier 6", status: "Active", lastActive: "3 hours ago", mfaEnabled: true, sessionsActive: 0, joinedDate: "May 2024", permissions: "View users, Export data" },
  { id: "a-5", name: "Jane Wambui", email: "jane@paymo.com", role: "Analyst", tier: "Tier 7", status: "Active", lastActive: "1 day ago", mfaEnabled: true, sessionsActive: 0, joinedDate: "Mar 2024", permissions: "Read-only all data" },
  { id: "a-6", name: "Samuel Kariuki", email: "samuel@paymo.com", role: "Support Agent", tier: "Tier 8", status: "Active", lastActive: "30 min ago", mfaEnabled: false, sessionsActive: 1, joinedDate: "Jun 2024", permissions: "View users, View transactions" },
  { id: "a-7", name: "Amina Hassan", email: "amina@paymo.com", role: "Risk Analyst", tier: "Tier 7", status: "Active", lastActive: "2 hours ago", mfaEnabled: true, sessionsActive: 1, joinedDate: "Jul 2026", permissions: "Fraud detection, Risk scoring" },
  { id: "a-8", name: "Kevin Ochieng", email: "kevin@paymo.com", role: "Support Agent", tier: "Tier 8", status: "Suspended", lastActive: "30 days ago", mfaEnabled: true, sessionsActive: 0, joinedDate: "Aug 2024", locked: true, lockedBy: "Joseph M.", lockedAt: "Aug 15, 2026", lockReason: "Account suspended — security investigation", permissions: "View users" },
  { id: "a-9", name: "Grace Muthoni", email: "grace@paymo.com", role: "Operations Manager", tier: "Tier 2", status: "Active", lastActive: "5 min ago", mfaEnabled: true, sessionsActive: 1, joinedDate: "Jan 2024", permissions: "Users, Transactions, Settlements" },
  { id: "a-10", name: "Brian Odhiambo", email: "brian@paymo.com", role: "Read-Only Viewer", tier: "Tier 9", status: "Invited", lastActive: "—", mfaEnabled: false, sessionsActive: 0, joinedDate: "Aug 2026", permissions: "Read-only" },
];

/* ===== SECURITY EVENTS ===== */
export const initialSecurityEvents: SecurityEvent[] = [
  { id: "se-1", timestamp: "14:32:01", severity: "Medium", category: "Permission Change", event: "Impersonate user revoked for Minor Admin", admin: "Joseph M.", ip: "192.168.1.10", status: "Resolved" },
  { id: "se-2", timestamp: "14:15:23", severity: "High", category: "Privilege Escalation", event: "Export user data granted — PII export capability", admin: "Joseph M.", ip: "192.168.1.10", status: "Resolved" },
  { id: "se-3", timestamp: "13:45:12", severity: "Low", category: "Role Creation", event: "New custom role 'Regional Manager' created", admin: "Joseph M.", ip: "192.168.1.10", status: "Resolved" },
  { id: "se-4", timestamp: "12:30:00", severity: "Medium", category: "Admin Assignment", event: "Samuel K. assigned to Support Agent role", admin: "Joseph M.", ip: "10.0.0.15", status: "Resolved" },
  { id: "se-5", timestamp: "11:48:22", severity: "High", category: "Session Anomaly", event: "Multiple failed login attempts — Kevin O.", admin: "System", ip: "203.0.113.42", status: "Investigating" },
  { id: "se-6", timestamp: "10:12:05", severity: "Critical", category: "Emergency Access", event: "Emergency access requested by Amina H.", admin: "Amina H.", ip: "172.16.0.5", status: "Pending approval" },
  { id: "se-7", timestamp: "09:30:00", severity: "Low", category: "MFA", event: "MFA enrollment confirmed — Brian O.", admin: "Brian O.", ip: "192.168.2.20", status: "Resolved" },
  { id: "se-8", timestamp: "08:15:33", severity: "Medium", category: "Policy Violation", event: "Session exceeded idle timeout — Jane W.", admin: "System", ip: "10.0.0.22", status: "Auto-resolved" },
];

/* ===== EMERGENCY ACCESS ===== */
export const initialEmergencyAccess: EmergencyAccess[] = [
  { id: "ea-1", admin: "Amina Hassan", reason: "Critical fraud incident — immediate investigation needed", requestedAt: "Aug 26, 2026 10:12", expiresAt: "Aug 26, 2026 22:12", status: "Pending", scope: "Full fraud dashboard access" },
  { id: "ea-2", admin: "David Kimani", reason: "Regulatory deadline — SAR filing due today", requestedAt: "Aug 22, 2026 09:00", expiresAt: "Aug 22, 2026 18:00", status: "Approved", approvedBy: "Joseph M.", scope: "Full compliance suite" },
  { id: "ea-3", admin: "Peter Njoroge", reason: "System outage — server recovery required", requestedAt: "Aug 15, 2026 03:00", expiresAt: "Aug 15, 2026 09:00", status: "Expired", approvedBy: "Joseph M.", scope: "System configuration" },
  { id: "ea-4", admin: "Jane Wambui", reason: "Quarterly report due — missing data access", requestedAt: "Aug 10, 2026 14:00", expiresAt: "Aug 10, 2026 20:00", status: "Approved", approvedBy: "Sarah K.", scope: "Finance reports" },
];

/* ===== ROLE DOCUMENTS ===== */
export const initialDocuments: RoleDocument[] = [
  { id: "doc-1", name: "Super Admin Access Policy", type: "Policy", role: "Super Admin", status: "Active", version: "v3.2", created: "Jan 2024", updatedBy: "Joseph M.", classification: "Confidential", fileSize: "245 KB",
    content: "PAYMO DIGITAL BANK LTD\nSuper Admin Access Policy\n\nDocument ID: POL-SADMIN-001\nVersion: 3.2 | Effective: Aug 1, 2026\nClassification: CONFIDENTIAL\n\n1. PURPOSE\nThis policy defines the access control framework for Super Administrators of the PayMo Digital Bank platform, ensuring least-privilege enforcement and dual-approval for destructive operations.\n\n2. SCOPE\nThis policy applies to all users granted Tier 0 (Super Admin) access, including but not limited to:\n- Platform administrators\n- Emergency response personnel\n- System architects with production access\n\n3. ACCESS REQUIREMENTS\n3.1 Multi-Factor Authentication\nAll Super Admin accounts MUST use hardware security keys or TOTP authenticators.\n3.2 Session Management\nMaximum session duration: 8 hours\nIdle timeout: 30 minutes\nConcurrent sessions: Maximum 2\n3.3 Network Restrictions\nAccess restricted to office network and approved VPN endpoints.\n\n4. APPROVAL MATRIX\nGrant Tier 0: Super Admin + 2FA + Board notification\nRevoke Tier 0: Super Admin + 2FA (immediate)\nEmergency access: Dual Super Admin + 4-hour limit\n\n5. AUDIT REQUIREMENTS\nAll Super Admin actions are logged with SHA-256 hashing.\nQuarterly access reviews mandatory.\nAnnual penetration testing required.\n\n6. ENFORCEMENT\nViolations result in immediate access revocation.\nSecurity incidents trigger emergency review protocol.\n\nApproved by: Jeckonia Kwasa, CEO\nNext review: Nov 1, 2026" },
  },
  { id: "doc-2", name: "Role Hierarchy Guide", type: "Guide", role: "All roles", status: "Active", version: "v2.1", created: "Mar 2024", updatedBy: "Sarah K.", classification: "Internal", fileSize: "180 KB",
    content: "PAYMO DIGITAL BANK LTD\nRole Hierarchy Guide\n\nDocument ID: GUD-HIER-001\nVersion: 2.1 | Effective: Jun 1, 2026\nClassification: INTERNAL\n\n1. OVERVIEW\nPayMo uses a hierarchical Role-Based Access Control (RBAC) system with 10 tier levels.\n\n2. TIER STRUCTURE\nTier 0 — Super Admin: Full platform access, emergency controls\nTier 1 — Platform Admin: All features except kill switch\nTier 2 — Operations Manager: Users, transactions, settlements\nTier 3 — Compliance Officer: SARs, KYC, AML, audit trails\nTier 4 — Finance Manager: Reports, fees, settlements, exports\nTier 5 — Support Lead: Tickets, users, reports, team management\nTier 6 — Custom Admin: Configurable per business need\nTier 7 — Analyst: Read-only access to data\nTier 8 — Support Agent: Limited user/transaction view\nTier 9 — Read-Only Viewer: Minimal access for auditors\n\n3. PERMISSION ASSIGNMENT\n- Tier 0-2: Requires dual Super Admin approval\n- Tier 3-5: Requires Super Admin approval\n- Tier 6-9: Requires Super Admin approval\n\n4. ESCALATION PATH\nTier 8 → Tier 5 → Tier 2 → Tier 1 → Tier 0\n\nApproved by: Jeckonia Kwasa, CEO" },
  { id: "doc-3", name: "Emergency Access Protocol", type: "Protocol", role: "Super Admin", status: "Active", version: "v1.4", created: "Feb 2024", updatedBy: "Joseph M.", classification: "Secret", fileSize: "320 KB",
    content: "PAYMO DIGITAL BANK LTD\nEmergency Access Protocol\n\nDocument ID: PRO-EAP-001\nVersion: 1.4 | Effective: Jul 1, 2026\nClassification: SECRET\n\n1. PURPOSE\nThis protocol defines the procedure for granting temporary elevated access during critical incidents.\n\n2. ELIGIBILITY\nOnly Tier 0-3 administrators may request emergency access.\nAll requests require dual approval from Tier 0 administrators.\n\n3. REQUEST PROCESS\nStep 1: Submit emergency access request with justification\nStep 2: System notifies all Tier 0 administrators\nStep 3: Two Tier 0 admins must approve within 15 minutes\nStep 4: Access granted with 4-hour maximum duration\nStep 5: Automatic revocation at expiry\n\n4. MONITORING\nAll emergency access actions are logged in real-time.\nSecurity team receives immediate notification.\nPost-incident review required within 48 hours.\n\n5. VIOLATIONS\nUnauthorized emergency access triggers immediate lockdown.\nInvestigation initiated by Security Operations Center.\n\nApproved by: Jeckonia Kwasa, CEO\nEmergency Contact: +254-700-000-000" },
  },
  { id: "doc-4", name: "Permission Grant Checklist", type: "Checklist", role: "All roles", status: "Active", version: "v1.0", created: "Apr 2024", updatedBy: "David K.", classification: "Internal", fileSize: "95 KB",
    content: "PAYMO DIGITAL BANK LTD\nPermission Grant Checklist\n\nDocument ID: CHK-PGR-001\nVersion: 1.0 | Effective: Apr 1, 2026\nClassification: INTERNAL\n\nPre-grant checklist for all permission changes:\n\n☐ Business justification documented\n☐ Least-privilege assessment completed\n☐ Approval from appropriate authority\n☐ 2FA confirmation verified\n☐ Audit log entry created\n☐ Impact assessment reviewed\n☐ Data scope limitations defined\n☐ Review date scheduled\n☐ Admin training updated\n☐ Emergency revocation plan prepared\n\nPost-grant verification:\n☐ Permission active in production\n☐ Admin notified of new access\n☐ Access review date confirmed\n☐ Monitoring rules updated" },
  },
  { id: "doc-5", name: "Offboarding Procedures", type: "Protocol", role: "All roles", status: "Active", version: "v2.0", created: "Jun 2024", updatedBy: "Sarah K.", classification: "Confidential", fileSize: "210 KB",
    content: "PAYMO DIGITAL BANK LTD\nAdmin Offboarding Procedures\n\nDocument ID: PRO-OFF-001\nVersion: 2.0 | Effective: Jun 1, 2026\nClassification: CONFIDENTIAL\n\n1. INITIATION\nHR or manager submits offboarding request.\n\n2. ACCESS REVOCATION (Immediate)\n- Disable all active sessions\n- Revoke MFA credentials\n- Remove from all role assignments\n- Disable API keys\n\n3. DATA HANDOVER\n- Transfer pending approvals to manager\n- Reassign open tickets\n- Archive personal admin notes\n- Document ongoing investigations\n\n4. AUDIT\n- Generate access summary report\n- Log all revocation actions\n- Archive audit trail\n- Notify compliance team\n\n5. CONFIRMATION\n- System access confirmed revoked\n- All assets returned\n- Non-disclosure agreement on file\n- Exit interview completed\n\nApproved by: Jeckonia Kwasa, CEO" },
  { id: "doc-6", name: "MFA Configuration Guide", type: "Guide", role: "All roles", status: "Active", version: "v1.2", created: "May 2024", updatedBy: "Joseph M.", classification: "Internal", fileSize: "150 KB",
    content: "PAYMO DIGITAL BANK LTD\nMFA Configuration Guide\n\nDocument ID: GUD-MFA-001\nVersion: 1.2 | Effective: May 15, 2026\nClassification: INTERNAL\n\n1. SUPPORTED METHODS\n- TOTP Authenticator (Google Authenticator, Authy)\n- Hardware Security Key (YubiKey 5)\n- Backup codes (10 single-use codes)\n\n2. ENROLLMENT\nStep 1: Navigate to Security Settings\nStep 2: Select MFA method\nStep 3: Scan QR code or register key\nStep 4: Enter verification code\nStep 5: Save backup codes securely\n\n3. REQUIREMENTS\n- Tier 0-2: Hardware key mandatory\n- Tier 3-5: TOTP or hardware key\n- Tier 6-9: TOTP recommended\n\n4. RECOVERY\nLost device: Contact Super Admin\nLost backup codes: Identity verification required\nKey compromise: Immediate rotation\n\nApproved by: Jeckonia Kwasa, CEO" },
];

/* ===== PERMISSION CATEGORIES ===== */
export const categories: Record<string, string[]> = {
  USERS: ["View user list", "View user detail", "Edit user profile", "Freeze account", "Unfreeze account", "Close account", "Impersonate user", "Delete user", "Adjust user limits", "Grant/revoke VIP", "Export user data", "View login history"],
  TRANSACTIONS: ["View all transactions", "Reverse transaction", "Approve high-value", "Set fee schedule", "Override fee", "Set withdrawal limits", "Export transactions", "Hold transaction", "Batch process"],
  "FRAUD & RISK": ["View fraud dashboard", "Block transaction", "Flag user", "Blacklist user", "Review alerts", "Manage blacklist", "Configure rules", "File SAR", "View risk scores"],
  FINANCE: ["View P&L", "View balance sheet", "Approve settlements", "Manage pools", "Set tax rates", "Manage charges", "Manage reserves", "Approve refunds", "View investor data"],
  PARTNERS: ["View partners", "Onboard partner", "Suspend partner", "Set partner fees", "View partner transactions", "Manage partner API"],
  SYSTEM: ["Manage admins", "View audit log", "Configure system", "Manage roles", "API key management", "Database access", "Feature flags", "View error logs", "Manage webhooks", "Backup management"],
  COMMUNICATIONS: ["Send broadcast", "Manage notifications", "View support queue", "Respond to tickets", "Manage templates"],
  DOCUMENTS: ["View documents", "Edit documents", "Publish documents", "Manage templates"],
  REPORTING: ["View analytics", "Create reports", "Export reports", "Schedule reports", "View investor reports"],
};
