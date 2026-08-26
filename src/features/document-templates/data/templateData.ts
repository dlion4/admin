export interface TemplateRecord {
  id: string;
  name: string;
  category: string;
  format: string;
  lastModified: string;
  usedCount30d: string;
  owner: string;
  locked: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
  status: "Active" | "Draft" | "Under Review" | "Deprecated" | "Archived";
  version: string;
  description: string;
  body: string;
  variables: string[];
  approvalRoute: string;
  channels: string;
  createdAt: string;
  generationsTotal: number;
  successRate: string;
  avgGenTime: string;
}

export interface VariableRecord {
  id: string;
  variable: string;
  type: string;
  scope: string;
  exampleValue: string;
  status: "Active" | "Deprecated" | "Pending";
  locked: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
  createdAt: string;
}

export interface UsageRecord {
  id: string;
  templateName: string;
  used30d: string;
  generatedPdf: string;
  generatedEmail: string;
  generatedLetter: string;
  avgTime: string;
  locked: boolean;
  createdAt: string;
}

export interface DocumentRecord {
  id: string;
  templateName: string;
  generatedFor: string;
  date: string;
  format: string;
  status: "Generated" | "Sent" | "Failed" | "Pending";
  size: string;
  locked: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
}

export const initialTemplates: TemplateRecord[] = [
  {
    id: "tpl-001",
    name: "User warning letter",
    category: "User Communication",
    format: "PDF",
    lastModified: "Aug 2026",
    usedCount30d: "23",
    owner: "Compliance",
    locked: false,
    status: "Active",
    version: "v3.1",
    description: "Formal warning letter for account violations",
    body: "Dear {{user_name}},\n\nThis notice concerns your PayMo account {{user_account}}. Your account has been flagged for review due to unusual activity.\n\nThe relevant amount is {{amount}} as of {{date}}. Reference: {{reference_number}}.\n\nPlease contact our support team within 7 days to resolve this matter.\n\nRegards,\n{{signatory_name}}",
    variables: ["user_name", "user_account", "amount", "date", "reference_number", "signatory_name"],
    approvalRoute: "Legal + Super Admin",
    channels: "PDF",
    createdAt: "May 2026",
    generationsTotal: 234,
    successRate: "99.6%",
    avgGenTime: "2.1s",
  },
  {
    id: "tpl-002",
    name: "Account closure notice",
    category: "User Communication",
    format: "PDF",
    lastModified: "Jul 2026",
    usedCount30d: "18",
    owner: "Operations",
    locked: false,
    status: "Active",
    version: "v2.0",
    description: "Formal account closure notification",
    body: "Dear {{user_name}},\n\nWe regret to inform you that your PayMo account {{user_account}} will be closed effective {{date}}.\n\nAny remaining balance of {{balance}} will be transferred to your linked bank account within 5 business days.\n\nReference: {{reference_number}}\n\nRegards,\n{{signatory_name}}",
    variables: ["user_name", "user_account", "balance", "date", "reference_number", "signatory_name"],
    approvalRoute: "Legal + Super Admin",
    channels: "PDF",
    createdAt: "Apr 2026",
    generationsTotal: 182,
    successRate: "100%",
    avgGenTime: "2.5s",
  },
  {
    id: "tpl-003",
    name: "Fee change notification",
    category: "User Communication",
    format: "PDF + Email",
    lastModified: "Aug 2026",
    usedCount30d: "1 · broadcast",
    owner: "Finance",
    locked: true,
    lockedBy: "Super Admin",
    lockedAt: "Aug 20, 2026",
    lockReason: "Pending legal review of updated fee schedule",
    status: "Under Review",
    version: "v4.2",
    description: "Bulk notification for fee schedule changes",
    body: "Dear {{user_name}},\n\nWe are writing to inform you of changes to our fee schedule effective {{date}}.\n\nYour account {{user_account}} will be subject to the updated fee of {{fee}} per transaction.\n\nFor questions, contact {{signatory_name}}.\n\nRegards,\nPayMo Digital Bank Ltd",
    variables: ["user_name", "user_account", "fee", "date", "signatory_name"],
    approvalRoute: "Legal + Super Admin",
    channels: "PDF + Email",
    createdAt: "Jun 2026",
    generationsTotal: 148392,
    successRate: "99.9%",
    avgGenTime: "45s bulk",
  },
  {
    id: "tpl-004",
    name: "Loan default notice",
    category: "Lending",
    format: "PDF",
    lastModified: "Jun 2026",
    usedCount30d: "45",
    owner: "Lending",
    locked: false,
    status: "Active",
    version: "v2.3",
    description: "Formal notice for loan payment defaults",
    body: "Dear {{user_name}},\n\nYour loan account {{user_account}} is currently in default.\n\nOutstanding amount: {{amount}}\nDue date: {{date}}\nReference: {{reference_number}}\n\nPlease clear the outstanding balance within 14 days.\n\nRegards,\n{{signatory_name}}",
    variables: ["user_name", "user_account", "amount", "date", "reference_number", "signatory_name"],
    approvalRoute: "Legal + Super Admin",
    channels: "PDF",
    createdAt: "Mar 2026",
    generationsTotal: 456,
    successRate: "100%",
    avgGenTime: "3.2s",
  },
  {
    id: "tpl-005",
    name: "Loan demand letter",
    category: "Lending",
    format: "PDF",
    lastModified: "Jun 2026",
    usedCount30d: "12",
    owner: "Legal",
    locked: false,
    status: "Active",
    version: "v1.5",
    description: "Legal demand letter for outstanding loans",
    body: "Dear {{user_name}},\n\nThis is a formal demand for payment of {{amount}} owed under loan agreement {{user_account}}.\n\nPayment must be received within 30 days of {{date}}.\n\nFailure to comply may result in legal action.\n\nReference: {{reference_number}}\n\n{{signatory_name}}",
    variables: ["user_name", "user_account", "amount", "date", "reference_number", "signatory_name"],
    approvalRoute: "Legal + Super Admin",
    channels: "PDF",
    createdAt: "Apr 2026",
    generationsTotal: 123,
    successRate: "100%",
    avgGenTime: "2.8s",
  },
  {
    id: "tpl-006",
    name: "Partner agreement",
    category: "Partnerships",
    format: "Word + PDF",
    lastModified: "Jul 2026",
    usedCount30d: "2",
    owner: "Legal",
    locked: false,
    status: "Active",
    version: "v1.2",
    description: "Standard partnership agreement template",
    body: "PARTNERSHIP AGREEMENT\n\nBetween PayMo Digital Bank Ltd (\"Company\") and {{partner_name}} (\"Partner\")\n\nEffective Date: {{date}}\nReference: {{reference_number}}\n\n1. Scope of Partnership\n[Partnership terms]\n\n2. Revenue Share\n{{revenue_share}}\n\nApproved by:\n{{signatory_name}}",
    variables: ["partner_name", "date", "reference_number", "revenue_share", "signatory_name"],
    approvalRoute: "Legal + Super Admin",
    channels: "Word + PDF",
    createdAt: "May 2026",
    generationsTotal: 24,
    successRate: "100%",
    avgGenTime: "5.1s",
  },
  {
    id: "tpl-007",
    name: "NDA",
    category: "Legal",
    format: "Word + PDF",
    lastModified: "May 2026",
    usedCount30d: "5",
    owner: "Legal",
    locked: false,
    status: "Active",
    version: "v2.0",
    description: "Non-disclosure agreement for confidential information",
    body: "NON-DISCLOSURE AGREEMENT\n\nBetween PayMo Digital Bank Ltd and {{party_name}}\n\nEffective: {{date}}\nRef: {{reference_number}}\n\nThe receiving party agrees to maintain confidentiality of all proprietary information.\n\nDuration: 24 months from effective date.\n\n{{signatory_name}}",
    variables: ["party_name", "date", "reference_number", "signatory_name"],
    approvalRoute: "Legal + Super Admin",
    channels: "Word + PDF",
    createdAt: "Mar 2026",
    generationsTotal: 56,
    successRate: "100%",
    avgGenTime: "1.8s",
  },
  {
    id: "tpl-008",
    name: "Employee offer letter",
    category: "HR",
    format: "Word + PDF",
    lastModified: "Apr 2026",
    usedCount30d: "3",
    owner: "HR",
    locked: false,
    status: "Active",
    version: "v1.8",
    description: "Employment offer letter for new hires",
    body: "Dear {{candidate_name}},\n\nWe are pleased to offer you the position of {{job_title}} at PayMo Digital Bank Ltd.\n\nStart date: {{start_date}}\nSalary: {{salary}}\nReporting to: {{manager_name}}\n\nPlease sign and return by {{offer_deadline}}.\n\n{{signatory_name}}\nHR Director",
    variables: ["candidate_name", "job_title", "start_date", "salary", "manager_name", "offer_deadline", "signatory_name"],
    approvalRoute: "HR + Super Admin",
    channels: "Word + PDF",
    createdAt: "Jan 2026",
    generationsTotal: 34,
    successRate: "100%",
    avgGenTime: "2.0s",
  },
  {
    id: "tpl-009",
    name: "Board meeting minutes",
    category: "Governance",
    format: "Word + PDF",
    lastModified: "Aug 2026",
    usedCount30d: "1",
    owner: "Company Secretary",
    locked: false,
    status: "Active",
    version: "v3.0",
    description: "Template for board meeting minutes documentation",
    body: "BOARD MEETING MINUTES\n\nDate: {{date}}\nLocation: {{location}}\nChair: {{chair_name}}\n\nAttendees:\n{{attendees}}\n\nAgenda:\n{{agenda}}\n\nResolutions:\n{{resolutions}}\n\nNext meeting: {{next_meeting_date}}\n\nMinutes prepared by:\n{{signatory_name}}",
    variables: ["date", "location", "chair_name", "attendees", "agenda", "resolutions", "next_meeting_date", "signatory_name"],
    approvalRoute: "Company Secretary",
    channels: "Word + PDF",
    createdAt: "Feb 2026",
    generationsTotal: 12,
    successRate: "100%",
    avgGenTime: "5 min",
  },
  {
    id: "tpl-010",
    name: "Regulatory response letter",
    category: "Compliance",
    format: "PDF",
    lastModified: "Jul 2026",
    usedCount30d: "3",
    owner: "Legal",
    locked: false,
    status: "Active",
    version: "v1.4",
    description: "Formal response to regulatory inquiries",
    body: "Date: {{date}}\nRef: {{reference_number}}\n\nDear {{regulator_name}},\n\nRe: {{inquiry_reference}}\n\nIn response to your inquiry dated {{inquiry_date}}, please find our response below.\n\n[Response content]\n\nPlease do not hesitate to contact us for further information.\n\nRegards,\n{{signatory_name}}",
    variables: ["date", "reference_number", "regulator_name", "inquiry_reference", "inquiry_date", "signatory_name"],
    approvalRoute: "Legal + Compliance",
    channels: "PDF",
    createdAt: "Apr 2026",
    generationsTotal: 34,
    successRate: "100%",
    avgGenTime: "2.4s",
  },
  {
    id: "tpl-011",
    name: "Data breach notification",
    category: "Privacy",
    format: "PDF + Email",
    lastModified: "Mar 2026",
    usedCount30d: "0 · no breach",
    owner: "DPO",
    locked: true,
    lockedBy: "Super Admin",
    lockedAt: "Aug 15, 2026",
    lockReason: "Emergency template — locked until legal review complete",
    status: "Active",
    version: "v2.1",
    description: "Data breach notification per ODPC requirements",
    body: "NOTIFICATION OF PERSONAL DATA BREACH\n\nDate: {{date}}\nRef: {{reference_number}}\n\nDear {{user_name}},\n\nWe are writing to notify you of a personal data breach affecting your account {{user_account}}.\n\nBreach date: {{breach_date}}\nData affected: {{data_affected}}\n\nWe have taken immediate steps to contain the breach and protect your information.\n\nFor questions, contact our DPO at dpo@paymo.co.ke.\n\n{{signatory_name}}",
    variables: ["date", "reference_number", "user_name", "user_account", "breach_date", "data_affected", "signatory_name"],
    approvalRoute: "DPO + Legal + Super Admin",
    channels: "PDF + Email",
    createdAt: "Jan 2026",
    generationsTotal: 0,
    successRate: "—",
    avgGenTime: "—",
  },
  {
    id: "tpl-012",
    name: "Refund confirmation",
    category: "User Communication",
    format: "PDF",
    lastModified: "Aug 2026",
    usedCount30d: "34",
    owner: "Finance",
    locked: false,
    status: "Active",
    version: "v2.5",
    description: "Confirmation letter for processed refunds",
    body: "Dear {{user_name}},\n\nYour refund has been processed successfully.\n\nAmount: {{amount}}\nAccount: {{user_account}}\nDate: {{date}}\nReference: {{reference_number}}\n\nThe refund will be reflected in your account within 3-5 business days.\n\nRegards,\n{{signatory_name}}",
    variables: ["user_name", "user_account", "amount", "date", "reference_number", "signatory_name"],
    approvalRoute: "Finance + Super Admin",
    channels: "PDF",
    createdAt: "Jun 2026",
    generationsTotal: 342,
    successRate: "99.7%",
    avgGenTime: "1.8s",
  },
];

