/* ============================================================
   Page 2 — Real-Time Monitor · data layer
   ============================================================ */

export type TxType = "Transfer" | "Withdrawal" | "Payment" | "Deposit" | "Bill pay" | "Airtime" | "Loan repay" | "Card auth";
export type TxChannel = "M-Pesa" | "Card (Visa)" | "Card (Mastercard)" | "Bank" | "Internal" | "ATM" | "PesaLink" | "PayPal";
export type TxStatus = "Complete" | "Pending" | "Failed" | "Held" | "Blocked" | "Reversed";

export type LiveTx = {
  id: string; time: string; type: TxType; from: string; fromName: string; to?: string; toName?: string;
  amount: number; channel: TxChannel; status: TxStatus; fraud: number; geo: string; device: string;
  fee: number; ref: string; latencyMs: number; merchant?: string;
};

const NAMES = [
  "Amina Hassan", "Brian Otieno", "Lucy Muthoni", "David Kimani", "Fatuma Abdalla", "James Mutua",
  "Wanjiru Karanja", "Samuel Okello", "Naomi Chemtai", "Kevin Barasa", "Esther Njeri", "Collins Ouma",
  "Mercy Akinyi", "Patrick Kiptoo", "Zainab Ali", "Joseph Maina", "Beatrice Wairimu", "Dennis Mwangi",
  "Sharon Adhiambo", "Felix Mutiso", "Caroline Nyambura", "Anthony Wafula", "Rose Atieno", "Vincent Kariuki",
  "Grace Wanjiru", "Peter Njoroge", "Faith Chebet", "Michael Omondi", "Alice Wambui", "Tom Kiprono",
];
const COUNTIES = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Uasin Gishu", "Machakos", "Nyeri", "Kakamega", "Kiambu", "Kilifi", "Kisii", "Meru", "Bungoma", "Trans Nzoia"];
const DEVICES = ["iPhone 15 / iOS 18", "Samsung A54 / Android 14", "Chrome 128 / Windows", "Tecno Spark / Android 13", "Safari / macOS 15", "PayMo POS T2", "Infinix Note / Android 14", "Firefox / Linux"];
const MERCHANTS = ["Naivas Supermarket", "Java House", "Total Kenya", "Carrefour", "KPLC Prepaid", "Nairobi Water", "DStv Kenya", "Jumia Kenya", "Chandarana", "Safaricom Airtime"];
const TYPES: TxType[] = ["Transfer", "Withdrawal", "Payment", "Deposit", "Bill pay", "Airtime", "Loan repay", "Card auth"];
const CHANNELS: TxChannel[] = ["M-Pesa", "Card (Visa)", "Card (Mastercard)", "Bank", "Internal", "ATM", "PesaLink", "PayPal"];

