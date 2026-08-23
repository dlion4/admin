/* ============================================================
   Page 4 — User Directory · data layer
   ============================================================ */

export type Tier = "Basic" | "Verified" | "VIP" | "Business" | "Agent";
export type KycStatus = "Verified" | "Pending" | "Rejected" | "Expired" | "Under review";
export type AccountStatus = "Active" | "Frozen" | "Dormant" | "Suspended" | "Closed";
export type Channel = "App" | "USSD" | "Web" | "API" | "POS";

export type User = {
  id: string; name: string; email: string; phone: string; county: string; tier: Tier;
  kyc: KycStatus; status: AccountStatus; balance: number; txn30d: number; volume30d: number;
  joined: string; lastActive: string; channel: Channel; device: string; riskScore: number;
  gender: "M" | "F"; age: number; occupation: string; rm: string; tags: string[];
  cards: number; loans: number; referrals: number; nps: number | null;
};

const FIRST_M = ["James", "Brian", "Dennis", "Kevin", "Patrick", "Collins", "Joseph", "Samuel", "Anthony", "Vincent", "Felix", "Peter", "Michael", "Tom", "David"];
const FIRST_F = ["Amina", "Lucy", "Fatuma", "Wanjiru", "Naomi", "Esther", "Mercy", "Zainab", "Sharon", "Caroline", "Rose", "Grace", "Faith", "Alice", "Beatrice"];
const LAST = ["Otieno", "Muthoni", "Kimani", "Hassan", "Karanja", "Okello", "Chemtai", "Barasa", "Njeri", "Ouma", "Akinyi", "Kiptoo", "Ali", "Maina", "Wairimu", "Mwangi", "Adhiambo", "Mutiso", "Nyambura", "Wafula", "Atieno", "Kariuki", "Wanjiru", "Njoroge", "Chebet", "Omondi", "Wambui", "Kiprono", "Abdalla", "Mutua"];
const COUNTIES = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Uasin Gishu", "Machakos", "Nyeri", "Kakamega", "Kiambu", "Kilifi", "Kisii", "Meru", "Bungoma", "Trans Nzoia", "Garissa", "Turkana", "Laikipia", "Nyandarua", "Embu", "Tharaka-Nithi"];
const OCCUPATIONS = ["Software Engineer", "Teacher", "Nurse", "Farmer", "Business Owner", "Trader", "Student", "Accountant", "Driver", "Chef", "Sales Agent", "Lawyer", "Mechanic", "Tailor", "Civil Servant"];
const DEVICES = ["iPhone 15 Pro", "Samsung A54", "Tecno Spark 20", "Infinix Note 40", "iPhone 14", "Samsung S24", "Xiaomi Redmi 13", "Google Pixel 8", "Nokia G42", "Oppo A78"];
const RMS = ["Grace Wanjiru", "Peter Njoroge", "Faith Chebet", "Dennis Otieno", "Unassigned"];
const TAGS_POOL = ["high-value", "early-adopter", "referral-champion", "salary-advance", "merchant", "international", "card-active", "dormant-risk", "loan-default", "sacco-member", "student", "diaspora", "mpesa-heavy", "agent-network"];

const TIERS: Tier[] = ["Basic", "Verified", "VIP", "Business", "Agent"];
const KYC_STATUSES: KycStatus[] = ["Verified", "Pending", "Rejected", "Expired", "Under review"];
const ACC_STATUSES: AccountStatus[] = ["Active", "Active", "Active", "Active", "Frozen", "Dormant", "Suspended", "Active", "Active", "Closed"];
const CHANNELS: Channel[] = ["App", "App", "USSD", "Web", "API", "App", "POS", "App"];

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const rndDate = (i: number) => {
  const y = 2023 + (i % 4);
  const m = (i * 3 + 7) % 12;
  const d = 1 + (i * 11) % 28;
  return `${d} ${months[m]} ${y}`;
};
const rndRecent = (i: number) => {
  const h = (i * 7 + 3) % 48;
  if (h < 2) return "Just now";
  if (h < 12) return `${h} hours ago`;
  if (h < 24) return "Yesterday";
  return `${Math.floor(h / 24) + 1} days ago`;
};