export const initialVariables: VariableRecord[] = [
  { id: "var-001", variable: "{{company_name}}", type: "System", scope: "All", exampleValue: "PayMo Digital Bank Ltd", status: "Active", locked: false, createdAt: "Jan 2026" },
  { id: "var-002", variable: "{{company_address}}", type: "System", scope: "All", exampleValue: "Westlands, Nairobi", status: "Active", locked: false, createdAt: "Jan 2026" },
  { id: "var-003", variable: "{{user_name}}", type: "User", scope: "User templates", exampleValue: "Joseph Kamau Mwangi", status: "Active", locked: false, createdAt: "Jan 2026" },
  { id: "var-004", variable: "{{user_account}}", type: "User", scope: "User templates", exampleValue: "PAY-12345-6789", status: "Active", locked: false, createdAt: "Jan 2026" },
  { id: "var-005", variable: "{{user_phone}}", type: "User", scope: "User templates", exampleValue: "+254 712 345 678", status: "Active", locked: false, createdAt: "Feb 2026" },
  { id: "var-006", variable: "{{user_kyc_tier}}", type: "User", scope: "User templates", exampleValue: "Tier 3", status: "Active", locked: false, createdAt: "Feb 2026" },
  { id: "var-007", variable: "{{balance}}", type: "Financial", scope: "Financial templates", exampleValue: "KES 45,230", status: "Active", locked: false, createdAt: "Mar 2026" },
  { id: "var-008", variable: "{{amount}}", type: "Financial", scope: "Financial templates", exampleValue: "KES 15,000", status: "Active", locked: false, createdAt: "Mar 2026" },
  { id: "var-009", variable: "{{fee}}", type: "Financial", scope: "Financial templates", exampleValue: "KES 225", status: "Active", locked: false, createdAt: "Mar 2026" },
  { id: "var-010", variable: "{{date}}", type: "System", scope: "All", exampleValue: "August 22, 2026", status: "Active", locked: false, createdAt: "Jan 2026" },
  { id: "var-011", variable: "{{reference_number}}", type: "System", scope: "All", exampleValue: "REF-2026-0822-001", status: "Active", locked: false, createdAt: "Jan 2026" },
  { id: "var-012", variable: "{{signatory_name}}", type: "System", scope: "All", exampleValue: "Jeckonia Kwasa, CEO", status: "Active", locked: false, createdAt: "Jan 2026" },
];

