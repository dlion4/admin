export interface EcosystemRecord {
  id: string;
  name: string;
  endpoints: string;
  healthy: string;
  degraded: string;
  down: string;
  score: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
}

export interface EndpointRecord {
  id: string;
  name: string;
  purpose: string;
  method: string;
  url: string;
  health: string;
  latency: string;
  errorRate: string;
  uptime: string;
  circuit: string;
  ecosystem: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
}

export interface BankRecord {
  id: string;
  name: string;
  code: string;
  transfer: string;
  validation: string;
  latency: string;
  successRate: string;
  lastTxn: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
}

export interface IncidentRecord {
  id: string;
  incident: string;
  service: string;
  state: string;
  impact: string;
  owner: string;
  status: string;
  openedAt: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
}

export interface CallbackRecord {
  id: string;
  event: string;
  type: string;
  error: string;
  source: string;
  age: string;
}

export const initialEcosystems: EcosystemRecord[] = [
  { id: "eco-1", name: "Mobile Money · M-Pesa", endpoints: "12", healthy: "12", degraded: "0", down: "0", score: "100%" },
  { id: "eco-2", name: "Bank APIs · PesaLink", endpoints: "8", healthy: "7", degraded: "1", down: "0", score: "95.2%" },
  { id: "eco-3", name: "Bank APIs · Direct", endpoints: "24", healthy: "22", degraded: "2", down: "0", score: "95.1%" },
  { id: "eco-4", name: "Card Networks · Visa", endpoints: "14", healthy: "14", degraded: "0", down: "0", score: "100%" },
  { id: "eco-5", name: "Card Networks · Mastercard", endpoints: "12", healthy: "12", degraded: "0", down: "0", score: "100%" },
  { id: "eco-6", name: "Card Networks · UnionPay", endpoints: "4", healthy: "3", degraded: "0", down: "1", score: "75.0%" },
  { id: "eco-7", name: "KYC / Identity", endpoints: "8", healthy: "8", degraded: "0", down: "0", score: "100%" },
  { id: "eco-8", name: "Communications", endpoints: "18", healthy: "17", degraded: "1", down: "0", score: "98.2%" },
  { id: "eco-9", name: "Utility Providers", endpoints: "34", healthy: "32", degraded: "2", down: "0", score: "97.6%" },
  { id: "eco-10", name: "Internal Microservices", endpoints: "21", healthy: "16", degraded: "2", down: "0", score: "94.8%" },
];

export const initialEndpoints: EndpointRecord[] = [
  { id: "ep-1", name: "STK Push", purpose: "Initiate payment", method: "POST", url: "sandbox.safaricom.../stk/push", health: "Up", latency: "3.2s", errorRate: "0.08%", uptime: "99.98%", circuit: "Closed", ecosystem: "M-Pesa" },
  { id: "ep-2", name: "STK Query", purpose: "Check STK status", method: "GET", url: "sandbox.safaricom.../stk/query", health: "Up", latency: "1.1s", errorRate: "0.02%", uptime: "99.99%", circuit: "Closed", ecosystem: "M-Pesa" },
  { id: "ep-3", name: "C2B Register", purpose: "Register validation URL", method: "POST", url: "sandbox.safaricom.../c2b/register", health: "Up", latency: "0.8s", errorRate: "0.00%", uptime: "100%", circuit: "Closed", ecosystem: "M-Pesa" },
  { id: "ep-4", name: "B2C", purpose: "Disbursement / cashout", method: "POST", url: "sandbox.safaricom.../b2c", health: "Up", latency: "5.1s", errorRate: "0.12%", uptime: "99.97%", circuit: "Closed", ecosystem: "M-Pesa" },
  { id: "ep-5", name: "Transaction Status", purpose: "Check TXN status", method: "GET", url: "sandbox.safaricom.../transaction/status", health: "Up", latency: "1.8s", errorRate: "0.03%", uptime: "99.99%", circuit: "Closed", ecosystem: "M-Pesa" },
  { id: "ep-6", name: "Reversal", purpose: "Reverse transaction", method: "POST", url: "sandbox.safaricom.../reversal", health: "Up", latency: "4.2s", errorRate: "0.15%", uptime: "99.96%", circuit: "Closed", ecosystem: "M-Pesa" },
  { id: "ep-7", name: "B2C Result Callback", purpose: "Receive result", method: "POST", url: "api.paymo.co.ke/callback/b2c", health: "Up", latency: "0.03s", errorRate: "0.00%", uptime: "100%", circuit: "Closed", ecosystem: "M-Pesa" },
];

export const initialBanks: BankRecord[] = [
  { id: "bk-1", name: "KCB Bank", code: "01", transfer: "Up", validation: "Up", latency: "6.2s", successRate: "99.5%", lastTxn: "14:31:50" },
  { id: "bk-2", name: "Equity Bank", code: "02", transfer: "Up", validation: "Up", latency: "7.1s", successRate: "99.3%", lastTxn: "14:31:42" },
  { id: "bk-3", name: "Cooperative Bank", code: "03", transfer: "Up", validation: "Up", latency: "8.4s", successRate: "99.1%", lastTxn: "14:31:30" },
  { id: "bk-4", name: "NCBA Bank", code: "04", transfer: "Up", validation: "Up", latency: "5.8s", successRate: "99.6%", lastTxn: "14:31:25" },
  { id: "bk-5", name: "Absa Bank", code: "05", transfer: "Up", validation: "Up", latency: "7.5s", successRate: "99.2%", lastTxn: "14:31:18" },
  { id: "bk-6", name: "Stanbic Bank", code: "06", transfer: "Up", validation: "Up", latency: "9.1s", successRate: "99.0%", lastTxn: "14:31:10" },
  { id: "bk-7", name: "National Bank", code: "08", transfer: "Slow", validation: "Slow", latency: "15.2s", successRate: "97.8%", lastTxn: "14:30:55" },
  { id: "bk-8", name: "I&M Bank", code: "09", transfer: "Up", validation: "Up", latency: "7.3s", successRate: "99.4%", lastTxn: "14:30:48" },
  { id: "bk-9", name: "KCB Islamic", code: "10", transfer: "Up", validation: "Up", latency: "6.5s", successRate: "99.5%", lastTxn: "14:30:40" },
];

export const initialIncidents: IncidentRecord[] = [
  { id: "inc-1", incident: "INC-233", service: "National Bank validation", state: "Degraded", impact: "15.2s latency", owner: "Bank API team", status: "Investigating", openedAt: "14:30 EAT" },
  { id: "inc-2", incident: "INC-232", service: "UnionPay authorization", state: "Down", impact: "Endpoint unavailable", owner: "Card team", status: "Mitigating", openedAt: "13:45 EAT" },
  { id: "inc-3", incident: "INC-231", service: "Webhook retry backlog", state: "Degraded", impact: "42 queued callbacks", owner: "Platform Ops", status: "Monitoring", openedAt: "12:00 EAT" },
];

export const initialCallbacks: CallbackRecord[] = [
  { id: "cb-1", event: "EVT-88234", type: "loan.disbursed", error: "Invalid payload", source: "QuickLend", age: "30 min" },
  { id: "cb-2", event: "EVT-88190", type: "transaction.created", error: "Signature mismatch", source: "Corporate", age: "45 min" },
  { id: "cb-3", event: "EVT-88156", type: "user.flagged", error: "Endpoint unreachable", source: "ComplyAdvantage", age: "1h" },
];
