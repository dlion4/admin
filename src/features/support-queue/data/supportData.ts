export interface TicketRecord { id: string; ticketId: string; user: string; subject: string; category: string; priority: string; status: string; assigned: string; created: string; updated: string; sla: string; locked: boolean; lockedBy?: string; lockedAt?: string; lockReason?: string; }
export interface AgentRecord { id: string; name: string; active: string; resolved: string; avgResolution: string; firstResponse: string; csat: string; escalations: string; slaMet: string; locked: boolean; lockedBy?: string; lockedAt?: string; lockReason?: string; }
export interface CategoryRecord { id: string; name: string; percent: string; routeTo: string; autoResolve: string; avgHandle: string; locked: boolean; lockedBy?: string; lockedAt?: string; lockReason?: string; }
export interface MacroRecord { id: string; name: string; trigger: string; content: string; usage: string; avgSave: string; locked: boolean; lockedBy?: string; lockedAt?: string; lockReason?: string; }

export const initTickets: TicketRecord[] = [
  { id: "tk-001", ticketId: "T-4523", user: "PAY-12345", subject: "Wrong amount debited", category: "Transaction", priority: "Urgent", status: "In Progress", assigned: "Samuel K.", created: "14:20", updated: "14:25", sla: "12 min left", locked: false },
  { id: "tk-002", ticketId: "T-4522", user: "PAY-67890", subject: "Cannot verify KYC", category: "KYC", priority: "Normal", status: "Open", assigned: "Unassigned", created: "14:15", updated: "14:15", sla: "14 min left", locked: false },
  { id: "tk-003", ticketId: "T-4521", user: "PAY-89012", subject: "Loan not disbursed", category: "Loans", priority: "Normal", status: "In Progress", assigned: "Grace M.", created: "14:00", updated: "14:10", sla: "2 min left", locked: false },
  { id: "tk-004", ticketId: "T-4520", user: "PAY-11223", subject: "Card declined", category: "Cards", priority: "Urgent", status: "In Progress", assigned: "Samuel K.", created: "13:55", updated: "14:05", sla: "Breached", locked: false },
  { id: "tk-005", ticketId: "T-4519", user: "PAY-44556", subject: "Balance query", category: "General", priority: "Low", status: "Resolved", assigned: "Samuel K.", created: "13:30", updated: "13:35", sla: "Met", locked: false },
  { id: "tk-006", ticketId: "T-4518", user: "PAY-15002", subject: "Account locked", category: "Security", priority: "High", status: "Open", assigned: "Agnes W.", created: "13:20", updated: "13:21", sla: "18 min left", locked: false },
  { id: "tk-007", ticketId: "T-4517", user: "PAY-15003", subject: "Missing receipt", category: "Transaction", priority: "Normal", status: "In Progress", assigned: "John M.", created: "12:55", updated: "13:02", sla: "38 min left", locked: false },
  { id: "tk-008", ticketId: "T-4516", user: "PAY-15004", subject: "Update phone number", category: "Profile", priority: "Low", status: "Open", assigned: "Unassigned", created: "12:30", updated: "12:30", sla: "2h left", locked: false },
];

export const initAgents: AgentRecord[] = [
  { id: "ag-001", name: "Samuel K.", active: "2", resolved: "67", avgResolution: "4.2 min", firstResponse: "1.8 min", csat: "4.5/5", escalations: "3 (4.5%)", slaMet: "97%", locked: false },
  { id: "ag-002", name: "Agnes W.", active: "1", resolved: "54", avgResolution: "3.8 min", firstResponse: "1.5 min", csat: "4.6/5", escalations: "2 (3.7%)", slaMet: "98%", locked: false },
  { id: "ag-003", name: "John M.", active: "1", resolved: "48", avgResolution: "5.1 min", firstResponse: "2.2 min", csat: "4.3/5", escalations: "5 (10.4%)", slaMet: "94%", locked: false },
  { id: "ag-004", name: "Faith O.", active: "0", resolved: "42", avgResolution: "4.5 min", firstResponse: "1.9 min", csat: "4.4/5", escalations: "3 (7.1%)", slaMet: "96%", locked: false },
  { id: "ag-005", name: "Peter N.", active: "0", resolved: "38", avgResolution: "5.8 min", firstResponse: "2.8 min", csat: "4.1/5", escalations: "4 (10.5%)", slaMet: "92%", locked: false },
];

export const initCategories: CategoryRecord[] = [
  { id: "cat-001", name: "Transaction issues", percent: "34%", routeTo: "Transaction team", autoResolve: "25%", avgHandle: "5.2 min", locked: false },
  { id: "cat-002", name: "KYC / Verification", percent: "22%", routeTo: "KYC team", autoResolve: "15%", avgHandle: "8.4 min", locked: false },
  { id: "cat-003", name: "Loan queries", percent: "18%", routeTo: "Lending support", autoResolve: "20%", avgHandle: "6.1 min", locked: false },
  { id: "cat-004", name: "Card issues", percent: "12%", routeTo: "Card team", autoResolve: "18%", avgHandle: "7.3 min", locked: false },
  { id: "cat-005", name: "General / Balance", percent: "8%", routeTo: "Any available", autoResolve: "45%", avgHandle: "2.1 min", locked: false },
  { id: "cat-006", name: "App / Technical", percent: "4%", routeTo: "Tech support", autoResolve: "30%", avgHandle: "9.8 min", locked: false },
  { id: "cat-007", name: "Complaints", percent: "2%", routeTo: "Support Lead", autoResolve: "0%", avgHandle: "15.2 min", locked: false },
];

export const initMacros: MacroRecord[] = [
  { id: "mc-001", name: "Balance check", trigger: "balance / how much", content: "Your current balance is {{balance}}...", usage: "2,345", avgSave: "3 min", locked: false },
  { id: "mc-002", name: "KYC status", trigger: "kyc / verify", content: "Your KYC status is {{kyc_status}}...", usage: "1,890", avgSave: "5 min", locked: false },
  { id: "mc-003", name: "TXN status", trigger: "transaction / where is", content: "Transaction {{txn_id}} is {{status}}...", usage: "1,567", avgSave: "4 min", locked: false },
  { id: "mc-004", name: "Loan status", trigger: "loan / disbursed", content: "Your loan application is {{loan_status}}...", usage: "987", avgSave: "4 min", locked: false },
  { id: "mc-005", name: "Card issue", trigger: "card not working / declined", content: "Let me check your card status...", usage: "654", avgSave: "6 min", locked: false },
  { id: "mc-006", name: "Fee inquiry", trigger: "fee / charges", content: "The fee for this transaction is {{fee_rate}}...", usage: "543", avgSave: "2 min", locked: false },
];