export const USERS: User[] = Array.from({ length: 50 }, (_, i) => {
  const isFemale = i % 3 === 0;
  const first = isFemale ? FIRST_F[i % FIRST_F.length] : FIRST_M[i % FIRST_M.length];
  const last = LAST[i % LAST.length];
  const name = `${first} ${last}`;
  const tier = TIERS[i % TIERS.length];
  const balance = tier === "VIP" ? 800_000 + ((i * 91_337) % 4_200_000) : tier === "Business" ? 200_000 + ((i * 47_311) % 1_800_000) : 1_200 + ((i * 23_117) % 420_000);
  const vol = Math.round(balance * (2.4 + (i % 7) * 0.4));
  const txn = Math.round(vol / (1_200 + (i % 12) * 300));
  const risk = [4, 8, 12, 22, 7, 41, 5, 63, 11, 88, 14, 31, 9, 17, 2, 55, 76, 38, 19, 25][i % 20];
  const tags: string[] = [];
  if (tier === "VIP") tags.push("high-value");
  if (i % 5 === 0) tags.push(TAGS_POOL[(i * 3) % TAGS_POOL.length]);
  if (i % 8 === 0) tags.push(TAGS_POOL[(i * 7 + 3) % TAGS_POOL.length]);
  return {
    id: `USR-${(10000 + i * 733) % 99999}`,
    name, email: `${first.toLowerCase()}.${last.toLowerCase()}@${["gmail.com", "yahoo.com", "paymo.co.ke", "outlook.com", "hotmail.com"][i % 5]}`,
    phone: `+2547${String(10 + (i % 80)).padStart(2, "0")} ${String(100 + (i * 7) % 900).padStart(3, "0")} ${String(100 + (i * 13) % 900).padStart(3, "0")}`,
    county: COUNTIES[i % COUNTIES.length], tier, kyc: KYC_STATUSES[i % KYC_STATUSES.length],
    status: ACC_STATUSES[i % ACC_STATUSES.length], balance, txn30d: txn, volume30d: vol,
    joined: rndDate(i), lastActive: rndRecent(i), channel: CHANNELS[i % CHANNELS.length],
    device: DEVICES[i % DEVICES.length], riskScore: risk, gender: isFemale ? "F" : "M",
    age: 18 + (i * 3) % 47, occupation: OCCUPATIONS[i % OCCUPATIONS.length],
    rm: tier === "VIP" || tier === "Business" ? RMS[i % (RMS.length - 1)] : RMS[4],
    tags, cards: tier === "VIP" || tier === "Business" ? 1 + (i % 3) : i % 4 === 0 ? 1 : 0,
    loans: i % 6 === 0 ? 1 + (i % 3) : 0, referrals: (i * 3) % 18,
    nps: i % 7 === 0 ? null : [28, 34, 42, 48, 55, 62, 70, 78, 84, 92][i % 10],
  };
});

export type SavedView = { id: string; name: string; filters: string; count: number; owner: string; shared: boolean };
export const SAVED_VIEWS: SavedView[] = [
  { id: "sv-1", name: "VIP clients — Nairobi", filters: "tier=VIP, county=Nairobi", count: 412, owner: "Joseph Mwangi", shared: true },
  { id: "sv-2", name: "Frozen accounts", filters: "status=Frozen", count: 1_847, owner: "Mary Wanjiku", shared: true },
  { id: "sv-3", name: "KYC pending > 48h", filters: "kyc=Pending, joined<48h", count: 89, owner: "David Kiplagat", shared: false },
  { id: "sv-4", name: "High risk (score > 70)", filters: "riskScore>70", count: 2_412, owner: "Sarah Kamau", shared: true },
  { id: "sv-5", name: "Dormant 90+ days", filters: "status=Dormant", count: 21_430, owner: "James Odhiambo", shared: true },
  { id: "sv-6", name: "Business accounts — all", filters: "tier=Business", count: 9_640, owner: "Joseph Mwangi", shared: true },
  { id: "sv-7", name: "New signups this week", filters: "joined<7d", count: 2_104, owner: "Head of Growth", shared: false },
  { id: "sv-8", name: "Card holders — active", filters: "cards>0, status=Active", count: 34_210, owner: "VP Cards", shared: true },
];

