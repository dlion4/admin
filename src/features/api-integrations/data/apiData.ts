// ================================================================
// API & Integrations — Data Types & Mock Data
// ================================================================

/* ---------- Existing types (enhanced) ---------- */

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
  environment?: string;
  expiryDate?: string;
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
  trend?: string;
}

export interface EndpointRecord {
  id: string;
  category: string;
  count: string;
  avgLatency: string;
  authMethod: string;
  methods?: string;
}

export interface WebhookRecord {
  id: string;
  name: string;
  url: string;
  events: string;
  successRate: string;
  lastDelivery: string;
  status: string;
  retryPolicy?: string;
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
  environment?: string;
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
  status?: string;
}

/* ---------- New types ---------- */

export interface ApiSecurityPolicy {
  id: string;
  policy: string;
  category: string;
  severity: string;
  status: string;
  description: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
}

export interface ApiAuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  details: string;
  ip: string;
  severity: string;
}

export interface ApiDocument {
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

export interface RateLimitRule {
  id: string;
  endpoint: string;
  limit: string;
  window: string;
  appliesTo: string;
  status: string;
  blocked24h?: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
}

/* ================================================================
   Initial Data
   ================================================================ */

export const initialKeys: ApiKeyRecord[] = [
  { id: "k-1", name: "Production — Main", key: "pk_live_****...7823", createdBy: "Joseph M.", created: "Jan 2024", permissions: "Full access", lastUsed: "2 min ago", status: "Active", rateLimit: "10K/min", environment: "Production", expiryDate: "Jan 2025", description: "Primary production API key for core platform services" },
  { id: "k-2", name: "Production — Partner API", key: "pk_live_****...4567", createdBy: "Joseph M.", created: "Mar 2024", permissions: "Partner scope", lastUsed: "5 min ago", status: "Active", rateLimit: "5K/min", environment: "Production", expiryDate: "Mar 2025", description: "Scoped key for third-party partner integrations" },
  { id: "k-3", name: "Staging — Testing", key: "pk_test_****...1234", createdBy: "Joseph M.", created: "Jan 2024", permissions: "Full access", lastUsed: "1h ago", status: "Active", rateLimit: "1K/min", environment: "Staging", expiryDate: "Jan 2025", description: "Staging environment testing key" },
  { id: "k-4", name: "QuickLend — Loan", key: "pk_live_****...9012", createdBy: "Joseph M.", created: "Jun 2025", permissions: "Loan scope only", lastUsed: "2 days ago", status: "Suspended", rateLimit: "500/min", environment: "Production", expiryDate: "Jun 2026", description: "QuickLend partner loan API access — suspended pending review" },
  { id: "k-5", name: "Internal — Batch", key: "pk_live_****...5678", createdBy: "Joseph M.", created: "Feb 2024", permissions: "Batch + export", lastUsed: "30 min ago", status: "Active", rateLimit: "2K/min", environment: "Production", expiryDate: "Feb 2025", description: "Internal batch processing and data export key" },
  { id: "k-6", name: "Analytics Pipeline", key: "pk_live_****...3456", createdBy: "Ops Manager", created: "Apr 2024", permissions: "Read only", lastUsed: "10 min ago", status: "Active", rateLimit: "5K/min", environment: "Production", expiryDate: "Apr 2025", description: "Read-only key for analytics data pipeline" },
  { id: "k-7", name: "Compliance Export", key: "pk_live_****...7890", createdBy: "Security Lead", created: "May 2024", permissions: "Export + Compliance", lastUsed: "1 hour ago", status: "Active", rateLimit: "500/min", environment: "Production", expiryDate: "May 2025", description: "Restricted key for regulatory data exports" },
];

export const initialUsage: UsageRecord[] = [
  { id: "u-1", key: "Production — Main", requests: "2,345,678", errors: "234 (0.01%)", avgLatency: "45ms", p95Latency: "120ms", p99Latency: "340ms", trend: "+12%" },
  { id: "u-2", key: "Production — Partner", requests: "890,123", errors: "89 (0.01%)", avgLatency: "78ms", p95Latency: "200ms", p99Latency: "560ms", trend: "+8%" },
  { id: "u-3", key: "Staging — Testing", requests: "45,678", errors: "12 (0.03%)", avgLatency: "120ms", p95Latency: "340ms", p99Latency: "890ms", trend: "-5%" },
  { id: "u-4", key: "Internal — Batch", requests: "234,567", errors: "0 (0%)", avgLatency: "200ms", p95Latency: "450ms", p99Latency: "1.2s", trend: "+3%" },
  { id: "u-5", key: "Analytics Pipeline", requests: "156,789", errors: "3 (0.002%)", avgLatency: "90ms", p95Latency: "210ms", p99Latency: "480ms", trend: "+15%" },
  { id: "u-6", key: "Compliance Export", requests: "12,345", errors: "0 (0%)", avgLatency: "340ms", p95Latency: "890ms", p99Latency: "2.1s", trend: "+2%" },
];

export const initialEndpoints: EndpointRecord[] = [
  { id: "e-1", category: "Authentication", count: "5", avgLatency: "120ms", authMethod: "API key + secret", methods: "POST, DELETE" },
  { id: "e-2", category: "Users", count: "12", avgLatency: "85ms", authMethod: "API key", methods: "GET, POST, PUT, DELETE" },
  { id: "e-3", category: "Transactions", count: "15", avgLatency: "45ms", authMethod: "API key", methods: "GET, POST" },
  { id: "e-4", category: "Transfers", count: "8", avgLatency: "180ms", authMethod: "API key + 2FA > KES 100K", methods: "POST" },
  { id: "e-5", category: "Cards", count: "10", avgLatency: "120ms", authMethod: "API key", methods: "GET, POST, PATCH" },
  { id: "e-6", category: "Loans", count: "8", avgLatency: "200ms", authMethod: "API key", methods: "GET, POST, PUT" },
  { id: "e-7", category: "Bill payments", count: "6", avgLatency: "340ms", authMethod: "API key", methods: "POST, GET" },
  { id: "e-8", category: "KYC", count: "5", avgLatency: "450ms", authMethod: "API key", methods: "POST, GET" },
  { id: "e-9", category: "Webhooks", count: "3", avgLatency: "—", authMethod: "HMAC signature", methods: "POST" },
  { id: "e-10", category: "Utilities", count: "4", avgLatency: "50ms", authMethod: "API key", methods: "GET" },
];

export const initialWebhooks: WebhookRecord[] = [
  { id: "w-1", name: "QuickLend — Loan Status", url: "api.quicklend.co.ke/webhook", events: "loan.disbursed, loan.repaid", successRate: "98.5%", lastDelivery: "5 min ago", status: "Suspended", retryPolicy: "3 attempts · exponential backoff" },
  { id: "w-2", name: "Corporate — TXN Alert", url: "api.corp.paymo.co.ke/webhook", events: "transaction.*", successRate: "99.8%", lastDelivery: "2 min ago", status: "Active", retryPolicy: "3 attempts · exponential backoff" },
  { id: "w-3", name: "Internal — Analytics", url: "internal.paymo/webhook", events: "*", successRate: "99.9%", lastDelivery: "1 min ago", status: "Active", retryPolicy: "5 attempts · linear backoff" },
  { id: "w-4", name: "Compliance — AML Alert", url: "comply.paymo/webhook", events: "user.flagged, sar.filed", successRate: "99.7%", lastDelivery: "30 min ago", status: "Active", retryPolicy: "3 attempts · exponential backoff" },
  { id: "w-5", name: "Mobile App — Push", url: "push.paymo.co.ke/webhook", events: "notification.*", successRate: "99.9%", lastDelivery: "Just now", status: "Active", retryPolicy: "5 attempts · exponential backoff" },
];

export const initialIntegrations: IntegrationRecord[] = [
  { id: "i-1", provider: "Safaricom (M-Pesa)", purpose: "Payments", status: "Connected", uptime: "99.98%", sla: "99.95%", contractEnd: "Jan 2027", environment: "Production" },
  { id: "i-2", provider: "Visa", purpose: "Card processing", status: "Connected", uptime: "99.99%", sla: "99.99%", contractEnd: "Jan 2029", environment: "Production" },
  { id: "i-3", provider: "Mastercard", purpose: "Card processing", status: "Connected", uptime: "99.97%", sla: "99.95%", contractEnd: "Jan 2029", environment: "Production" },
  { id: "i-4", provider: "KCB Bank", purpose: "Banking", status: "Connected", uptime: "99.95%", sla: "99.90%", contractEnd: "Jan 2027", environment: "Production" },
  { id: "i-5", provider: "Equity Bank", purpose: "Banking", status: "Connected", uptime: "99.96%", sla: "99.90%", contractEnd: "Jan 2027", environment: "Production" },
  { id: "i-6", provider: "Onfido", purpose: "KYC verification", status: "Connected", uptime: "99.90%", sla: "99.90%", contractEnd: "Jan 2027", environment: "Production" },
  { id: "i-7", provider: "ComplyAdvantage", purpose: "AML screening", status: "Connected", uptime: "99.95%", sla: "99.90%", contractEnd: "Jan 2027", environment: "Production" },
  { id: "i-8", provider: "Africa's Talking", purpose: "SMS", status: "Connected", uptime: "99.99%", sla: "99.95%", contractEnd: "Dec 2026", environment: "Production" },
  { id: "i-9", provider: "SendGrid", purpose: "Email", status: "Connected", uptime: "99.99%", sla: "99.95%", contractEnd: "Mar 2027", environment: "Production" },
  { id: "i-10", provider: "AWS", purpose: "Infrastructure", status: "Connected", uptime: "99.99%", sla: "99.99%", contractEnd: "Ongoing", environment: "Production" },
];

export const initialErrors: ErrorRecord[] = [
  { id: "err-1", code: "400 Bad Request", count: "123", share: "52.6%", topEndpoint: "/transactions", rootCause: "Invalid amount format", status: "Active" },
  { id: "err-2", code: "401 Unauthorized", count: "45", share: "19.2%", topEndpoint: "/users", rootCause: "Expired API key", status: "Active" },
  { id: "err-3", code: "403 Forbidden", count: "34", share: "14.5%", topEndpoint: "/transactions", rootCause: "Insufficient permissions", status: "Active" },
  { id: "err-4", code: "429 Rate Limited", count: "23", share: "9.8%", topEndpoint: "/transactions", rootCause: "Rate limit exceeded", status: "Active" },
  { id: "err-5", code: "500 Internal Error", count: "9", share: "3.8%", topEndpoint: "/transfers", rootCause: "Partner timeout", status: "Active" },
];

export const initialSecurityPolicies: ApiSecurityPolicy[] = [
  { id: "asp-1", policy: "API key rotation", category: "Access Control", severity: "High", status: "Enforced", description: "Production keys must be rotated every 90 days" },
  { id: "asp-2", policy: "IP allowlist", category: "Network", severity: "Critical", status: "Enforced", description: "All API keys restricted to approved IP ranges" },
  { id: "asp-3", policy: "HMAC webhook signing", category: "Data Integrity", severity: "High", status: "Enforced", description: "All webhook payloads must be signed with HMAC-SHA256" },
  { id: "asp-4", policy: "TLS 1.3 minimum", category: "Network", severity: "Critical", status: "Enforced", description: "All API connections require TLS 1.3 or higher" },
  { id: "asp-5", policy: "2FA for transfers > KES 100K", category: "Transaction Security", severity: "Critical", status: "Enforced", description: "Large transfers require 2FA confirmation" },
  { id: "asp-6", policy: "API key scope least privilege", category: "Access Control", severity: "High", status: "Enforced", description: "Keys must follow least-privilege principle" },
  { id: "asp-7", policy: "Rate limit monitoring", category: "Traffic Protection", severity: "Medium", status: "Enforced", description: "Alert when any key exceeds 80% of rate limit" },
  { id: "asp-8", policy: "Webhook retry limit", category: "Data Integrity", severity: "Medium", status: "Enforced", description: "Maximum 5 retry attempts with exponential backoff" },
];

export const initialApiAudit: ApiAuditEntry[] = [
  { id: "aa-1", timestamp: "Aug 27, 14:32", actor: "Joseph M.", action: "Created", resource: "API key", details: "Created Analytics Pipeline key", ip: "192.168.1.45", severity: "Info" },
  { id: "aa-2", timestamp: "Aug 27, 14:15", actor: "Security Lead", action: "Suspended", resource: "API key", details: "Suspended QuickLend — Loan key", ip: "10.0.0.22", severity: "Warning" },
  { id: "aa-3", timestamp: "Aug 27, 13:45", actor: "Ops Manager", action: "Updated", resource: "Webhook", details: "Changed retry policy for Corporate TXN Alert", ip: "172.16.0.8", severity: "Info" },
  { id: "aa-4", timestamp: "Aug 27, 12:30", actor: "Joseph M.", action: "Rotated", resource: "API key", details: "Rotated Production — Main key (24h overlap)", ip: "192.168.1.45", severity: "Warning" },
  { id: "aa-5", timestamp: "Aug 27, 11:20", actor: "System", action: "Alert", resource: "Rate limit", details: "Production — Main at 85% rate limit", ip: "—", severity: "Warning" },
  { id: "aa-6", timestamp: "Aug 27, 10:00", actor: "Joseph M.", action: "Connected", resource: "Integration", details: "New Africa's Talking SMS integration", ip: "192.168.1.45", severity: "Info" },
  { id: "aa-7", timestamp: "Aug 26, 16:45", actor: "Security Lead", action: "Blocked", resource: "IP range", details: "Blocked suspicious IP range 45.33.x.x", ip: "10.0.0.22", severity: "Critical" },
  { id: "aa-8", timestamp: "Aug 26, 14:30", actor: "Ops Manager", action: "Updated", resource: "Rate limit", details: "Increased general API to 1000/min", ip: "172.16.0.8", severity: "Info" },
];

export const initialApiDocuments: ApiDocument[] = [
  {
    id: "doc-1", title: "API Authentication Guide", type: "Technical", status: "Active", version: "v2.3",
    author: "Platform Team", lastUpdated: "Aug 20, 2026",
    content: "API AUTHENTICATION GUIDE\n\nPayMo Digital Bank Ltd\nVersion 2.3 — Effective {{date}}\n\n1. OVERVIEW\nPayMo APIs use API key authentication for all requests. Keys are issued per-environment and scoped to specific endpoints.\n\n2. OBTAINING AN API KEY\n1. Log in to the Developer Portal\n2. Navigate to Settings → API Keys\n3. Click \"Create New Key\"\n4. Select environment (Production/Staging)\n5. Define scope and rate limits\n6. Copy the key — it is shown only once\n\n3. USING THE KEY\nInclude the key in the Authorization header:\nAuthorization: Bearer {{api_key}}\n\n4. SECURITY BEST PRACTICES\n• Never expose keys in client-side code\n• Rotate keys every 90 days\n• Use environment-specific keys\n• Monitor usage in the dashboard\n• Report compromised keys immediately"
  },
  {
    id: "doc-2", title: "Webhook Integration Guide", type: "Technical", status: "Active", version: "v1.8",
    author: "Platform Team", lastUpdated: "Aug 15, 2026",
    content: "WEBHOOK INTEGRATION GUIDE\n\nPayMo Digital Bank Ltd\nVersion 1.8\n\n1. OVERVIEW\nWebhooks notify your application of events in real-time.\n\n2. EVENT TYPES\ntransaction.created — New transaction initiated\ntransaction.completed — Transaction settled\nuser.registered — New user created\nuser.flagged — User flagged by AML\nloan.disbursed — Loan funds released\nloan.repaid — Loan payment received\n\n3. WEBHOOK PAYLOAD\nAll payloads include:\n• event — Event type\n• timestamp — ISO 8601 timestamp\n• data — Event-specific payload\n• signature — HMAC-SHA256 signature\n\n4. VERIFYING SIGNATURES\nUse your signing secret to verify:\nExpected: HMAC-SHA256(secret, body)\nHeader: X-PayMo-Signature\n\n5. RETRY POLICY\nFailed deliveries are retried 3 times with exponential backoff."
  },
  {
    id: "doc-3", title: "API Rate Limiting Reference", type: "Technical", status: "Active", version: "v2.0",
    author: "Platform Team", lastUpdated: "Aug 22, 2026",
    content: "API RATE LIMITING REFERENCE\n\nPayMo Digital Bank Ltd\nVersion 2.0\n\n1. DEFAULT LIMITS\nGeneral API: 1000 requests/minute per key\nSearch API: 100 requests/minute per key\nTransaction API: 10 requests/minute per user\nExport API: 3 requests/minute per admin\n\n2. RATE LIMIT HEADERS\nX-RateLimit-Limit: Maximum requests per window\nX-RateLimit-Remaining: Remaining requests in window\nX-RateLimit-Reset: Unix timestamp when window resets\n\n3. HANDLING 429 RESPONSES\nImplement exponential backoff:\n• 1st retry: 1 second\n• 2nd retry: 2 seconds\n• 3rd retry: 4 seconds\n• Max 5 retries before circuit break\n\n4. RATE LIMIT INCREASES\nContact {{supportEmail}} with:\n• Current usage patterns\n• Justification for increase\n• Expected volume"
  },
];

export const initialRateLimits: RateLimitRule[] = [
  { id: "rl-1", endpoint: "General API", limit: "1000/min", window: "60s", appliesTo: "All keys", status: "Active", blocked24h: "8,901" },
  { id: "rl-2", endpoint: "Search endpoints", limit: "100/min", window: "60s", appliesTo: "All keys", status: "Active", blocked24h: "2,456" },
  { id: "rl-3", endpoint: "Auth endpoints", limit: "20/min", window: "60s", appliesTo: "All keys", status: "Active", blocked24h: "1,234" },
  { id: "rl-4", endpoint: "Export endpoints", limit: "3/hour", window: "3600s", appliesTo: "All keys", status: "Active", blocked24h: "67" },
  { id: "rl-5", endpoint: "Webhook callbacks", limit: "500/min", window: "60s", appliesTo: "All keys", status: "Active", blocked24h: "23" },
  { id: "rl-6", endpoint: "KYC submissions", limit: "5/hour", window: "3600s", appliesTo: "All keys", status: "Active", blocked24h: "89" },
  { id: "rl-7", endpoint: "File upload", limit: "20/min", window: "60s", appliesTo: "All keys", status: "Active", blocked24h: "345" },
  { id: "rl-8", endpoint: "OTP verification", limit: "5/min", window: "60s", appliesTo: "All keys", status: "Active", blocked24h: "567" },
];
