export type KycState = "Pending" | "In review" | "Escalated" | "Approved" | "Rejected" | "More info";
export type RiskBand = "Low" | "Medium" | "High" | "Critical";
export type DocumentState = "Verified" | "Review" | "Rejected" | "Expired" | "Missing";

export interface KycDocument {
  id: string;
  type: string;
  number: string;
  state: DocumentState;
  uploaded: string;
  expires: string;
  score: number;
  checks: string[];
}

export interface KycCase {
  id: string;
  userId: string;
  name: string;
  initials: string;
  phone: string;
  email: string;
  county: string;
  nationality: string;
  submitted: string;
  ageHours: number;
  state: KycState;
  risk: RiskBand;
  riskScore: number;
  tier: "Tier 1" | "Tier 2" | "Tier 3" | "Business";
  reviewer: string;
  source: "App" | "Web" | "Agent" | "API";
  idType: string;
  liveness: number;
  faceMatch: number;
  sanctions: "Clear" | "Possible match" | "Confirmed match";
  pep: "Clear" | "Possible PEP" | "Confirmed PEP";
  duplicate: number;
  documents: KycDocument[];
  flags: string[];
}

const first = ["Amina", "Brian", "Lucy", "David", "Fatuma", "James", "Wanjiru", "Samuel", "Naomi", "Kevin", "Esther", "Collins", "Mercy", "Patrick", "Zainab", "Joseph", "Beatrice", "Dennis", "Sharon", "Felix", "Caroline", "Anthony", "Rose", "Vincent", "Grace", "Peter", "Faith", "Michael", "Alice", "Tom", "Mary", "Daniel", "Joyce", "Martin", "Irene", "George"];
const last = ["Hassan", "Otieno", "Muthoni", "Kimani", "Abdalla", "Mutua", "Karanja", "Okello", "Chemtai", "Barasa", "Njeri", "Ouma", "Akinyi", "Kiptoo", "Ali", "Maina", "Wairimu", "Mwangi", "Adhiambo", "Mutiso", "Nyambura", "Wafula", "Atieno", "Kariuki", "Wanjiru", "Njoroge", "Chebet", "Omondi", "Wambui", "Kiprono", "Kamau", "Kibet", "Moraa", "Muli", "Jepkorir", "Odhiambo"];
const counties = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Uasin Gishu", "Kiambu", "Machakos", "Nyeri", "Kakamega", "Kilifi", "Kisii", "Meru"];
const reviewers = ["Unassigned", "David Kiplagat", "Mary Wanjiku", "Cynthia Awuor", "James Odhiambo"];
const states: KycState[] = ["Pending", "In review", "Pending", "Escalated", "More info", "Approved", "Pending", "Rejected"];
const idTypes = ["National ID", "Passport", "Alien ID", "Military ID"];
const flagsPool = ["Address mismatch", "Name transliteration", "Document glare", "Possible duplicate", "Recent SIM swap", "High-risk occupation", "Sanctions similarity", "Expired document"];

const makeDocs = (i: number, score: number): KycDocument[] => [
  { id: `DOC-${7100 + i * 4}`, type: idTypes[i % idTypes.length], number: `ID-${24_900_000 + i * 73_119}`, state: score > 76 ? "Verified" : score > 55 ? "Review" : "Rejected", uploaded: `${2 + (i % 22)} Aug 2026`, expires: `${2 + (i % 22)} Aug 2031`, score: Math.min(99, score + 12), checks: ["MRZ/barcode parsed", "Tamper check complete", "Government registry queried"] },
  { id: `DOC-${7101 + i * 4}`, type: "Selfie & liveness", number: `BIO-${8100 + i}`, state: score > 66 ? "Verified" : "Review", uploaded: `${2 + (i % 22)} Aug 2026`, expires: "Not applicable", score: Math.min(99, score + 8), checks: ["Passive liveness", "Face embedding created", "Replay attack checked"] },
  { id: `DOC-${7102 + i * 4}`, type: "Proof of address", number: `ADR-${6100 + i}`, state: i % 9 === 0 ? "Missing" : i % 7 === 0 ? "Expired" : score > 58 ? "Verified" : "Review", uploaded: `${1 + (i % 20)} Aug 2026`, expires: `${1 + (i % 20)} Nov 2026`, score: Math.max(40, score - 4), checks: ["Issue date within 90 days", "Address extracted", "Name compared"] },
  { id: `DOC-${7103 + i * 4}`, type: i % 4 === 0 ? "Business registration" : "Source of income", number: `SOF-${5100 + i}`, state: i % 5 === 0 ? "Review" : "Verified", uploaded: `${1 + (i % 18)} Aug 2026`, expires: `${1 + (i % 18)} Feb 2027`, score: Math.max(52, score), checks: ["Issuer validated", "Income band extracted", "Account tier eligibility checked"] },
];

