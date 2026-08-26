export interface AdminRecord {
  id: string;
  name: string;
  role: string;
  email: string;
  status: string;
  lastLogin: string;
  sessions: string;
  twoFA: string;
  passkey: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
  department?: string;
  phone?: string;
  joinDate?: string;
}

export interface SessionRecord {
  id: string;
  admin: string;
  sessionId: string;
  loginTime: string;
  ip: string;
  device: string;
  location: string;
  idle: string;
  expires: string;
}

export interface ActivityRecord {
  id: string;
  time: string;
  admin: string;
  action: string;
  target: string;
  details: string;
  ip: string;
}

export interface PermissionRecord {
  id: string;
  admin: string;
  role: string;
  permissions: string;
  lastModified: string;
  modifiedBy: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
}

export interface PerformanceRecord {
  id: string;
  admin: string;
  actions: string;
  usersManaged: string;
  ticketsResolved: string;
  sarsFiled: string;
  avgSession: string;
}

export interface OffboardRecord {
  id: string;
  admin: string;
  deactivationDate: string;
  reason: string;
  accessRevoked: string;
  dataExported: string;
  exitInterview: string;
}

export interface SecuritySetting {
  id: string;
  setting: string;
  value: string;
  scope: string;
  status: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
}

export interface RoleRecord {
  id: string;
  name: string;
  tier: string;
  admins: string;
  permissions: string;
  created: string;
  status: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
}

export interface InvitationRecord {
  id: string;
  email: string;
  role: string;
  invitedBy: string;
  sentDate: string;
  expiry: string;
  status: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
}

export interface AccessLogRecord {
  id: string;
  timestamp: string;
  admin: string;
  action: string;
  resource: string;
  result: string;
  ip: string;
  device: string;
}

export const initialAdmins: AdminRecord[] = [
  { id: "adm-1", name: "Jeckonia Kwasa", role: "Super Admin", email: "joseph@paymo.co.ke", status: "Active", lastLogin: "2 min ago", sessions: "1", twoFA: "Enabled", passkey: "Registered", department: "Platform", phone: "+254 700 100 001", joinDate: "Jan 2024" },
  { id: "adm-2", name: "Sarah Kiptoo", role: "Platform Admin", email: "sarah@paymo.co.ke", status: "Active", lastLogin: "15 min ago", sessions: "1", twoFA: "Enabled", passkey: "Registered", department: "Platform", phone: "+254 700 100 002", joinDate: "Mar 2024" },
  { id: "adm-3", name: "James Ochieng", role: "Operations Mgr", email: "james@paymo.co.ke", status: "Active", lastLogin: "1h ago", sessions: "1", twoFA: "Enabled", passkey: "Pending", department: "Operations", phone: "+254 700 100 003", joinDate: "Feb 2024" },
  { id: "adm-4", name: "Mary Wanjiku", role: "Finance Mgr", email: "mary@paymo.co.ke", status: "Active", lastLogin: "30 min ago", sessions: "1", twoFA: "Enabled", passkey: "Not registered", department: "Finance", phone: "+254 700 100 004", joinDate: "Apr 2024" },
  { id: "adm-5", name: "David Kimani", role: "Compliance Officer", email: "david@paymo.co.ke", status: "Active", lastLogin: "2h ago", sessions: "0", twoFA: "Enabled", passkey: "Registered", department: "Compliance", phone: "+254 700 100 005", joinDate: "May 2024" },
  { id: "adm-6", name: "Grace Muthoni", role: "Support Lead", email: "grace@paymo.co.ke", status: "Active", lastLogin: "45 min ago", sessions: "1", twoFA: "Enabled", passkey: "Not registered", department: "Support", phone: "+254 700 100 006", joinDate: "Jun 2024" },
  { id: "adm-7", name: "Peter Njoroge", role: "Minor Admin", email: "peter@paymo.co.ke", status: "Locked", lastLogin: "—", sessions: "0", twoFA: "Enabled", passkey: "Not registered", department: "Operations", phone: "+254 700 100 007", joinDate: "Aug 2024" },
  { id: "adm-8", name: "Jane Wambui", role: "Analyst", email: "jane@paymo.co.ke", status: "Active", lastLogin: "3h ago", sessions: "0", twoFA: "Enabled", passkey: "Not registered", department: "Analytics", phone: "+254 700 100 008", joinDate: "Jul 2024" },
  { id: "adm-9", name: "Samuel Kariuki", role: "Support Agent", email: "samuel@paymo.co.ke", status: "Active", lastLogin: "20 min ago", sessions: "1", twoFA: "Enabled", passkey: "Not registered", department: "Support", phone: "+254 700 100 009", joinDate: "Jul 2025" },
  { id: "adm-10", name: "Amina Hassan", role: "Risk Analyst", email: "amina@paymo.co.ke", status: "Active", lastLogin: "4h ago", sessions: "0", twoFA: "Enabled", passkey: "Registered", department: "Risk", phone: "+254 700 100 010", joinDate: "Sep 2024" },
];