export const initialUsage: UsageRecord[] = [
  { id: "us-001", templateName: "Loan default notice", used30d: "45", generatedPdf: "45", generatedEmail: "0", generatedLetter: "0", avgTime: "3.2s", locked: false, createdAt: "Jun 2026" },
  { id: "us-002", templateName: "Refund confirmation", used30d: "34", generatedPdf: "34", generatedEmail: "34", generatedLetter: "0", avgTime: "1.8s", locked: false, createdAt: "Jun 2026" },
  { id: "us-003", templateName: "User warning letter", used30d: "23", generatedPdf: "23", generatedEmail: "0", generatedLetter: "23", avgTime: "2.1s", locked: false, createdAt: "May 2026" },
  { id: "us-004", templateName: "Account closure notice", used30d: "18", generatedPdf: "18", generatedEmail: "18", generatedLetter: "0", avgTime: "2.5s", locked: false, createdAt: "Apr 2026" },
  { id: "us-005", templateName: "Fee change notification", used30d: "1", generatedPdf: "1", generatedEmail: "148392", generatedLetter: "0", avgTime: "45s bulk", locked: false, createdAt: "Jun 2026" },
  { id: "us-006", templateName: "Board meeting minutes", used30d: "1", generatedPdf: "1", generatedEmail: "0", generatedLetter: "1", avgTime: "5 min", locked: false, createdAt: "Feb 2026" },
];