export const KYC_CASES: KycCase[] = first.map((f, i) => {
  const name = `${f} ${last[i]}`;
  const score = 42 + ((i * 17) % 57);
  const sanctions = i === 7 ? "Confirmed match" : i % 11 === 0 ? "Possible match" : "Clear";
  const pep = i === 15 ? "Confirmed PEP" : i % 13 === 0 ? "Possible PEP" : "Clear";
  const riskScore = Math.min(99, Math.round((100 - score) * .55 + (sanctions !== "Clear" ? 38 : 0) + (pep !== "Clear" ? 20 : 0) + (i % 8)));
  const risk: RiskBand = riskScore >= 80 ? "Critical" : riskScore >= 60 ? "High" : riskScore >= 30 ? "Medium" : "Low";
  const flags = flagsPool.filter((_, n) => (i + n * 3) % 9 === 0).slice(0, 3);
  return {
    id: `KYC-${2026000 + i}`, userId: `USR-${10000 + i * 733}`, name,
    initials: `${f[0]}${last[i][0]}`, phone: `+2547${String(10 + i).padStart(2, "0")} ${String(120 + i * 9).slice(0, 3)} ${String(310 + i * 11).slice(0, 3)}`,
    email: `${f.toLowerCase()}.${last[i].toLowerCase()}@${["gmail.com", "outlook.com", "yahoo.com"][i % 3]}`,
    county: counties[i % counties.length], nationality: i % 10 === 0 ? "Ugandan" : i % 14 === 0 ? "Tanzanian" : "Kenyan",
    submitted: `${String(14 - Math.floor(i / 10)).padStart(2, "0")}:${String(32 - (i * 3) % 30).padStart(2, "0")} EAT`,
    ageHours: 1 + ((i * 7) % 94), state: states[i % states.length], risk, riskScore,
    tier: (["Tier 2", "Tier 3", "Tier 2", "Business", "Tier 1"] as KycCase["tier"][])[i % 5],
    reviewer: reviewers[i % reviewers.length], source: (["App", "Web", "Agent", "API"] as const)[i % 4],
    idType: idTypes[i % idTypes.length], liveness: Math.min(99, score + 6), faceMatch: Math.min(99, score + 3),
    sanctions, pep, duplicate: i % 9 === 0 ? 82 : 2 + ((i * 11) % 37), documents: makeDocs(i, score), flags,
  };
});

export const KYC_STATS = [
  { label: "Pending review", value: "347", note: "+42 since 08:00", icon: "bi-hourglass-split", tone: "amber" },
  { label: "Approved today", value: "1,284", note: "93.1% auto-clear", icon: "bi-patch-check", tone: "green" },
  { label: "Manual review", value: "89", note: "24 over 24h", icon: "bi-person-check", tone: "blue" },
  { label: "SLA compliance", value: "96.8%", note: "+1.4 pts this week", icon: "bi-stopwatch", tone: "green" },
  { label: "Sanctions hits", value: "12", note: "2 confirmed", icon: "bi-globe", tone: "red" },
  { label: "Median decision", value: "9.2 min", note: "target under 15m", icon: "bi-speedometer", tone: "green" },
];

export const QUEUE_HEALTH = [
  { label: "Auto-clear", count: 1284, pct: 78, color: "#12b76a" },
  { label: "Manual document review", count: 203, pct: 12, color: "#2e90fa" },
  { label: "Sanctions / PEP", count: 32, pct: 4, color: "#f04438" },
  { label: "Duplicate identity", count: 44, pct: 3, color: "#7a5af8" },
  { label: "More information", count: 51, pct: 3, color: "#f79009" },
];

export const SLA_BUCKETS = [
  { bucket: "Under 15 min", cases: 241, pct: 69, tone: "green" },
  { bucket: "15 min - 2h", cases: 72, pct: 21, tone: "blue" },
  { bucket: "2h - 24h", cases: 25, pct: 7, tone: "amber" },
  { bucket: "Over 24h", cases: 9, pct: 3, tone: "red" },
];

export interface ReviewActivity { id: string; time: string; admin: string; action: string; caseId: string; detail: string; }
export const REVIEW_ACTIVITY: ReviewActivity[] = Array.from({ length: 22 }, (_, i) => ({
  id: `AUD-${88410 - i}`, time: i < 2 ? `${2 + i * 3} min ago` : i < 10 ? `${10 + i * 4} min ago` : `${1 + Math.floor(i / 5)}h ago`,
  admin: reviewers[1 + (i % 4)], action: ["Approved KYC", "Requested information", "Escalated sanctions match", "Rejected document", "Re-ran liveness", "Assigned reviewer"][i % 6],
  caseId: `KYC-${2026000 + (i * 7) % 36}`, detail: ["All four evidence stages passed.", "Proof of address was older than 90 days.", "Name similarity 88% against a PEP record.", "Document tamper model returned 0.81.", "Passive liveness improved from 62% to 94%.", "SLA ownership moved to the compliance queue."][i % 6],
}));

export interface SavedKycView { id: string; name: string; query: string; count: number; owner: string; shared: boolean; }
export const SAVED_KYC_VIEWS: SavedKycView[] = [
  { id: "KV-1", name: "Critical sanctions / PEP", query: "risk=Critical, sanctions!=Clear", count: 12, owner: "David Kiplagat", shared: true },
  { id: "KV-2", name: "SLA breach - unassigned", query: "age>24h, reviewer=Unassigned", count: 9, owner: "Jeckonia Kwasa", shared: true },
  { id: "KV-3", name: "Address review", query: "document=Address, state=Review", count: 51, owner: "Cynthia Awuor", shared: false },
  { id: "KV-4", name: "Business tier applications", query: "tier=Business", count: 84, owner: "Mary Wanjiku", shared: true },
  { id: "KV-5", name: "Possible duplicate identities", query: "duplicate>70", count: 44, owner: "James Odhiambo", shared: true },
];