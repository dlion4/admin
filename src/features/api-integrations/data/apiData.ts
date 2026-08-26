export interface ApiKeyRecord {
  id: string;
  name: string;
  key: string;
  createdBy: string;
  created: string;
  permissions: string;
  lastUsed: string;
  status: string;
  rateLimit: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
  description?: string;
}

export interface UsageRecord {
  id: string;
  key: string;
  requests: string;
  errors: string;
  avgLatency: string;
  p95Latency: string;
  p99Latency: string;
}

export interface EndpointRecord {
  id: string;
  category: string;
  count: string;
  avgLatency: string;
  authMethod: string;
}

export interface WebhookRecord {
  id: string;
  name: string;
  url: string;
  events: string;
  successRate: string;
  lastDelivery: string;
  status: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
}

export interface IntegrationRecord {
  id: string;
  provider: string;
  purpose: string;
  status: string;
  uptime: string;
  sla: string;
  contractEnd: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
}

export interface ErrorRecord {
  id: string;
  code: string;
  count: string;
  share: string;
  topEndpoint: string;
  rootCause: string;
}

export const initialKeys: ApiKeyRecord[] = [
  { id: "k-1", name: "Production — Main", key: "pk_live_****...7823", createdBy: "Joseph M.", created: "Jan 2024", permissions: "Full access", lastUsed: "2 min ago", status: "Active", rateLimit: "10K/min" },
  { id: "k-2", name: "Production — Partner API", key: "pk_live_****...4567", createdBy: "Joseph M.", created: "Mar 2024", permissions: "Partner scope", lastUsed: "5 min ago", status: "Active", rateLimit: "5K/min" },
  { id: "k-3", name: "Staging — Testing", key: "pk_test_****...1234", createdBy: "Joseph M.", created: "Jan 2024", permissions: "Full access", lastUsed: "1h ago", status: "Active", rateLimit: "1K/min" },
  { id: "k-4", name: "QuickLend — Loan", key: "pk_live_****...9012", createdBy: "Joseph M.", created: "Jun 2025", permissions: "Loan scope only", lastUsed: "2 days ago", status: "Suspended", rateLimit: "500/min" },
  { id: "k-5", name: "Internal — Batch", key: "pk_live_****...5678", createdBy: "Joseph M.", created: "Feb 2024", permissions: "Batch + export", lastUsed: "30 min ago", status: "Active", rateLimit: "2K/min" },
];

export const initialUsage: UsageRecord[] = [
  { id: "u-1", key: "Production — Main", requests: "2,345,678", errors: "234 (0.01%)", avgLatency: "45ms", p95Latency: "120ms", p99Latency: "340ms" },
  { id: "u-2", key: "Production — Partner", requests: "890,123", errors: "89 (0.01%)", avgLatency: "78ms", p95Latency: "200ms", p99Latency: "560ms" },
  { id: "u-3", key: "Staging — Testing", requests: "45,678", errors: "12 (0.03%)", avgLatency: "120ms", p95Latency: "340ms", p99Latency: "890ms" },
  { id: "u-4", key: "Internal — Batch", requests: "234,567", errors: "0 (0%)", avgLatency: "200ms", p95Latency: "450ms", p99Latency: "1.2s" },
];

export const initialEndpoints: EndpointRecord[] = [
  { id: "e-1", category: "Authentication", count: "5", avgLatency: "120ms", authMethod: "API key + secret" },
  { id: "e-2", category: "Users", count: "12", avgLatency: "85ms", authMethod: "API key" },
  { id: "e-3", category: "Transactions", count: "15", avgLatency: "45ms", authMethod: "API key" },
  { id: "e-4", category: "Transfers", count: "8", avgLatency: "180ms", authMethod: "API key + 2FA > KES 100K" },
  { id: "e-5", category: "Cards", count: "10", avgLatency: "120ms", authMethod: "API key" },
  { id: "e-6", category: "Loans", count: "8", avgLatency: "200ms", authMethod: "API key" },
  { id: "e-7", category: "Bill payments", count: "6", avgLatency: "340ms", authMethod: "API key" },
  { id: "e-8", category: "KYC", count: "5", avgLatency: "450ms", authMethod: "API key" },
  { id: "e-9", category: "Webhooks", count: "3", avgLatency: "—", authMethod: "HMAC signature" },
  { id: "e-10", category: "Utilities", count: "4", avgLatency: "50ms", authMethod: "API key" },
];