export const initialSessions: SessionRecord[] = [
  { id: "ss-1", admin: "Joseph M.", sessionId: "S-8821", loginTime: "08:00", ip: "192.168.1.x", device: "MacBook Pro", location: "Nairobi", idle: "2 min", expires: "16:00" },
  { id: "ss-2", admin: "Sarah K.", sessionId: "S-8820", loginTime: "08:15", ip: "192.168.1.x", device: "iMac", location: "Nairobi", idle: "15 min", expires: "16:15" },
  { id: "ss-3", admin: "James O.", sessionId: "S-8819", loginTime: "07:30", ip: "192.168.1.x", device: "Dell Laptop", location: "Nairobi", idle: "1h", expires: "15:30" },
  { id: "ss-4", admin: "Grace M.", sessionId: "S-8818", loginTime: "08:30", ip: "41.x.x.x", device: "iPhone", location: "Nairobi", idle: "45 min", expires: "16:30" },
  { id: "ss-5", admin: "Samuel K.", sessionId: "S-8817", loginTime: "08:45", ip: "192.168.1.x", device: "Desktop PC", location: "Nairobi", idle: "20 min", expires: "16:45" },
];

export const initialActivity: ActivityRecord[] = [
  { id: "act-1", time: "14:32", admin: "Joseph M.", action: "Froze account", target: "User #89234", details: "Fraud suspicion", ip: "192.168.1.x" },
  { id: "act-2", time: "14:15", admin: "Sarah K.", action: "Approved settlement", target: "Partner #12", details: "KES 4.2M", ip: "192.168.1.x" },
  { id: "act-3", time: "13:45", admin: "James O.", action: "Updated fee schedule", target: "M-Pesa cashout", details: "2.0% → 1.75%", ip: "192.168.1.x" },
  { id: "act-4", time: "13:00", admin: "Mary W.", action: "Exported report", target: "Transaction ledger", details: "Aug data", ip: "192.168.1.x" },
  { id: "act-5", time: "12:30", admin: "David K.", action: "Filed SAR", target: "SAR-2026-035", details: "Structuring", ip: "192.168.1.x" },
  { id: "act-6", time: "12:00", admin: "Grace M.", action: "Resolved ticket", target: "#T-4523", details: "Balance query", ip: "41.x.x.x" },
  { id: "act-7", time: "11:30", admin: "Samuel K.", action: "Responded to user", target: "Ticket #T-4519", details: "KYC question", ip: "192.168.1.x" },
];

export const initialPermissions: PermissionRecord[] = [
  { id: "pm-1", admin: "Peter Njoroge", role: "Minor Admin", permissions: "View users, View transactions, Export data", lastModified: "Aug 1", modifiedBy: "Joseph M." },
  { id: "pm-2", admin: "Jane Wambui", role: "Analyst", permissions: "Read-only all (default)", lastModified: "Mar 2024", modifiedBy: "System" },
  { id: "pm-3", admin: "Samuel Kariuki", role: "Support Agent", permissions: "View users, View transactions, Respond to tickets", lastModified: "Jul 2025", modifiedBy: "Grace M." },
];

export const initialPerformance: PerformanceRecord[] = [
  { id: "pf-1", admin: "Joseph M.", actions: "234", usersManaged: "45", ticketsResolved: "0", sarsFiled: "0", avgSession: "6.2 hours" },
  { id: "pf-2", admin: "Sarah K.", actions: "456", usersManaged: "89", ticketsResolved: "23", sarsFiled: "2", avgSession: "7.1 hours" },
  { id: "pf-3", admin: "James O.", actions: "389", usersManaged: "67", ticketsResolved: "12", sarsFiled: "0", avgSession: "6.8 hours" },
  { id: "pf-4", admin: "Mary W.", actions: "312", usersManaged: "34", ticketsResolved: "0", sarsFiled: "0", avgSession: "5.4 hours" },
  { id: "pf-5", admin: "David K.", actions: "278", usersManaged: "56", ticketsResolved: "0", sarsFiled: "8", avgSession: "5.9 hours" },
  { id: "pf-6", admin: "Grace M.", actions: "534", usersManaged: "123", ticketsResolved: "456", sarsFiled: "0", avgSession: "7.8 hours" },
  { id: "pf-7", admin: "Samuel K.", actions: "678", usersManaged: "234", ticketsResolved: "567", sarsFiled: "0", avgSession: "8.1 hours" },
];

export const initialOffboarding: OffboardRecord[] = [
  { id: "of-1", admin: "Previous admin", deactivationDate: "Jul 15, 2026", reason: "Resigned", accessRevoked: "All", dataExported: "Yes", exitInterview: "Completed" },
  { id: "of-2", admin: "Previous admin", deactivationDate: "Jun 1, 2026", reason: "Terminated", accessRevoked: "All", dataExported: "Yes", exitInterview: "Completed" },
];