export type Segment = { id: string; label: string; count: number; icon: string; color: string };
export const SEGMENTS: Segment[] = [
  { id: "all", label: "All users", count: 148_392, icon: "bi-people", color: "#667085" },
  { id: "active", label: "Active (30d)", count: 89_214, icon: "bi-person-check", color: "#12b76a" },
  { id: "verified", label: "KYC verified", count: 124_810, icon: "bi-patch-check", color: "#2e90fa" },
  { id: "vip", label: "VIP tier", count: 1_284, icon: "bi-gem", color: "#7a5af8" },
  { id: "business", label: "Business", count: 9_640, icon: "bi-briefcase", color: "#f79009" },
  { id: "frozen", label: "Frozen", count: 1_847, icon: "bi-snow3", color: "#0ba5ec" },
  { id: "dormant", label: "Dormant 90d+", count: 21_430, icon: "bi-moon", color: "#98a2b3" },
  { id: "high-risk", label: "Risk score > 70", count: 2_412, icon: "bi-exclamation-triangle", color: "#f04438" },
  { id: "defaulters", label: "Loan defaulters", count: 1_247, icon: "bi-cash-coin", color: "#ee46bc" },
  { id: "new-7d", label: "New (last 7 days)", count: 2_104, icon: "bi-person-plus", color: "#16b364" },
];

export const SUMMARY_STATS = [
  { label: "Total registered", value: "148,392", delta: "+8,412 this month", trend: "up", icon: "bi-people" },
  { label: "Active (30d)", value: "89,214", delta: "+5.2%", trend: "up", icon: "bi-person-check" },
  { label: "KYC verified", value: "124,810", delta: "84.1% of total", trend: "up", icon: "bi-patch-check" },
  { label: "VIP clients", value: "1,284", delta: "+182 this quarter", trend: "up", icon: "bi-gem" },
  { label: "Avg balance", value: "KES 16,600", delta: "+12.3% MoM", trend: "up", icon: "bi-wallet2" },
  { label: "Frozen / suspended", value: "2,641", delta: "1.8% of total", trend: "down", icon: "bi-snow3" },
];

export type ColumnDef = { key: keyof User | "actions"; label: string; default: boolean; sortable: boolean; align?: "end" };
export const COLUMNS: ColumnDef[] = [
  { key: "name", label: "Customer", default: true, sortable: true },
  { key: "phone", label: "Phone", default: true, sortable: false },
  { key: "tier", label: "Tier", default: true, sortable: true },
  { key: "kyc", label: "KYC", default: true, sortable: true },
  { key: "status", label: "Status", default: true, sortable: true },
  { key: "balance", label: "Balance", default: true, sortable: true, align: "end" },
  { key: "txn30d", label: "Txns (30d)", default: true, sortable: true, align: "end" },
  { key: "volume30d", label: "Volume (30d)", default: false, sortable: true, align: "end" },
  { key: "county", label: "County", default: true, sortable: true },
  { key: "riskScore", label: "Risk", default: true, sortable: true, align: "end" },
  { key: "joined", label: "Joined", default: false, sortable: false },
  { key: "lastActive", label: "Last active", default: false, sortable: false },
  { key: "channel", label: "Channel", default: false, sortable: true },
  { key: "device", label: "Device", default: false, sortable: false },
  { key: "cards", label: "Cards", default: false, sortable: true, align: "end" },
  { key: "loans", label: "Loans", default: false, sortable: true, align: "end" },
  { key: "referrals", label: "Referrals", default: false, sortable: true, align: "end" },
  { key: "rm", label: "RM", default: false, sortable: true },
  { key: "actions", label: "", default: true, sortable: false },
];