export const initialWebhooks: WebhookRecord[] = [
  { id: "w-1", name: "QuickLend — Loan Status", url: "api.quicklend.co.ke/webhook", events: "loan.disbursed, loan.repaid", successRate: "98.5%", lastDelivery: "5 min ago", status: "Suspended" },
  { id: "w-2", name: "Corporate — TXN Alert", url: "api.corp.paymo.co.ke/webhook", events: "transaction.*", successRate: "99.8%", lastDelivery: "2 min ago", status: "Active" },
  { id: "w-3", name: "Internal — Analytics", url: "internal.paymo/webhook", events: "*", successRate: "99.9%", lastDelivery: "1 min ago", status: "Active" },
  { id: "w-4", name: "Compliance — AML Alert", url: "comply.paymo/webhook", events: "user.flagged, sar.filed", successRate: "99.7%", lastDelivery: "30 min ago", status: "Active" },
];

export const initialIntegrations: IntegrationRecord[] = [
  { id: "i-1", provider: "Safaricom (M-Pesa)", purpose: "Payments", status: "Connected", uptime: "99.98%", sla: "99.95%", contractEnd: "Jan 2027" },
  { id: "i-2", provider: "Visa", purpose: "Card processing", status: "Connected", uptime: "99.99%", sla: "99.99%", contractEnd: "Jan 2029" },
  { id: "i-3", provider: "Mastercard", purpose: "Card processing", status: "Connected", uptime: "99.97%", sla: "99.95%", contractEnd: "Jan 2029" },
  { id: "i-4", provider: "KCB Bank", purpose: "Banking", status: "Connected", uptime: "99.95%", sla: "99.90%", contractEnd: "Jan 2027" },
  { id: "i-5", provider: "Equity Bank", purpose: "Banking", status: "Connected", uptime: "99.96%", sla: "99.90%", contractEnd: "Jan 2027" },
  { id: "i-6", provider: "Onfido", purpose: "KYC verification", status: "Connected", uptime: "99.90%", sla: "99.90%", contractEnd: "Jan 2027" },
  { id: "i-7", provider: "ComplyAdvantage", purpose: "AML screening", status: "Connected", uptime: "99.95%", sla: "99.90%", contractEnd: "Jan 2027" },
  { id: "i-8", provider: "Africa's Talking", purpose: "SMS", status: "Connected", uptime: "99.99%", sla: "99.95%", contractEnd: "Dec 2026" },
  { id: "i-9", provider: "SendGrid", purpose: "Email", status: "Connected", uptime: "99.99%", sla: "99.95%", contractEnd: "Mar 2027" },
  { id: "i-10", provider: "AWS", purpose: "Infrastructure", status: "Connected", uptime: "99.99%", sla: "99.99%", contractEnd: "Ongoing" },
];

export const initialErrors: ErrorRecord[] = [
  { id: "err-1", code: "400 Bad Request", count: "123", share: "52.6%", topEndpoint: "/transactions", rootCause: "Invalid amount format" },
  { id: "err-2", code: "401 Unauthorized", count: "45", share: "19.2%", topEndpoint: "/users", rootCause: "Expired API key" },
  { id: "err-3", code: "403 Forbidden", count: "34", share: "14.5%", topEndpoint: "/transactions", rootCause: "Insufficient permissions" },
  { id: "err-4", code: "429 Rate Limited", count: "23", share: "9.8%", topEndpoint: "/transactions", rootCause: "Rate limit exceeded" },
  { id: "err-5", code: "500 Internal Error", count: "9", share: "3.8%", topEndpoint: "/transfers", rootCause: "Partner timeout" },
];