export const initialDocuments: DocumentRecord[] = [
  { id: "doc-001", templateName: "User warning letter", generatedFor: "PAY-55667", date: "Aug 22, 14:30", format: "PDF", status: "Sent", size: "45 KB", locked: false },
  { id: "doc-002", templateName: "User warning letter", generatedFor: "PAY-33445", date: "Aug 22, 11:15", format: "PDF", status: "Sent", size: "42 KB", locked: false },
  { id: "doc-003", templateName: "User warning letter", generatedFor: "PAY-11234", date: "Aug 21, 16:45", format: "PDF", status: "Sent", size: "44 KB", locked: false },
  { id: "doc-004", templateName: "Loan default notice", generatedFor: "PAY-77889", date: "Aug 20, 09:00", format: "PDF", status: "Sent", size: "38 KB", locked: false },
  { id: "doc-005", templateName: "Refund confirmation", generatedFor: "PAY-44556", date: "Aug 19, 14:20", format: "PDF", status: "Pending", size: "32 KB", locked: false },
  { id: "doc-006", templateName: "Account closure notice", generatedFor: "PAY-22334", date: "Aug 18, 11:00", format: "PDF", status: "Sent", size: "41 KB", locked: false },
  { id: "doc-007", templateName: "Fee change notification", generatedFor: "BROADCAST", date: "Aug 15, 08:00", format: "PDF + Email", status: "Sent", size: "148,392 emails", locked: false },
  { id: "doc-008", templateName: "Partner agreement", generatedFor: "Safaricom PLC", date: "Aug 14, 10:30", format: "Word + PDF", status: "Generated", size: "120 KB", locked: false },
  { id: "doc-009", templateName: "NDA", generatedFor: "Onfido Ltd", date: "Aug 12, 15:45", format: "Word + PDF", status: "Sent", size: "85 KB", locked: false },
  { id: "doc-010", templateName: "Employee offer letter", generatedFor: "James Mwangi", date: "Aug 10, 09:30", format: "Word + PDF", status: "Sent", size: "67 KB", locked: false },
  { id: "doc-011", templateName: "Regulatory response letter", generatedFor: "CBK", date: "Aug 8, 14:00", format: "PDF", status: "Sent", size: "55 KB", locked: false },
  { id: "doc-012", templateName: "Loan demand letter", generatedFor: "PAY-88990", date: "Aug 5, 11:15", format: "PDF", status: "Failed", size: "0 KB", locked: false },
];