const t0 = 14 * 3600 + 32 * 60 + 5;
const fmt = (sec: number) => {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export const makeTx = (i: number): LiveTx => {
  const fraud = [4, 8, 12, 3, 7, 22, 5, 63, 11, 9, 41, 6, 88, 14, 2, 31, 17, 5, 92, 25, 10, 55, 7, 13, 76, 19, 4, 38, 8, 47][i % 30];
  const amount = [15000, 5000, 2300, 50000, 8700, 1200, 340000, 780, 4500, 96000, 25000, 1900, 610000, 3400, 12000,
    88000, 7600, 450, 1250000, 32000, 2100, 145000, 990, 5400, 470000, 18000, 720, 63000, 2800, 21000][i % 30];
  const type = TYPES[i % TYPES.length];
  const channel = CHANNELS[(i * 3) % CHANNELS.length];
  const status: TxStatus = fraud > 85 ? "Blocked" : fraud > 60 ? "Held" : i % 11 === 0 ? "Pending" : i % 17 === 0 ? "Failed" : "Complete";
  return {
    id: `TXN-${882451 - i}`,
    time: fmt(t0 - i * 3),
    type,
    from: `#${(89234 - i * 137 + 100000) % 99999}`,
    fromName: NAMES[i % NAMES.length],
    to: type === "Transfer" || type === "Payment" ? `#${(12045 + i * 311) % 99999}` : undefined,
    toName: type === "Transfer" ? NAMES[(i + 7) % NAMES.length] : type === "Payment" ? MERCHANTS[i % MERCHANTS.length] : undefined,
    amount,
    channel,
    status,
    fraud,
    geo: COUNTIES[i % COUNTIES.length],
    device: DEVICES[i % DEVICES.length],
    fee: Math.max(0, Math.round(amount * 0.0045)),
    ref: `${channel.slice(0, 2).toUpperCase()}${(748291 + i * 17).toString()}`,
    latencyMs: 120 + ((i * 137) % 4200),
    merchant: type === "Payment" || type === "Bill pay" ? MERCHANTS[i % MERCHANTS.length] : undefined,
  };
};

export const SEED_TX: LiveTx[] = Array.from({ length: 40 }, (_, i) => makeTx(i));

export type LiveMetric = {
  id: string; label: string; value: number; prev: number; unit: string; threshold: number;
  invert?: boolean; format?: "num" | "pct" | "ms";
};
export const LIVE_METRICS: LiveMetric[] = [
  { id: "tpm", label: "Transactions / min", value: 142, prev: 138, unit: "", threshold: 500, format: "num" },
  { id: "sessions", label: "Active sessions", value: 3847, prev: 3812, unit: "", threshold: 20000, format: "num" },
  { id: "failedlogin", label: "Failed logins (1h)", value: 23, prev: 18, unit: "", threshold: 50, invert: true, format: "num" },
  { id: "fraudalerts", label: "Fraud alerts (1h)", value: 7, prev: 5, unit: "", threshold: 15, invert: true, format: "num" },
  { id: "p95", label: "API p95 latency", value: 124, prev: 118, unit: "ms", threshold: 500, invert: true, format: "ms" },
  { id: "errorrate", label: "Error rate", value: 0.03, prev: 0.02, unit: "%", threshold: 0.5, invert: true, format: "pct" },
  { id: "pending", label: "Pending transactions", value: 342, prev: 318, unit: "", threshold: 1000, invert: true, format: "num" },
  { id: "queue", label: "Job queue depth", value: 23, prev: 19, unit: "", threshold: 200, invert: true, format: "num" },
  { id: "mem", label: "Memory usage", value: 67, prev: 65, unit: "%", threshold: 85, invert: true, format: "pct" },
  { id: "cpu", label: "CPU usage", value: 34, prev: 31, unit: "%", threshold: 80, invert: true, format: "pct" },
  { id: "dlq", label: "Dead-letter queue", value: 23, prev: 21, unit: "", threshold: 25, invert: true, format: "num" },
  { id: "settle", label: "Unsettled value", value: 412, prev: 388, unit: "M", threshold: 800, invert: true, format: "num" },
];

export type County = { name: string; txns: number; volume: number; lat: number; lng: number; growth: number; topMerchant: string; agents: number };
export const COUNTY_DATA: County[] = [
  { name: "Nairobi", txns: 48210, volume: 6_940_000_000, lat: -1.286, lng: 36.817, growth: 18.4, topMerchant: "Naivas Supermarket", agents: 1240 },
  { name: "Mombasa", txns: 14820, volume: 1_820_000_000, lat: -4.043, lng: 39.668, growth: 11.2, topMerchant: "Nakumatt Nyali", agents: 412 },
  { name: "Kisumu", txns: 11240, volume: 1_140_000_000, lat: -0.091, lng: 34.768, growth: 14.8, topMerchant: "United Mall", agents: 318 },
  { name: "Nakuru", txns: 10480, volume: 986_000_000, lat: -0.303, lng: 36.080, growth: 9.6, topMerchant: "Westside Mall", agents: 288 },
  { name: "Uasin Gishu", txns: 8120, volume: 742_000_000, lat: 0.514, lng: 35.269, growth: 12.1, topMerchant: "Rupa's Mall", agents: 214 },
  { name: "Kiambu", txns: 9640, volume: 812_000_000, lat: -1.171, lng: 36.835, growth: 21.3, topMerchant: "Quickmart Ruiru", agents: 262 },
  { name: "Machakos", txns: 5480, volume: 421_000_000, lat: -1.518, lng: 37.266, growth: 7.4, topMerchant: "Total Machakos", agents: 148 },
  { name: "Nyeri", txns: 4820, volume: 384_000_000, lat: -0.420, lng: 36.947, growth: 5.9, topMerchant: "Kimathi Market", agents: 132 },
  { name: "Kakamega", txns: 4210, volume: 298_000_000, lat: 0.283, lng: 34.752, growth: 16.2, topMerchant: "Mega Mall", agents: 118 },
  { name: "Kilifi", txns: 3980, volume: 312_000_000, lat: -3.510, lng: 39.909, growth: 8.8, topMerchant: "Malindi Complex", agents: 104 },
  { name: "Kisii", txns: 3640, volume: 246_000_000, lat: -0.677, lng: 34.779, growth: 10.4, topMerchant: "Daraja Mbili", agents: 96 },
  { name: "Meru", txns: 3410, volume: 231_000_000, lat: 0.047, lng: 37.650, growth: 6.2, topMerchant: "Makutano Traders", agents: 88 },
  { name: "Bungoma", txns: 2980, volume: 192_000_000, lat: 0.563, lng: 34.560, growth: 13.7, topMerchant: "Khetia's", agents: 74 },
  { name: "Trans Nzoia", txns: 2410, volume: 164_000_000, lat: 1.021, lng: 34.998, growth: 4.1, topMerchant: "Kitale Mega", agents: 62 },
  { name: "Garissa", txns: 1840, volume: 128_000_000, lat: -0.453, lng: 39.646, growth: 19.8, topMerchant: "Garissa Traders", agents: 41 },
  { name: "Turkana", txns: 940, volume: 62_000_000, lat: 3.117, lng: 35.597, growth: 24.6, topMerchant: "Lodwar Central", agents: 22 },
];

export type ChannelPerf = {
  channel: string; tpm: number; volPerMin: number; success: number; latency: string; errors: number;
  breaker: "Closed" | "Half-open" | "Open"; provider: string; color: string; trend: number[];
};
export const CHANNEL_PERF: ChannelPerf[] = [
  { channel: "M-Pesa", tpm: 52, volPerMin: 780_000, success: 99.2, latency: "3.2s", errors: 4, breaker: "Closed", provider: "Safaricom Daraja", color: "#12b76a", trend: [44, 48, 51, 49, 53, 52, 55, 52] },
  { channel: "Card (Visa)", tpm: 28, volPerMin: 420_000, success: 99.8, latency: "1.8s", errors: 1, breaker: "Closed", provider: "Visa Direct", color: "#2e90fa", trend: [24, 26, 25, 27, 29, 28, 30, 28] },
  { channel: "Card (Mastercard)", tpm: 18, volPerMin: 270_000, success: 99.7, latency: "1.9s", errors: 0, breaker: "Closed", provider: "Mastercard Send", color: "#f79009", trend: [15, 17, 16, 18, 19, 18, 18, 18] },
  { channel: "Bank transfer", tpm: 8, volPerMin: 1_200_000, success: 98.5, latency: "45s", errors: 2, breaker: "Closed", provider: "i&M · KCB · Equity", color: "#7a5af8", trend: [6, 7, 9, 8, 7, 8, 9, 8] },
  { channel: "Internal", tpm: 34, volPerMin: 510_000, success: 99.9, latency: "0.3s", errors: 0, breaker: "Closed", provider: "PayMo core ledger", color: "#16b364", trend: [30, 32, 31, 34, 36, 34, 35, 34] },
  { channel: "ATM", tpm: 6, volPerMin: 180_000, success: 97.8, latency: "12s", errors: 3, breaker: "Closed", provider: "Kenswitch", color: "#98a2b3", trend: [5, 6, 7, 6, 5, 6, 6, 6] },
  { channel: "PesaLink", tpm: 11, volPerMin: 640_000, success: 99.1, latency: "6.4s", errors: 1, breaker: "Closed", provider: "IPS Kenya", color: "#0ba5ec", trend: [9, 10, 12, 11, 10, 11, 12, 11] },
  { channel: "UnionPay", tpm: 0, volPerMin: 0, success: 0, latency: "—", errors: 5, breaker: "Open", provider: "UnionPay International", color: "#f04438", trend: [2, 2, 1, 1, 0, 0, 0, 0] },
];

export type LoginEvent = {
  id: string; time: string; user: string; name: string; device: string; ip: string; location: string;
  status: "Success" | "Failed" | "Challenged"; risk: "Low" | "Medium" | "High"; method: string; reason?: string;
};
export const LOGIN_STREAM: LoginEvent[] = Array.from({ length: 26 }, (_, i) => {
  const risk = i % 9 === 0 ? "High" : i % 4 === 0 ? "Medium" : "Low";
  const status = risk === "High" ? (i % 2 === 0 ? "Failed" : "Challenged") : "Success";
  return {
    id: `LGN-${44210 - i}`,
    time: fmt(t0 - i * 7),
    user: `#${(89234 - i * 271 + 100000) % 99999}`,
    name: NAMES[(i + 3) % NAMES.length],
    device: DEVICES[(i + 2) % DEVICES.length],
    ip: `${[41, 197, 102, 105, 196][i % 5]}.${(i * 13) % 255}.${(i * 29) % 255}.${(i * 7) % 255}`,
    location: risk === "High" && i % 3 === 0 ? "Unknown (VPN)" : COUNTIES[(i + 5) % COUNTIES.length],
    status: status as LoginEvent["status"],
    risk: risk as LoginEvent["risk"],
    method: ["Passkey", "PIN", "Biometric", "OTP", "Password"][i % 5],
    reason: status === "Failed" ? ["Wrong PIN (3rd attempt)", "Passkey rejected", "Device not recognised", "Geo-velocity breach"][i % 4] : undefined,
  };
});

export type FraudAlert = {
  id: string; time: string; rule: string; user: string; name: string; score: number; amount: number;
  action: "Auto-blocked" | "Held for review" | "Flagged" | "Cleared"; channel: string; reason: string; county: string;
};
export const FRAUD_FEED: FraudAlert[] = [
  { id: "FRD-7712", time: "14:31:58", rule: "velocity.multi_device_v3", user: "#11223", name: "David Kimani", score: 96, amount: 610_000, action: "Auto-blocked", channel: "M-Pesa", reason: "4 devices in 90 seconds across 2 counties", county: "Nakuru" },
  { id: "FRD-7711", time: "14:30:12", rule: "aml.structuring_v2", user: "#45120", name: "Brian Otieno", score: 88, amount: 340_000, action: "Held for review", channel: "Bank", reason: "14 deposits just below the KES 100,000 reporting threshold", county: "Kisumu" },
  { id: "FRD-7710", time: "14:28:44", rule: "card.bin_attack_v1", user: "#77812", name: "Lucy Muthoni", score: 92, amount: 1_250_000, action: "Auto-blocked", channel: "Card (Visa)", reason: "38 declined auths on sequential PANs from one IP", county: "Nyeri" },
  { id: "FRD-7709", time: "14:26:03", rule: "geo.impossible_travel", user: "#33456", name: "Fatuma Abdalla", score: 76, amount: 96_000, action: "Held for review", channel: "M-Pesa", reason: "Mombasa then Eldoret within 11 minutes", county: "Kilifi" },
  { id: "FRD-7708", time: "14:24:51", rule: "behaviour.dormant_spike", user: "#4512", name: "James Mutua", score: 63, amount: 470_000, action: "Flagged", channel: "Internal", reason: "Dormant 8 months, then 12 transfers in one hour", county: "Nairobi" },
  { id: "FRD-7707", time: "14:22:19", rule: "mule.ring_graph_v4", user: "#67890", name: "Samuel Okello", score: 84, amount: 145_000, action: "Held for review", channel: "PesaLink", reason: "Connected to 6 accounts in a known mule cluster", county: "Kisumu" },
  { id: "FRD-7706", time: "14:20:08", rule: "sim.swap_recent", user: "#22110", name: "Naomi Chemtai", score: 71, amount: 88_000, action: "Flagged", channel: "M-Pesa", reason: "SIM changed 6 hours before high-value withdrawal", county: "Uasin Gishu" },
  { id: "FRD-7705", time: "14:18:37", rule: "merchant.refund_abuse", user: "#90881", name: "Kevin Barasa", score: 58, amount: 32_000, action: "Cleared", channel: "Card (Mastercard)", reason: "9 refunds in 30 days — verified as legitimate returns", county: "Bungoma" },
  { id: "FRD-7704", time: "14:16:22", rule: "sanctions.name_match", user: "#71204", name: "Vincent Kariuki", score: 81, amount: 210_000, action: "Held for review", channel: "Bank", reason: "Fuzzy match against an OFAC listing (82% confidence)", county: "Nairobi" },
  { id: "FRD-7703", time: "14:14:09", rule: "device.rooted_emulator", user: "#58312", name: "Collins Ouma", score: 90, amount: 54_000, action: "Auto-blocked", channel: "Internal", reason: "Rooted emulator with a spoofed device fingerprint", county: "Machakos" },
  { id: "FRD-7702", time: "14:11:44", rule: "velocity.amount_ramp", user: "#31877", name: "Mercy Akinyi", score: 67, amount: 128_000, action: "Flagged", channel: "M-Pesa", reason: "Amounts ramping 5× above the 90-day profile", county: "Kisii" },
  { id: "FRD-7701", time: "14:09:02", rule: "atm.card_testing", user: "#66420", name: "Patrick Kiptoo", score: 74, amount: 18_000, action: "Held for review", channel: "ATM", reason: "6 balance enquiries then a max withdrawal", county: "Trans Nzoia" },
];

export type SystemEvent = {
  id: string; time: string; severity: "info" | "warn" | "error"; service: string; message: string; detail: string;
};
export const SYSTEM_EVENTS: SystemEvent[] = [
  { id: "EVT-3341", time: "14:32:02", severity: "info", service: "ledger", message: "Partition rotated", detail: "ledger_2026_08_p24 created; writes redirected in 42 ms." },
  { id: "EVT-3340", time: "14:31:48", severity: "warn", service: "mpesa-adapter", message: "Callback latency above SLO", detail: "p95 5m 12s vs 30s target — 12 STK results outstanding." },
  { id: "EVT-3339", time: "14:31:20", severity: "error", service: "unionpay-adapter", message: "Circuit breaker opened", detail: "5 consecutive failures; probing again at 14:32:30." },
  { id: "EVT-3338", time: "14:30:55", severity: "info", service: "risk-engine", message: "Model reloaded", detail: "risk-v4.2.1 weights refreshed from the feature store." },
  { id: "EVT-3337", time: "14:30:11", severity: "info", service: "auth", message: "Passkey registered", detail: "Admin adm_cynthia_awuor bound YubiKey 5C NFC." },
  { id: "EVT-3336", time: "14:29:47", severity: "warn", service: "settlement", message: "Break detected", detail: "KCB file 2026-08-24 has 3 unmatched credits totalling KES 184,200." },
  { id: "EVT-3335", time: "14:28:33", severity: "info", service: "notification", message: "Batch dispatched", detail: "18,442 push notifications delivered in 4.1 s." },
  { id: "EVT-3334", time: "14:27:58", severity: "error", service: "kcb-adapter", message: "mTLS certificate expiring", detail: "Client certificate expires in 6 days — rotation required." },
  { id: "EVT-3333", time: "14:26:40", severity: "info", service: "cdn", message: "Cache purged", detail: "Storefront assets invalidated across 6 edge PoPs." },
  { id: "EVT-3332", time: "14:25:12", severity: "warn", service: "job-runner", message: "Job retried", detail: "recon-build attempt 2 of 3 after a transient S3 timeout." },
  { id: "EVT-3331", time: "14:24:03", severity: "info", service: "kyc", message: "Batch completed", detail: "Onfido returned 347 results: 312 clear, 24 consider, 11 reject." },
  { id: "EVT-3330", time: "14:22:31", severity: "info", service: "api-gateway", message: "Rate limit adjusted", detail: "Partner QuickLend raised to 600 req/min for 24 hours." },
];

export type Incident = {
  id: string; title: string; severity: "P1" | "P2" | "P3" | "P4"; status: "Open" | "Mitigating" | "Monitoring" | "Resolved";
  opened: string; owner: string; service: string; impact: string; updates: { t: string; who: string; text: string }[];
};
export const INCIDENTS: Incident[] = [
  {
    id: "INC-2026-0091", title: "M-Pesa STK callback latency", severity: "P2", status: "Mitigating", opened: "14:24 EAT",
    owner: "Payments guild", service: "mpesa-adapter", impact: "12 pending transactions · KES 486K",
    updates: [
      { t: "14:24", who: "Alerting", text: "Callback p95 crossed the 30s SLO for 5 consecutive minutes." },
      { t: "14:27", who: "Mary Wanjiku", text: "Confirmed with Safaricom NOC — degraded C2B on their side." },
      { t: "14:31", who: "Platform", text: "Replaying from the DLQ; customer comms template ready to send." },
    ],
  },
  {
    id: "INC-2026-0090", title: "UnionPay circuit breaker open", severity: "P3", status: "Monitoring", opened: "14:28 EAT",
    owner: "Platform", service: "unionpay-adapter", impact: "2,100 users (1.4%) cannot use UnionPay",
    updates: [
      { t: "14:28", who: "Alerting", text: "Breaker tripped after 5 consecutive 504 responses." },
      { t: "14:30", who: "James Odhiambo", text: "Certificate pinning verified as correct — appears to be upstream." },
    ],
  },
  {
    id: "INC-2026-0089", title: "KCB mTLS certificate expiring", severity: "P4", status: "Open", opened: "14:27 EAT",
    owner: "Platform", service: "kcb-adapter", impact: "Settlement will fail in 6 days if not rotated",
    updates: [{ t: "14:27", who: "Alerting", text: "Certificate valid until 30 Aug 2026 — rotation task raised." }],
  },
];

export const THROUGHPUT_SERIES = Array.from({ length: 30 }, (_, i) => ({
  t: `${String(14).padStart(2, "0")}:${String((i * 2) % 60).padStart(2, "0")}`,
  mpesa: 44 + Math.round(Math.sin(i / 3) * 8 + (i % 5)),
  cards: 38 + Math.round(Math.cos(i / 4) * 6 + (i % 4)),
  bank: 8 + Math.round(Math.sin(i / 5) * 3),
  internal: 30 + Math.round(Math.cos(i / 3) * 5 + (i % 3)),
}));

export const LATENCY_SERIES = Array.from({ length: 30 }, (_, i) => ({
  t: `${String(14).padStart(2, "0")}:${String((i * 2) % 60).padStart(2, "0")}`,
  p50: 34 + Math.round(Math.sin(i / 4) * 6),
  p95: 118 + Math.round(Math.cos(i / 3) * 22 + (i % 7) * 3),
  p99: 380 + Math.round(Math.sin(i / 2) * 90 + (i % 5) * 12),
}));

export const DLQ_ROWS = [
  { queue: "B2C callback", id: "DLQ-8821", payload: "TXN-882400 · KES 50,000", error: "Timeout (30s)", retries: "3/5", next: "Auto-retry 14:35", expires: "14:50" },
  { queue: "B2C callback", id: "DLQ-8820", payload: "TXN-882399 · KES 25,000", error: "Timeout (30s)", retries: "3/5", next: "Auto-retry 14:35", expires: "14:50" },
  { queue: "B2C callback", id: "DLQ-8819", payload: "TXN-882398 · KES 10,000", error: "HTTP 500", retries: "2/5", next: "Auto-retry 14:35", expires: "14:50" },
  { queue: "PesaLink", id: "DLQ-8818", payload: "PL-44567 · KES 100,000", error: "Deserialize error", retries: "1/5", next: "Manual review", expires: "15:10" },
  { queue: "i&M Bank", id: "DLQ-8817", payload: "IM-8823 · KES 500,000", error: "Signature mismatch", retries: "0/5", next: "Manual review", expires: "15:00" },
  { queue: "KCB Bank", id: "DLQ-8816", payload: "KCB-8822 · KES 200,000", error: "mTLS cert expired", retries: "0/5", next: "Alert devops", expires: "15:00" },
  { queue: "QuickLend", id: "DLQ-8815", payload: "QL-4456 · KES 50,000", error: "HTTP 503", retries: "3/5", next: "Auto-retry 14:35", expires: "14:50" },
  { queue: "QuickLend", id: "DLQ-8814", payload: "QL-4455 · KES 30,000", error: "HTTP 503", retries: "3/5", next: "Auto-retry 14:35", expires: "14:50" },
  { queue: "QuickLend", id: "DLQ-8813", payload: "QL-4454 · KES 20,000", error: "HTTP 503", retries: "2/5", next: "Auto-retry 14:35", expires: "14:50" },
  { queue: "SMS delivery", id: "DLQ-8812", payload: "SMS-99120 · ARR-03", error: "Provider 429", retries: "1/5", next: "Auto-retry 14:40", expires: "16:00" },
  { queue: "SMS delivery", id: "DLQ-8811", payload: "SMS-99119 · ARR-03", error: "Provider 429", retries: "1/5", next: "Auto-retry 14:40", expires: "16:00" },
  { queue: "Partner webhook", id: "DLQ-8810", payload: "PW-3312 · txn.completed", error: "Connection refused", retries: "4/5", next: "Auto-retry 14:36", expires: "15:20" },
];