export const initialSecurity: SecuritySetting[] = [
  { id: "sec-1", setting: "Failed PIN lockout", value: "5 attempts · 30 minutes", scope: "All admins", status: "Live" },
  { id: "sec-2", setting: "Session duration", value: "8 hours", scope: "All admins", status: "Live" },
  { id: "sec-3", setting: "Approved IP ranges", value: "Nairobi office + VPN", scope: "Privileged roles", status: "Live" },
  { id: "sec-4", setting: "Passkey required", value: "Super Admin + Platform Admin", scope: "Tier 1–2", status: "Live" },
  { id: "sec-5", setting: "Step-up authentication", value: "Destructive actions + exports", scope: "All admins", status: "Live" },
  { id: "sec-6", setting: "Audit retention", value: "7 years", scope: "All activity", status: "Live" },
];

export const initialRoles: RoleRecord[] = [
  { id: "rl-1", name: "Super Admin", tier: "Tier 1", admins: "1", permissions: "Full platform access, kill switch, emergency controls", created: "Jan 2024", status: "Active" },
  { id: "rl-2", name: "Platform Admin", tier: "Tier 2", admins: "2", permissions: "All features except kill switch and emergency controls", created: "Jan 2024", status: "Active" },
  { id: "rl-3", name: "Operations Manager", tier: "Tier 3", admins: "1", permissions: "Users, transactions, settlements, fee config", created: "Feb 2024", status: "Active" },
  { id: "rl-4", name: "Finance Manager", tier: "Tier 3", admins: "1", permissions: "Reports, fees, settlements, exports", created: "Apr 2024", status: "Active" },
  { id: "rl-5", name: "Compliance Officer", tier: "Tier 3", admins: "1", permissions: "SARs, KYC, AML, audit trails", created: "May 2024", status: "Active" },
  { id: "rl-6", name: "Support Lead", tier: "Tier 4", admins: "1", permissions: "Tickets, users, reports, team management", created: "Jun 2024", status: "Active" },
  { id: "rl-7", name: "Minor Admin", tier: "Tier 5", admins: "1", permissions: "View users, view transactions, export data", created: "Aug 2024", status: "Active" },
  { id: "rl-8", name: "Analyst", tier: "Tier 6", admins: "1", permissions: "Read-only access to all data", created: "Jul 2024", status: "Active" },
  { id: "rl-9", name: "Support Agent", tier: "Tier 6", admins: "2", permissions: "View users, view transactions, respond to tickets", created: "Jul 2025", status: "Active" },
];

export const initialInvitations: InvitationRecord[] = [
  { id: "inv-1", email: "newadmin@paymo.co.ke", role: "Support Agent", invitedBy: "Grace M.", sentDate: "Aug 20", expiry: "Aug 27", status: "Pending" },
  { id: "inv-2", email: "contractor@partner.co.ke", role: "Analyst", invitedBy: "Sarah K.", sentDate: "Aug 18", expiry: "Aug 25", status: "Expired" },
  { id: "inv-3", email: "auditor@deloitte.co.ke", role: "Analyst", invitedBy: "David K.", sentDate: "Aug 15", expiry: "Sep 15", status: "Active" },
];

export const initialAccessLogs: AccessLogRecord[] = [
  { id: "al-1", timestamp: "14:32:01", admin: "Joseph M.", action: "Login", resource: "Admin UI", result: "Success", ip: "192.168.1.x", device: "MacBook Pro" },
  { id: "al-2", timestamp: "14:15:23", admin: "Sarah K.", action: "Export", resource: "Transaction report", result: "Success", ip: "192.168.1.x", device: "iMac" },
  { id: "al-3", timestamp: "13:45:12", admin: "James O.", action: "Update", resource: "Fee config", result: "Success", ip: "192.168.1.x", device: "Dell Laptop" },
  { id: "al-4", timestamp: "13:00:45", admin: "Mary W.", action: "Approve", resource: "Settlement SET-4456", result: "Success", ip: "192.168.1.x", device: "MacBook Air" },
  { id: "al-5", timestamp: "12:30:00", admin: "David K.", action: "Create", resource: "SAR-2026-035", result: "Success", ip: "192.168.1.x", device: "Desktop PC" },
  { id: "al-6", timestamp: "11:48:22", admin: "Grace M.", action: "Login", resource: "Admin UI", result: "Success", ip: "41.x.x.x", device: "iPhone" },
  { id: "al-7", timestamp: "10:44:31", admin: "System", action: "Reject", resource: "TXN-55123", result: "Failure", ip: "10.x.x.x", device: "System" },
  { id: "al-8", timestamp: "09:12:05", admin: "Peter N.", action: "Login", resource: "Admin UI", result: "Locked", ip: "192.168.1.x", device: "Desktop PC" },
];
